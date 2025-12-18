/**
 * Rutas de Tags y Etiquetado
 * 
 * Endpoints:
 *   GET /api/tags/stats   - Top 50 tags más usados (admin)
 *   GET /api/tags/list    - Lista completa de tags únicos
 *   GET /api/tags/suggest - Autocomplete de tags (min 2 chars)
 * 
 * Funcionalidad:
 *   - Tags son extraídos automáticamente del contenido (#hashtag)
 *   - Autocomplete con regex case-insensitive (^query)
 *   - Stats: aggregation para conteo de frecuencia
 * 
 * Uso SOC:
 *   - Los analistas pueden etiquetar incidentes/operaciones con #tags
 *   - Tags facilitan búsqueda y categorización de entradas
 *   - Admin puede ver tags más usados en dashboard
 */
const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/tags/stats - Estadísticas de tags
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const tagStats = await Entry.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
      { $project: { tag: '$_id', count: 1, _id: 0 } }
    ]);

    res.json(tagStats);
  } catch (error) {
    console.error('Error al obtener stats de tags:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de tags' });
  }
});

// GET /api/tags/list - Lista completa de tags únicos
router.get('/list', authenticate, async (req, res) => {
  try {
    const tags = await Entry.distinct('tags');
    res.json(tags.sort());
  } catch (error) {
    console.error('Error al obtener lista de tags:', error);
    res.status(500).json({ message: 'Error al obtener tags' });
  }
});

// GET /api/tags/suggest - Autocompletar (ya está en entries.js pero también aquí)
router.get('/suggest', authenticate, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    const regex = new RegExp(`^${q}`, 'i');

    const tags = await Entry.aggregate([
      { $unwind: '$tags' },
      { $match: { tags: regex } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { tag: '$_id', count: 1, _id: 0 } }
    ]);

    res.json(tags);
  } catch (error) {
    console.error('Error en autocomplete:', error);
    res.status(500).json({ message: 'Error al obtener sugerencias' });
  }
});

module.exports = router;
