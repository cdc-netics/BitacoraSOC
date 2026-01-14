/**
 * Rutas de Configuracion SMTP (estilo Passbolt)
 *
 * Reglas:
 *  - GET    /api/smtp       -> obtiene config sin password
 *  - POST   /api/smtp       -> guarda config solo si la prueba es exitosa
 *  - POST   /api/smtp/test  -> prueba conexion/envio (usa body o config guardada)
 *
 * Seguridad:
 *  - Password cifrada (AES) en Mongo, nunca se expone
 *  - Rate limit en pruebas para evitar abuso de relay
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

const smtpTestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3,
  message: 'Demasiados intentos de prueba SMTP. Intenta en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false
});

const smtpValidators = [
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
];

const testValidators = [
  body('provider').optional().isIn(['office365', 'aws-ses', 'elastic-email', 'google-mail', 'google-workspace', 'mailgun', 'custom']),
  body('username').optional().trim().notEmpty(),
  body('password').optional().isLength({ min: 8 }),
  body('host').optional().trim().notEmpty(),
  body('port').optional().isInt({ min: 1, max: 65535 }).toInt(),
  body('useTLS').optional().isBoolean(),
  body('senderName').optional().trim().notEmpty(),
  body('senderEmail').optional().isEmail().normalizeEmail(),
  body('recipients').optional().isArray({ min: 1 }),
  body('recipients.*').optional().isEmail().normalizeEmail(),
  body('sendOnlyIfRed').optional().isBoolean()
];

const ensureRequiredFields = (data) => {
  const required = ['host', 'port', 'username', 'password', 'senderName', 'senderEmail'];
  for (const field of required) {
    if (!data[field]) return `Falta el campo requerido: ${field}`;
  }
  if (!Array.isArray(data.recipients) || data.recipients.length === 0) {
    return 'Debe haber al menos un destinatario';
  }
  return null;
};

const verifyAndTest = async (config, sendMail = true) => {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.useTLS,
    auth: {
      user: config.username,
      pass: config.password
    }
  });

  await transporter.verify();

  const testRecipient = config.recipients[0] || config.senderEmail;
  if (!testRecipient) throw new Error('No hay destinatarios configurados ni email remitente');

  if (sendMail) {
    await transporter.sendMail({
      from: `"${config.senderName}" <${config.senderEmail}>`,
      to: testRecipient,
      subject: 'Prueba de Configuracion SMTP - Bitacora SOC',
      text: 'Este es un correo de prueba. La configuracion SMTP funciona correctamente.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Prueba Exitosa</h2>
          <p>Correo de prueba enviado desde la <strong>Bitacora SOC</strong>.</p>
          <p>La configuracion SMTP esta funcionando correctamente.</p>
          <hr>
          <small>Fecha: ${new Date().toISOString()}</small>
        </div>
      `
    });
  }

  return testRecipient;
};

// GET /api/smtp - Obtener configuracion SMTP (admin)
router.get('/', authenticate, authorize('admin'), async (_req, res) => {
  try {
    const config = await SmtpConfig.findOne();
    if (!config) return res.json(null);

    const configObj = config.toObject();
    delete configObj.password;
    return res.json(configObj);
  } catch (error) {
    console.error('Error al obtener config SMTP:', error);
    return res.status(500).json({ message: 'Error al obtener configuracion' });
  }
});

// POST /api/smtp - Guardar config solo si la prueba es exitosa
router.post('/',
  authenticate,
  authorize('admin'),
  smtpValidators,
  validate,
  async (req, res) => {
    try {
      const data = req.body;

      const missing = ensureRequiredFields(data);
      if (missing) {
        return res.status(400).json({ message: missing });
      }

      await verifyAndTest({
        ...data,
        password: data.password
      });

      const encryptedPassword = encrypt(data.password);

      let config = await SmtpConfig.findOne();
      if (!config) {
        config = new SmtpConfig({
          ...data,
          password: encryptedPassword,
          lastTestDate: new Date(),
          lastTestSuccess: true
        });
      } else {
        Object.assign(config, {
          ...data,
          password: encryptedPassword,
          lastTestDate: new Date(),
          lastTestSuccess: true
        });
      }

      await config.save();

      const configObj = config.toObject();
      delete configObj.password;

      return res.json({
        message: 'Configuracion SMTP guardada y probada exitosamente',
        config: configObj
      });
    } catch (error) {
      console.error('Error al guardar config SMTP:', error);
      return res.status(500).json({ message: 'Error al guardar configuracion SMTP', error: error.message });
    }
  }
);

// POST /api/smtp/test - Probar configuracion (usa body o config guardada)
router.post('/test',
  authenticate,
  authorize('admin'),
  smtpTestLimiter,
  testValidators,
  validate,
  async (req, res) => {
    let usingStoredConfig = false;
    try {
      let configData = null;

      if (Object.keys(req.body || {}).length > 0) {
        const missing = ensureRequiredFields(req.body);
        if (missing) {
          return res.status(400).json({ message: missing });
        }
        configData = req.body;
      } else {
        const stored = await SmtpConfig.findOne();
        usingStoredConfig = true;
        if (!stored) {
          return res.status(404).json({ message: 'No hay configuracion SMTP' });
        }
        configData = {
          ...stored.toObject(),
          password: decrypt(stored.password)
        };
      }

      const recipient = await verifyAndTest({
        ...configData,
        password: configData.password
      });

      if (usingStoredConfig) {
        const stored = await SmtpConfig.findOne();
        if (stored) {
          stored.lastTestDate = new Date();
          stored.lastTestSuccess = true;
          await stored.save();
        }
      }

      return res.json({
        message: 'Correo de prueba enviado exitosamente',
        recipient
      });
    } catch (error) {
      console.error('Error al probar SMTP:', error);

      if (usingStoredConfig) {
        const stored = await SmtpConfig.findOne();
        if (stored) {
          stored.lastTestDate = new Date();
          stored.lastTestSuccess = false;
          await stored.save();
        }
      }

      return res.status(500).json({
        message: 'Error al enviar correo de prueba',
        error: error.message
      });
    }
  }
);

// Helper exportado para correos de checklist
const sendChecklistEmail = async (check, services) => {
  try {
    const config = await SmtpConfig.findOne({ isActive: true });
    if (!config) {
      console.log('No hay configuracion SMTP activa');
      return;
    }

    if (config.sendOnlyIfRed && !check.hasRedServices) {
      console.log('No se envia correo: no hay servicios en rojo');
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

    const servicesHtml = check.services.map(s => {
      const statusColor = s.status === 'verde' ? '#4CAF50' : '#F44336';
      const statusIcon = s.status === 'verde' ? 'OK' : 'ERROR';
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
        <p><strong>Fecha:</strong> ${new Date(check.checkDate).toLocaleString()}</p>
        <p><strong>Estado general:</strong> ${check.hasRedServices ? 'Con problemas' : 'OK'}</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f4f4f4;">
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Servicio</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Estado</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Observacion</th>
            </tr>
          </thead>
          <tbody>
            ${servicesHtml}
          </tbody>
        </table>
        
        <hr style="margin-top: 30px;">
        <small style="color: #666;">Bitacora SOC - ${new Date().toLocaleString()}</small>
      </div>
    `;

    await transporter.sendMail({
      from: `"${config.senderName}" <${config.senderEmail}>`,
      to: config.recipients.join(', '),
      subject: `[Bitacora SOC] Checklist de ${check.type} - ${check.username}`,
      html: emailHtml
    });

    console.log('Correo de checklist enviado exitosamente');
  } catch (error) {
    console.error('Error al enviar correo de checklist:', error);
  }
};

module.exports = router;
module.exports.sendChecklistEmail = sendChecklistEmail;
