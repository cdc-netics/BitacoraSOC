const nodemailer = require('nodemailer');
const { logger } = require('./logger');
const AppConfig = require('../models/AppConfig');
const SmtpConfig = require('../models/SmtpConfig');
const { decrypt } = require('./encryption');

/**
 * Servicio centralizado de envío de emails
 * Lee configuración SMTP desde BD (AppConfig.smtpConfig)
 */

let smtpConfigCache = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene configuración SMTP desde BD (AppConfig.smtpConfig) o variables de entorno
 */
async function getSMTPConfig() {
  const now = Date.now();
  
  // Usar cache si está disponible
  if (smtpConfigCache && (now - cacheTime) < CACHE_DURATION) {
    logger.info('📧 SMTP config FROM CACHE');
    return smtpConfigCache;
  }

  try {
    logger.info('📧 Reading SMTP config FROM DATABASE (SmtpConfig)...');
    const smtpDoc = await SmtpConfig.findOne({ isActive: true }).lean();

    if (smtpDoc) {
      const config = {
        host: smtpDoc.host,
        port: smtpDoc.port,
        secure: smtpDoc.useTLS === true || smtpDoc.port === 465,
        user: smtpDoc.username,
        pass: decrypt(smtpDoc.password),
        from: smtpDoc.senderName
          ? `"${smtpDoc.senderName}" <${smtpDoc.senderEmail}>`
          : smtpDoc.senderEmail || smtpDoc.username
      };

      smtpConfigCache = config;
      cacheTime = now;
      logger.info('📧 SMTP config LOADED FROM SmtpConfig', { host: config.host, port: config.port, user: config.user });
      return config;
    }

    logger.warn('📧 No SMTP config found in SmtpConfig (isActive: true)');
  } catch (error) {
    logger.error('📧 ERROR reading SMTP from SmtpConfig:', error.message, error.stack);
  }

  try {
    logger.info('📧 Reading SMTP config FROM DATABASE (AppConfig.smtpConfig) as fallback...');
    const appConfig = await AppConfig.findOne().select('smtpConfig').lean();

    if (appConfig && appConfig.smtpConfig) {
      const smtpConfig = appConfig.smtpConfig;
      logger.info('📧 SMTP config found in AppConfig', { user: smtpConfig.user });

      const config = {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure === true,
        user: smtpConfig.user,
        pass: smtpConfig.pass,
        from: smtpConfig.from || smtpConfig.user
      };

      smtpConfigCache = config;
      cacheTime = now;
      logger.info('📧 SMTP config LOADED FROM AppConfig', { host: config.host, port: config.port, user: config.user });
      return config;
    }

    logger.warn('📧 No SMTP config found in AppConfig');
  } catch (error) {
    logger.error('📧 ERROR reading SMTP from AppConfig:', error.message, error.stack);
  }

  // Fallback a variables de entorno
  logger.info('📧 Trying ENV VARIABLES fallback...');
  const envConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || ''
  };

  if (envConfig.user && envConfig.pass) {
    logger.info('📧 Using SMTP from ENV VARIABLES', { user: envConfig.user });
    smtpConfigCache = envConfig;
    cacheTime = now;
    return envConfig;
  }

  logger.error('❌ NO SMTP CONFIGURATION FOUND - neither DB nor ENV');
  return null;
}

/**
 * Crea transporter de nodemailer con configuración actual
 */
async function createTransporter() {
  const config = await getSMTPConfig();

  if (!config || !config.user || !config.pass) {
    throw new Error('SMTP configuration missing: user and pass required');
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure === true,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });
}

/**
 * Envía un email
 * @param {Object} options - Opciones del email
 * @param {string|string[]} options.to - Destinatario(s)
 * @param {string} options.subject - Asunto
 * @param {string} [options.text] - Contenido en texto plano
 * @param {string} [options.html] - Contenido en HTML
 * @param {string} [options.from] - Remitente (opcional, usa config por defecto)
 */
async function sendEmail({ to, subject, text, html, from }) {
  try {
    logger.info('📧 [sendEmail] Starting email send process...', { to, subject });
    
    const config = await getSMTPConfig();
    
    if (!config || !config.user || !config.pass) {
      logger.error('❌ [sendEmail] SMTP config is missing!', { user: config?.user, pass: !!config?.pass });
      throw new Error('SMTP configuration missing: Please configure email settings in Settings > Configuración SMTP');
    }

    logger.info('📧 [sendEmail] SMTP config loaded, creating transporter...');
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: from || config.from || config.user,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text,
      html
    };

    logger.info('📧 [sendEmail] Sending mail...', { 
      from: mailOptions.from, 
      to: mailOptions.to, 
      subject,
      hasHTML: !!html,
      htmlLength: html?.length || 0
    });

    const info = await transporter.sendMail(mailOptions);
    
    logger.info('✅ [sendEmail] EMAIL SENT SUCCESSFULLY!', {
      messageId: info.messageId,
      recipients: mailOptions.to,
      subject,
      response: info.response
    });

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    logger.error('❌ [sendEmail] EMAIL SEND FAILED!', {
      error: error.message,
      stack: error.stack,
      to,
      subject
    });
    throw error;
  }
}

/**
 * Verifica si la configuración SMTP está disponible
 */
async function isConfigured() {
  try {
    const config = await getSMTPConfig();
    return !!(config && config.user && config.pass && config.host);
  } catch (error) {
    return false;
  }
}

/**
 * Invalida el cache de configuración (llamar después de actualizar SMTP)
 */
function invalidateCache() {
  smtpConfigCache = null;
  cacheTime = 0;
}

module.exports = {
  sendEmail,
  createTransporter,
  isConfigured,
  invalidateCache,
  getSMTPConfig
};
