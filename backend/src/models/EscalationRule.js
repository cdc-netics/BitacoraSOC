const mongoose = require('mongoose');

const escalationRuleSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  recipientsTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  }],
  recipientsCC: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  }],
  emergencyPhone: {
    type: String,
    trim: true
  },
  emergencyContactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  notes: {
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
escalationRuleSchema.index({ serviceId: 1 });
escalationRuleSchema.index({ active: 1 });

const EscalationRule = mongoose.model('EscalationRule', escalationRuleSchema);

module.exports = EscalationRule;
