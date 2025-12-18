const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// FIXED: Use MONGODB_URI to match .env file
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/bitacora_soc';

const adminUser = {
  username: 'admin',
  password: 'Admin123!',
  email: 'admin@bitacora.local',
  fullName: 'Administrador',
  role: 'admin',
  theme: 'dark'
};

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  El usuario admin ya existe. No se requiere seed.');
      process.exit(0);
    }

    // Crear admin
    // NOTA: No hashear aquí, el pre-save hook del modelo lo hará automáticamente
    const newAdmin = new User(adminUser);

    await newAdmin.save();
    console.log('✅ Usuario admin creado exitosamente');
    console.log('   Usuario: admin');
    console.log('   Contraseña: Admin123!');
    console.log('   ⚠️  CAMBIA ESTA CONTRASEÑA INMEDIATAMENTE');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error.message);
    process.exit(1);
  }
}

seedAdmin();
