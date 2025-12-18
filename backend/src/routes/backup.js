/**
 * Rutas de Backup/Restore MongoDB
 * 
 * Endpoints:
 *   GET  /api/backup/mongo   - Crear backup con mongodump (admin)
 *   POST /api/backup/restore - Restaurar backup con mongorestore (admin)
 *   GET  /api/backup/list    - Listar backups disponibles (admin)
 * 
 * Reglas SOC:
 *   - Solo admins pueden ejecutar backups
 *   - Path sanitization obligatoria (prevenir path traversal)
 *   - Command injection mitigado con validación estricta
 *   - Auditoría: registrar quién ejecuta backup/restore
 */
const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { authenticate, authorize } = require('../middleware/auth');
const { audit } = require('../utils/audit');
const { logger } = require('../utils/logger');

// Helper seguro para ejecutar mongodump/mongorestore sin command injection
const spawnSafe = (command, args) => {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { shell: false });
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => stdout += data.toString());
    proc.stderr.on('data', (data) => stderr += data.toString());
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Proceso terminó con código ${code}: ${stderr}`));
      }
    });
    
    proc.on('error', (err) => reject(err));
  });
};

// GET /api/backup/mongo - Crear backup de MongoDB (admin)
router.get('/mongo', authenticate, authorize('admin'), async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '../../backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    // Verificar permisos de escritura
    try {
      await fs.access(backupDir, require('fs').constants.W_OK);
    } catch {
      return res.status(500).json({ message: 'Sin permisos de escritura en carpeta backups' });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(backupDir, `backup-${timestamp}`);

    const mongoUri = process.env.MONGODB_URI;

    // 🔒 CRÍTICO: spawn con args separados (NO concatenación de strings)
    // Previene command injection: el path y URI son argumentos independientes
    await spawnSafe('mongodump', ['--uri', mongoUri, '--out', outputPath]);
    
    // Auditar backup exitoso
    await audit(req, {
      event: 'admin.backup.create',
      level: 'info',
      result: { success: true },
      metadata: { outputPath, timestamp }
    });

    res.json({
      message: 'Backup creado exitosamente',
      path: outputPath,
      timestamp
    });
  } catch (error) {
    logger.error({
      err: error,
      requestId: req.requestId,
      adminId: req.user._id
    }, 'Error creating backup');
    
    await audit(req, {
      event: 'admin.backup.create',
      level: 'error',
      result: { success: false, reason: error.message }
    });
    
    res.status(500).json({
      message: 'Error al crear backup',
      error: error.message
    });
  }
});

// POST /api/backup/restore - Restaurar backup (admin)
router.post('/restore', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { backupPath } = req.body;

    if (!backupPath) {
      return res.status(400).json({ message: 'Se requiere la ruta del backup' });
    }

    // 🔒 CRÍTICO: Sanitizar backupPath para prevenir path traversal y command injection
    const backupDir = path.join(__dirname, '../../backups');
    const resolvedPath = path.resolve(backupPath);
    
    // Verificar que el path resuelto esté dentro de backupDir
    if (!resolvedPath.startsWith(path.resolve(backupDir))) {
      return res.status(400).json({ message: 'Ruta de backup inválida (path traversal detectado)' });
    }
    
    // Verificar que exista
    try {
      await fs.access(resolvedPath, require('fs').constants.R_OK);
    } catch {
      return res.status(404).json({ message: 'Backup no encontrado' });
    }

    const mongoUri = process.env.MONGODB_URI;

    // 🔒 CRÍTICO: spawn con args separados (path ya sanitizado arriba)
    await spawnSafe('mongorestore', ['--uri', mongoUri, '--drop', resolvedPath]);

    res.json({ message: 'Backup restaurado exitosamente' });
  } catch (error) {
    console.error('Error al restaurar backup:', error);
    res.status(500).json({
      message: 'Error al restaurar backup',
      error: error.message
    });
  }
});

// GET /api/backup/list - Listar backups disponibles (admin)
router.get('/list', authenticate, authorize('admin'), async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '../../backups');

    try {
      const files = await fs.readdir(backupDir);
      const backups = files.filter(f => f.startsWith('backup-'));

      const backupInfo = await Promise.all(
        backups.map(async (name) => {
          const stat = await fs.stat(path.join(backupDir, name));
          return {
            name,
            path: path.join(backupDir, name),
            created: stat.birthtime,
            size: stat.size
          };
        })
      );

      res.json(backupInfo.sort((a, b) => b.created - a.created));
    } catch (err) {
      res.json([]);
    }
  } catch (error) {
    console.error('Error al listar backups:', error);
    res.status(500).json({ message: 'Error al listar backups' });
  }
});

module.exports = router;
