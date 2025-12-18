/**
 * Log Forwarder - Envío de logs a colector externo
 * 
 * Características:
 *   - TCP plain o TLS
 *   - Queue en memoria (max 1000 logs)
 *   - Backoff exponencial si colector down
 *   - Sanitización automática de secrets
 *   - Formato NDJSON (compatible SIEM)
 * 
 * Uso:
 *   logForwarder.forward(auditRecord)
 *   logForwarder.testConnection()
 * 
 * Variables de entorno (seguridad):
 *   - LOG_FORWARD_CLIENT_KEY: client key para mTLS (no guardar en DB)
 */
const net = require('net');
const tls = require('tls');
const fs = require('fs');
const LogForwardingConfig = require('../models/LogForwardingConfig');
const { logger, sanitize } = require('./logger');

class LogForwarder {
  constructor() {
    this.socket = null;
    this.queue = []; // Cola en memoria
    this.maxQueueSize = 1000;
    this.isConnected = false;
    this.isConnecting = false;
    this.retryCount = 0;
    this.config = null;
    
    // Cargar config al iniciar
    this.loadConfig();
  }
  
  /**
   * Cargar configuración de forwarding desde MongoDB
   */
  async loadConfig() {
    try {
      this.config = await LogForwardingConfig.findOne();
      
      if (this.config && this.config.enabled) {
        logger.info({
          event: 'logforward.config.loaded',
          host: this.config.host,
          port: this.config.port,
          mode: this.config.mode
        }, 'Log forwarding enabled');
        
        // Conectar inmediatamente si está habilitado
        this.connect();
      }
    } catch (error) {
      logger.error({ err: error }, 'Error loading log forwarding config');
    }
  }
  
  /**
   * Recargar config (llamado desde API cuando admin actualiza)
   */
  async reloadConfig() {
    logger.info({ event: 'logforward.config.reload' }, 'Reloading log forwarding config');
    
    // Cerrar conexión existente
    this.disconnect();
    
    // Cargar nueva config
    await this.loadConfig();
  }
  
