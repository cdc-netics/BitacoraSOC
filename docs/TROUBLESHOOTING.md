# 🔧 Troubleshooting - Bitácora SOC

Solución de problemas comunes categorizados por área.

---

## 🖥️ Backend

### EADDRINUSE: Port 3000 in use

**Síntoma:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Causa:** Otro proceso usa el puerto 3000

**Solución (Windows):**
```powershell
# Identificar proceso
netstat -ano | findstr :3000
# Output: TCP 0.0.0.0:3000 0.0.0.0:0 LISTENING 12345

# Matar proceso
taskkill /PID 12345 /F

# Reiniciar backend
npm run dev
```

**Solución (Linux):**
```bash
# Identificar proceso
lsof -i :3000

# Matar proceso
kill -9 <PID>

# Reiniciar backend
npm run dev
```

**Solución alternativa:** Cambiar puerto en `.env`
```env
PORT=3001
```

---

### MongoDB connection refused

**Síntoma:**
```
MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Causa:** MongoDB no está corriendo o URI incorrecta

**Verificar si MongoDB está corriendo:**

**Windows:**
```powershell
# Verificar servicio
Get-Service MongoDB

# Si está detenido, iniciar
net start MongoDB
```

**Linux:**
```bash
# Verificar status
sudo systemctl status mongod

# Si está detenido, iniciar
sudo systemctl start mongod
```

**Verificar conexión manual:**
```bash
mongosh mongodb://localhost:27017
# Debe conectar sin error
```

**Verificar MONGODB_URI en `.env`:**
```env
# Formato correcto
MONGODB_URI=mongodb://localhost:27017/bitacora_soc

# Si usa auth
MONGODB_URI=mongodb://user:password@localhost:27017/bitacora_soc
```

---

### ENCRYPTION_KEY error

**Síntoma:**
```
Error: ENCRYPTION_KEY must be 32 bytes (64 hex characters)
```

**Causa:** ENCRYPTION_KEY incorrecto en `.env`

**Solución:**
```powershell
# Generar clave correcta (64 caracteres hex)
openssl rand -hex 32

# Output: <cadena_hex_aleatoria>...  (64 chars)
```

**Actualizar `.env`:**
```env
ENCRYPTION_KEY=<pegar_resultado_de_openssl_aqui>
```

**Reiniciar backend:**
```bash
# Ctrl+C para detener
npm run dev
```

---

### JWT_SECRET missing

**Síntoma:**
```
Error: JWT_SECRET is not defined in environment variables
```

**Causa:** Variable JWT_SECRET no existe en `.env`

**Solución:**
```powershell
# Generar secret
openssl rand -base64 32

# Output: <cadena_aleatoria_generada>
```

**Añadir a `.env`:**
```env
JWT_SECRET=<pegar_resultado_de_openssl_aqui>
```

---

### bcrypt native build failed

**Síntoma:**
```
Error: Cannot find module 'bcrypt'
```

**Causa:** bcrypt requiere compilación nativa

**Solución (Windows):**
```powershell
# Instalar Visual Studio Build Tools
npm install --global windows-build-tools

# Reinstalar bcrypt
cd backend
npm uninstall bcrypt
npm install bcrypt
```

**Solución (Linux):**
```bash
sudo apt install build-essential python3
cd backend
npm rebuild bcrypt
```

---

## 🌐 Frontend

### Port 4200 in use

**Síntoma:**
```
Port 4200 is already in use.
```

**Solución rápida:** Usar otro puerto
```bash
ng serve --port 4201
```

**Solución permanente:** Actualizar `package.json`
```json
{
  "scripts": {
    "start": "ng serve --port 4201"
  }
}
```

---

### CORS error

**Síntoma (consola navegador):**
```
Access to XMLHttpRequest at 'http://192.168.100.50:3000/api/users/me' 
from origin 'http://192.168.100.50:4200' has been blocked by CORS policy
```

**Causa:** ALLOWED_ORIGINS en backend no incluye la IP del frontend

**Verificar:**
```bash
# Backend .env
ALLOWED_ORIGINS=http://192.168.100.50:4200,http://192.168.1.100:4200
```

**Debe coincidir EXACTAMENTE con:**
```typescript
// Frontend environment.ts
apiUrl: 'http://192.168.100.50:3000/api'
```

**Reglas:**
- Incluir `http://` o `https://`
- Sin barra final `/`
- Puerto explícito (`:4200`)

**Reiniciar backend después de cambiar:**
```bash
cd backend
npm run dev
```

---

### ng serve fails

**Síntoma:**
```
An unhandled exception occurred: Cannot find module '@angular/cli'
```

