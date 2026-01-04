const mongoose = require('mongoose');

const shiftRoleSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    enum: ['N2', 'TI', 'N1_NO_HABIL']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices
shiftRoleSchema.index({ code: 1 });

const ShiftRole = mongoose.model('ShiftRole', shiftRoleSchema);

module.exports = ShiftRole;
