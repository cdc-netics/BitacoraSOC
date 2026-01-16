# Scripts de Importación Masiva

Este directorio contiene scripts para importar datos masivamente a la BitacoraSOC.

## 📁 Archivos

### Scripts de Importación

- **`import-catalog-events.js`** - Importa eventos al catálogo de eventos
- **`import-entries.js`** - Importa entradas de bitácora con asignación de usuarios
- **`csv-to-json-entries.js`** - Convierte CSV a formato JSON para importación
- **`delete-entries.js`** - Elimina todas las entradas (usar con precaución)
- **`create-users.js`** - Crea usuarios en el sistema

### Archivos de Ejemplo

- **`entradas-ejemplo.json`** - Ejemplo de formato JSON para entradas
- **`entradas-ejemplo.csv`** - Ejemplo de formato CSV para entradas
- **`eventos-ejemplo.json`** - Ejemplo de formato JSON para catálogo de eventos

## 🚀 Uso

### 1. Importar Entradas desde CSV

Primero, convierte tu CSV al formato JSON:

```bash
# Formato CSV requerido: id,email,date,text,tags
node backend/scripts/csv-to-json-entries.js ruta/al/archivo.csv salida.json
```

Luego importa las entradas:

```bash
# En local
node backend/scripts/import-entries.js salida.json nombre-usuario

# En Docker
docker exec bitacora-backend node scripts/import-entries.js scripts/salida.json nombre-usuario
```

### 2. Importar Entradas desde JSON

Si ya tienes el JSON con el formato correcto:

```bash
# En local
node backend/scripts/import-entries.js entradas.json nombre-usuario

# En Docker
docker exec bitacora-backend node scripts/import-entries.js scripts/entradas.json nombre-usuario
```

### 3. Importar Catálogo de Eventos

```bash
# Modo 1: Insertar sin borrar existentes
docker exec bitacora-backend node scripts/import-catalog-events.js scripts/eventos.json 1

# Modo 2: Hacer upsert (actualizar si existe, insertar si no)
docker exec bitacora-backend node scripts/import-catalog-events.js scripts/eventos.json 2

# Modo 3: Borrar todo y reinsertar
docker exec bitacora-backend node scripts/import-catalog-events.js scripts/eventos.json 3
```

### 4. Eliminar Todas las Entradas

```bash
# ⚠️ PRECAUCIÓN: Esto eliminará TODAS las entradas
docker exec bitacora-backend node scripts/delete-entries.js
```

### 5. Restaurar un Backup

Los backups se crean automáticamente en formato JSON con todas las colecciones.

```bash
# Ver backups disponibles
ls backend/backups/

# Restaurar backup desde la API (requiere estar logueado como admin)
curl -X POST http://localhost:3000/api/backup/restore \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "backup-2026-01-15T16-34-29-624Z.json",
    "clearBeforeRestore": false
  }'
```

**Parámetros de restauración:**

- `filename`: Nombre del archivo de backup (ejemplo: `backup-2026-01-15T16-34-29-624Z.json`)
- `clearBeforeRestore`: 
  - `false` (default): Inserta datos sin borrar existentes (puede generar duplicados)
  - `true`: **BORRAR TODO** antes de restaurar (restauración limpia)

#### Restauración Manual desde el Servidor

Si necesitas restaurar manualmente usando mongorestore:

```bash
# 1. Extraer el backup JSON a MongoDB
docker exec -i bitacora-mongodb mongorestore \
  --uri="mongodb://bitacora:bitacora123@localhost:27017/bitacora?authSource=admin" \
  --archive < backup.archive

# 2. O restaurar colección específica desde JSON
docker exec bitacora-backend node -e "
const fs = require('fs');
const mongoose = require('mongoose');
const Entry = require('./src/models/Entry');

mongoose.connect('mongodb://bitacora:bitacora123@localhost:27017/bitacora?authSource=admin')
  .then(async () => {
    const backup = JSON.parse(fs.readFileSync('/app/backups/backup-2026-01-15.json', 'utf8'));
    await Entry.insertMany(backup.data.entries);
    console.log('Restaurado:', backup.data.entries.length, 'entradas');
    process.exit(0);
  });
"
```

#### Restauración desde el Frontend

1. Login como **admin**
2. Ir a **Configuración** > **Backups**
3. Seleccionar backup de la lista
4. Click en **Restaurar**
5. Elegir modo:
   - **Incremental**: Agregar datos sin borrar existentes
   - **Completo**: Borrar todo y restaurar desde cero ⚠️

