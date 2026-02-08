# 🌐 Documentación API - Bitácora SOC

Guía para consumir la API REST del sistema.

> Aviso: Todos los valores de ejemplo son placeholders. Reemplazarlos por credenciales reales desde `.env` antes de usar en producción.

---

## Acceso a Swagger UI

**URL:** `http://IP_SERVIDOR:3000/api-docs`

**Ejemplo:** `http://192.168.100.50:3000/api-docs`

**Contenido:**
- Todos los endpoints documentados
- Schemas completos
- Try it out interactivo

---

## Autenticación

### JWT Bearer Token

Todos los endpoints (excepto `/auth/login`) requieren header:

```
Authorization: Bearer <tu_token_jwt>
```

### Obtener Token

**POST** `/api/auth/login`

```bash
curl -X POST http://192.168.100.50:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "CHANGE_ME"
  }'

> Nota: `username` acepta nombre de usuario o email.
> Nota: `CHANGE_ME` es un placeholder. Usa tu valor real desde `.env` (`ADMIN_PASSWORD`).
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "675e12345...",
    "username": "admin",
    "email": "admin@example.com",
    "fullName": "Administrador",
    "role": "admin",
    "theme": "dark",
    "guestExpiresAt": null
  }
}
```

**Duración:**
- Admin/User: 4h
- Guest: 2h

### Clock Skew Tolerance

El servidor acepta tokens con diferencia de ±60 segundos (previene errores por desincronización de relojes).

---

