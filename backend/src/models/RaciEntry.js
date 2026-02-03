/**
 * Modelo RACI por cliente/servicio
 */
const mongoose = require('mongoose');

const raciEntrySchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    default: null
  },
  activity: {
    type: String,
    required: true,
    trim: true
  },
  responsible: {
    type: String,
    required: true,
    trim: true
  },
  accountable: {
    type: String,
    required: true,
    trim: true
  },
  consulted: {
    type: String,
    default: '',
    trim: true
  },
  informed: {
    type: String,
    default: '',
    trim: true
  },
  notes: {
    type: String,
    default: '',
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

raciEntrySchema.index({ clientId: 1, serviceId: 1, activity: 1 });

module.exports = mongoose.model('RaciEntry', raciEntrySchema);
