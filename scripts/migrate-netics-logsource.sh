#!/bin/bash

###############################################################################
# Script de migración: Crear LogSource "Netics" y actualizar entradas
# 
# Este script:
# 1. Lee credenciales de MongoDB desde .env
# 2. Crea el LogSource "Netics" si no existe
# 3. Actualiza todas las entradas sin clientId para asignarles "Netics"
#
# Uso:
#   ./scripts/migrate-netics-logsource.sh
#
# Pre-requisitos:
#   - Docker y docker-compose corriendo
#   - Archivo .env con MONGO_ROOT_USER y MONGO_ROOT_PASSWORD
###############################################################################

set -e  # Salir si hay algún error

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Migración: LogSource Netics${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Verificar que estamos en el directorio correcto
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: Archivo .env no encontrado${NC}"
    echo "   Ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

# Cargar variables del .env
echo -e "${YELLOW}📋 Cargando configuración desde .env...${NC}"
export $(grep -v '^#' .env | xargs)

# Validar que las variables existan
if [ -z "$MONGO_ROOT_USER" ] || [ -z "$MONGO_ROOT_PASSWORD" ]; then
    echo -e "${RED}❌ Error: MONGO_ROOT_USER o MONGO_ROOT_PASSWORD no definidos en .env${NC}"
    exit 1
fi

MONGO_DATABASE=${MONGO_DATABASE:-bitacora_soc}
CONTAINER_NAME=${MONGO_CONTAINER_NAME:-bitacora-mongodb}

echo -e "${GREEN}✅ Configuración cargada:${NC}"
echo "   Usuario: $MONGO_ROOT_USER"
echo "   Base de datos: $MONGO_DATABASE"
echo "   Contenedor: $CONTAINER_NAME"
echo ""

# Verificar que el contenedor esté corriendo
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}❌ Error: Contenedor $CONTAINER_NAME no está corriendo${NC}"
    echo "   Inicia los servicios con: docker-compose up -d"
    exit 1
fi

echo -e "${YELLOW}🔄 Ejecutando migración en MongoDB...${NC}\n"

# Ejecutar migración
docker exec $CONTAINER_NAME mongosh \
  --username "$MONGO_ROOT_USER" \
  --password "$MONGO_ROOT_PASSWORD" \
  --authenticationDatabase admin \
  --quiet \
  --eval "
    // Conectar a la base de datos
    db = db.getSiblingDB('$MONGO_DATABASE');
    
    print('');
    print('═══════════════════════════════════════════════════════');
    print('  Paso 1: Verificar/Crear LogSource \"Netics\"');
    print('═══════════════════════════════════════════════════════');
    print('');
    
    // 1. Crear o verificar LogSource 'Netics'
    const existing = db.catalog_log_sources.findOne({ name: 'Netics' });
    
    if (existing) {
      print('✅ LogSource \"Netics\" ya existe');
      print('   ID: ' + existing._id);
      print('   Estado: ' + (existing.enabled ? 'Habilitado' : 'Deshabilitado'));
      
      if (!existing.enabled) {
        db.catalog_log_sources.updateOne(
          { _id: existing._id },
          { \$set: { enabled: true, updatedAt: new Date() } }
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
      print('✅ LogSource \"Netics\" creado exitosamente');
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
          { \$set: { clientId: netics._id, clientName: 'Netics' } }
        );
        print('✅ ' + updateResult.modifiedCount + ' entradas actualizadas con \"Netics\"');
      } else {
        print('✅ No hay entradas sin LogSource');
      }
      
      // Verificar resultado
      const countAfter = db.entries.countDocuments({ clientId: null });
      print('📊 Entradas sin LogSource después: ' + countAfter);
    } else {
      print('❌ Error: No se pudo encontrar el LogSource \"Netics\"');
    }
    
    print('');
    print('═══════════════════════════════════════════════════════');
    print('  Paso 3: Verificación final');
    print('═══════════════════════════════════════════════════════');
    print('');
    
    // 3. Estadísticas finales
    const totalEntries = db.entries.countDocuments({});
    const entriesWithNetics = db.entries.countDocuments({ clientName: 'Netics' });
    const entriesWithClient = db.entries.countDocuments({ clientId: { \$ne: null } });
    
    print('📊 Estadísticas:');
    print('   Total de entradas: ' + totalEntries);
    print('   Entradas con Netics: ' + entriesWithNetics);
    print('   Entradas con LogSource: ' + entriesWithClient);
    print('');
  "

MIGRATION_EXIT_CODE=$?

if [ $MIGRATION_EXIT_CODE -eq 0 ]; then
    echo -e "\n${GREEN}✨ Migración completada exitosamente${NC}\n"
    
    echo -e "${YELLOW}📝 Próximos pasos:${NC}"
    echo "   1. Verifica que el frontend muestre la columna 'Cliente / Log Source'"
    echo "   2. Crea una nueva entrada sin seleccionar LogSource"
    echo "   3. Verifica que se asigne automáticamente a 'Netics'"
    echo ""
else
    echo -e "\n${RED}❌ Error en la migración (código: $MIGRATION_EXIT_CODE)${NC}"
    echo -e "${YELLOW}Revisa los logs arriba para más detalles${NC}\n"
    exit 1
fi
