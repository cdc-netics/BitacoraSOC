/**
 * Rutas de Configuración SMTP
 * 
 * Endpoints:
 *   GET  /api/smtp      - Obtener config SMTP (sin password)
 *   POST /api/smtp      - Guardar config SMTP (cifra password con AES)
 *   POST /api/smtp/test - Enviar email de prueba
 * 
 * Seguridad SMTP:
 *   - Password NUNCA se retorna al frontend (delete configObj.password)
 *   - Password se guarda cifrado con AES-256 (crypto-js)
 *   - Validación mínima 8 caracteres
 *   - Debe haber al menos 1 destinatario
 * 
 * UI estilo Passbolt: provider, auth, advanced (host/port/TLS), sender, recipients
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const SmtpConfig = require('../models/SmtpConfig');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { encrypt, decrypt } = require('../utils/encryption');

// 🔒 Rate limit para SMTP test (prevenir abuso de envío)
const smtpTestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // 3 tests por ventana
  message: 'Demasiados intentos de prueba SMTP. Intenta en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false
});

// GET /api/smtp - Obtener configuración SMTP (admin)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    let config = await SmtpConfig.findOne();

    if (!config) {
      return res.json(null);
    }

    // No retornar password al frontend
    const configObj = config.toObject();
    delete configObj.password;

    res.json(configObj);
  } catch (error) {
    console.error('Error al obtener config SMTP:', error);
    res.status(500).json({ message: 'Error al obtener configuración' });
  }
});

// POST /api/smtp - Crear/actualizar configuración SMTP (admin)
router.post('/',
  authenticate,
  authorize('admin'),
  [
    body('provider').isIn(['office365', 'aws-ses', 'elastic-email', 'google-mail', 'google-workspace', 'mailgun', 'custom']),
    body('username').trim().notEmpty(),
    body('password').isLength({ min: 8 }).withMessage('Password SMTP debe tener al menos 8 caracteres'),
    body('host').trim().notEmpty(),
    body('port').isInt({ min: 1, max: 65535 }).toInt(),
    body('useTLS').isBoolean(),
    body('senderName').trim().notEmpty(),
    body('senderEmail').isEmail().normalizeEmail(),
    body('recipients').isArray({ min: 1 }).withMessage('Debe haber al menos un destinatario'),
    body('recipients.*').isEmail().normalizeEmail(),
    body('sendOnlyIfRed').isBoolean()
  ],
  validate,
  async (req, res) => {
    try {
      const data = req.body;

      // Cifrar password
      data.password = encrypt(data.password);

      let config = await SmtpConfig.findOne();

      if (!config) {
        config = new SmtpConfig(data);
      } else {
        Object.assign(config, data);
      }

      await config.save();

      // Retornar sin password
      const configObj = config.toObject();
      delete configObj.password;

      res.json({
        message: 'Configuración SMTP guardada',
        config: configObj
      });
    } catch (error) {
      console.error('Error al guardar config SMTP:', error);
      res.status(500).json({ message: 'Error al guardar configuración' });
    }
  }
);

// POST /api/smtp/test - Probar configuración SMTP (admin)
router.post('/test', authenticate, authorize('admin'), smtpTestLimiter, async (req, res) => {
  try {
    const config = await SmtpConfig.findOne();

    if (!config) {
      return res.status(404).json({ message: 'No hay configuración SMTP' });
    }

    // 🔓 Descifrar password para uso temporal (no se expone al cliente)
    const decryptedPassword = decrypt(config.password);

    // Crear transporter con credenciales descifradas
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.useTLS,
      auth: {
        user: config.username,
        pass: decryptedPassword
      }
    });

    // Verificar conexión
    await transporter.verify();

    // Enviar email de prueba
    const testRecipient = config.recipients[0] || req.user.email;
    
    if (!testRecipient) {
      return res.status(400).json({ message: 'No hay destinatarios configurados ni email de usuario' });
    }

    await transporter.sendMail({
      from: `"${config.senderName}" <${config.senderEmail}>`,
      to: testRecipient,
      subject: 'Prueba de Configuración SMTP - Bitácora SOC',
      text: 'Este es un correo de prueba. La configuración SMTP funciona correctamente.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>✅ Prueba Exitosa</h2>
          <p>Este es un correo de prueba desde la <strong>Bitácora SOC</strong>.</p>
          <p>La configuración SMTP está funcionando correctamente.</p>
          <hr>
          <small>Fecha: ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}</small>
        </div>
      `
    });

    // Actualizar fecha de último test
    config.lastTestDate = new Date();
    config.lastTestSuccess = true;
    await config.save();

    res.json({
      message: 'Correo de prueba enviado exitosamente',
      recipient: testRecipient
    });
  } catch (error) {
    console.error('Error al probar SMTP:', error);

    // Actualizar fecha de último test
    const config = await SmtpConfig.findOne();
    if (config) {
      config.lastTestDate = new Date();
      config.lastTestSuccess = false;
      await config.save();
    }

    res.status(500).json({
      message: 'Error al enviar correo de prueba',
      error: error.message
    });
  }
});

// Función helper para enviar correo de checklist (exportada)
const sendChecklistEmail = async (check, services) => {
  try {
    const config = await SmtpConfig.findOne({ isActive: true });

    if (!config) {
      console.log('No hay configuración SMTP activa');
      return;
    }

    // Verificar si debe enviar
    if (config.sendOnlyIfRed && !check.hasRedServices) {
      console.log('No se envía correo: no hay servicios en rojo');
      return;
    }

    const decryptedPassword = decrypt(config.password);

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.useTLS,
      auth: {
        user: config.username,
        pass: decryptedPassword
      }
    });

    // Construir HTML
    const servicesHtml = check.services.map(s => {
      const statusColor = s.status === 'verde' ? '#4CAF50' : '#F44336';
      const statusIcon = s.status === 'verde' ? '✅' : '⛔';
      return `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">
            <strong>${s.serviceTitle}</strong>
          </td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center; background-color: ${statusColor}; color: white;">
            ${statusIcon} ${s.status.toUpperCase()}
          </td>
          <td style="padding: 10px; border: 1px solid #ddd;">
            ${s.observation || '-'}
          </td>
        </tr>
      `;
    }).join('');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #333;">Checklist de Turno - ${check.type.toUpperCase()}</h2>
        <p><strong>Analista:</strong> ${check.username}</p>
        <p><strong>Fecha:</strong> ${new Date(check.checkDate).toLocaleString('es-CL', { timeZone: 'America/Santiago' })}</p>
        <p><strong>Estado general:</strong> ${check.hasRedServices ? '⛔ Con problemas' : '✅ OK'}</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f4f4f4;">
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Servicio</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Estado</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Observación</th>
            </tr>
          </thead>
          <tbody>
            ${servicesHtml}
          </tbody>
        </table>
        
        <hr style="margin-top: 30px;">
        <small style="color: #666;">Bitácora SOC - ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}</small>
      </div>
    `;

    await transporter.sendMail({
      from: `"${config.senderName}" <${config.senderEmail}>`,
      to: config.recipients.join(', '),
      subject: `[Bitácora SOC] Checklist de ${check.type} - ${check.username}`,
      html: emailHtml
    });

    console.log('Correo de checklist enviado exitosamente');
  } catch (error) {
    console.error('Error al enviar correo de checklist:', error);
  }
};

module.exports = router;
module.exports.sendChecklistEmail = sendChecklistEmail;
