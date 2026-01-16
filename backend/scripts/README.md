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
