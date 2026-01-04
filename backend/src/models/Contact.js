const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  organization: {
    type: String,
    trim: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    default: null
  },
  role: {
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
contactSchema.index({ email: 1 });
contactSchema.index({ active: 1 });
contactSchema.index({ serviceId: 1 });

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
