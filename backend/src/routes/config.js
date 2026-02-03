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
    let config = await AppConfig.findOne().populate('defaultLogSourceId', 'name enabled');

    if (!config) {
      config = await AppConfig.create({
        guestModeEnabled: false,
        guestMaxDurationDays: 2,
        shiftCheckCooldownHours: 4,
        checklistAlertEnabled: true,
        checklistAlertTime: '09:30'
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
    body('checklistAlertEnabled').optional().isBoolean(),
    body('checklistAlertTime').optional().matches(/^\d{2}:\d{2}$/).withMessage('Formato de hora inválido (HH:mm)'),
    body('logoUrl').optional().trim(),
    body('defaultLogSourceId').optional({ checkFalsy: true }).isMongoId().withMessage('ID de LogSource inválido')
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

      // Populate defaultLogSourceId para retornar nombre
      await config.populate('defaultLogSourceId', 'name enabled');

      res.json({ message: 'Configuración actualizada', config });
    } catch (error) {
      console.error('Error al actualizar config:', error);
      res.status(500).json({ message: 'Error al actualizar configuración' });
    }
  }
);

// GET /api/config/logo - Obtener logo actual (PÚBLICO - para mostrar en login)
router.get('/logo', async (req, res) => {
  try {
    const config = await AppConfig.findOne();
    
    if (!config || !config.logoUrl) {
      return res.json({ logoUrl: '' });
    }

    // Devolver ruta relativa - el navegador la resolverá automáticamente
    res.json({ logoUrl: config.logoUrl });
  } catch (error) {
    console.error('Error al obtener logo:', error);
    res.status(500).json({ message: 'Error al obtener logo' });
  }
});

// POST /api/config/logo - Subir logo (admin)
router.post('/logo',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    // Middleware dinámico para manejar multipart o JSON
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Manejar subida de archivo
      upload.single('logo')(req, res, async (err) => {
        if (err) {
          console.error('Error en multer:', err);
          return res.status(400).json({ message: err.message || 'Error al procesar archivo' });
        }

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
      });
    } else {
      // Manejar base64 o URL externa
      try {
        const { logoData, logoUrl } = req.body;

        if (!logoData && !logoUrl) {
          return res.status(400).json({ message: 'Debe proporcionar logoData (base64) o logoUrl' });
        }

        let config = await AppConfig.findOne();
        if (!config) {
          config = new AppConfig();
        }

        if (logoData) {
          // Guardar imagen base64 como archivo
          const matches = logoData.match(/^data:image\/(\w+);base64,(.+)$/);
          if (!matches) {
            return res.status(400).json({ message: 'Formato de imagen base64 inválido' });
          }

          const ext = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');

          // Validar tamaño (2MB máx)
          if (buffer.length > 2 * 1024 * 1024) {
            return res.status(400).json({ message: 'La imagen es muy grande (máx 2MB)' });
          }

          const uploadDir = path.join(__dirname, '../../uploads/logos');
          await fs.mkdir(uploadDir, { recursive: true });

          const filename = `logo-${Date.now()}.${ext}`;
          const filepath = path.join(uploadDir, filename);
          await fs.writeFile(filepath, buffer);

          config.logoUrl = `/uploads/logos/${filename}`;
          config.logoType = 'upload';
        } else if (logoUrl) {
          // URL externa
          config.logoUrl = logoUrl;
          config.logoType = 'external';
        }

        config.lastUpdatedBy = req.user._id;
        await config.save();

        res.json({
          message: 'Logo actualizado',
          logoUrl: config.logoUrl
        });
      } catch (error) {
        console.error('Error al guardar logo:', error);
        res.status(500).json({ message: 'Error al guardar logo' });
      }
    }
  }
);

// DELETE /api/config/logo - Eliminar logo (admin)
router.delete('/logo',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const config = await AppConfig.findOne();
      
      if (!config || !config.logoUrl) {
        return res.json({ message: 'No hay logo configurado' });
      }

      // Si es un archivo local, eliminarlo
      if (config.logoType === 'upload' && config.logoUrl.startsWith('/uploads/')) {
        const filepath = path.join(__dirname, '../..', config.logoUrl);
        try {
          await fs.unlink(filepath);
        } catch (err) {
          console.warn('No se pudo eliminar archivo:', err.message);
        }
      }

      config.logoUrl = '';
      config.logoType = undefined;
      config.lastUpdatedBy = req.user._id;
      await config.save();

      res.json({ message: 'Logo eliminado' });
    } catch (error) {
      console.error('Error al eliminar logo:', error);
      res.status(500).json({ message: 'Error al eliminar logo' });
    }
  }
);

module.exports = router;
