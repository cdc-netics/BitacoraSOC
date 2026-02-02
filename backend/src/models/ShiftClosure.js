/**
 * Modelo ShiftClosure
 * 
 * Registra el cierre de turno (B2m)
 * - Detecta inicio/cierre automático
 * - Envía resumen via integraciones (GLPI, SMTP, webhooks)
 * - Agrupa entradas y checklists del periodo
 */
const mongoose = require('mongoose');

const shiftClosureSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Inicio del turno (cuando user hizo primer check de "inicio")
  shiftStartAt: {
    type: Date,
    required: true
  },
  // Cierre del turno (cuando user registra check de "cierre")
  shiftEndAt: {
    type: Date,
    required: true
  },
  // Referencia al check de cierre
  closureCheckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShiftCheck'
  },
  // Resumen del turno (extraido del check)
  summary: {
    totalEntries: Number,
    totalIncidents: Number,
    servicesDown: [String], // códigos de servicios en rojo
    observaciones: String
  },
  // Estado de envío
  sentVia: {
    type: String,
    enum: ['email', 'api', 'webhook', 'none'],
    default: 'none'
  },
  integrationName: {
    type: String,
    default: null
  },
  sentAt: {
    type: Date,
    default: null
  },
  sentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  sentError: String,
  sentResponse: mongoose.Schema.Types.Mixed,
  // Para evitar doble envío
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Índices
shiftClosureSchema.index({ userId: 1, shiftStartAt: -1 });
shiftClosureSchema.index({ userId: 1, sentStatus: 1 });

const ShiftClosure = mongoose.model('ShiftClosure', shiftClosureSchema);

module.exports = ShiftClosure;