**⚠️ PRECAUCIÓN:** La restauración completa (`clearBeforeRestore: true`) **eliminará TODOS los datos actuales** y los reemplazará con el backup. Úsalo solo si estás seguro.

## 📋 Formatos de Archivo

### CSV para Entradas (entradas-ejemplo.csv)

```csv
id,email,date,text,tags
1,usuario@example.com,2025-12-17,"Texto de la entrada",#tag1 #tag2
```

**Campos:**
- `id`: Identificador único (se omite en la importación)
- `email`: Email del usuario (se mapea a username)
- `date`: Fecha en formato YYYY-MM-DD
- `text`: Contenido de la entrada
- `tags`: Tags separados por espacio (opcional)

**Notas:**
- Los campos con comas deben estar entre comillas dobles
- El script maneja campos multi-línea correctamente
- Se extraen hashtags automáticamente del texto

### JSON para Entradas (entradas-ejemplo.json)

```json
[
  {
    "content": "Texto de la entrada con #tags",
    "entryType": "operativa",
    "entryDate": "2025-12-17",
    "entryTime": "14:30",
    "_username": "nombre-usuario"
  }
]
```

**Campos requeridos:**
- `content`: Texto completo de la entrada
- `entryType`: `"operativa"` o `"incidente"`
- `entryDate`: Fecha en formato YYYY-MM-DD
- `entryTime`: Hora en formato HH:MM (24 horas)

**Campos opcionales:**
- `_username`: Usuario específico (si no se provee, usa el del parámetro del comando)

### JSON para Catálogo de Eventos (eventos-ejemplo.json)

```json
[
  {
    "name": "Nombre del Evento",
    "parent": "Categoría Padre",
    "motivoDefault": "Descripción breve del motivo",
    "description": "Descripción detallada",
    "enabled": true
  }
]
```

## 🔐 Seguridad

**IMPORTANTE:** Los archivos con datos reales de la empresa **NO** deben subirse a git.

### Archivos a Ignorar

Crea tus archivos de datos fuera de git o agrégalos al `.gitignore`:

```
# Datos reales (NO subir a git)
backend/scripts/*.csv
backend/scripts/*-data.json
entradas-*.json
!backend/scripts/entradas-ejemplo.csv
!backend/scripts/entradas-ejemplo.json
!backend/scripts/eventos-ejemplo.json
```

### Buenas Prácticas

1. **Nunca** subas archivos con:
   - Datos reales de clientes
   - Información confidencial
   - IPs internas
   - Nombres de usuarios reales
   - Información de incidentes reales

2. **Siempre** usa datos ficticios en los ejemplos:
   - IPs de ejemplo (192.0.2.x, 203.0.113.x)
   - Emails de ejemplo (@example.com)
   - Nombres genéricos (analista1, usuario1)

3. **Después de importar** en producción, elimina los archivos del servidor

## 🔄 Flujo de Trabajo en Producción

### Importación Inicial

```bash
# 1. En el servidor, copiar archivos
scp entradas.json usuario@servidor:/opt/BitacoraSOC/
scp eventos.json usuario@servidor:/opt/BitacoraSOC/

# 2. SSH al servidor
ssh usuario@servidor

# 3. Copiar al contenedor
docker cp entradas.json bitacora-backend:/app/scripts/
docker cp eventos.json bitacora-backend:/app/scripts/

# 4. Importar
docker exec bitacora-backend node scripts/import-entries.js scripts/entradas.json usuario
docker exec bitacora-backend node scripts/import-catalog-events.js scripts/eventos.json 3

# 5. IMPORTANTE: Eliminar archivos después de importar
rm /opt/BitacoraSOC/entradas.json
rm /opt/BitacoraSOC/eventos.json
docker exec bitacora-backend rm /app/scripts/entradas.json
docker exec bitacora-backend rm /app/scripts/eventos.json
```

### Backup Programado

Recomendación: Crear backups automáticos usando cron:

```bash
# Editar crontab
crontab -e

# Agregar línea para backup diario a las 2 AM
0 2 * * * docker exec bitacora-backend node -e "fetch('http://localhost:3000/api/backup/create', {method:'POST', headers:{'Authorization':'Bearer YOUR_ADMIN_TOKEN'}}).then(r=>r.json()).then(console.log)"

# O usar curl
0 2 * * * curl -X POST http://localhost:3000/api/backup/create -H "Authorization: Bearer YOUR_ADMIN_TOKEN" >> /var/log/bitacora-backup.log 2>&1
```

