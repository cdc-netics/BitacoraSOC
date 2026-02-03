/**
 * Script de Seed para Catálogos SOC
 * 
 * Pobla las colecciones:
 *   - catalog_events (eventos SOC)
 *   - catalog_log_sources (fuentes de logs / clientes)
 *   - catalog_operation_types (tipos de operación)
 * 
 * Ejecutar: node src/scripts/seed-catalogs.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const CatalogEvent = require('../models/CatalogEvent');
const CatalogLogSource = require('../models/CatalogLogSource');
const CatalogOperationType = require('../models/CatalogOperationType');

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bitacora-soc', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Datos de ejemplo - Eventos SOC
const sampleEvents = [
  {
    name: 'Phishing detectado',
    parent: 'Email Security',
    description: 'Correo electrónico de phishing detectado y bloqueado',
    motivoDefault: 'Se detectó correo de phishing dirigido a usuarios internos. Email bloqueado por filtro anti-spam.',
    enabled: true
  },
  {
    name: 'Malware detectado en endpoint',
    parent: 'Endpoint Security',
    description: 'Malware detectado y cuarentenado en estación de trabajo',
    motivoDefault: 'Antivirus detectó malware en endpoint. Archivo movido a cuarentena y usuario notificado.',
    enabled: true
  },
  {
    name: 'Intento de acceso no autorizado',
    parent: 'Access Control',
    description: 'Múltiples intentos fallidos de autenticación',
    motivoDefault: 'Se detectaron múltiples intentos de acceso fallidos desde IP externa. Cuenta bloqueada temporalmente.',
    enabled: true
  },
  {
    name: 'Vulnerabilidad crítica detectada',
    parent: 'Vulnerability Management',
    description: 'Vulnerabilidad de alta criticidad identificada en sistema',
    motivoDefault: 'Scanner de vulnerabilidades identificó CVE crítico. Parche de seguridad aplicado.',
    enabled: true
  },
  {
    name: 'Ataque DDoS mitigado',
    parent: 'Network Security',
    description: 'Ataque de denegación de servicio distribuido mitigado',
    motivoDefault: 'Firewall detectó y bloqueó ataque DDoS. Tráfico malicioso filtrado exitosamente.',
    enabled: true
  },
  {
    name: 'Fuga de datos previenida',
    parent: 'Data Loss Prevention',
    description: 'Intento de exfiltración de datos bloqueado',
    motivoDefault: 'DLP detectó intento de envío de datos sensibles. Transmisión bloqueada y usuario alertado.',
    enabled: true
  },
  {
    name: 'Actividad sospechosa en Active Directory',
    parent: 'Identity & Access',
    description: 'Comportamiento anómalo detectado en AD',
    motivoDefault: 'SIEM alertó sobre actividad anómala en AD. Usuario deshabilitado preventivamente.',
    enabled: true
  },
  {
    name: 'Ransomware bloqueado',
    parent: 'Endpoint Security',
    description: 'Intento de cifrado de archivos por ransomware bloqueado',
    motivoDefault: 'EDR detectó y bloqueó comportamiento de ransomware. Sistema restaurado desde backup.',
    enabled: true
  }
];

// Datos de ejemplo - Log Sources
const sampleLogSources = [
  {
    name: 'Netics',
    parent: 'Sistema Interno',
    description: 'Log source por defecto del sistema',
    enabled: true
  },
  {
    name: 'Firewall Cisco ASA',
    parent: 'Cliente ABC Corp',
    description: 'Firewall perimetral principal',
    enabled: true
  },
  {
    name: 'Firewall Fortinet',
    parent: 'Cliente XYZ Ltd',
    description: 'Firewall de próxima generación',
    enabled: true
  },
  {
    name: 'Windows Domain Controller',
    parent: 'Cliente ABC Corp',
    description: 'Controlador de dominio Active Directory',
    enabled: true
  },
  {
    name: 'Microsoft 365 Defender',
    parent: 'Cliente DEF Inc',
    description: 'Plataforma de seguridad en la nube',
    enabled: true
  },
  {
    name: 'Trellix EDR',
    parent: 'Cliente ABC Corp',
    description: 'Endpoint Detection and Response',
    enabled: true
  },
  {
    name: 'Splunk SIEM',
    parent: 'Infraestructura SOC',
    description: 'Sistema centralizado de logs',
    enabled: true
  },
  {
    name: 'CrowdStrike Falcon',
    parent: 'Cliente XYZ Ltd',
    description: 'Plataforma de protección de endpoints',
    enabled: true
  },
  {
    name: 'AWS CloudTrail',
    parent: 'Cliente DEF Inc',
    description: 'Auditoría de servicios AWS',
    enabled: true
  }
];

// Datos de ejemplo - Operation Types
const sampleOperationTypes = [
  {
    name: 'Investigación de incidente',
    parent: 'Incident Response',
    description: 'Análisis forense de evento de seguridad',
    infoAdicionalDefault: 'Investigación iniciada por alerta SIEM. Evidencia recolectada y preservada.',
    enabled: true
  },
  {
    name: 'Monitoreo proactivo',
    parent: 'SOC Operations',
    description: 'Hunting de amenazas en infraestructura',
    infoAdicionalDefault: 'Sesión de threat hunting ejecutada. No se encontraron IoCs maliciosos.',
    enabled: true
  },
  {
    name: 'Respuesta a incidente',
    parent: 'Incident Response',
    description: 'Contención y remediación de amenaza',
    infoAdicionalDefault: 'Medidas de contención implementadas. Amenaza neutralizada.',
    enabled: true
  },
  {
    name: 'Análisis de vulnerabilidades',
    parent: 'Vulnerability Management',
    description: 'Evaluación de vulnerabilidades identificadas',
    infoAdicionalDefault: 'Scan de vulnerabilidades completado. Reporte de hallazgos generado.',
    enabled: true
  },
  {
    name: 'Gestión de parches',
    parent: 'Patch Management',
    description: 'Aplicación de actualizaciones de seguridad',
    infoAdicionalDefault: 'Parches críticos aplicados según política de seguridad.',
    enabled: true
  },
  {
    name: 'Configuración de reglas',
    parent: 'Security Configuration',
    description: 'Ajuste de políticas y reglas de seguridad',
    infoAdicionalDefault: 'Reglas de firewall actualizadas. Cambios documentados y aprobados.',
    enabled: true
  }
];

async function seedCatalogs() {
  try {
    console.log('🌱 Iniciando seed de catálogos...\n');

    // Limpiar colecciones existentes (opcional - comentar si no quieres borrar)
    console.log('🗑️  Limpiando colecciones existentes...');
    await CatalogEvent.deleteMany({});
    await CatalogLogSource.deleteMany({});
    await CatalogOperationType.deleteMany({});

    // Insertar eventos
    console.log('📋 Insertando eventos SOC...');
    const events = await CatalogEvent.insertMany(sampleEvents);
    console.log(`✅ ${events.length} eventos insertados\n`);

    // Insertar log sources
    console.log('📡 Insertando log sources...');
    const logSources = await CatalogLogSource.insertMany(sampleLogSources);
    console.log(`✅ ${logSources.length} log sources insertados\n`);

    // Insertar operation types
    console.log('⚙️  Insertando tipos de operación...');
    const operationTypes = await CatalogOperationType.insertMany(sampleOperationTypes);
    console.log(`✅ ${operationTypes.length} tipos de operación insertados\n`);

    console.log('✨ Seed completado exitosamente!\n');
    console.log('📊 Resumen:');
    console.log(`   - Eventos: ${events.length}`);
    console.log(`   - Log Sources: ${logSources.length}`);
    console.log(`   - Operation Types: ${operationTypes.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

// Ejecutar seed
seedCatalogs();
