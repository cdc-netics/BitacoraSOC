###############################################################################
# Script de migración: Crear LogSource "Netics" y actualizar entradas
# 
# Este script:
# 1. Lee credenciales de MongoDB desde .env
# 2. Crea el LogSource "Netics" si no existe
# 3. Actualiza todas las entradas sin clientId para asignarles "Netics"
#
# Uso:
#   .\scripts\migrate-netics-logsource.ps1
#
# Pre-requisitos:
#   - Docker y docker-compose corriendo
#   - Archivo .env con MONGO_ROOT_USER y MONGO_ROOT_PASSWORD
###############################################################################

$ErrorActionPreference = "Stop"

# Colores
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Success "========================================"
Write-Success "  Migración: LogSource Netics"
Write-Success "========================================"
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path ".env")) {
    Write-Error "❌ Error: Archivo .env no encontrado"
    Write-Host "   Ejecuta este script desde el directorio raíz del proyecto"
    exit 1
}

# Cargar variables del .env
Write-Warning "📋 Cargando configuración desde .env..."

$envVars = @{}
Get-Content ".env" | Where-Object { $_ -notmatch '^\s*#' -and $_ -match '=' } | ForEach-Object {
    $key, $value = $_ -split '=', 2
    $envVars[$key.Trim()] = $value.Trim()
}

$MONGO_ROOT_USER = $envVars['MONGO_ROOT_USER']
$MONGO_ROOT_PASSWORD = $envVars['MONGO_ROOT_PASSWORD']
$MONGO_DATABASE = if ($envVars['MONGO_DATABASE']) { $envVars['MONGO_DATABASE'] } else { 'bitacora_soc' }
$CONTAINER_NAME = if ($envVars['MONGO_CONTAINER_NAME']) { $envVars['MONGO_CONTAINER_NAME'] } else { 'bitacora-mongodb' }

# Validar que las variables existan
if (-not $MONGO_ROOT_USER -or -not $MONGO_ROOT_PASSWORD) {
    Write-Error "❌ Error: MONGO_ROOT_USER o MONGO_ROOT_PASSWORD no definidos en .env"
    exit 1
}

Write-Success "✅ Configuración cargada:"
Write-Host "   Usuario: $MONGO_ROOT_USER"
Write-Host "   Base de datos: $MONGO_DATABASE"
Write-Host "   Contenedor: $CONTAINER_NAME"
Write-Host ""

# Verificar que el contenedor esté corriendo
$containerRunning = docker ps --format '{{.Names}}' | Where-Object { $_ -eq $CONTAINER_NAME }
if (-not $containerRunning) {
    Write-Error "❌ Error: Contenedor $CONTAINER_NAME no está corriendo"
    Write-Host "   Inicia los servicios con: docker-compose up -d"
    exit 1
}

Write-Warning "🔄 Ejecutando migración en MongoDB..."
Write-Host ""

# Script de MongoDB (sin usar comillas escapadas para PowerShell)
$mongoScript = @"
    // Conectar a la base de datos
    db = db.getSiblingDB('$MONGO_DATABASE');
    
    print('');
    print('═══════════════════════════════════════════════════════');
    print('  Paso 1: Verificar/Crear LogSource "Netics"');
    print('═══════════════════════════════════════════════════════');
    print('');
    
    // 1. Crear o verificar LogSource 'Netics'
    const existing = db.catalog_log_sources.findOne({ name: 'Netics' });
    
    if (existing) {
      print('✅ LogSource "Netics" ya existe');
      print('   ID: ' + existing._id);
      print('   Estado: ' + (existing.enabled ? 'Habilitado' : 'Deshabilitado'));
      
      if (!existing.enabled) {
        db.catalog_log_sources.updateOne(
          { _id: existing._id },
          { `$set: { enabled: true, updatedAt: new Date() } }
        );
        print('   ✅ Habilitado');
      }
    } else {
      const result = db.catalog_log_sources.insertOne({
        name: 'Netics',
        parent: 'Sistema Interno',
        description: 'Log source por defecto del sistema',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      print('✅ LogSource "Netics" creado exitosamente');
      print('   ID: ' + result.insertedId);
    }
    
    print('');
    print('═══════════════════════════════════════════════════════');
    print('  Paso 2: Actualizar entradas sin LogSource');
    print('═══════════════════════════════════════════════════════');
    print('');
    
    // 2. Actualizar entradas existentes sin clientId
    const netics = db.catalog_log_sources.findOne({ name: 'Netics' });
    
    if (netics) {
      // Contar entradas sin clientId
      const countBefore = db.entries.countDocuments({ clientId: null });
      print('📊 Entradas sin LogSource: ' + countBefore);
      
      if (countBefore > 0) {
        const updateResult = db.entries.updateMany(
          { clientId: null },
          { `$set: { clientId: netics._id, clientName: 'Netics' } }
        );
        print('✅ ' + updateResult.modifiedCount + ' entradas actualizadas con "Netics"');
      } else {
        print('✅ No hay entradas sin LogSource');
      }
      
      // Verificar resultado
      const countAfter = db.entries.countDocuments({ clientId: null });
      print('📊 Entradas sin LogSource después: ' + countAfter);
    } else {
      print('❌ Error: No se pudo encontrar el LogSource "Netics"');
    }
    
    print('');
    print('═══════════════════════════════════════════════════════');
    print('  Paso 3: Verificación final');
    print('═══════════════════════════════════════════════════════');
    print('');
    
    // 3. Estadísticas finales
    const totalEntries = db.entries.countDocuments({});
    const entriesWithNetics = db.entries.countDocuments({ clientName: 'Netics' });
    const entriesWithClient = db.entries.countDocuments({ clientId: { `$ne: null } });
    
    print('📊 Estadísticas:');
    print('   Total de entradas: ' + totalEntries);
    print('   Entradas con Netics: ' + entriesWithNetics);
    print('   Entradas con LogSource: ' + entriesWithClient);
    print('');
"@

# Ejecutar migración
try {
    docker exec $CONTAINER_NAME mongosh `
        --username $MONGO_ROOT_USER `
        --password $MONGO_ROOT_PASSWORD `
        --authenticationDatabase admin `
        --quiet `
        --eval $mongoScript

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Success "✨ Migración completada exitosamente"
        Write-Host ""
        
        Write-Warning "📝 Próximos pasos:"
        Write-Host "   1. Verifica que el frontend muestre la columna 'Cliente / Log Source'"
        Write-Host "   2. Crea una nueva entrada sin seleccionar LogSource"
        Write-Host "   3. Verifica que se asigne automáticamente a 'Netics'"
        Write-Host ""
    } else {
        throw "Error en la ejecución de mongosh"
    }
} catch {
    Write-Host ""
    Write-Error "❌ Error en la migración"
    Write-Warning "Revisa los logs arriba para más detalles"
    Write-Host ""
    exit 1
}