**Solución:**
```bash
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
```

**Si persiste:**
```bash
npm install -g @angular/cli@17
```

---

### API URL localhost en producción

**Síntoma:** Frontend desplegado no conecta al backend

**Causa:** `environment.ts` usa `localhost` en vez de IP

**Verificar:**
```typescript
// ❌ INCORRECTO (solo funciona en mismo equipo)
apiUrl: 'http://localhost:3000/api'

// ✅ CORRECTO (funciona desde cualquier equipo en red)
apiUrl: 'http://192.168.100.50:3000/api'
```

**Compilar nuevamente:**
```bash
ng build --configuration production
```

---

## 📧 SMTP

### Test email fails

**Síntoma:**
```json
{
  "message": "Error al enviar email de prueba",
  "error": "Invalid login: 535 Authentication failed"
}
```

**Verificar credenciales:**
```bash
# Backend logs
grep "smtp" backend/logs/app.log
```

**Probar conexión manual:**

**Telnet (Windows):**
```powershell
telnet smtp.example.com 587
# Si conecta: 220 smtp.example.com ESMTP
```

**OpenSSL (TLS):**
```bash
openssl s_client -connect smtp.example.com:587 -starttls smtp
# Debe retornar certificado
```

**Verificar config:**
```json
{
  "host": "smtp.gmail.com",         // Correcto
  "port": 587,                      // TLS usa 587, SSL usa 465
  "secure": false,                  // false para TLS (STARTTLS)
  "user": "bitacora@gmail.com",     // Email completo
  "password": "app-password-here",  // NO la contraseña normal
  "from": "bitacora@gmail.com",     // Mismo que user
  "to": "soc@example.com",          // Destinatario
  "sendOnlyIfRed": false
}
```

**Gmail específico:**
- Usar **App Password** (no contraseña de cuenta)
- Generar en: https://myaccount.google.com/apppasswords
- Activar "Less secure app access" si usa cuenta normal

---

### Rate limit: Too many SMTP test requests

**Síntoma:**
```json
{
  "message": "Too many requests, please try again later."
}
```

**Causa:** Excedió 3 intentos en 15 minutos

**Solución:** Esperar 15 minutos o reiniciar backend (resetea contador)

---

### Emails not sending on checklist

**Síntoma:** Checklist con rojos no envía email

**Verificar:**

**1. Configuración SMTP existe:**
```bash
curl -X GET http://192.168.100.50:3000/api/smtp \
  -H "Authorization: Bearer $TOKEN"
```

**2. Flag sendOnlyIfRed:**
```json
{
  "sendOnlyIfRed": true   // ✅ Envía solo si hay rojos
}
```

**3. Hay servicios rojos:**
```json
{
  "services": [
    {
      "serviceTitle": "QRadar",
      "status": "rojo",           // Debe haber al menos 1 rojo
      "observation": "..."
    }
  ]
}
```

**4. Email config válida:**
- `host`, `port`, `user`, `password` correctos
- Test envío exitoso

---

## ✅ Checklist

### Cannot submit consecutive checks

**Síntoma:**
```json
{
  "message": "No puedes registrar dos checks del mismo tipo consecutivamente"
}
```

**Causa:** Regla anti-spam (inicio → inicio bloqueado, debe ser inicio → cierre → inicio)

**Verificar último check:**
```bash
curl -X GET http://192.168.100.50:3000/api/checklist/check/last \
  -H "Authorization: Bearer $TOKEN"
```

**Solución:** Registrar el tipo opuesto
- Si último fue `inicio` → registrar `cierre`
- Si último fue `cierre` → registrar `inicio`

---

### Cooldown not met

**Síntoma:**
```json
{
  "message": "Debes esperar 4 horas entre checks. Tiempo restante: 2.5 horas"
}
```

**Causa:** Cooldown entre checks (default 4h)

**Verificar cooldown configurado:**
```bash
curl -X GET http://192.168.100.50:3000/api/config \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "shiftCheckCooldownHours": 4  // Tiempo mínimo entre checks
}
```

**Solución:**

**Opción 1 (usuario):** Esperar tiempo restante

**Opción 2 (admin):** Reducir cooldown temporalmente
```bash
curl -X PUT http://192.168.100.50:3000/api/config \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shiftCheckCooldownHours": 1  // Reducir a 1h
  }'
```

---

### Missing services in checklist

**Síntoma:**
```json
{
  "message": "Debes evaluar todos los servicios configurados"
}
```

**Causa:** El array `services` enviado no incluye todos los servicios activos

