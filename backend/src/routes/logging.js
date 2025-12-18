/**
 * Rutas de configuración de log forwarding
 * 
 * Solo admin puede:
 *   - Ver/actualizar config de SIEM
 *   - Probar conexión al colector externo
 * 
 * Endpoints:
 *   GET  /api/logging/config      - Obtener configuración actual
 *   PUT  /api/logging/config      - Actualizar configuración
 *   POST /api/logging/test        - Probar conexión al colector
 * 
 * Seguridad:
 *   - authenticate middleware (JWT válido)
 *   - authorize('admin') middleware (solo admin)
 *   - Validación de host/port
 *   - clientKey NO se expone en GET (solo en env)
 */
const express = require('express');
const router = express.Router();
const LogForwardingConfig = require('../models/LogForwardingConfig');
const logForwarder = require('../utils/logForwarder');
const { authenticate, authorize } = require('../middleware/auth');
const { audit } = require('../utils/audit');
const { logger } = require('../utils/logger');

/**
 * GET /api/logging/config
 * 
 * Obtener configuración actual de log forwarding
 * 
 * Respuesta:
 *   200: Configuración actual (sin secretos)
 *   404: No existe configuración
 */
router.get('/config', authenticate, authorize('admin'), async (req, res) => {
  try {
    let config = await LogForwardingConfig.findOne();
    
    if (!config) {
      // Crear config por defecto si no existe
      config = new LogForwardingConfig({
        enabled: false,
        host: 'localhost',
        port: 5140,
        mode: 'plain',
        forwardLevel: 'audit-only'
      });
      await config.save();
    }
    
    // NO exponer clientKey (está en env, no DB)
    const safeConfig = config.toObject();
    if (safeConfig.tls && safeConfig.tls._clientKeyNote) {
      delete safeConfig.tls._clientKeyNote;
    }
    
    await audit(req, {
      event: 'admin.logging.view',
      level: 'info',
      result: { success: true },
      metadata: { enabled: config.enabled }
    });
    
    res.json(safeConfig);
    
  } catch (error) {
    logger.error({ err: error, requestId: req.requestId }, 'Error fetching log config');
    
    await audit(req, {
      event: 'admin.logging.view',
      level: 'error',
      result: { success: false, reason: error.message }
    });
    
    res.status(500).json({ error: 'Error al obtener configuración de logs' });
  }
});

/**
 * PUT /api/logging/config
 * 
 * Actualizar configuración de log forwarding
 * 
 * Body:
 *   {
 *     enabled: boolean,
 *     host: string (IP o hostname),
 *     port: number (1-65535),
 *     mode: 'plain' | 'tls',
 *     tls: { rejectUnauthorized, caCert, clientCert },
 *     retry: { enabled, maxRetries, backoffMs },
 *     forwardLevel: 'audit-only' | 'info' | 'warn' | 'error'
 *   }
 * 
 * Respuesta:
 *   200: Config actualizada
 *   400: Validación fallida
 */
router.put('/config', authenticate, authorize('admin'), async (req, res) => {
  try {
    const {
      enabled,
      host,
      port,
      mode,
      tls,
      retry,
      forwardLevel
    } = req.body;
    
    // Validar campos requeridos
    if (enabled && (!host || !port)) {
      return res.status(400).json({
        error: 'Host y port son requeridos cuando forwarding está habilitado'
      });
    }
    
    // Validar port
    if (port && (port < 1 || port > 65535)) {
      return res.status(400).json({ error: 'Puerto debe estar entre 1 y 65535' });
    }
    
    // Validar mode
    if (mode && !['plain', 'tls'].includes(mode)) {
      return res.status(400).json({ error: 'Mode debe ser "plain" o "tls"' });
    }
    
    // Validar forwardLevel
    if (forwardLevel && !['audit-only', 'info', 'warn', 'error'].includes(forwardLevel)) {
      return res.status(400).json({
        error: 'forwardLevel debe ser audit-only, info, warn o error'
      });
    }
    
    // Actualizar config (upsert)
    let config = await LogForwardingConfig.findOne();
    
    if (!config) {
      config = new LogForwardingConfig();
    }
    
    // Actualizar campos
    if (enabled !== undefined) config.enabled = enabled;
    if (host) config.host = host;
    if (port) config.port = port;
    if (mode) config.mode = mode;
    if (tls) {
      config.tls = {
        ...config.tls,
        ...tls
      };
    }
    if (retry) {
      config.retry = {
        ...config.retry,
        ...retry
      };
    }
    if (forwardLevel) config.forwardLevel = forwardLevel;
    
    // Metadata
    config.lastUpdatedBy = {
      userId: req.user.userId,
      username: req.user.username,
      role: req.user.role
    };
    
    await config.save();
    
    // Recargar config en logForwarder
    await logForwarder.reloadConfig();
    
    logger.info({
      event: 'admin.logging.update',
      userId: req.user.userId,
      enabled: config.enabled,
      host: config.host,
      port: config.port,
      mode: config.mode
    }, 'Log forwarding config updated');
    
    await audit(req, {
      event: 'admin.logging.update',
      level: 'info',
      result: { success: true },
      metadata: {
        enabled: config.enabled,
        host: config.host,
        port: config.port,
        mode: config.mode,
        forwardLevel: config.forwardLevel
      }
    });
    
    res.json({ message: 'Configuración actualizada', config });
    
  } catch (error) {
    logger.error({ err: error, requestId: req.requestId }, 'Error updating log config');
    
    await audit(req, {
      event: 'admin.logging.update',
      level: 'error',
      result: { success: false, reason: error.message }
    });
    
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

/**
 * POST /api/logging/test
 * 
 * Probar conexión al colector externo
 * 
 * Envía un log de prueba y retorna resultado
 * 
 * Respuesta:
 *   200: { success: true, message: 'Connection successful' }
 *   400: { success: false, error: 'Connection timeout' }
 */
router.post('/test', authenticate, authorize('admin'), async (req, res) => {
  try {
    // Test de conexión
    const result = await logForwarder.testConnection();
    
    // Guardar resultado en config
    const config = await LogForwardingConfig.findOne();
    if (config) {
      config.lastTestedAt = new Date();
      config.lastTestResult = {
        success: result.success,
        message: result.message,
        timestamp: new Date()
      };
      await config.save();
    }
    
    logger.info({
      event: 'admin.logging.test',
      userId: req.user.userId,
      success: result.success
    }, 'Log forwarding test executed');
    
    await audit(req, {
      event: 'admin.logging.test',
      level: 'info',
      result: { success: result.success, reason: result.message }
    });
    
    res.json(result);
    
  } catch (error) {
    logger.error({ err: error, requestId: req.requestId }, 'Error testing log connection');
    
    // Guardar resultado fallido en config
    const config = await LogForwardingConfig.findOne();
    if (config) {
      config.lastTestedAt = new Date();
      config.lastTestResult = {
        success: false,
        message: error.message,
        timestamp: new Date()
      };
      await config.save();
    }
    
    await audit(req, {
      event: 'admin.logging.test',
      level: 'warn',
      result: { success: false, reason: error.message }
    });
    
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
