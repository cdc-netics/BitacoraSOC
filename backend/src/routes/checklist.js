/**
 * Rutas de Checklist de Turno
 * 
 * Servicios SOC:
 *   - Catálogo de servicios configurable por admin (CRUD)
 *   - Registro de checks de turno (inicio/cierre)
 *   - Historial de checks con filtros
 * 
 * Reglas SOC CRÍTICAS:
 *   1. Todos los servicios activos deben evaluarse (verde/rojo)
 *   2. Servicios en rojo REQUIEREN observación (max 1000 chars)
 *   3. Anti-spam: NO permitir tipos consecutivos iguales (inicio->inicio)
 *   4. Cooldown configurable entre checks (default 4h)
 *   5. Email automático si config SMTP existe (condicional si sendOnlyIfRed)
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ServiceCatalog = require('../models/ServiceCatalog');
const ShiftCheck = require('../models/ShiftCheck');
const AppConfig = require('../models/AppConfig');
const { authenticate, authorize, notGuest } = require('../middleware/auth');
const validate = require('../middleware/validate');
const captureMetadata = require('../middleware/metadata');
const { audit } = require('../utils/audit');
const { logger } = require('../utils/logger');

// ========== CATÁLOGO DE SERVICIOS ==========

// GET /api/checklist/services - Obtener servicios activos
router.get('/services', authenticate, async (req, res) => {
  try {
    const services = await ServiceCatalog.find({ isActive: true })
      .sort({ order: 1, title: 1 });

    res.json(services);
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ message: 'Error al obtener servicios' });
  }
});

// GET /api/checklist/services/all - Obtener todos los servicios (admin)
router.get('/services/all', authenticate, authorize('admin'), async (req, res) => {
  try {
    const services = await ServiceCatalog.find().sort({ order: 1, title: 1 });
    res.json(services);
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ message: 'Error al obtener servicios' });
  }
});

// POST /api/checklist/services - Crear servicio (admin)
router.post('/services',
  authenticate,
  authorize('admin'),
  [
    body('title').trim().notEmpty().withMessage('El título es requerido'),
    body('order').optional().isInt().toInt()
  ],
  validate,
  async (req, res) => {
    try {
      const { title, order } = req.body;

      const service = new ServiceCatalog({
        title,
        order: order || 0
      });

      await service.save();

      res.status(201).json({ message: 'Servicio creado', service });
    } catch (error) {
      console.error('Error al crear servicio:', error);
      res.status(500).json({ message: 'Error al crear servicio' });
    }
  }
);

// PUT /api/checklist/services/:id - Actualizar servicio (admin)
router.put('/services/:id',
  authenticate,
  authorize('admin'),
  [
    body('title').optional().trim().notEmpty(),
    body('isActive').optional().isBoolean(),
    body('order').optional().isInt().toInt()
  ],
  validate,
  async (req, res) => {
    try {
      const service = await ServiceCatalog.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!service) {
        return res.status(404).json({ message: 'Servicio no encontrado' });
      }

      res.json({ message: 'Servicio actualizado', service });
    } catch (error) {
      console.error('Error al actualizar servicio:', error);
      res.status(500).json({ message: 'Error al actualizar servicio' });
    }
  }
);

// DELETE /api/checklist/services/:id - Eliminar servicio (admin)
router.delete('/services/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const service = await ServiceCatalog.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    res.json({ message: 'Servicio eliminado' });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({ message: 'Error al eliminar servicio' });
  }
});

// ========== REGISTROS DE CHECKLIST ==========

// POST /api/checklist/check - Registrar checklist de turno
router.post('/check',
  authenticate,
  notGuest,
  captureMetadata,
  [
    body('type').isIn(['inicio', 'cierre']).withMessage('Tipo inválido'),
    body('services').isArray({ min: 1 }).withMessage('Debes incluir al menos un servicio'),
    body('services.*.serviceId').isMongoId().withMessage('ID de servicio inválido'),
    body('services.*.serviceTitle').trim().notEmpty(),
    body('services.*.status').isIn(['verde', 'rojo']).withMessage('Estado inválido'),
    body('services.*.observation').optional().trim().isString().isLength({ max: 1000 })
  ],
  validate,
  async (req, res) => {
    try {
      const { type, services } = req.body;
      const userId = req.user._id;

      // 1. Obtener servicios activos y verificar que se incluyeron TODOS
      const activeServices = await ServiceCatalog.find({ isActive: true });
      const receivedServiceIds = services.map(s => s.serviceId.toString());
      const activeServiceIds = activeServices.map(s => s._id.toString());

      // Verificar que se incluyeron TODOS los servicios activos
      const missingServices = activeServiceIds.filter(id => !receivedServiceIds.includes(id));
      if (missingServices.length > 0) {
        const missingTitles = activeServices
          .filter(s => missingServices.includes(s._id.toString()))
          .map(s => s.title);
        return res.status(400).json({
          message: `Debes evaluar todos los servicios. Faltan: ${missingTitles.join(', ')}`
        });
      }

      // Verificar que no haya servicios extra/inactivos
      const extraServices = receivedServiceIds.filter(id => !activeServiceIds.includes(id));
      if (extraServices.length > 0) {
        return res.status(400).json({
          message: 'Se incluyeron servicios inactivos o inexistentes'
        });
      }

      // 2. Verificar que todos los servicios en rojo tengan observación
      for (const service of services) {
        if (service.status === 'rojo' && (!service.observation || service.observation.trim() === '')) {
          return res.status(400).json({
            message: `El servicio "${service.serviceTitle}" está en rojo y requiere observación`
          });
        }
      }

      // 2. 🔒 REGLA SOC: Anti-spam - NO permitir tipos consecutivos iguales
      // 
      // Por qué: Evita errores operativos donde un analista registra dos "inicio"
      // sin haber cerrado el turno anterior. Fuerza el flujo correcto:
      //   inicio -> cierre -> inicio -> cierre...
      // 
      // Ejemplo de error bloqueado: Usuario hace "inicio" dos veces seguidas.
      // Solución: Backend valida último check y rechaza si tipo === lastCheck.type
      const lastCheck = await ShiftCheck.findOne({ userId }).sort({ createdAt: -1 });

      if (lastCheck && lastCheck.type === type) {
        const expectedType = type === 'inicio' ? 'cierre' : 'inicio';
        
        await audit(req, {
          event: 'shiftcheck.block.consecutive',
          level: 'warn',
          result: { success: false, reason: `Consecutive ${type} blocked` },
          metadata: { type, lastCheckType: lastCheck.type, expectedType }
        });
        
        return res.status(400).json({
          message: `No puedes registrar dos "${type}" consecutivos. Debes hacer "${expectedType}" primero.`
        });
      }

      // 3. 🔒 REGLA SOC: Cooldown configurable entre checks
      //
      // Por qué: Previene spam de checks (ej: registrar inicio cada 5 minutos).
      // El admin puede configurar las horas mínimas entre checks (default 4h).
      // Calculamos tiempo transcurrido y bloqueamos si no cumple el mínimo.
      //
      // Cálculo: (now - lastCheck.createdAt) en milisegundos
      //          Si < cooldownHours * 3600 * 1000 -> rechazar
      const config = await AppConfig.findOne();
      const cooldownHours = config?.shiftCheckCooldownHours || 4;

      if (lastCheck) {
        const hoursSinceLastCheck = (Date.now() - lastCheck.createdAt.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastCheck < cooldownHours) {
          const remainingHours = (cooldownHours - hoursSinceLastCheck).toFixed(1);
          
          await audit(req, {
            event: 'shiftcheck.block.cooldown',
            level: 'warn',
            result: { success: false, reason: 'Cooldown not met' },
            metadata: {
              type,
              cooldownHours,
              hoursSinceLastCheck: hoursSinceLastCheck.toFixed(2),
              remainingHours
            }
          });
          
          return res.status(400).json({
            message: `Debes esperar ${cooldownHours} horas entre checks. Tiempo restante: ${remainingHours}h`
          });
        }
      }

      // 4. Crear registro
      const hasRedServices = services.some(s => s.status === 'rojo');

      const check = new ShiftCheck({
        userId,
        username: req.user.username,
        type,
        services,
        hasRedServices,
        checkDate: new Date(),
        ipAddress: req.clientIp,
        userAgent: req.clientUserAgent
      });

      await check.save();
      
      // Auditar registro exitoso
      await audit(req, {
        event: 'shiftcheck.submit',
        level: 'info',
        result: { success: true, reason: 'Check registered successfully' },
        metadata: {
          type,
          redCount: services.filter(s => s.status === 'rojo').length,
          greenCount: services.filter(s => s.status === 'verde').length,
          services: services.map(s => ({
            title: s.serviceTitle,
            status: s.status,
            hasObservation: !!s.observation
          }))
        }
      });

      // 5. 📧 Envío automático de email (si SMTP configurado)
      //
      // Si existe SmtpConfig activo:
      //   - sendOnlyIfRed=false → envía siempre
      //   - sendOnlyIfRed=true  → envía solo si hay servicios en rojo
      // El email incluye todos los servicios con estados y observaciones.
      try {
        const { sendChecklistEmail } = require('./smtp');
        const SmtpConfig = require('../models/SmtpConfig');
        const smtpConfig = await SmtpConfig.findOne({ isActive: true });
        
        if (smtpConfig) {
          const shouldSend = !smtpConfig.sendOnlyIfRed || hasRedServices;
          if (shouldSend) {
            await sendChecklistEmail(check, services);
          }
        }
      } catch (emailError) {
        logger.error({
          err: emailError,
          requestId: req.requestId,
          checkId: check._id
        }, 'Error sending checklist email');
        // No fallar la petición si el email falla
      }

      res.status(201).json({
        message: 'Checklist registrado exitosamente',
        check
      });
    } catch (error) {
      console.error('Error al registrar check:', error);
      res.status(500).json({ message: 'Error al registrar checklist' });
    }
  }
);

// GET /api/checklist/check/last - Obtener último check del usuario
router.get('/check/last', authenticate, notGuest, async (req, res) => {
  try {
    const lastCheck = await ShiftCheck.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('services.serviceId');

    if (!lastCheck) {
      return res.json({ message: 'Sin registro previo', check: null });
    }

    res.json(lastCheck);
  } catch (error) {
    console.error('Error al obtener último check:', error);
    res.status(500).json({ message: 'Error al obtener último check' });
  }
});

// GET /api/checklist/check/history - Historial de checks
router.get('/check/history', authenticate, notGuest, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Si es admin, ver todos; si no, solo los suyos
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };

    const [checks, total] = await Promise.all([
      ShiftCheck.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'username fullName'),
      ShiftCheck.countDocuments(filter)
    ]);

    res.json({
      checks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ message: 'Error al obtener historial' });
  }
});

module.exports = router;