**Obtener servicios activos:**
```bash
curl -X GET http://192.168.100.50:3000/api/checklist/services \
  -H "Authorization: Bearer $TOKEN"
```

**Verificar coincidencia:**
```javascript
// Services activos
[
  { _id: "675e123...", title: "QRadar", active: true },
  { _id: "675e456...", title: "Zabbix", active: true },
  { _id: "675e789...", title: "Wazuh", active: true }
]

// Tu request DEBE incluir los 3 serviceId
{
  "services": [
    { "serviceId": "675e123...", "status": "verde" },
    { "serviceId": "675e456...", "status": "verde" },
    { "serviceId": "675e789...", "status": "rojo", "observation": "..." }
  ]
}
```

**Solución:** Incluir **todos** los servicios activos en el array

---

### Red service requires observation

**Síntoma:**
```json
{
  "message": "Los servicios en rojo requieren observación (máx 1000 caracteres)"
}
```

**Causa:** Servicio con `status: "rojo"` sin `observation` o vacío

**Solución:**
```json
{
  "serviceId": "675e...",
  "serviceTitle": "QRadar",
  "status": "rojo",
  "observation": "Alerta de tráfico sospechoso desde 192.168.1.100. Escalado a tier 2. Ticket #12345."
}
```

**Requisitos:**
- Longitud: 1-1000 caracteres
- No vacío
- Descriptivo (contexto, acción, ticket)

---

## 💾 Backup

### mongodump not found

**Síntoma:**
```json
{
  "message": "Error al crear backup",
  "error": "mongodump no está instalado"
}
```

**Solución:**

**Windows:**
```powershell
choco install mongodb-database-tools
```

**Linux:**
```bash
sudo apt install mongodb-database-tools
```

**Verificar:**
```bash
mongodump --version
```

---

### Permission denied: backups/

**Síntoma:**
```
Error: EACCES: permission denied, mkdir 'backups'
```

**Solución (Windows):**
```powershell
# Dar permisos al usuario de Node.js
icacls "C:\bitacora\backend\backups" /grant Users:F
```

**Solución (Linux):**
```bash
sudo chown -R $USER:$USER /opt/bitacora/backend/backups
sudo chmod 755 /opt/bitacora/backend/backups
```

---

### Backup created but size 0 KB

**Síntoma:** Backup vacío (0 bytes)

**Verificar conexión MongoDB:**
```bash
mongosh mongodb://localhost:27017/bitacora_soc
> db.users.countDocuments()
# Debe retornar número > 0
```

**Verificar MONGODB_URI:**
```env
# .env
MONGODB_URI=mongodb://localhost:27017/bitacora_soc
```

**Test manual:**
```bash
mongodump -d bitacora_soc -o ./test-backup
ls -lh test-backup/bitacora_soc
# Debe mostrar archivos .bson
```

---

### mongorestore fails with --drop

**Síntoma:**
```
error: Failed to drop collection: users
```

**Solución:**

**Opción 1:** Eliminar DB manualmente antes de restaurar
```bash
mongosh
> use bitacora_soc
> db.dropDatabase()
> exit
mongorestore -d bitacora_soc ./backups/backup-xxx/bitacora_soc
```

**Opción 2:** Restaurar sin `--drop`
```bash
mongorestore -d bitacora_soc ./backups/backup-xxx/bitacora_soc
# Documentos existentes NO se eliminan (pueden haber duplicados)
```

---

## 📊 Logging

### Logs no aparecen en stdout

**Síntoma:** `npm run dev` no muestra logs

**Verificar LOG_LEVEL:**
```env
# .env
LOG_LEVEL=debug   # Cambiar a debug temporalmente
```

**Reiniciar backend:**
```bash
npm run dev
```

**Verificar código:**
```javascript
logger.info({ event: 'test' }, 'Test log');
// Debe aparecer en consola
```

---

### AuditLog no persiste en MongoDB

**Síntoma:** `db.auditlogs.find()` retorna vacío

**Verificar conexión MongoDB:**
```bash
mongosh
> use bitacora_soc
> show collections
# Debe mostrar 'auditlogs'
```

**Verificar código:**
```javascript
const { audit } = require('./utils/audit');

await audit(req, {
  event: 'test.event',
  level: 'info',
  result: { success: true }
});

// Verificar en MongoDB
db.auditlogs.find({ event: 'test.event' });
```

---

### Log forwarding no funciona

**Síntoma:** SIEM no recibe logs

**1. Verificar config:**
```bash
curl -X GET http://192.168.100.50:3000/api/logging/config \
  -H "Authorization: Bearer $TOKEN"
```