### Migración entre Servidores

```bash
# SERVIDOR ORIGEN
# 1. Crear backup
curl -X POST http://origen:3000/api/backup/create \
  -H "Authorization: Bearer TOKEN"

# 2. Descargar backup
scp usuario@origen:/opt/BitacoraSOC/backend/backups/backup-*.json ./

# SERVIDOR DESTINO
# 3. Copiar backup al servidor destino
scp backup-*.json usuario@destino:/opt/BitacoraSOC/backend/backups/

# 4. Restaurar (modo limpio)
curl -X POST http://destino:3000/api/backup/restore \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filename": "backup-2026-01-15.json", "clearBeforeRestore": true}'
```

### Rollback en Caso de Error

```bash
# Si una importación salió mal:

# 1. Restaurar desde el último backup bueno
curl -X POST http://localhost:3000/api/backup/restore \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filename": "backup-ANTES-DE-IMPORTAR.json", "clearBeforeRestore": true}'

# 2. O eliminar solo las entradas problemáticas
docker exec bitacora-backend node scripts/delete-entries.js

# 3. Reimportar correctamente
docker exec bitacora-backend node scripts/import-entries.js scripts/entradas.json usuario
```

## 📊 Verificación

Después de importar, verifica los datos:

```bash
# Ver logs de importación
docker logs bitacora-backend --tail 100

# Verificar en el frontend
# - Login al sistema
# - Ir a "Todas las Entradas"
# - Verificar que aparecen los datos con los autores correctos
```

## ⚠️ Troubleshooting

### Error: Usuario no encontrado

Asegúrate de crear el usuario primero:

```bash
docker exec -it bitacora-backend node scripts/create-users.js
```

### Error: Cannot find module

Verifica que el script esté en el contenedor:

```bash
docker cp backend/scripts/import-entries.js bitacora-backend:/app/scripts/
```

### Error: 429 Rate Limit

En desarrollo, el rate limiter está deshabilitado. En producción, ajusta las variables:

```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### Caracteres con encoding incorrecto

El script `csv-to-json-entries.js` incluye corrección automática de UTF-8. Si persiste:

1. Guarda tu CSV con encoding UTF-8
2. Verifica que no hay BOM (Byte Order Mark)
3. Usa un editor que soporte UTF-8 correctamente

### Error al restaurar backup: Duplicados

Si obtienes error de claves duplicadas al restaurar:

```bash
# Opción 1: Restaurar con clearBeforeRestore
curl -X POST http://localhost:3000/api/backup/restore \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filename": "backup.json", "clearBeforeRestore": true}'

# Opción 2: Limpiar manualmente colecciones específicas
docker exec bitacora-backend node scripts/delete-entries.js
```

### Backup no aparece en el frontend

Verifica permisos del directorio:

```bash
# En el servidor
docker exec bitacora-backend ls -la backups/
docker exec bitacora-backend chmod 755 backups/
```

### Restauración se queda colgada

Si la restauración de un backup grande se queda sin respuesta:

```bash
# Ver logs del backend
docker logs bitacora-backend -f

# Verificar uso de memoria
docker stats bitacora-backend

# Si es necesario, aumentar recursos en docker-compose.yml
services:
  backend:
    mem_limit: 2g
    cpus: 2
```

### Backup muy grande (>100MB)

Para backups grandes, considera:

1. **Limpiar auditorías antiguas** antes de hacer backup
2. **Exportar en partes** (solo entradas, solo catálogos, etc.)
3. **Usar mongodump** nativo en lugar del backup JSON:

```bash
# Crear dump binario (más eficiente)
docker exec bitacora-mongodb mongodump \
  --uri="mongodb://bitacora:bitacora123@localhost:27017/bitacora?authSource=admin" \
  --archive=/data/db/backup.archive \
  --gzip

# Copiar del contenedor
docker cp bitacora-mongodb:/data/db/backup.archive ./backup-$(date +%Y%m%d).archive

# Restaurar
docker exec -i bitacora-mongodb mongorestore \
  --uri="mongodb://bitacora:bitacora123@localhost:27017/bitacora?authSource=admin" \
  --archive=/data/db/backup.archive \
  --gzip
```
