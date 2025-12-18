# 💾 Backup y Recuperación - Bitácora SOC

Procedimientos de backup, restauración y retención de datos.

---

## Export CSV (Entradas)

### Uso

**Endpoint:** `GET /api/reports/export-entries`

**Query params:**
- `startDate` (ISO8601): Fecha inicio (ej: `2025-01-01`)
- `endDate` (ISO8601): Fecha fin (ej: `2025-12-31`)

**Ejemplo:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl -X GET "http://192.168.100.50:3000/api/reports/export-entries?startDate=2025-12-01&endDate=2025-12-31" \
  -H "Authorization: Bearer $TOKEN" \
  -o entradas_diciembre.csv
```

### Columnas

```csv
Fecha Entrada,Hora,Tipo,Contenido,Tags,Usuario,Creado Por Guest,Fecha Creación
2025-12-17,14:30,operativa,"Revisión de alertas en #Trellix...","trellix,hunting",admin,false,2025-12-17T14:30:00Z
```

### Filtros

Sin filtros de fechas = **todas** las entradas (puede ser muy grande).

**Recomendación:** Siempre especificar rango de fechas.

---

## Backup MongoDB Completo

### Comando: mongodump

**Endpoint:** `GET /api/backup/mongo`

**Seguridad:**
- Path sanitizado (bloquea path traversal `../`, `;`, `|`)
- Usa `spawn` (NO `exec` vulnerable a command injection)
- Solo admin

**Proceso:**
1. Backend ejecuta `mongodump -d bitacora_soc -o ./backups/backup-<timestamp>/`
2. Crea carpeta: `backups/backup-2025-12-17T14-30-00/`
3. Retorna metadata: `{ path, size, timestamp }`

**Ejemplo:**
```bash
curl -X GET http://192.168.100.50:3000/api/backup/mongo \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta:**
```json
{
  "message": "Backup creado exitosamente",
  "backup": {
    "path": "backups/backup-2025-12-17T14-30-00",
    "timestamp": "2025-12-17T14:30:00.000Z",
    "size": "2.5 MB"
  }
}
```

### Ubicación

**Ruta absoluta:** `backend/backups/`

**Estructura:**
```
backend/
├── backups/
│   ├── backup-2025-12-01T02-00-00/
│   │   └── bitacora_soc/
│   │       ├── users.bson
│   │       ├── entries.bson
│   │       ├── auditlogs.bson
│   │       └── ...
│   ├── backup-2025-12-02T02-00-00/
│   └── ...
```

### Requisitos

**mongodump debe estar instalado:**

**Windows:**
```powershell
# Instalar MongoDB Database Tools
choco install mongodb-database-tools
```

**Linux:**
```bash
sudo apt install mongodb-database-tools
```

**Verificar:**
```bash
mongodump --version
# mongodump version: 100.9.4
```

---

## Listar Backups

**Endpoint:** `GET /api/backup/list`

```bash
curl -X GET http://192.168.100.50:3000/api/backup/list \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta:**
```json
{
  "backups": [
    {
      "name": "backup-2025-12-17T14-30-00",
      "date": "2025-12-17T14:30:00.000Z",
      "size": "2.5 MB",
      "path": "backups/backup-2025-12-17T14-30-00"
    },
    {
      "name": "backup-2025-12-16T02-00-00",
      "date": "2025-12-16T02:00:00.000Z",
      "size": "2.3 MB",
      "path": "backups/backup-2025-12-16T02-00-00"
    }
  ]
}
```

---

## Restaurar Backup

### ⚠️ ADVERTENCIA

**mongorestore con `--drop`:**
- Elimina **todas las colecciones existentes** antes de restaurar
- **NO se puede deshacer**
- **Recomendación:** Crear backup de datos actuales ANTES de restaurar

### Procedimiento Seguro

**1. Backup de datos actuales:**
```bash
curl -X GET http://192.168.100.50:3000/api/backup/mongo \
  -H "Authorization: Bearer $TOKEN"
```

**2. Restaurar backup:**
```bash
curl -X POST http://192.168.100.50:3000/api/backup/restore \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "backupPath": "backup-2025-12-16T02-00-00"
  }'
