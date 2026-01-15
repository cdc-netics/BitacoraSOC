/**
 * Rutas de Autenticación
 * 
 * Endpoints:
 *   POST /api/auth/login   - Iniciar sesión
 *   POST /api/auth/refresh - Renovar token JWT
 * 
 * Roles: admin, user, guest
 * 
 * Tokens JWT:
 *   - Admin/User: 24h de duración
 *   - Guest: 2h de duración (cuentas guest expiran a 48h)
 *   - Verificación de expiración guest en login y refresh
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

// 🎫 Generar token JWT con expiración diferenciada por rol
// Guest: 2h (sesión corta), Admin/User: 24h
const generateToken = (userId, role) => {
  // Guest: tokens más cortos (2 horas)
  const expiresIn = role === 'guest' ? '2h' : (process.env.JWT_EXPIRES_IN || '24h');
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

// POST /api/auth/login
router.post('/login', 
  [
    body('username').trim().notEmpty().withMessage('El usuario es requerido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
  ],
  validate,
  async (req, res) => {
    console.log('🔵 LOGIN REQUEST:', req.body.username);
    try {
      const { username, password } = req.body;

      const user = await User.findOne({ username });
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

module.exports = router;
