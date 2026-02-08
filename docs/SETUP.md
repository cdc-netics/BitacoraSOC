# 🔧 Instalación y Configuración - BitacoraSOC

Guía detallada para instalar y configurar el sistema desde cero.

---

## Requisitos

- **Node.js** 18+ y npm
- **MongoDB** 6+ (local o remoto)
- **mongodump/mongorestore** (para backups)
- **Angular CLI** 20+ `npm install -g @angular/cli`

---

## 1. Instalación

### 1.1 Clonar o Extraer

```powershell
cd C:\ruta\a\BitacoraSOC
```

### 1.2 Backend

```powershell
cd backend
npm install
```

**Paquetes principales instalados:**
- express, mongoose, jsonwebtoken
- bcryptjs, nodemailer, helmet
- pino (logging), uuid (correlation ID)

### 1.3 Frontend

```powershell
cd ..\frontend
npm install
```

**Paquetes principales:**
- @angular/core 20.3.16, @angular/material 20.2.14
- anime.js (animaciones)

### 1.4 MongoDB

Verificar que MongoDB esté corriendo:

```powershell
mongosh --eval "db.version()"
```

**Salida esperada:**
```
6.0.x
```

Si no está instalado:
- **Windows:** [Descargar MongoDB Community](https://www.mongodb.com/try/download/community)
- **Instalación:** Incluir MongoDB Compass (GUI opcional)
- **Servicio:** Configurar como servicio Windows (auto-start)

---

## 2. Configuración Backend (.env)

### 2.1 Copiar Template

```powershell
cd backend
cp .env.example .env
```

### 2.2 Editar .env

```env
# Server
NODE_ENV=development
HOST=0.0.0.0                          # Escucha todas las interfaces
PORT=3000

# Frontend (para links de reset password)
HOST_DOMAIN=tu-dominio-o-ip
FRONTEND_PORT=4200

# MongoDB
MONGODB_URI=mongodb://localhost:27017/bitacora_soc

# JWT
JWT_SECRET=CAMBIAR_EN_PRODUCCION      # Ver sección 2.3
# Nota: la expiración se define en backend (4h admin/user, 2h guest)

# CORS (IPs frontend permitidas)
# En producción usa allowlist; en desarrollo permite cualquier origen
ALLOWED_ORIGINS=http://192.168.100.50:4200,http://localhost:4200

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000           # 15 min
RATE_LIMIT_MAX_REQUESTS=100           # 100 requests/15min

# Timezone
TZ=America/Santiago

# Encryption (passwords SMTP)
ENCRYPTION_KEY=GENERAR_CON_OPENSSL    # 64 caracteres hex (32 bytes)

# Logging
LOG_LEVEL=info                        # info | debug | warn | error
AUDIT_TTL_DAYS=90                     # Retención logs auditoría
LOG_FORWARD_CLIENT_KEY=               # Path a client.key para mTLS (opcional)
```

### 2.3 Generar Secrets (CRÍTICO)

**ENCRYPTION_KEY (AES-256-GCM):**
```powershell
openssl rand -hex 32
```

Copiar salida (64 chars hex) a `.env`:
```env
ENCRYPTION_KEY=a3f5b8c9d2e4f6a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9
```

**JWT_SECRET:**
```powershell
openssl rand -base64 32
```

Copiar salida a `.env`:
```env
JWT_SECRET=XyZ123AbC456DeF789...
```

**⚠️ NUNCA COMMITEAR .env A GIT**

---

## 3. Configuración por IP

### 3.1 Obtener IP Local

**Windows PowerShell:**
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Ethernet*" -or $_.InterfaceAlias -like "*Wi-Fi*"} | Select-Object IPAddress, InterfaceAlias
```

**Ejemplo salida:**
```
IPAddress     InterfaceAlias
---------     --------------
192.168.100.50  Wi-Fi
```

**Linux/Mac:**
```bash
ip addr show | grep inet
```

### 3.2 Configurar CORS Backend

En `backend\.env`:
```env
ALLOWED_ORIGINS=http://192.168.100.50:4200,http://192.168.1.100:4200
```

**Reglas:**
- Separar múltiples IPs con comas
- Incluir puerto `:4200` (Angular)
- Incluir `localhost` solo para desarrollo

### 3.3 Configurar API URL Frontend

Editar `frontend\src\environments\environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://192.168.100.50:3000/api'  // ⚠️ USAR TU IP
};
```

**Producción** (`environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'http://IP_SERVIDOR_PROD:3000/api'
};
```

---

## 4. Primer Usuario Admin

### Opción A: Registro Manual en MongoDB

```javascript
// Ejecutar en mongosh
use bitacora_soc

db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  // Password: "CHANGE_ME" hasheado con bcrypt
  password: "<bcrypt_hash>",
  fullName: "Administrador",
  role: "admin",
  isActive: true,
  theme: "light",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**⚠️ Cambiar password inmediatamente después del primer login.**

### Opción B: Script Seed (Recomendado)

