/**
 * Modelo de Configuración Global de Aplicación
 * 
 * Función:
 *   - Configuración dinámica del SOC (sin reiniciar servidor)
 *   - Solo admin puede modificar (frontend settings)
 *   - Singleton: solo existe 1 registro
 * 
 * Parámetros SOC:
 *   - guestModeEnabled: Permitir creación de invitados (true/false)
 *   - guestMaxDurationDays: Duración de cuenta guest (1-30 días)
 *   - shiftCheckCooldownHours: Tiempo mínimo entre checks (1-24 horas)
 *   - logoUrl/logoType: Personalización de logo (URL o upload)
 * 
 * Uso:
 *   - Al crear guest: calcular expiresAt = now + guestMaxDurationDays
 *   - Al registrar check: validar cooldown con shiftCheckCooldownHours
 *   - Frontend: mostrar/ocultar botón crear guest según guestModeEnabled
 * 
 * Singleton pattern: GET siempre retorna el único registro (crea si no existe)
 */
const mongoose = require('mongoose');

// Configuración global de la aplicación
const appConfigSchema = new mongoose.Schema({
  // Modo invitado
  guestModeEnabled: {
    type: Boolean,
    default: false
  },
  guestMaxDurationDays: {
    type: Number,
    default: 2,
    min: 1,
    max: 30
  },
  // Cooldown checklist
  shiftCheckCooldownHours: {
    type: Number,
    default: 4,
    min: 1,
    max: 24
  },
  // Alertas de checklist (B4-7)
  checklistAlertEnabled: {
    type: Boolean,
    default: true
  },
  checklistAlertTime: {
    type: String,
    default: '09:30'
  },
  lastChecklistAlertDate: {
    type: Date,
    default: null
  },
  // Logo
  logoUrl: {
    type: String,
    default: ''
  },
  logoType: {
    type: String,
    enum: ['url', 'upload', 'external'],
    default: 'url'
  },
  // LogSource por defecto para entradas sin cliente
  defaultLogSourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CatalogLogSource',
    default: null
  },
  // Última actualización
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AppConfig', appConfigSchema);
