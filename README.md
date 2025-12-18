# 📋 Bitácora SOC

Sistema de registro y gestión de actividades para Security Operations Center (SOC).

**Stack:** Angular 17 + Express + MongoDB

---

## Descripción

Sistema para documentar entradas operativas/incidentes, realizar checklist de turno con validaciones, tomar notas duales (admin + personal), generar reportes/KPIs, y auditar todo con logging estructurado.

**Características principales:**
- Entradas operativas/incidentes con #hashtags automáticos
- Checklist de turno (anti-spam, cooldown 1-24h, validación servicios)
- Notas (admin global + personal privada con autosave)
- Notificaciones SMTP (configurables, solo si hay rojos opcional)
- Reportes (dashboard, CSV export)
- RBAC (admin/user/guest)
- Backup/restore MongoDB
- Logging 3 capas (pino + MongoDB AuditLog + SIEM TCP/TLS)
- Seguridad (AES-256-GCM, bcrypt, rate limiting, helmet)

---

## Requisitos

- Node.js 18+
- MongoDB 6+
- Angular CLI 17
- MongoDB Database Tools (mongodump/mongorestore)

---

## Quickstart

### 1. Instalar dependencias

```powershell
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Configurar variables de entorno

```powershell
cd backend
cp .env.example .env
```

**Editar `.env`:**
```env
# Generar claves seguras
openssl rand -hex 32        # ENCRYPTION_KEY
openssl rand -base64 32     # JWT_SECRET

# MongoDB
MONGODB_URI=mongodb://localhost:27017/bitacora_soc

# CORS (IP del frontend)
ALLOWED_ORIGINS=http://192.168.100.50:4200
```

Ver detalles completos en [docs/SETUP.md](docs/SETUP.md).

### 3. Ejecutar

**Backend:**
```powershell
cd backend
npm run dev
# Escucha en http://localhost:3000
```

**Frontend:**
```powershell
cd frontend
npm start
# Escucha en http://localhost:4200
```

### 4. Acceder

**URL:** `http://localhost:4200`

**Credenciales iniciales:**
- Usuario: `admin`
- Password: `admin123`

⚠️ **Cambiar contraseña inmediatamente después del primer login.**

---

## Configuración por IP (Ejecución en red)

### Obtener IP del servidor

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.PrefixOrigin -eq "Manual" }
# Ejemplo: 192.168.100.50
```

### Backend: Configurar CORS

**Editar `backend/.env`:**
```env
ALLOWED_ORIGINS=http://192.168.100.50:4200,http://192.168.1.100:4200
```

### Frontend: Configurar API URL

**Editar `frontend/src/environments/environment.ts`:**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://192.168.100.50:3000/api'  // IP real del servidor
};
```

### Verificar

```bash
# Desde otra máquina en la red
curl http://192.168.100.50:3000/health
# Respuesta: {"status":"ok","timestamp":"..."}
```

**Detalles completos en [docs/SETUP.md](docs/SETUP.md#configuracion-por-ip).**

---

## Documentación Detallada

Toda la documentación técnica está organizada en [`docs/`](docs/):

| Documento | Descripción |
|-----------|-------------|
| **[SETUP.md](docs/SETUP.md)** | Instalación paso a paso, configuración .env, primer usuario admin, verificación |
| **[RUNBOOK.md](docs/RUNBOOK.md)** | Operación diaria SOC: flujo de turno, reglas de negocio checklist, clasificación entradas |
| **[API.md](docs/API.md)** | Uso de Swagger UI, autenticación JWT, todos los endpoints con ejemplos cURL |
| **[SECURITY.md](docs/SECURITY.md)** | Decisiones de seguridad, hardening, checklist pre-producción |
| **[LOGGING.md](docs/LOGGING.md)** | 3 capas de logging (pino, MongoDB AuditLog, SIEM forwarding TCP/TLS) |
| **[BACKUP.md](docs/BACKUP.md)** | Procedimientos de backup/restore, retención, disaster recovery |
| **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** | Solución de problemas comunes por categoría |

**Swagger UI:** `http://IP_SERVIDOR:3000/api-docs`

---

## Estructura del Proyecto

```
BitacoraSOC/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Lógica de negocio
│   │   ├── models/           # Schemas Mongoose
│   │   ├── routes/           # Rutas Express
│   │   ├── middleware/       # Auth, RBAC, rate limiting
│   │   ├── utils/            # Logger, encryption, audit
│   │   ├── docs/             # swagger.yaml
│   │   └── scripts/          # seed.js (usuario admin inicial)
│   ├── .env.example          # Template variables de entorno
│   ├── package.json
│   └── server.js             # Entry point
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Componentes Angular
│   │   │   ├── services/     # HTTP services
│   │   │   ├── guards/       # Auth, role guards
│   │   │   └── interceptors/ # JWT interceptor
│   │   ├── environments/     # environment.ts (apiUrl configurable)
│   │   └── styles.scss       # Material themes
│   └── package.json
├── docs/                     # Documentación técnica
│   ├── SETUP.md
│   ├── RUNBOOK.md
│   ├── API.md
│   ├── SECURITY.md
│   ├── LOGGING.md
│   ├── BACKUP.md
│   └── TROUBLESHOOTING.md
├── SECURITY_AUDIT_REPORT.md  # Auditoría de seguridad (histórico)
└── README.md                 # Este archivo
```

---

## Licencia

MIT

---

## Soporte

Para problemas comunes, consulta [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md).

Para operación diaria, consulta [docs/RUNBOOK.md](docs/RUNBOOK.md).