Crear `backend/src/scripts/seed.js`:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const adminExists = await User.findOne({ role: 'admin' });
  if (adminExists) {
    console.log('❌ Admin ya existe');
    process.exit(0);
  }
  
  const admin = new User({
    username: 'admin',
    email: 'admin@example.com',
    password: 'CHANGE_ME',  // Se hashea automáticamente
    fullName: 'Administrador',
    role: 'admin',
    isActive: true
  });
  
  await admin.save();
  console.log('✅ Admin creado: admin / CHANGE_ME');
  process.exit(0);
}

seed().catch(console.error);
```

Ejecutar:
```powershell
node backend\src\scripts\seed.js
```

---

## 5. Verificación

### Backend

```powershell
cd backend
npm run dev
```

**Salida esperada:**
```
╔════════════════════════════════════════╗
║     🛡️  BITÁCORA SOC - BACKEND       ║
╠════════════════════════════════════════╣
║  Host:     0.0.0.0                     ║
║  Port:     3000                        ║
║  Timezone: America/Santiago            ║
║  API Docs: http://0.0.0.0:3000/api-docs║
╚════════════════════════════════════════╝
✅ MongoDB conectado correctamente
```

**Test endpoint:**
```powershell
curl http://localhost:3000/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-17T12:00:00.000Z",
  "timezone": "America/Santiago"
}
```

### Frontend

```powershell
cd frontend
npm start
```

**Salida esperada:**
```
** Angular Live Development Server is listening on 0.0.0.0:4200 **
✔ Compiled successfully.
```

**Acceder:**
- Local: `http://localhost:4200`
- Por IP: `http://192.168.100.50:4200`

---

## 6. Configuración Inicial Admin

### 6.1 Login

1. Ir a `http://192.168.100.50:4200`
2. Login: `admin` / `CHANGE_ME`
3. **Cambiar password inmediatamente** (Mi Perfil → Cambiar contraseña)

### 6.2 Configuración General

**Admin → Config General:**

- **Nombre de la aplicación:** "Bitácora SOC"
- **Cooldown checklist:** 4 horas (ajustar según operación)
- **Modo invitado:**
  - Habilitado: Sí/No
  - Duración: 2 días (1-30 días)

### 6.3 Catálogo de Servicios

**Checklist → Servicios (admin):**

Agregar servicios SOC:
- QRadar
- Zabbix
- Wazuh
- Splunk
- FortiGate
- etc.

**Orden:** Drag & drop para reordenar

### 6.4 SMTP (Opcional)

Si quieres notificaciones email de checklist:

**Admin → SMTP:**

1. Seleccionar proveedor (Office 365, Google, AWS SES, etc.)
2. Ingresar credenciales
3. Configurar remitente
4. Agregar destinatarios
5. Toggle: "Enviar solo si hay rojos" (Sí/No)
6. **Probar configuración** (envía test email)
7. Guardar

**Seguridad:** Password se cifra con AES-256-GCM, nunca se retorna al frontend.

---

## 7. Usuarios Adicionales

**Admin → Admin Usuarios → Nuevo:**

- Username (único)
- Email (único)
- Password (mín 6 chars)
- Nombre completo
- Rol:
  - **Admin:** Acceso total
  - **User:** Entradas + checklist
  - **Guest:** Solo entradas (temporal)

**Guests:**
- Si modo invitado habilitado, se calcula `guestExpiresAt` automáticamente
- Expira según configuración (default 2 días)
- Después de expiración, no puede hacer login

---

## 8. Logo Personalizado

**Admin → Config General → Logo:**

1. Click "Cambiar logo"
2. Seleccionar imagen (PNG/JPG, máx 2MB)
3. Upload
4. Se muestra en sidebar

**Path almacenado:** `backend/uploads/logo.png`

---

## 9. Backup Inicial

**Admin → Backup/Restore:**

1. Click "Crear Backup"
2. Esperar (puede tardar según tamaño DB)
3. Descarga automática o lista en "Backups disponibles"

**Path:** `backend/backups/backup-YYYY-MM-DDTHH-MM-SS/`

**Contiene:**
- Usuarios
- Entradas
- Checklist
- Configuración
- Notas

**Frecuencia recomendada:** Diario (automatizar con cron/task scheduler)

---

## 10. Troubleshooting Instalación

### Backend no inicia

**Error: `ENCRYPTION_KEY no configurada`**
```
⚠️ ENCRYPTION_KEY no configurada o muy corta. Usa: openssl rand -hex 32
```

**Solución:**
```powershell
openssl rand -hex 32 | Out-File -Encoding ASCII .encryption_key
# Copiar contenido a .env → ENCRYPTION_KEY=...
```

**Error: `MongoDB connection failed`**
```
MongooseError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solución:**
```powershell
# Verificar MongoDB corriendo
net start MongoDB

# O iniciar manualmente
mongod --dbpath C:\data\db
```

### Frontend no compila

**Error: `Port 4200 is already in use`**

**Solución:**
```powershell
# Cambiar puerto en package.json
"start": "ng serve --host 0.0.0.0 --port 4201"
```

### CORS Error

**Error en console browser:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solución:**
1. Verificar IP en `backend\.env` → `ALLOWED_ORIGINS`
2. Verificar IP en `frontend\src\environments\environment.ts` → `apiUrl`
3. Reiniciar backend

---

## 11. Siguiente Paso

Ver [RUNBOOK.md](./RUNBOOK.md) para operación diaria SOC.
