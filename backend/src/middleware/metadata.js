/**
 * Middleware de Captura de Metadata
 * 
 * Función:
 *   - Extrae IP real del cliente (respeta X-Forwarded-For si hay proxy)
 *   - Captura User-Agent del navegador/cliente
 *   - Almacena en req.clientIp y req.clientUserAgent
 * 
 * Uso SOC:
 *   - Auditoría de entradas: ¿desde qué IP se registró el incidente?
 *   - Detección de accesos anómalos: ¿cambio repentino de IP/dispositivo?
 *   - Logs: trazabilidad completa de operaciones críticas
 * 
 * Aplicado en:
 *   - POST /api/entries (crear entrada)
 *   - POST /api/checklist/check (registrar check de turno)
 */
const captureMetadata = (req, res, next) => {
  req.clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  req.clientUserAgent = req.headers['user-agent'] || '';
  next();
};

module.exports = captureMetadata;
