# Sistema de Reenvío de Información (Email Reports)

## 📧 Descripción General

Sistema automático para enviar reportes de turno por correo electrónico al finalizar cada turno. Los reportes incluyen checklist de entrada/salida y entradas de bitácora en formato HTML profesional.

## ✨ Características

- ✅ **Envío automático** al finalizar turno (ejecuta cada minuto vía cron)
- ✅ **Envío manual** vía endpoint API
- ✅ **Contenido personalizable**: incluir/excluir checklist y entradas
- ✅ **Asunto personalizable** con variables dinámicas
- ✅ **Múltiples destinatarios** por turno
- ✅ **HTML responsive** con tabla de checklist lado a lado
- ✅ **Solo turnos regulares** (NO N1_NO_HABIL/emergency)

## 🔧 Configuración en Frontend

### Ubicación
`Administración → Gestión de Turnos → (Editar turno) → Reenvío de Información`

### Campos de Configuración

```typescript
emailReportConfig: {
  enabled: boolean,              // Habilitar reenvío automático
  includeChecklist: boolean,     // Incluir tabla checklist entrada/salida
  includeEntries: boolean,       // Incluir lista de entradas de bitácora
  recipients: string[],          // Array de emails destinatarios
  subjectTemplate: string        // Asunto con variables [fecha], [turno], [hora]
}
```

### Ejemplo de Configuración

```javascript
{
  enabled: true,
  includeChecklist: true,
  includeEntries: true,
  recipients: ['supervisor@empresa.com', 'jefe-soc@empresa.com'],
  subjectTemplate: 'Reporte SOC [fecha] [turno] - Finalizado a las [hora]'
}
```

## 📝 Variables en Asunto

| Variable   | Descripción                  | Ejemplo         |
|------------|------------------------------|-----------------|
| `[fecha]`  | Fecha del turno (DD/MM/YYYY) | 03/02/2026      |
| `[turno]`  | Nombre del turno             | Turno Mañana    |
| `[hora]`   | Hora de fin del turno        | 18:00           |

**Ejemplo:**
- Template: `Reporte SOC [fecha] [turno]`
- Resultado: `Reporte SOC 03/02/2026 Turno Mañana`

## 🔌 API Endpoints

### 1. Envío Manual de Reporte

```http
POST /api/work-shifts/:id/send-report
Authorization: Bearer {admin-token}
Content-Type: application/json
```

**Body (opcional):**
```json
{
  "date": "2026-02-03T12:00:00Z"  // Fecha del turno, default: hoy
}
```

**Response (éxito):**
```json
{
  "success": true,
  "message": "Report sent successfully",
  "recipients": 2,
  "includeChecklist": true,
  "includeEntries": true,
  "entriesCount": 5
}
```

**Response (sin destinatarios):**
```json
{
  "success": false,
  "message": "No recipients configured"
}
```

### 2. Gestión de Turnos (CRUD normal)

Los campos de `emailReportConfig` se incluyen automáticamente en:
- `POST /api/work-shifts` (crear)
- `PUT /api/work-shifts/:id` (actualizar)
- `GET /api/work-shifts/:id` (obtener)

## 📧 Formato del Email

### Estructura HTML
1. **Encabezado**: Logo y nombre del turno con fecha
2. **Tabla de Checklist**: Dos columnas (Entrada | Salida) lado a lado
3. **Lista de Entradas**: Entradas de bitácora con hora y descripción
4. **Footer**: Mensaje auto-generado

### Estilos
- Diseño responsive
- Colores corporativos (púrpura/azul)
- Tabla con bordes y zebra-striping
- Checkboxes visuales (✓ / ○)
- Compatible con clientes de correo móviles

## ⚙️ Configuración SMTP

