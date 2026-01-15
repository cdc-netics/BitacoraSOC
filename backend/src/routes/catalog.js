/**
 * 📚 RUTAS DE CATÁLOGOS
 * 
 * Endpoints para búsqueda incremental (typeahead) de catálogos grandes:
 *   - GET /api/catalog/events
 *   - GET /api/catalog/log-sources
 *   - GET /api/catalog/operation-types
 * 
 * Performance:
 *   - Búsqueda server-side con índice de texto MongoDB
 *   - Límite de 20 resultados por request
 *   - Cursor-based pagination (opcional)
 *   - Solo registros enabled=true
 * 
 * RBAC:
 *   - GET (lectura): Todos los usuarios autenticados
 *   - POST/PUT/DELETE (escritura): Solo ADMIN (no implementado aquí, ver /api/admin/catalog)
 */
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const CatalogEvent = require('../models/CatalogEvent');
const CatalogLogSource = require('../models/CatalogLogSource');
const CatalogOperationType = require('../models/CatalogOperationType');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * GET /api/catalog/events
 * 
 * Buscar eventos en catálogo (typeahead)
 * 
 * Query params:
 *   - search: string de búsqueda (min 2 caracteres recomendado)
 *   - enabled: true (default) | false
 *   - limit: max resultados (default 20, max 50)
 *   - cursor: _id para pagination (opcional)
 * 
 * Respuesta:
 *   {
 *     items: [{ _id, name, parent, description, motivoDefault }],
 *     nextCursor: string | null
 *   }
 */
router.get('/events', authenticate, async (req, res) => {
  try {
    const { 
      search = '', 
      enabled = 'true', 
      limit = '20', 
      cursor 
    } = req.query;

    const searchTerm = search.trim();
    const limitNum = Math.min(parseInt(limit) || 20, 50);
    const enabledBool = enabled === 'true';

    // Construir query
    let query = enabledBool
      ? { $or: [
          { enabled: true },
          { enabled: { $exists: false } },
          { enabled: 'true' },
          { enabled: 1 }
        ] }
      : { $or: [
          { enabled: false },
          { enabled: 'false' },
          { enabled: 0 }
        ] };

    // Agregar cursor para pagination
    if (cursor) {
      query._id = { $gt: cursor };
    }

    if (searchTerm.length > 0) {
      const regex = new RegExp(escapeRegExp(searchTerm), 'i');
      query.$or = [
        { name: regex },
        { parent: regex },
        { description: regex }
      ];
    }

    const items = await CatalogEvent
      .find(query)
      .sort({ name: 1 })
      .limit(limitNum + 1) // +1 para detectar si hay más
      .select('_id name parent description motivoDefault')
      .lean();

    // Detectar si hay más resultados
    const hasMore = items.length > limitNum;
    const results = hasMore ? items.slice(0, limitNum) : items;
    const nextCursor = hasMore ? results[results.length - 1]._id : null;

    res.json({
      items: results,
      nextCursor
    });
  } catch (error) {
    console.error('Error en búsqueda de eventos:', error);
    res.status(500).json({ message: 'Error al buscar eventos', error: error.message });
  }
});

/**
 * GET /api/catalog/log-sources
 * 
 * Buscar log sources en catálogo (typeahead)
 */
router.get('/log-sources', authenticate, async (req, res) => {
  try {
    const { 
      search = '', 
      enabled = 'true', 
      limit = '20', 
      cursor 
    } = req.query;

    const searchTerm = search.trim();
    const limitNum = Math.min(parseInt(limit) || 20, 50);
    const enabledBool = enabled === 'true';

    let query = enabledBool
      ? { $or: [
          { enabled: true },
          { enabled: { $exists: false } },
          { enabled: 'true' },
          { enabled: 1 }
        ] }
      : { $or: [
          { enabled: false },
          { enabled: 'false' },
          { enabled: 0 }
        ] };

    if (cursor) {
      query._id = { $gt: cursor };
    }

    if (searchTerm.length > 0) {
      const regex = new RegExp(escapeRegExp(searchTerm), 'i');
      query.$or = [
        { name: regex },
        { parent: regex },
        { description: regex }
      ];
    }

    const items = await CatalogLogSource
      .find(query)
      .sort({ name: 1 })
      .limit(limitNum + 1)
      .select('_id name parent description')
      .lean();

    const hasMore = items.length > limitNum;
    const results = hasMore ? items.slice(0, limitNum) : items;
    const nextCursor = hasMore ? results[results.length - 1]._id : null;

    res.json({
      items: results,
      nextCursor
    });
  } catch (error) {
    console.error('Error en búsqueda de log sources:', error);
    res.status(500).json({ message: 'Error al buscar log sources', error: error.message });
  }
});

/**
 * GET /api/catalog/operation-types
 * 
 * Buscar tipos de operación en catálogo (typeahead)
 */
router.get('/operation-types', authenticate, async (req, res) => {
  try {
    const { 
      search = '', 
      enabled = 'true', 
      limit = '20', 
      cursor 
    } = req.query;

    const searchTerm = search.trim();
    const limitNum = Math.min(parseInt(limit) || 20, 50);
    const enabledBool = enabled === 'true';

    let query = enabledBool
      ? { $or: [
          { enabled: true },
          { enabled: { $exists: false } },
          { enabled: 'true' },
          { enabled: 1 }
        ] }
      : { $or: [
          { enabled: false },
          { enabled: 'false' },
          { enabled: 0 }
        ] };

    if (cursor) {
      query._id = { $gt: cursor };
    }

    if (searchTerm.length > 0) {
      const regex = new RegExp(escapeRegExp(searchTerm), 'i');
      query.$or = [
        { name: regex },
        { parent: regex },
        { description: regex }
      ];
    }

    const items = await CatalogOperationType
      .find(query)
      .sort({ name: 1 })
      .limit(limitNum + 1)
      .select('_id name parent description infoAdicionalDefault')
      .lean();

    const hasMore = items.length > limitNum;
    const results = hasMore ? items.slice(0, limitNum) : items;
    const nextCursor = hasMore ? results[results.length - 1]._id : null;

    res.json({
      items: results,
      nextCursor
    });
  } catch (error) {
    console.error('Error en búsqueda de operation types:', error);
    res.status(500).json({ message: 'Error al buscar operation types', error: error.message });
  }
});

module.exports = router;
