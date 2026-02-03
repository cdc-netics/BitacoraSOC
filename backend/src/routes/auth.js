/**
 * Rutas de Autenticación
 * 
 * Endpoints:
 *   POST /api/auth/login   - Iniciar sesión
 *   POST /api/auth/refresh - Renovar token JWT
 *   POST /api/auth/forgot-password - Solicitar token de reseteo
 *   POST /api/auth/reset-password - Resetear contraseña
 * 
 * Roles: admin, user, guest
 * 
 * Tokens JWT (C6 - Reducido por seguridad):
 *   - Admin/User: 4h de duración (reducido de 24h)
 *   - Guest: 2h de duración (cuentas guest expiran a 48h)
 *   - Verificación de expiración guest en login y refresh
 * 
 * Token de Recuperación (C5 - Reducido por seguridad):
 *   - Duración: 5 minutos (reducido de 1 hora)
 *   - Hasheado con SHA256 antes de almacenar
 */
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const AppConfig = require('../models/AppConfig');
const validate = require('../middleware/validate');
const { audit } = require('../utils/audit');
const { logger } = require('../utils/logger');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 🎫 Generar token JWT con expiración diferenciada por rol
// Guest: 2h (sesión corta), Admin/User: 4h (reducido de 24h por seguridad)
const generateToken = (userId, role) => {
  // Guest: tokens más cortos (2 horas)
  // Admin/User: 4 horas (reducido por seguridad - C6)
  const expiresIn = role === 'guest' ? '2h' : '4h';
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

// POST /api/auth/login
router.post('/login', 
  [
    body('username').trim().notEmpty().withMessage('El usuario o email es requerido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
  ],
  validate,
  async (req, res) => {
    console.log('🔵 LOGIN REQUEST:', req.body.username);
    try {
      const { username, password } = req.body;

      // Buscar por username O email
      const normalized = (username || '').trim();
      const exactMatch = new RegExp(`^${escapeRegex(normalized)}$`, 'i');

      const user = await User.findOne({ 
        $or: [{ username: exactMatch }, { email: exactMatch }]
      });
      console.log('🔵 Usuario encontrado:', !!user);

      if (!user || !user.isActive) {
        audit(req, {
          event: 'auth.login.fail',
          level: 'warn',
          result: { success: false, reason: 'Invalid credentials' },
          metadata: { username }
        }).catch(err => logger.error({ err }, 'Audit error'));
        
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Verificar si es guest expirado
      if (user.role === 'guest' && user.isGuestExpired()) {
        audit(req, {
          event: 'auth.login.fail',
          level: 'warn',
          result: { success: false, reason: 'Guest expired' },
          metadata: { username, guestExpiresAt: user.guestExpiresAt }
        }).catch(err => logger.error({ err }, 'Audit error'));
        
        return res.status(401).json({ message: 'Cuenta de invitado expirada' });
      }

      const isMatch = await user.comparePassword(password);
      console.log('🔵 Password match:', isMatch);

      if (!isMatch) {
        audit(req, {
          event: 'auth.login.fail',
          level: 'warn',
          result: { success: false, reason: 'Invalid password' },
          metadata: { username }
        }).catch(err => logger.error({ err }, 'Audit error'));
        
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const token = generateToken(user._id, user.role);
      console.log('🔵 Token generado, enviando respuesta...');
      
      // ⚠️ TEMPORAL: Audit deshabilitado para debugging
      /*
      audit(req, {
        event: 'auth.login.success',
        level: 'info',
        result: { success: true, reason: 'Login successful' },
        metadata: {
          userId: user._id,
          username: user.username,
          role: user.role,
          isGuest: user.role === 'guest'
        }
      }).catch(err => logger.error({ err }, 'Audit error'));
      */

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          theme: user.theme,
          avatar: user.avatar,
          guestExpiresAt: user.guestExpiresAt
        }
      });
    } catch (error) {
      logger.error({
        err: error,
        requestId: req.requestId,
        method: req.method,
        path: req.path
      }, 'Error in login');
      
      res.status(500).json({ message: 'Error al iniciar sesión' });
    }
  }
);

// POST /api/auth/refresh (opcional)
// ⚠️ NOTA: Guests pueden renovar tokens, lo que podría extender su sesión indefinidamente
// si renuevan cada hora antes de que expire su cuenta (48h).
// 
// TODO: Considerar bloquear refresh para guests o limitar ventana de renovación
// a las últimas X horas antes de expiración.
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Usuario no válido' });
    }

    if (user.role === 'guest' && user.isGuestExpired()) {
      return res.status(401).json({ message: 'Sesión de invitado expirada' });
    }

    const newToken = generateToken(user._id, user.role);

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
});

