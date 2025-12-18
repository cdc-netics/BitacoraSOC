/**
 * Middleware de Validación Express
 * 
 * Función:
 *   - Procesa resultados de express-validator (body, query, param rules)
 *   - Si hay errores: responde 400 con array de errores detallados
 *   - Si OK: pasa al siguiente middleware
 * 
 * Uso:
 *   router.post('/endpoint', [body('field').rule()], validate, handler)
 * 
 * Formato error:
 *   { message: 'Errores de validación', errors: [{ field, msg, value }] }
 */
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  
  next();
};

module.exports = validate;