## Endpoints Principales

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/refresh` | Renovar token | No |
| POST | `/api/auth/forgot-password` | Solicitar reseteo | No |
| POST | `/api/auth/reset-password` | Resetear contraseña | No |

### Usuarios

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | `/api/users` | Listar usuarios | Admin |
| POST | `/api/users` | Crear usuario | Admin |
| GET | `/api/users/me` | Perfil actual | Todos |
| PUT | `/api/users/me` | Actualizar perfil | Todos |
| PUT | `/api/users/:id` | Actualizar usuario | Admin |
| DELETE | `/api/users/:id` | Eliminar usuario | Admin |

### Entradas

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | `/api/entries` | Listar con filtros | Todos |
| POST | `/api/entries` | Crear entrada | Todos |
| GET | `/api/entries/:id` | Obtener por ID | Todos |
| PUT | `/api/entries/:id` | Actualizar | Creador o Admin |
| DELETE | `/api/entries/:id` | Eliminar | Creador o Admin |
| GET | `/api/entries/tags/suggest?q=xxx` | Autocompletar tags | Todos |

### Checklist

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | `/api/checklist/services` | Servicios activos | Todos |
| GET | `/api/checklist/services/all` | Todos los servicios | Admin |
| POST | `/api/checklist/services` | Crear servicio | Admin |
| PUT | `/api/checklist/services/:id` | Actualizar servicio | Admin |
| DELETE | `/api/checklist/services/:id` | Eliminar servicio | Admin |
| POST | `/api/checklist/check` | Registrar check | User/Admin |
| GET | `/api/checklist/check/last` | Último check usuario | User/Admin |
| GET | `/api/checklist/check/history` | Historial checks | User/Admin |

### Notas

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | `/api/notes/admin` | Nota del administrador | Todos |
| PUT | `/api/notes/admin` | Actualizar nota admin | Admin |
| GET | `/api/notes/personal` | Nota personal | Todos |
| PUT | `/api/notes/personal` | Actualizar nota personal | Todos |

### SMTP

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | `/api/smtp` | Obtener config | Admin |
| POST | `/api/smtp` | Guardar config | Admin |
| POST | `/api/smtp/test` | Probar (rate-limited 3/15min) | Admin |

### Reportes

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | `/api/reports/overview?days=30` | KPIs generales | Admin |
| GET | `/api/reports/export-entries?startDate=...&endDate=...` | Export CSV | Admin |
| GET | `/api/reports/tags-trend?days=30&tags=a,b` | Tendencia de tags | Admin/User |
| GET | `/api/reports/heatmap?days=30` | Mapa de calor día/hora | Admin/User |
| GET | `/api/reports/entries-by-logsource?days=30` | Entradas por Log Source | Admin/User |

### Configuración

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | `/api/config` | Config general | Todos |
| PUT | `/api/config` | Actualizar config | Admin |
| POST | `/api/config/logo` | Subir logo | Admin |
| GET | `/api/config/logo` | Obtener logo (público) | No |
| GET | `/api/config/favicon` | Obtener favicon (público) | No |
| POST | `/api/config/favicon` | Subir favicon | Admin |

### Backup

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | `/api/backup/history` | Historial de backups | Admin |
| POST | `/api/backup/create` | Crear backup JSON | Admin |
| POST | `/api/backup/restore` | Restaurar backup | Admin |
| GET | `/api/backup/export/:type` | Exportar CSV | Admin |
| POST | `/api/backup/import` | Importar CSV/JSON | Admin |
| DELETE | `/api/backup/:id` | Eliminar backup | Admin |

### Logging (SIEM)

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | `/api/logging/config` | Config forwarding | Admin |
| PUT | `/api/logging/config` | Actualizar config | Admin |
| POST | `/api/logging/test` | Probar conexión SIEM | Admin |

### Audit Logs

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | `/api/audit-logs` | Listar logs de auditoría | Admin/Auditor |
| GET | `/api/audit-logs/events` | Eventos disponibles | Admin/Auditor |
| GET | `/api/audit-logs/stats` | Estadísticas de auditoría | Admin/Auditor |

### Turnos de Trabajo

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | `/api/work-shifts` | Listar turnos | Todos |
| GET | `/api/work-shifts/current` | Turno actual | Todos |
| POST | `/api/work-shifts` | Crear turno | Admin |
| PUT | `/api/work-shifts/:id` | Actualizar turno | Admin |
| DELETE | `/api/work-shifts/:id` | Eliminar turno | Admin |
| PUT | `/api/work-shifts/reorder` | Reordenar | Admin |
| POST | `/api/work-shifts/:id/send-report` | Enviar reporte | Admin |

### Escalación

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | `/api/escalation/view/:serviceId` | Vista escalación por servicio | Todos |
| GET | `/api/escalation/clients` | Clientes activos | Todos |
| GET | `/api/escalation/services` | Servicios (por cliente) | Todos |
| GET | `/api/escalation/contacts` | Contactos públicos | Todos |
| GET | `/api/escalation/internal-shifts` | Turnos internos actuales | Todos |
| GET | `/api/escalation/raci` | Matriz RACI por cliente/servicio | Todos |

**Admin CRUD:**
- `/api/escalation/admin/clients`
- `/api/escalation/admin/services`
- `/api/escalation/admin/contacts`
- `/api/escalation/admin/raci`
- `/api/escalation/admin/rules`
- `/api/escalation/admin/cycles`
- `/api/escalation/admin/assignments`
- `/api/escalation/admin/overrides`
- `/api/escalation/admin/external-people`

---

## Ejemplos cURL

### Crear Entrada Operativa

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."  # Tu token

curl -X POST http://192.168.100.50:3000/api/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "Revisión de alertas en #Trellix. Todo operativo. Se identificó falso positivo en regla #FW-001. #hunting",
    "entryType": "operativa",
    "entryDate": "2025-12-17",
    "entryTime": "14:30"
  }'
```

**Respuesta:**
```json
{
  "message": "Entrada creada exitosamente",
  "entry": {
    "_id": "675e123...",
    "content": "Revisión de alertas en #Trellix...",
    "entryType": "operativa",
    "entryDate": "2025-12-17T00:00:00.000Z",
    "entryTime": "14:30",
    "tags": ["trellix", "fw-001", "hunting"],
    "createdBy": "675e...",
    "createdByUsername": "admin",
    "isGuestEntry": false,
    "createdAt": "2025-12-17T14:30:00.000Z"
  }
}
```