  /**
   * Conectar a colector externo
   */
  async connect() {
    if (!this.config || !this.config.enabled) {
      return;
    }
    
    if (this.isConnected || this.isConnecting) {
      return;
    }
    
    this.isConnecting = true;
    
    try {
      const { host, port, mode, tls: tlsConfig } = this.config;
      
      if (mode === 'plain') {
        // TCP sin cifrado
        this.socket = net.connect({ host, port }, () => {
          this.onConnect();
        });
      } else {
        // TLS (cifrado)
        const tlsOptions = {
          host,
          port,
          rejectUnauthorized: tlsConfig.rejectUnauthorized
        };
        
        // CA cert (custom)
        if (tlsConfig.caCert) {
          tlsOptions.ca = [this.readCert(tlsConfig.caCert)];
        }
        
        // Client cert (mTLS)
        if (tlsConfig.clientCert) {
          tlsOptions.cert = this.readCert(tlsConfig.clientCert);
        }
        
        // Client key (desde env, NO DB)
        const clientKey = process.env.LOG_FORWARD_CLIENT_KEY;
        if (clientKey) {
          tlsOptions.key = this.readCert(clientKey);
        }
        
        this.socket = tls.connect(tlsOptions, () => {
          this.onConnect();
        });
      }
      
      // Event handlers
      this.socket.on('error', (err) => this.onError(err));
      this.socket.on('close', () => this.onClose());
      
    } catch (error) {
      logger.error({ err: error }, 'Error creating socket');
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }
  
  /**
   * Callback: conexión exitosa
   */
  onConnect() {
    this.isConnected = true;
    this.isConnecting = false;
    this.retryCount = 0;
    
    logger.info({
      event: 'logforward.connected',
      host: this.config.host,
      port: this.config.port,
      mode: this.config.mode
    }, 'Connected to log collector');
    
    // Flush queue
    this.flushQueue();
  }
  
  /**
   * Callback: error de socket
   */
  onError(err) {
    logger.warn({
      event: 'logforward.error',
      err,
      host: this.config?.host,
      port: this.config?.port
    }, 'Log forwarder socket error');
    
    this.disconnect();
  }
  
  /**
   * Callback: conexión cerrada
   */
  onClose() {
    this.isConnected = false;
    this.isConnecting = false;
    
    logger.info({ event: 'logforward.disconnected' }, 'Disconnected from log collector');
    
    // Reconectar si enabled
    if (this.config && this.config.enabled) {
      this.scheduleReconnect();
    }
  }
  
  /**
   * Desconectar socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
  }
  
  /**
   * Programar reconexión con backoff exponencial
   */
  scheduleReconnect() {
    if (!this.config || !this.config.enabled || !this.config.retry.enabled) {
      return;
    }
    
    if (this.retryCount >= this.config.retry.maxRetries) {
      logger.error({
        event: 'logforward.retry.exhausted',
        retryCount: this.retryCount
      }, 'Max retries reached, giving up');
      return;
    }
    
    // Backoff exponencial
    const delay = this.config.retry.backoffMs * Math.pow(2, this.retryCount);
    this.retryCount++;
    
    logger.info({
      event: 'logforward.retry.scheduled',
      retryCount: this.retryCount,
      delayMs: delay
    }, `Reconnecting in ${delay}ms`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }
  
  /**
   * Enviar log a colector (llamado desde audit.js)
   */
  async forward(auditRecord) {
    if (!this.config || !this.config.enabled) {
      return;
    }
    
    // Filtrar por nivel (audit-only, info, warn, error)
    const shouldForward = this.shouldForwardLevel(auditRecord.level);
    if (!shouldForward) {
      return;
    }
    
    // Sanitizar payload
    const payload = this.preparePayload(auditRecord);
    
    // Si está conectado, enviar inmediatamente
    if (this.isConnected && this.socket) {
      this.send(payload);
    } else {
      // Encolar (máximo maxQueueSize)
      if (this.queue.length < this.maxQueueSize) {
        this.queue.push(payload);
      } else {
        logger.warn({
          event: 'logforward.queue.full',
          queueSize: this.queue.length
        }, 'Log queue full, dropping oldest logs');
        this.queue.shift(); // Drop oldest
        this.queue.push(payload);
      }
      
      // Intentar conectar si no está conectando
      if (!this.isConnecting) {
        this.connect();
      }
    }
  }
  
  /**
   * Determinar si el log debe forwardearse según nivel configurado
   */
  shouldForwardLevel(logLevel) {
    const { forwardLevel } = this.config;
    
    // audit-only: solo eventos de AuditLog (todos tienen level info/warn/error)
    if (forwardLevel === 'audit-only') {
      return true;
    }
    
    // Mapear niveles a números para comparación
    const levels = { info: 0, warn: 1, error: 2 };
    const configLevel = levels[forwardLevel] || 0;
    const currentLevel = levels[logLevel] || 0;
    
    return currentLevel >= configLevel;
  }
  
  /**
   * Preparar payload NDJSON
   */
  preparePayload(auditRecord) {
    const payload = {
      timestamp: auditRecord.timestamp.toISOString(),
      event: auditRecord.event,
      level: auditRecord.level,
      actor: auditRecord.actor,
      request: auditRecord.request,
      result: auditRecord.result,
      metadata: sanitize(auditRecord.metadata)
    };
    
    // NDJSON: una línea por evento
    return JSON.stringify(payload) + '\n';
  }
  
  /**
   * Enviar payload por socket
   */
  send(payload) {
    try {
      this.socket.write(payload, 'utf8', (err) => {
        if (err) {
          logger.error({ err }, 'Error writing to log collector');
          // Encolar para reintento
          if (this.queue.length < this.maxQueueSize) {
            this.queue.push(payload);
          }
        }
      });
    } catch (error) {
      logger.error({ err: error }, 'Exception writing to log collector');
    }
  }
  
  /**
   * Flush queue (enviar todos los logs encolados)
   */
  flushQueue() {
    if (!this.isConnected || this.queue.length === 0) {
      return;
    }
    
    logger.info({
      event: 'logforward.queue.flush',
      queueSize: this.queue.length
    }, 'Flushing log queue');
    
    while (this.queue.length > 0) {
      const payload = this.queue.shift();
      this.send(payload);
    }
  }
  
  /**
   * Leer certificado (desde string PEM o path a archivo)
   */
  readCert(certOrPath) {
    // Si empieza con -----BEGIN, es PEM directo
    if (certOrPath.startsWith('-----BEGIN')) {
      return certOrPath;
    }
    
    // Si no, es path a archivo
    try {
      return fs.readFileSync(certOrPath, 'utf8');
    } catch (error) {
      logger.error({ err: error, path: certOrPath }, 'Error reading certificate file');
      return '';
    }
  }
  
  /**
   * Test de conexión (llamado desde API /test)
   */
  async testConnection() {
    if (!this.config) {
      throw new Error('No log forwarding configuration found');
    }
    
    return new Promise((resolve, reject) => {
      const { host, port, mode, tls: tlsConfig } = this.config;
      
      let testSocket;
      const timeout = setTimeout(() => {
        if (testSocket) testSocket.destroy();
        reject(new Error('Connection timeout (5s)'));
      }, 5000);
      
      const onConnect = () => {
        clearTimeout(timeout);
        
        // Enviar log de prueba
        const testPayload = JSON.stringify({
          timestamp: new Date().toISOString(),
          event: 'logforward.test',
          level: 'info',
          message: 'Test connection from BitacoraSOC',
          source: 'test'
        }) + '\n';
        
        testSocket.write(testPayload, 'utf8', (err) => {
          testSocket.destroy();
          if (err) {
            reject(err);
          } else {
            resolve({ success: true, message: 'Connection successful' });
          }
        });
      };
      
      const onError = (err) => {
        clearTimeout(timeout);
        testSocket.destroy();
        reject(err);
      };
      
      try {
        if (mode === 'plain') {
          testSocket = net.connect({ host, port }, onConnect);
        } else {
          const tlsOptions = {
            host,
            port,
            rejectUnauthorized: tlsConfig.rejectUnauthorized
          };
          
          if (tlsConfig.caCert) {
            tlsOptions.ca = [this.readCert(tlsConfig.caCert)];
          }
          
          if (tlsConfig.clientCert) {
            tlsOptions.cert = this.readCert(tlsConfig.clientCert);
          }
          
          const clientKey = process.env.LOG_FORWARD_CLIENT_KEY;
          if (clientKey) {
            tlsOptions.key = this.readCert(clientKey);
          }
          
          testSocket = tls.connect(tlsOptions, onConnect);
        }
        
        testSocket.on('error', onError);
        
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }
}

// Singleton instance
const logForwarder = new LogForwarder();

module.exports = logForwarder;