**2. Test manual (netcat):**
```bash
# Terminal 1: Escuchar en puerto
nc -l 5140

# Terminal 2: Probar forwarding
curl -X POST http://192.168.100.50:3000/api/logging/test \
  -H "Authorization: Bearer $TOKEN"

# Terminal 1 debe recibir JSON
```

**3. Verificar firewall:**
```powershell
# Windows: Permitir puerto saliente
netsh advfirewall firewall add rule name="Bitacora SIEM" dir=out action=allow protocol=TCP remoteport=5140
```

---

### TLS handshake fails

**Síntoma:**
```
Error: unable to verify the first certificate
```

**Causa:** Certificado auto-firmado o CA no confiable

**Solución DEV (⚠️ NO usar en producción):**
```json
{
  "tls": {
    "rejectUnauthorized": false
  }
}
```

**Solución PROD:** Configurar CA cert
```json
{
  "tls": {
    "rejectUnauthorized": true,
    "caCert": "-----BEGIN CERTIFICATE-----\nMIID...\n-----END CERTIFICATE-----"
  }
}
```

**Verificar certificado manualmente:**
```bash
openssl s_client -connect siem.example.com:5140 -showcerts
```

---

## 👤 Usuario Admin Inicial

### No puedo login (no existe admin)

**Síntoma:**
```json
{
  "message": "Usuario no encontrado"
}
```

**Causa:** Base de datos vacía, no hay usuario admin

**Solución 1 (Script seed):**
```bash
cd backend
node src/scripts/seed.js
# Crea admin/CHANGE_ME
```

**Solución 2 (MongoDB manual):**
```bash
mongosh
> use bitacora_soc
> db.users.insertOne({
  username: "admin",
  password: "<bcrypt_hash>",
  fullName: "Administrador",
  email: "admin@example.com",
  role: "admin",
  theme: "dark",
  isActive: true,
  createdAt: new Date()
})
```

**Credenciales por defecto:**
- Username: `admin`
- Password: `CHANGE_ME`

**⚠️ Cambiar contraseña inmediatamente:**
```bash
curl -X PUT http://192.168.100.50:3000/api/users/me \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"password": "nueva_contraseña_segura"}'
```

---

## 🔐 Autenticación

### Token expired

**Síntoma:**
```json
{
  "message": "Token expirado"
}
```

**Causa:** Token JWT pasó de 4h (admin/user) o 2h (guest)

**Solución:** Re-login
```bash
curl -X POST http://192.168.100.50:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"CHANGE_ME"}'
```

---

### Invalid token

**Síntoma:**
```json
{
  "message": "Token inválido"
}
```

**Causas posibles:**
1. JWT_SECRET cambió después de generar token
2. Token malformado
3. Token de otro entorno (dev vs prod)

**Solución:** Generar nuevo token (login nuevamente)

---

## 🌐 Red

### Cannot access from other computers

**Síntoma:** `http://192.168.100.50:3000` no responde desde otro equipo

**Verificar firewall:**

**Windows:**
```powershell
# Permitir puerto 3000
netsh advfirewall firewall add rule name="Bitacora Backend" dir=in action=allow protocol=TCP localport=3000

# Permitir puerto 4200
netsh advfirewall firewall add rule name="Bitacora Frontend" dir=in action=allow protocol=TCP localport=4200
```

**Linux:**
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 4200/tcp
```

**Verificar binding:**
```javascript
// backend/src/server.js
app.listen(PORT, '0.0.0.0', () => {  // NO '127.0.0.1'
  console.log(`Server running on port ${PORT}`);
});
```

---

## 📱 Frontend UI

### Dashboard no carga datos

**Síntoma:** Pantalla vacía, spinner infinito

**Verificar consola navegador (F12):**
```
Network tab → Failed requests → Ver error
```

**Causas comunes:**
1. CORS error (ver sección CORS arriba)
2. Token expirado (re-login)
3. Backend caído (verificar `http://IP:3000/health`)

---

### Logo personalizado no aparece

**Síntoma:** Después de subir logo, sigue mostrando logo anterior

**Solución:** Limpiar caché del navegador
```
Ctrl + Shift + R  (hard reload)
```

**Verificar archivo:**
```bash
ls backend/uploads/logo.png
# Debe existir y tener tamaño > 0
```

---

## Referencias

- **Instalación:** [SETUP.md](./SETUP.md)
- **Operación:** [RUNBOOK.md](./RUNBOOK.md)
- **API:** [API.md](./API.md)
- **Seguridad:** [SECURITY.md](./SECURITY.md)
- **Logging:** [LOGGING.md](./LOGGING.md)
- **Backup:** [BACKUP.md](./BACKUP.md)