### Registrar Checklist Inicio

```bash
curl -X POST http://192.168.100.50:3000/api/checklist/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "inicio",
    "services": [
      {
        "serviceId": "675e1234567890abcdef1234",
        "serviceTitle": "QRadar",
        "status": "verde",
        "observation": ""
      },
      {
        "serviceId": "675e1234567890abcdef1235",
        "serviceTitle": "Zabbix",
        "status": "rojo",
        "observation": "Alerta de CPU en servidor prod-01. Escalado a infra. Ticket #12345."
      },
      {
        "serviceId": "675e1234567890abcdef1236",
        "serviceTitle": "Wazuh",
        "status": "verde",
        "observation": ""
      }
    ]
  }'
```

**Respuesta:**
```json
{
  "message": "Checklist registrado exitosamente",
  "check": {
    "_id": "675e456...",
    "userId": "675e...",
    "username": "admin",
    "type": "inicio",
    "services": [...],
    "hasRedServices": true,
    "checkDate": "2025-12-17T14:00:00.000Z"
  }
}
```

### Listar Entradas con Filtros

**Filtros disponibles:**
- `page`, `limit` (paginación)
- `search` (búsqueda texto completo)
- `tags` (ej: `trellix,hunting`)
- `entryType` (`operativa` o `incidente`)
- `startDate`, `endDate` (formato ISO8601)
- `userId` (solo admin)

**Ejemplo: Incidentes con tag 'malware' últimos 7 días**

```bash
START_DATE=$(date -d '7 days ago' +%Y-%m-%d)
END_DATE=$(date +%Y-%m-%d)

curl -X GET "http://192.168.100.50:3000/api/entries?entryType=incidente&tags=malware&startDate=${START_DATE}&endDate=${END_DATE}&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta:**
```json
{
  "entries": [
    {
      "_id": "675e...",
      "content": "Detección de malware en estación WS-045...",
      "entryType": "incidente",
      "tags": ["malware", "trellix", "respuesta"],
      "createdByUsername": "admin",
      "createdAt": "2025-12-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalEntries": 45,
    "limit": 20
  }
}
```

### Probar Configuración SMTP

```bash
curl -X POST http://192.168.100.50:3000/api/smtp/test \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta (éxito):**
```json
{
  "message": "Email de prueba enviado exitosamente",
  "recipient": "soc@example.com"
}
```

**Respuesta (error):**
```json
{
  "message": "Error al enviar email de prueba",
  "error": "Invalid login: 535 Authentication failed"
}
```

### Obtener Reportes

```bash
curl -X GET "http://192.168.100.50:3000/api/reports/overview?days=30" \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta:**
```json
{
  "summary": {
    "totalEntries": 450,
    "totalIncidents": 23,
    "totalOperational": 427,
    "activeUsers": 5,
    "totalChecks": 120
  },
  "incidentsByUser": [
    {"username": "juan", "count": 12},
    {"username": "maria", "count": 8}
  ],
  "topTags": [
    {"tag": "trellix", "count": 89},
    {"tag": "hunting", "count": 56}
  ],
  "checksByService": [
    {"service": "QRadar", "totalReds": 3},
    {"service": "Zabbix", "totalReds": 8}
  ]
}
```

### Configurar Log Forwarding (SIEM)

```bash
curl -X PUT http://192.168.100.50:3000/api/logging/config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "enabled": true,
    "host": "10.0.101.200",
    "port": 5140,
    "mode": "tls",
    "tls": {
      "rejectUnauthorized": true
    },
    "forwardLevel": "audit-only",
    "retry": {
      "enabled": true,
      "maxRetries": 5,
      "backoffMs": 1000
    }
  }'
