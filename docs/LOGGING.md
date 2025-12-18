# 📊 Sistema de Logging y Auditoría - BitacoraSOC

## Arquitectura

El sistema implementa 3 capas de observabilidad:

1. **Logs estructurados** (pino): JSON para stdout/stderr
2. **Auditoría persistente** (MongoDB): AuditLog collection con TTL
3. **Forwarding a SIEM** (TCP/TLS): Envío a colector externo

---

## 1. Logs Estructurados (pino)

### Formato

```json
{
  "level": 30,
  "time": 1704067200000,
  "pid": 12345,
  "hostname": "soc-server",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "event": "auth.login.success",
  "userId": "507f1f77bcf86cd799439011",
  "role": "admin",
  "msg": "User logged in"
}
```

### Niveles

- `trace` (10): Debug muy detallado
- `debug` (20): Debug general
- `info` (30): Eventos informativos (default)
- `warn` (40): Advertencias
- `error` (50): Errores
- `fatal` (60): Errores fatales

### Uso en código

```javascript
const { logger, requestLogger, actorLogger, sanitize } = require('./utils/logger');

// Log básico
logger.info({ event: 'user.login', userId: '123' }, 'User logged in');

// Con request context
const reqLogger = requestLogger(req);
reqLogger.info({ event: 'entry.create' }, 'Entry created');

// Con actor context
const actorLog = actorLogger(req.user);
actorLog.warn({ event: 'permission.denied' }, 'Access denied');

// Sanitizar objeto (remove secrets)
const safe = sanitize({ password: '123', data: 'public' });
// → { data: 'public' } (password removido)
```

### Variables de entorno

```bash
LOG_LEVEL=info          # Nivel mínimo (info, debug, warn, error)
NODE_ENV=production     # Si es "production", no usa pretty print
```

---

## 2. Auditoría Persistente (MongoDB)

### Colección: AuditLog

```javascript
{
  _id: ObjectId,
  timestamp: Date,           // indexed
  event: String,             // namespace.action (ej: "auth.login.success")
  level: String,             // info | warn | error
  actor: {
    userId: ObjectId,
    username: String,
    role: String,
    isGuest: Boolean
  },
  request: {
    requestId: String,       // correlation ID
    ip: String,
    userAgent: String,
    method: String,
    path: String
  },
  result: {
    success: Boolean,
    reason: String,
    statusCode: Number
  },
  metadata: Object,          // flexible (sanitizado)
  forwarded: Boolean         // true si se envió a SIEM
}
```

### TTL (Time To Live)

Los logs se eliminan automáticamente después de **90 días** (configurable):

```bash
AUDIT_TTL_DAYS=90
```

### Inmutabilidad

Los registros de auditoría **NO se pueden modificar ni eliminar** manualmente. Mongoose hooks lo previenen.

### Uso en código

```javascript
const { audit } = require('./utils/audit');

// En una ruta
await audit(req, {
  event: 'entry.create',
  level: 'info',
  result: { success: true },
  metadata: {
    entryId: entry._id,
    entryType: 'incidente',
    tagCount: 5
  }
});
```

### Eventos auditados

| Namespace | Acción | Nivel | Descripción |
|-----------|--------|-------|-------------|
| `auth.login` | `.success` / `.fail` | info/warn | Login de usuario |
| `entry.create` | `.update` / `.delete` | info | CRUD de entradas |
| `shiftcheck.submit` | - | info | Registro de check de turno |
| `shiftcheck.block` | `.consecutive` / `.cooldown` | warn | Bloqueos de validación |
| `admin.users` | `.create` / `.update` / `.delete` | info | Gestión de usuarios |
| `admin.backup` | `.create` / `.restore` | info | Backups |
| `admin.logging` | `.view` / `.update` / `.test` | info | Config de forwarding |

---

## 3. Log Forwarding (SIEM)

### Configuración

Solo **admin** puede configurar forwarding:

**GET** `/api/logging/config`
```json
{
  "enabled": false,
  "host": "siem.example.com",
  "port": 5140,
  "mode": "plain",
  "tls": {
    "rejectUnauthorized": true,
    "caCert": "-----BEGIN CERTIFICATE-----...",
    "clientCert": null
  },
  "retry": {
    "enabled": true,
    "maxRetries": 5,
    "backoffMs": 1000
  },
  "forwardLevel": "audit-only"
}
```

**PUT** `/api/logging/config`
```json
{
  "enabled": true,
  "host": "10.0.101.200",
  "port": 5140,
  "mode": "tls",
  "forwardLevel": "audit-only"
}
```

**POST** `/api/logging/test` → Envía log de prueba

### Formato enviado (NDJSON)

Cada línea es un JSON completo:

```json
{"timestamp":"2024-01-01T12:00:00.000Z","event":"auth.login.success","level":"info","actor":{"userId":"507f...","username":"admin","role":"admin","isGuest":false},"request":{"requestId":"550e8400...","ip":"10.0.101.10","userAgent":"Mozilla/5.0...","method":"POST","path":"/api/auth/login"},"result":{"success":true,"reason":"Login successful"},"metadata":{"isGuest":false}}
{"timestamp":"2024-01-01T12:05:00.000Z","event":"entry.create","level":"info","actor":{...},"request":{...},"result":{...},"metadata":{...}}
```

### Protocolos

#### TCP Plain

```bash
# Test receptor (netcat)
nc -l 5140
```

Usar solo en desarrollo o redes internas aisladas.

#### TCP + TLS

```bash
# Test receptor (openssl)
openssl s_server -accept 5140 -cert server.pem -key server-key.pem
```