```

**Respuesta:**
```json
{
  "message": "Backup restaurado exitosamente",
  "details": {
    "collections": ["users", "entries", "auditlogs", "..."],
    "documentsRestored": 1234
  }
}
```

### Comando ejecutado internamente

```bash
mongorestore --drop -d bitacora_soc ./backups/backup-2025-12-16T02-00-00/bitacora_soc
```

**Flags:**
- `--drop`: Elimina colecciones existentes antes de restaurar
- `-d bitacora_soc`: Base de datos destino
- Path: Ruta del backup (sanitizada)

### Seguridad

**Path sanitization:**
- Bloquea: `../`, `/`, `\`, `;`, `|`, `&`, `$`, `` ` ``, `*`
- Permite: Solo nombres de carpeta alfanuméricos con `-`, `_`

**Prevención command injection:**
- Usa `spawn` con argumentos separados (NO `exec`)
- Path validation + allowlist

---

## Retención de Backups

### Política Recomendada

**Automatización:** Task Scheduler (Windows) o cron (Linux)

**Frecuencia:** Diaria (02:00 AM)

**Retención:** 30 días

### Automatización Windows

**PowerShell script:**
```powershell
# backup-diario.ps1
$TOKEN = "eyJhbGciOiJIUzI1NiIs..."
$API = "http://192.168.100.50:3000"

# Crear backup
Invoke-RestMethod -Uri "$API/api/backup/mongo" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $TOKEN" }

# Eliminar backups mayores a 30 días
Get-ChildItem -Path "C:\bitacora\backend\backups" -Directory |
  Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-30) } |
  Remove-Item -Recurse -Force

Write-Host "Backup completado: $(Get-Date)"
```

**Task Scheduler:**
```
Acción: powershell.exe
Argumentos: -File "C:\bitacora\scripts\backup-diario.ps1"
Frecuencia: Diaria
Hora: 02:00 AM
Usuario: BitacoraAdmin (con permisos)
```

### Automatización Linux

**Cron script:**
```bash
#!/bin/bash
# /opt/bitacora/scripts/backup-diario.sh

TOKEN="eyJhbGciOiJIUzI1NiIs..."
API="http://192.168.100.50:3000"

# Crear backup
curl -X GET "$API/api/backup/mongo" \
  -H "Authorization: Bearer $TOKEN"

# Eliminar backups mayores a 30 días
find /opt/bitacora/backend/backups -type d -mtime +30 -exec rm -rf {} \;

echo "Backup completado: $(date)"
```

**Crontab:**
```bash
crontab -e
# Añadir:
0 2 * * * /opt/bitacora/scripts/backup-diario.sh >> /var/log/bitacora-backup.log 2>&1
```

---

## Backup Offsite (Opcional)

### Copiar a servidor remoto

**Después de crear backup:**

**Windows (Robocopy):**
```powershell
robocopy "C:\bitacora\backend\backups" "\\nas-server\backups\bitacora" /MIR /Z /LOG:backup-offsite.log
```

**Linux (rsync):**
```bash
rsync -avz /opt/bitacora/backend/backups/ user@nas-server:/backups/bitacora/
```

### Cloud Storage

**AWS S3:**
```bash
aws s3 sync ./backups/ s3://mi-bucket/bitacora-backups/ --delete
```

**Azure Blob:**
```bash
az storage blob upload-batch -d bitacora-backups -s ./backups/ --account-name mistore
```

---

## Disaster Recovery

### Escenario: Servidor completo perdido

**1. Instalar MongoDB + Node.js + Angular** (ver [SETUP.md](./SETUP.md))

**2. Clonar repositorio:**
```bash
git clone https://github.com/tu-org/BitacoraSOC.git
cd BitacoraSOC
```

**3. Configurar .env** (usar backup de configuración)

**4. Restaurar backup más reciente:**

**Opción A: API (si backend está corriendo):**
```bash
curl -X POST http://192.168.100.50:3000/api/backup/restore \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"backupPath": "backup-2025-12-17T02-00-00"}'
```

**Opción B: Manual (si backend no arranca):**
```bash
# Copiar backup al servidor nuevo
mongorestore --drop -d bitacora_soc /path/to/backup-2025-12-17T02-00-00/bitacora_soc
```

**5. Verificar integridad:**
```bash
mongosh
> use bitacora_soc
> db.users.countDocuments()
> db.entries.countDocuments()
> db.auditlogs.countDocuments()
```

**6. Test aplicación:**
```bash
npm run dev  # backend
npm start     # frontend
```

### RTO/RPO

**RTO (Recovery Time Objective):**
- Estimado: 2-4 horas (instalación + restauración)

**RPO (Recovery Point Objective):**
- Con backup diario: pérdida máxima 24h de datos
- Con backup cada 6h: pérdida máxima 6h

---

## Backup de Configuración

### Archivos críticos a respaldar

**Backend:**
```
backend/.env                    # Variables (NUNCA commitear a Git)
backend/src/config/*.js         # Configuración app
```