```

---

## Paginación

**Query params:**
- `page`: Número de página (default: 1)
- `limit`: Items por página (default: 20, máx: 100)

**Respuesta incluye:**
```json
{
  "entries": [...],
  "pagination": {
    "currentPage": 2,
    "totalPages": 10,
    "totalEntries": 195,
    "limit": 20
  }
}
```

---

## Rate Limiting

### Límites por Endpoint

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `/api/auth/login` | 5 intentos | 15 min |
| `/api/smtp/test` | 3 intentos | 15 min |
| `/api/**` (general) | 100 requests | 15 min |

### Headers de Rate Limit

**Respuesta incluye:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702814400
```

### Respuesta 429 (Too Many Requests)

```json
{
  "message": "Too many requests, please try again later."
}
```

---

## Errores Estándar

### Formato de Error

```json
{
  "message": "Descripción del error",
  "errors": [
    {
      "field": "entryType",
      "message": "Tipo de entrada inválido"
    }
  ]
}
```

### Códigos HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (validación fallida) |
| 401 | Unauthorized (sin token o token inválido) |
| 403 | Forbidden (sin permisos) |
| 404 | Not Found |
| 409 | Conflict (duplicado) |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Ejemplo: Validación Fallida

**Request:**
```bash
curl -X POST http://192.168.100.50:3000/api/entries \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content": ""}'
```

**Respuesta 400:**
```json
{
  "message": "Errores de validación",
  "errors": [
    {
      "field": "content",
      "message": "El contenido es requerido"
    },
    {
      "field": "entryType",
      "message": "El tipo de entrada es requerido"
    }
  ]
}
```

---

## Correlation ID (X-Request-Id)

Cada request tiene un UUID único para tracing:

**Request:**
```bash
curl -X POST http://192.168.100.50:3000/api/entries \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Request-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{...}'
```

**Response incluye:**
```
X-Request-Id: 550e8400-e29b-41d4-a716-446655440000
```

Si no envías X-Request-Id, el backend genera uno automáticamente.

**Uso:**
- Debugging
- Logs correlacionados
- Tracing end-to-end

---

## CORS

**Orígenes permitidos:** Configurados en `backend/.env`

```env
ALLOWED_ORIGINS=http://192.168.100.50:4200,http://192.168.1.100:4200
```

**Headers permitidos:**
- Authorization
- Content-Type
- X-Request-Id

**Credentials:** `true` (cookies permitidas)

---

## Timezone

**Todas las fechas en respuesta:** ISO8601 con timezone UTC

**Ejemplo:**
```json
"createdAt": "2025-12-17T14:30:00.000Z"
```

**Backend interno:** America/Santiago (Chile)

**Conversión automática:** Backend convierte a UTC para respuestas API

---

## Schemas

Ver Swagger UI para schemas completos:
- User
- Entry
- ShiftCheck
- Service
- AdminNote
- PersonalNote
- SmtpConfig
- AppConfig

**URL:** `http://IP_SERVIDOR:3000/api-docs` → Components → Schemas

---

## Testing con Postman

1. **Importar colección:**
   - Swagger URL: `http://192.168.100.50:3000/api-docs`
   - Postman → Import → Link → Pegar URL

2. **Configurar Environment:**
   - Variable: `baseUrl` = `http://192.168.100.50:3000/api`
   - Variable: `token` = `<tu_token_jwt>`

3. **Pre-request script (Auth):**
   ```javascript
   pm.request.headers.add({
     key: 'Authorization',
     value: 'Bearer ' + pm.environment.get('token')
   });
   ```

---

## Referencias

- **Swagger UI:** `http://IP_SERVIDOR:3000/api-docs`
- **Health Check:** `http://IP_SERVIDOR:3000/health`
- **Instalación:** [SETUP.md](./SETUP.md)
- **Operación:** [RUNBOOK.md](./RUNBOOK.md)
- **Logging:** [LOGGING.md](./LOGGING.md)
