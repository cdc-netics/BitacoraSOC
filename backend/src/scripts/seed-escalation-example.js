/**
 * Script de ejemplo para poblar el módulo de Escalaciones
 * con datos de prueba basados en JUNJI - Mundo
 * 
 * Uso:
 *   node src/scripts/seed-escalation-example.js
 */

const mongoose = require('mongoose');
const Client = require('../models/Client');
const Service = require('../models/Service');
const Contact = require('../models/Contact');
const EscalationRule = require('../models/EscalationRule');
const ShiftRole = require('../models/ShiftRole');
const ShiftAssignment = require('../models/ShiftAssignment');
const ShiftOverride = require('../models/ShiftOverride');
const User = require('../models/User');
require('dotenv').config();

async function seedEscalationExample() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Conectado a MongoDB\n');

    // 1. Crear Roles de Turno (si no existen)
    console.log('1️⃣  Creando roles de turno...');
    const roles = ['N2', 'TI', 'N1_NO_HABIL'];
    const roleNames = ['Nivel 2', 'Soporte TI', 'N1 No Hábil'];
    
    for (let i = 0; i < roles.length; i++) {
      const existing = await ShiftRole.findOne({ code: roles[i] });
      if (!existing) {
        await ShiftRole.create({
          code: roles[i],
          name: roleNames[i],
          active: true
        });
        console.log(`   ✅ Rol creado: ${roles[i]}`);
      } else {
        console.log(`   ⏭️  Rol ya existe: ${roles[i]}`);
      }
    }

    // 2. Crear Clientes
    console.log('\n2️⃣  Creando clientes...');
    const junji = await Client.findOneAndUpdate(
      { code: 'JUNJI' },
      {
        name: 'JUNJI',
        code: 'JUNJI',
        description: 'Junta Nacional de Jardines Infantiles',
        active: true
      },
      { upsert: true, new: true }
    );
    console.log(`   ✅ Cliente: ${junji.name} (${junji._id})`);

    const dpp = await Client.findOneAndUpdate(
      { code: 'DPP' },
      {
        name: 'DPP',
        code: 'DPP',
        description: 'Defensoría Penal Pública',
        active: true
      },
      { upsert: true, new: true }
    );
    console.log(`   ✅ Cliente: ${dpp.name} (${dpp._id})`);

    // 3. Crear Servicios
    console.log('\n3️⃣  Creando servicios...');
    const junjiMundo = await Service.findOneAndUpdate(
      { code: 'JUNJI_MUNDO' },
      {
        clientId: junji._id,
        name: 'JUNJI - Mundo',
        code: 'JUNJI_MUNDO',
        description: 'Servicio telecomunicaciones Mundo',
        active: true
      },
      { upsert: true, new: true }
    );
    console.log(`   ✅ Servicio: ${junjiMundo.name} (${junjiMundo._id})`);

    // 4. Crear Contactos
    console.log('\n4️⃣  Creando contactos...');
    
    const miltonAranda = await Contact.findOneAndUpdate(
      { email: 'milton.aranda@mundotelecomunicaciones.cl' },
      {
        name: 'Milton Aranda',
        email: 'milton.aranda@mundotelecomunicaciones.cl',
        organization: 'Mundo Telecomunicaciones',
        role: 'Jefe Operaciones',
        active: true
      },
      { upsert: true, new: true }
    );
    console.log(`   ✅ Contacto: ${miltonAranda.name}`);

    const claudioSchleyer = await Contact.findOneAndUpdate(
      { email: 'claudio.schleyer@mundotelecomunicaciones.cl' },
      {
        name: 'Claudio Schleyer',
        email: 'claudio.schleyer@mundotelecomunicaciones.cl',
        organization: 'Mundo Telecomunicaciones',
        role: 'Gerente',
        active: true
      },
      { upsert: true, new: true }
    );
    console.log(`   ✅ Contacto: ${claudioSchleyer.name}`);

    const diegoGarcia = await Contact.findOneAndUpdate(
      { email: 'diego.garcia@junji.cl' },
      {
        name: 'Diego García',
        email: 'diego.garcia@junji.cl',
        organization: 'JUNJI',
        role: 'Mandante',
        active: true
      },
      { upsert: true, new: true }
    );
    console.log(`   ✅ Contacto: ${diegoGarcia.name}`);

    // 5. Crear Regla de Escalación
    console.log('\n5️⃣  Creando regla de escalación...');
    const rule = await EscalationRule.findOneAndUpdate(
      { serviceId: junjiMundo._id },
      {
        serviceId: junjiMundo._id,
        recipientsTo: [miltonAranda._id],
        recipientsCC: [claudioSchleyer._id, diegoGarcia._id],
        emergencyPhone: '+56923609140',
        emergencyContactId: miltonAranda._id,
        notes: 'Contactar a Milton en emergencias',
        active: true
      },
      { upsert: true, new: true }
    );
    console.log(`   ✅ Regla creada para servicio ${junjiMundo.name}`);

    // 6. Obtener usuarios para asignaciones
    console.log('\n6️⃣  Obteniendo usuarios para turnos...');
    const users = await User.find({ role: { $in: ['admin', 'user'] } }).limit(3);
    
    if (users.length < 3) {
      console.log('   ⚠️  Se necesitan al menos 3 usuarios. Creando usuarios de ejemplo...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('demo123', 10);
      
      for (let i = users.length; i < 3; i++) {
        const newUser = await User.create({
          username: `turno${i + 1}`,
          password: hashedPassword,
          name: `Usuario Turno ${i + 1}`,
          email: `turno${i + 1}@synet.cl`,
          role: 'user',
          active: true
        });
        users.push(newUser);
        console.log(`   ✅ Usuario creado: ${newUser.name} (username: turno${i + 1}, password: demo123)`);
      }
    } else {
      console.log(`   ✅ ${users.length} usuarios disponibles para turnos`);
    }

    // 7. Crear Asignaciones de Turno (próxima semana)
    console.log('\n7️⃣  Creando asignaciones de turno...');
    
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // N2: Usuario 0
    const n2Start = new Date('2026-01-03T11:00:00Z'); // Viernes 08:00 Chile
    const n2End = new Date('2026-01-10T11:00:00Z');
    
    const assignmentN2 = await ShiftAssignment.findOneAndUpdate(
      { roleCode: 'N2', weekStartDate: n2Start },
      {
        roleCode: 'N2',
        userId: users[0]._id,
        weekStartDate: n2Start,
        weekEndDate: n2End,
        notes: 'Turno semanal N2 - Semana 1'
      },
      { upsert: true, new: true }
    );
    console.log(`   ✅ N2: ${users[0].name} (${n2Start.toISOString()} - ${n2End.toISOString()})`);

    // TI: Usuario 1
    const tiStart = new Date('2026-01-01T14:00:00Z'); // Miércoles 11:00 Chile
    const tiEnd = new Date('2026-01-08T14:00:00Z');
    
    const assignmentTI = await ShiftAssignment.findOneAndUpdate(
      { roleCode: 'TI', weekStartDate: tiStart },
      {
        roleCode: 'TI',
        userId: users[1]._id,
        weekStartDate: tiStart,
        weekEndDate: tiEnd,
        notes: 'Turno semanal TI - Semana 1'
      },
      { upsert: true, new: true }
    );
    console.log(`   ✅ TI: ${users[1].name} (${tiStart.toISOString()} - ${tiEnd.toISOString()})`);

    // N1_NO_HABIL: Usuario 2
    const n1Start = new Date('2026-01-06T03:00:00Z'); // Lunes 00:00 Chile
    const n1End = new Date('2026-01-13T03:00:00Z');
    
    const assignmentN1 = await ShiftAssignment.findOneAndUpdate(
      { roleCode: 'N1_NO_HABIL', weekStartDate: n1Start },
      {
        roleCode: 'N1_NO_HABIL',
        userId: users[2]._id,
        weekStartDate: n1Start,
        weekEndDate: n1End,
        notes: 'Turno semanal N1 No Hábil - Semana 1'
      },
      { upsert: true, new: true }
    );
    console.log(`   ✅ N1_NO_HABIL: ${users[2].name} (${n1Start.toISOString()} - ${n1End.toISOString()})`);

    // 8. Crear Override de ejemplo (opcional)
    console.log('\n8️⃣  Creando override de ejemplo...');
    
    if (users.length >= 2) {
      // Obtener usuario admin para createdBy
      const adminUser = await User.findOne({ role: 'admin' });
      
      const overrideStart = new Date('2026-01-05T00:00:00Z');
      const overrideEnd = new Date('2026-01-07T23:59:59Z');
      
      const override = await ShiftOverride.findOneAndUpdate(
        { roleCode: 'TI', startDate: overrideStart },
        {
          roleCode: 'TI',
          originalUserId: users[1]._id,
          replacementUserId: users[2]._id,
          startDate: overrideStart,
          endDate: overrideEnd,
          reason: 'Licencia médica del titular',
          active: true,
          createdBy: adminUser?._id || users[0]._id
        },
        { upsert: true, new: true }
      );
      console.log(`   ✅ Override TI: ${users[2].name} reemplaza a ${users[1].name}`);
      console.log(`      Vigencia: ${overrideStart.toISOString()} - ${overrideEnd.toISOString()}`);
    }

    console.log('\n✅ Seed completado exitosamente!\n');
    console.log('📍 Accesos:');
    console.log('   - Vista Analista: http://localhost:4200/main/escalation/view');
    console.log('   - Vista Admin: http://localhost:4200/main/escalation/admin');
    console.log('   - API: GET /api/escalation/view/' + junjiMundo._id);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante el seed:', error);
    process.exit(1);
  }
}

seedEscalationExample();
