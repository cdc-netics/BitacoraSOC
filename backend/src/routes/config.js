const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const AppConfig = require('../models/AppConfig');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Configurar multer para logo
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|svg\+xml/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (jpg, png, svg)'));
  }
});

// GET /api/config - Obtener configuración
router.get('/', authenticate, async (req, res) => {
  try {
    let config = await AppConfig.findOne();

    if (!config) {
      config = await AppConfig.create({
        guestModeEnabled: false,
        guestMaxDurationDays: 2,
        shiftCheckCooldownHours: 4
      });
    }

    res.json(config);
  } catch (error) {
    console.error('Error al obtener config:', error);
    res.status(500).json({ message: 'Error al obtener configuración' });
  }
});

// PUT /api/config - Actualizar configuración (admin)
router.put('/',
  authenticate,
  authorize('admin'),
  [
    body('guestModeEnabled').optional().isBoolean(),
    body('guestMaxDurationDays').optional().isInt({ min: 1, max: 30 }).toInt(),
    body('shiftCheckCooldownHours').optional().isInt({ min: 1, max: 24 }).toInt(),
    body('logoUrl').optional().trim()
  ],
  validate,
  async (req, res) => {
    try {
      let config = await AppConfig.findOne();

      if (!config) {
        config = new AppConfig(req.body);
      } else {
        Object.assign(config, req.body);
      }

      config.lastUpdatedBy = req.user._id;
      await config.save();

      res.json({ message: 'Configuración actualizada', config });
    } catch (error) {
      console.error('Error al actualizar config:', error);
      res.status(500).json({ message: 'Error al actualizar configuración' });
    }
  }
);

// POST /api/config/logo - Subir logo (admin)
router.post('/logo',
  authenticate,
  authorize('admin'),
  upload.single('logo'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No se proporcionó archivo' });
      }

      const logoUrl = `/uploads/logos/${req.file.filename}`;

      let config = await AppConfig.findOne();
      if (!config) {
        config = new AppConfig();
      }

      config.logoUrl = logoUrl;
      config.logoType = 'upload';
      config.lastUpdatedBy = req.user._id;
      await config.save();

      res.json({
        message: 'Logo actualizado',
        logoUrl
      });
    } catch (error) {
      console.error('Error al subir logo:', error);
      res.status(500).json({ message: 'Error al subir logo' });
    }
  }
);

module.exports = router;
