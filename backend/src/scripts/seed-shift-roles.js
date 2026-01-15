const mongoose = require('mongoose');
const ShiftRole = require('../models/ShiftRole');
require('dotenv').config();

const roles = [
  {
    code: 'N2',
    name: 'Nivel 2',
    description: 'Soporte técnico avanzado',
    active: true
  },
  {
    code: 'TI',
    name: 'Soporte TI',
    description: 'Equipo de tecnologías de la información',
    active: true
  },
  {
    code: 'N1_NO_HABIL',
    name: 'N1 No Hábil',
    description: 'Soporte N1 fuera de horario hábil',
    active: true
  }
];

async function seedShiftRoles() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('📡 Conectado a MongoDB');

    // Verificar si ya existen roles
    const existingRoles = await ShiftRole.find();
    if (existingRoles.length > 0) {
      console.log('⚠️  Ya existen roles de turno. Omitiendo seed...');
      process.exit(0);
    }

    // Insertar roles
    await ShiftRole.insertMany(roles);
    
    console.log('✅ Roles de turno creados exitosamente:');
    roles.forEach(role => {
      console.log(`   - ${role.code}: ${role.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear roles de turno:', error);
    process.exit(1);
  }
}

seedShiftRoles();
