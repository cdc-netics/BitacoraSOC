/**
 * Rate Limiters de Seguridad
 * 
 * Funcionalidad:
 *   - Prevenir brute force en login (5 intentos/15min)
 *   - Limitar abuso general de API (100 req/15min por IP)
 * 
 * Configuración:
 *   - loginLimiter: aplicado solo en POST /api/auth/login
 *   - apiLimiter: aplicado globalmente en app.use('/api/', apiLimiter)
 * 
 * Comportamiento:
 *   - Bloquea por IP (X-Forwarded-For aware si hay proxy)
 *   - Responde 429 Too Many Requests al superar límite
 *   - skipSuccessfulRequests=false: logins exitosos también cuentan
 * 
 * Reglas SOC:
 *   - 5 intentos login: previene credential stuffing
 *   - 100 req/15min: permite operación normal pero bloquea scraping
 */
const rateLimit = require('express-rate-limit');
const isProduction = process.env.NODE_ENV === 'production';

// Rate limiter para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por ventana
  message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

// Rate limiter general para API
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !isProduction
});

module.exports = {
  loginLimiter,
  apiLimiter
};