Asegúrate de tener configuradas estas variables de entorno:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@empresa.com
SMTP_PASS=tu-contraseña-app
SMTP_FROM="Bitácora SOC <notificaciones@empresa.com>"
```

## 🔄 Funcionamiento del Scheduler

### Cron Job
- **Frecuencia**: Cada minuto
- **Condiciones**: 
  - Turno tipo `regular` (no emergency)
  - `active: true`
  - `emailReportConfig.enabled: true`
  - Hora actual === `endTime` del turno

### Log de Eventos
```javascript
// Inicio del scheduler
✅ Shift report scheduler started

// Turno finalizado
Shift Turno Mañana ended, sending report...

// Reporte enviado
Automatic report sent for Turno Mañana {
  shiftId: "...",
  recipients: 2,
  success: true
}
```

## 🗃️ Archivos Modificados

### Backend
```
backend/src/
├── models/WorkShift.js                  # Modelo actualizado con emailReportConfig
├── routes/work-shifts.js                # Endpoint POST /:id/send-report
├── utils/
│   ├── email.js                         # Nuevo: Servicio de envío de emails
│   ├── shift-report.js                  # Nuevo: Generador de reportes HTML
│   └── shift-scheduler.js               # Nuevo: Cron scheduler automático
└── server.js                            # Inicializa scheduler
```

### Frontend
```
frontend/src/app/
├── models/work-shift.model.ts           # Interfaz actualizada
└── pages/work-shifts/work-shifts-admin/
    ├── work-shifts-admin.component.ts    # Lógica chips de emails
    ├── work-shifts-admin.component.html  # Formulario "Reenvío de Información"
    └── work-shifts-admin.component.scss  # Estilos sección reportes
```

## 🧪 Pruebas

### 1. Prueba Manual (vía API)
```bash
curl -X POST http://localhost:3000/api/work-shifts/{shift-id}/send-report \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

### 2. Prueba Automática
1. Configurar turno con `endTime` = hora actual + 1 minuto
2. Habilitar `emailReportConfig.enabled = true`
3. Agregar email de prueba en `recipients`
4. Esperar 1 minuto
5. Verificar logs: `docker logs bitacora-backend --tail 50`

### 3. Verificar Scheduler
```bash
docker logs bitacora-backend --tail 100 | grep "Shift report scheduler"
```

Debe mostrar: `✅ Shift report scheduler started`

## ❗ Solución de Problemas

### Scheduler no aparece en logs
- Verificar que `node-cron` esté instalado: `npm ls node-cron`
- Reconstruir imagen Docker: `docker-compose build --no-cache backend`

### Email no se envía
- Verificar variables SMTP en `.env`
- Probar configuración SMTP en Admin → Configuración SMTP → Probar
- Ver logs de error: `docker logs bitacora-backend | grep ERROR`

### Destinatarios vacíos
- Al menos 1 email requerido si `enabled: true`
- Frontend valida antes de guardar

### Reporte vacío
- Verificar que existan ShiftCheck con `type: 'entry'` y `type: 'exit'`
- Verificar que haya entradas en bitácora dentro del rango horario del turno

## 📋 Migración de Datos Existentes

Los turnos creados con campos antiguos (`enableEmailNotifications`, `notificationEmails`) seguirán funcionando, pero NO enviarán reportes automáticos.

Para migrar manualmente:
1. Editar turno en UI
2. Ir a sección "Reenvío de Información"
3. Habilitar y configurar
4. Guardar

## 🔐 Seguridad

- ✅ Endpoint requiere autenticación admin
- ✅ Validación de formato email en frontend
- ✅ Rate limiting aplicado (mismo que otros endpoints)
- ✅ Logs de auditoría para todos los envíos
- ✅ No se envían credenciales en emails

## 📊 Monitoreo

### Logs Importantes
```bash
# Scheduler iniciado
docker logs bitacora-backend | grep "Shift report scheduler"

# Reportes enviados automáticamente
docker logs bitacora-backend | grep "Automatic report sent"

# Reportes enviados manualmente
docker logs bitacora-backend | grep "Manual shift report sent"

# Errores de envío
docker logs bitacora-backend | grep "Error sending shift report"
```

---

**Última actualización**: 2026-02-03  
**Versión sistema**: 1.1.0