**Frontend:**
```
frontend/src/environments/environment.ts      # Producción
frontend/src/environments/environment.dev.ts  # Desarrollo
```

**Certificados (si usa TLS):**
```
backend/certs/server.pem
backend/certs/server-key.pem
backend/certs/ca-cert.pem
```

**MongoDB config:**
```
/etc/mongod.conf  # Linux
C:\Program Files\MongoDB\Server\6.0\bin\mongod.cfg  # Windows
```

### Método

**1. Crear carpeta backup-config:**
```bash
mkdir -p backups/config
```

**2. Copiar archivos:**
```bash
cp backend/.env backups/config/.env.backup
cp frontend/src/environments/environment.ts backups/config/environment.ts.backup
```

**3. Cifrar (recomendado):**
```bash
# Cifrar con AES-256
openssl enc -aes-256-cbc -salt -pbkdf2 \
  -in backups/config/.env.backup \
  -out backups/config/.env.backup.enc

# Descifrar
openssl enc -d -aes-256-cbc -pbkdf2 \
  -in backups/config/.env.backup.enc \
  -out .env
```

---

## Monitoreo de Backups

### Verificar último backup

**API:**
```bash
curl -X GET http://192.168.100.50:3000/api/backup/list \
  -H "Authorization: Bearer $TOKEN" | jq '.[0]'
```

**Filesystem:**
```powershell
# Windows
Get-ChildItem -Path "C:\bitacora\backend\backups" -Directory |
  Sort-Object CreationTime -Descending |
  Select-Object -First 1
```

```bash
# Linux
ls -lt /opt/bitacora/backend/backups | head -n 2
```

### Alertas

**Script verificación (PowerShell):**
```powershell
# check-backup.ps1
$lastBackup = Get-ChildItem "C:\bitacora\backend\backups" -Directory |
  Sort-Object CreationTime -Descending |
  Select-Object -First 1

$age = (Get-Date) - $lastBackup.CreationTime

if ($age.TotalHours -gt 26) {
  # Enviar alerta (email, Slack, etc.)
  Send-MailMessage -To "admin@example.com" `
    -From "backup@bitacora.com" `
    -Subject "⚠️ Backup desactualizado" `
    -Body "Último backup: $($lastBackup.Name)" `
    -SmtpServer "smtp.example.com"
}
```

**Ejecutar cada hora:**
```
Task Scheduler → Nueva Tarea
Acción: powershell.exe -File check-backup.ps1
Frecuencia: Cada 1 hora
```

---

## Troubleshooting

### mongodump not found

**Síntoma:**
```json
{
  "message": "Error al crear backup",
  "error": "mongodump no está instalado"
}
```

**Solución:**
```powershell
# Windows
choco install mongodb-database-tools

# Linux
sudo apt install mongodb-database-tools

# Verificar
mongodump --version
```

### Permission denied (backups/)

**Síntoma:**
```
Error: EACCES: permission denied, mkdir 'backups'
```

**Solución:**
```bash
# Linux
sudo chown -R bitacora:bitacora /opt/bitacora/backend/backups
sudo chmod 755 /opt/bitacora/backend/backups

# Windows
# Propiedades → Seguridad → Usuario de servicio Node.js → Control total
```

### Backup incompleto (size 0 KB)

**Síntoma:** Backup creado pero vacío

**Verificar conexión MongoDB:**
```bash
mongosh mongodb://localhost:27017/bitacora_soc
# Si no conecta, verificar MONGODB_URI en .env
```

### mongorestore --drop fails

**Síntoma:**
```
error: Failed to drop collection
```

**Causa:** Colecciones con índices TTL o datos bloqueados

**Solución:**
```bash
# Conectar a MongoDB
mongosh
> use bitacora_soc
> db.dropDatabase()  # Eliminar todo manualmente
> exit

# Restaurar sin --drop
mongorestore -d bitacora_soc ./backups/backup-xxx/bitacora_soc
```

---

## Referencias

- **Instalación:** [SETUP.md](./SETUP.md)
- **Seguridad (command injection):** [SECURITY.md](./SECURITY.md#command-injection)
- **Logging y auditoría:** [LOGGING.md](./LOGGING.md)
- **Troubleshooting:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## Recursos Externos

- **MongoDB Backup Methods:** https://www.mongodb.com/docs/manual/core/backups/
- **mongodump documentation:** https://www.mongodb.com/docs/database-tools/mongodump/
- **mongorestore documentation:** https://www.mongodb.com/docs/database-tools/mongorestore/
