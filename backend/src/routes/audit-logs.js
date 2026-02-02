const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const AuditLog = require('../models/AuditLog');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { logger } = require('../utils/logger');

// GET /api/audit-logs - Obtener logs de auditoría (solo admin/auditor)
router.get('/',
  authenticate,
  authorize('admin', 'auditor'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Página inválida'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido'),
    query('userId').optional().isMongoId().withMessage('UserId inválido'),
    query('event').optional().isString().trim(),
    query('level').optional().isIn(['info', 'warn', 'error']).withMessage('Level inválido'),
    query('startDate').optional().isISO8601().withMessage('Fecha inicio inválida'),
    query('endDate').optional().isISO8601().withMessage('Fecha fin inválida'),
    query('search').optional().isString().trim()
  ],
  validate,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        userId,
        event,
        level,
        startDate,
        endDate,
        search
      } = req.query;

      // Construir filtros
      const filters = {};

      if (userId) {
        filters['actor.userId'] = userId;
      }

      if (event) {
        filters.event = new RegExp(event, 'i');
      }

      if (level) {
        filters.level = level;
      }

      // Filtro de rango de fechas
      if (startDate || endDate) {
        filters.timestamp = {};
        if (startDate) {
          filters.timestamp.$gte = new Date(startDate);
        }
        if (endDate) {
          const endDateObj = new Date(endDate);
          endDateObj.setHours(23, 59, 59, 999);
          filters.timestamp.$lte = endDateObj;
        }
      }

      // Búsqueda de texto libre (username, IP, path)
      if (search) {
        filters.$or = [
          { 'actor.username': new RegExp(search, 'i') },
          { 'request.ip': new RegExp(search, 'i') },
          { 'request.path': new RegExp(search, 'i') },
          { 'result.reason': new RegExp(search, 'i') }
        ];
      }

      // Paginación
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Query
      const [logs, total] = await Promise.all([
        AuditLog.find(filters)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .select('-__v')
          .lean(),
        AuditLog.countDocuments(filters)
      ]);

      res.json({
        logs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      logger.error({
        err: error,
        requestId: req.requestId,
        userId: req.user._id
      }, 'Error fetching audit logs');
      
      res.status(500).json({ message: 'Error al obtener logs de auditoría' });
    }
  }
);

// GET /api/audit-logs/events - Obtener lista de eventos únicos (para filtro dropdown)
router.get('/events',
  authenticate,
  authorize('admin', 'auditor'),
  async (req, res) => {
    try {
      const events = await AuditLog.distinct('event');
      res.json({ events: events.sort() });
    } catch (error) {
      logger.error({
        err: error,
        requestId: req.requestId,
        userId: req.user._id
      }, 'Error fetching audit events');
      
      res.status(500).json({ message: 'Error al obtener eventos' });
    }
  }
);

// GET /api/audit-logs/stats - Estadísticas de auditoría (para dashboard)
router.get('/stats',
  authenticate,
  authorize('admin', 'auditor'),
  async (req, res) => {
    try {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [total, last24hCount, last7dCount, byLevel, byEvent] = await Promise.all([
        AuditLog.countDocuments(),
        AuditLog.countDocuments({ timestamp: { $gte: last24h } }),
        AuditLog.countDocuments({ timestamp: { $gte: last7d } }),
        AuditLog.aggregate([
          { $group: { _id: '$level', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ]),
        AuditLog.aggregate([
          { $match: { timestamp: { $gte: last7d } } },
          { $group: { _id: '$event', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ])
      ]);

      res.json({
        total,
        last24h: last24hCount,
        last7d: last7dCount,
        byLevel: byLevel.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        topEvents: byEvent
      });
    } catch (error) {
      logger.error({
        err: error,
        requestId: req.requestId,
        userId: req.user._id
      }, 'Error fetching audit stats');
      
      res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
  }
);

module.exports = router;