Producción DEBE usar TLS con certificado válido.

### mTLS (Mutual TLS)

Si el SIEM requiere client certificate:

1. Admin sube `clientCert` (PEM) en config
2. Admin configura `LOG_FORWARD_CLIENT_KEY` en `.env`:

```bash
LOG_FORWARD_CLIENT_KEY=/path/to/client-key.pem
```

⚠️ **NUNCA** guardar `clientKey` en MongoDB (solo en env).

### Filtrado por nivel

- `audit-only`: Solo eventos de AuditLog (default)
- `info`: AuditLog + logs info
- `warn`: AuditLog + logs warn/error
- `error`: Solo logs error

### Backoff exponencial

Si el colector está down:

- Intento 1: wait 1s
- Intento 2: wait 2s
- Intento 3: wait 4s
- Intento 4: wait 8s
- Intento 5: wait 16s
- Intento 6+: desiste

### Queue

Si conexión está caída, los logs se encolan en memoria (max 1000). Cuando reconecta, se envían todos.

---

## Seguridad

### Sanitización automática

Estas claves se **eliminan** antes de loggear:

- `password`
- `token`
- `jwt`
- `secret`
- `apiKey`
- `authorization`
- `cookie`

### Límite de metadata

Metadata de audit se trunca a **10KB** para evitar payloads gigantes.

### Certificados

- **CA Cert**: validar identidad del servidor SIEM
- **Client Cert**: autenticación mTLS (opcional)
- **rejectUnauthorized**: `true` por defecto (NO aceptar self-signed en prod)

---

## Correlation ID (X-Request-Id)

Cada request tiene un UUID v4 único:

- Cliente puede enviar header `X-Request-Id` (se reutiliza)
- Si no existe, backend genera uno nuevo
- Aparece en **todos** los logs de ese request
- Se retorna en response header

Permite tracing end-to-end: Frontend → Backend → Logs → SIEM

---

## Troubleshooting

### Los logs no aparecen en stdout

Verificar `LOG_LEVEL`:

```bash
LOG_LEVEL=debug node src/server.js
```

### AuditLog no persiste

Verificar conexión MongoDB:

```bash
mongo
> use bitacora_soc
> db.auditlogs.find().limit(5)
```

### Forwarding no funciona

1. Test conexión:
   ```bash
   curl -X POST http://localhost:3000/api/logging/test \
     -H "Authorization: Bearer <admin-token>"
   ```

2. Verificar logs del forwarder:
   ```bash
   grep "logforward" logs/combined.log
   ```

3. Test manual (netcat):
   ```bash
   # Terminal 1
   nc -l 5140

   # Terminal 2 (admin UI o API)
   # Habilitar forwarding → host localhost, port 5140
   ```

### TLS handshake fails

Verificar certificados:

```bash
openssl s_client -connect siem.example.com:5140 -showcerts
```

Si usa self-signed en dev, set `rejectUnauthorized: false` (⚠️ NO en prod).

---

## Integración SIEM

### Logstash

```ruby
input {
  tcp {
    port => 5140
    codec => json_lines
  }
}

filter {
  mutate {
    add_field => { "[@metadata][source]" => "bitacora-soc" }
  }
}

output {
  elasticsearch {
    hosts => ["http://localhost:9200"]
    index => "bitacora-%{+YYYY.MM.dd}"
  }
}
```

### Graylog

1. **System / Inputs** → Create Input
2. Type: **Raw/Plaintext TCP**
3. Port: 5140
4. Codec: **JSON Lines** (extractor)

### Splunk

```bash
# inputs.conf
[tcp://5140]
sourcetype = _json
source = bitacora-soc
```

---

## Performance

### pino (logger)

- **3x más rápido** que winston
- Writes asíncronos a stdout (non-blocking)
- Pretty print solo en dev (prod es JSON puro)

### logForwarder

- **Queue in-memory**: 1000 logs max (previene memory leak)
- **No blocking**: `process.nextTick` para forwarding
- **Connection pooling**: reutiliza socket TCP/TLS

### AuditLog

- **Indexes**: timestamp, event, actor.userId
- **TTL index**: auto-delete después de 90 días
- **Immutable**: no se puede UPDATE/DELETE (solo INSERT)

---

## Desarrollo

### Test sin SIEM real

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start netcat collector
nc -l 5140

# Terminal 3: Configure forwarding (admin)
curl -X PUT http://localhost:3000/api/logging/config \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "host": "localhost",
    "port": 5140,
    "mode": "plain",
    "forwardLevel": "audit-only"
  }'

# Terminal 4: Trigger audit event
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Ver en Terminal 2: JSON llegando a netcat
```

### Pretty logs en dev

```bash
NODE_ENV=development npm run dev
```

Output:
```
[12:00:00.123] INFO (12345): User logged in
    event: "auth.login.success"
    userId: "507f1f77bcf86cd799439011"
    requestId: "550e8400-e29b-41d4-a716-446655440000"
```

### Modo JSON puro

```bash
NODE_ENV=production npm start
```

Output:
```json
{"level":30,"time":1704067200123,"pid":12345,"event":"auth.login.success","userId":"507f1f77bcf86cd799439011","msg":"User logged in"}
```

---

## Referencias

- [pino documentation](https://getpino.io/)
- [NDJSON specification](http://ndjson.org/)
- [RFC 4122 (UUID)](https://datatracker.ietf.org/doc/html/rfc4122)
- [OpenTelemetry context propagation](https://opentelemetry.io/docs/concepts/signals/traces/#context-propagation)