// POST /api/auth/forgot-password - Solicitar reseteo de contraseña
router.post('/forgot-password',
  [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail()
  ],
  validate,
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email, isActive: true });

      // Por seguridad, siempre retornamos éxito (no revelar si el email existe)
      if (!user) {
        return res.json({ message: 'Si el email existe, recibirás instrucciones para resetear tu contraseña' });
      }

      // Generar token de reseteo (6 caracteres aleatorios)
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Guardar token hasheado + expiración (5 minutos por seguridad - C5)
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
      await user.save();

      // Construir URL del frontend dinámicamente:
      // 1. Intenta obtener el host del header de la request (X-Forwarded-Host o Host)
      // 2. Si no existe, usa HOST_DOMAIN (del .env) o localhost
      const requestHost = req.headers['x-forwarded-host'] || req.headers.host || process.env.HOST_DOMAIN || 'localhost';
      const frontendPort = process.env.FRONTEND_PORT || '4200';
      
      // Si el host ya incluye puerto (ej: 10.0.100.13:3000), extraer solo el host
      const hostWithoutPort = requestHost.split(':')[0];
      const frontendUrl = `http://${hostWithoutPort}:${frontendPort}`;
      
      const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

      // Intentar enviar email si SMTP está configurado
      const SmtpConfig = require('../models/SmtpConfig');
      const nodemailer = require('nodemailer');
      const { decrypt } = require('../utils/encryption');
      
      let emailSent = false;
      const smtpConfig = await SmtpConfig.findOne({ isActive: true });
      
      if (smtpConfig) {
        try {
          const secure = smtpConfig.port === 465;
          const transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: secure,
            auth: {
              user: smtpConfig.username,
              pass: decrypt(smtpConfig.password)
            }
          });

          await transporter.sendMail({
            from: `"${smtpConfig.senderName}" <${smtpConfig.senderEmail}>`,
            to: email,
            subject: 'Recuperación de Contraseña - Bitácora SOC',
            text: `Hola,\n\nHemos recibido una solicitud para resetear tu contraseña.\n\nHaz click en el siguiente enlace para crear una nueva contraseña:\n${resetUrl}\n\nEste enlace expirará en 5 minutos.\n\nSi no solicitaste este cambio, ignora este email.\n\nSaludos,\nEquipo Bitácora SOC`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1976d2;">Recuperación de Contraseña</h2>
                <p>Hola,</p>
                <p>Hemos recibido una solicitud para resetear tu contraseña.</p>
                <p>Haz click en el siguiente botón para crear una nueva contraseña:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
                    Resetear Contraseña
                  </a>
                </div>
                <p><small>O copia y pega este enlace en tu navegador:<br>${resetUrl}</small></p>
                <p style="color: #f44336;"><strong>⏰ Este enlace expirará en 5 minutos.</strong></p>
                <p>Si no solicitaste este cambio, ignora este email.</p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">Saludos,<br>Equipo Bitácora SOC</p>
              </div>
            `
          });

          emailSent = true;
        } catch (emailError) {
          console.error('Error enviando email de recuperación:', emailError);
          // Continuar aunque falle el email
        }
      }

      // Si está en desarrollo Y el email no se envió, retornar el token
      if (process.env.NODE_ENV === 'development' && !emailSent) {
        return res.json({
          message: 'Token de reseteo generado (solo desarrollo - SMTP no configurado)',
          resetToken,
          resetUrl
        });
      }

      // Si se envió el email o estamos en producción
      res.json({ 
        message: emailSent 
          ? 'Email de recuperación enviado. Revisa tu bandeja de entrada.' 
          : 'Si el email existe, recibirás instrucciones para resetear tu contraseña'
      });
    } catch (error) {
      logger.error({ err: error }, 'Error in forgot-password');
      res.status(500).json({ message: 'Error al procesar solicitud' });
    }
  }
);

// POST /api/auth/reset-password - Resetear contraseña con token
router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Token requerido'),
    body('newPassword').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres')
  ],
  validate,
  async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      // Hashear el token recibido para comparar con el almacenado
      const crypto = require('crypto');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Buscar usuario con token válido y no expirado
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
        isActive: true
      });

      if (!user) {
        return res.status(400).json({ message: 'Token inválido o expirado' });
      }

      // Actualizar contraseña (el pre-save hook se encarga de hashearla)
      user.password = newPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      // Auditar el reseteo
      await audit(req, {
        event: 'auth.password_reset',
        level: 'info',
        result: { success: true },
        metadata: {
          userId: user._id,
          username: user.username,
          email: user.email
        }
      });

      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      logger.error({ err: error }, 'Error in reset-password');
      res.status(500).json({ message: 'Error al resetear contraseña' });
    }
  }
);

module.exports = router;
