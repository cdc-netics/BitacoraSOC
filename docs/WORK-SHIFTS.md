# 🕐 Módulo de Turnos de Trabajo - BitacoraSOC

## 📋 Descripción

Sistema de gestión de **turnos de trabajo** con horarios personalizados, diferenciando entre:

- **Turnos regulares**: Horarios normales de oficina (ej: mañana, tarde, noche)
- **Turnos de emergencia**: Para atención fuera de horario hábil (no confundir con N1_NO_HABIL de escalación)

## ✨ Características

✅ **Configuración flexible de horarios** (ej: 9-18, 18-2, 2-9)
✅ **Asignación opcional de usuarios** a turnos específicos
✅ **Asociación con checklists** diferentes por turno
✅ **Detección automática** del turno actual según hora
✅ **Soporte para cruces de medianoche** (ej: 22:00 - 06:00)
✅ **Gestión completa** (crear, editar, eliminar, reordenar)
✅ **Reportes por correo** configurables por turno

---

## 🏗️ Arquitectura

### Backend

**Modelo:** `backend/src/models/WorkShift.js`

```javascript
{
  name: String,              // "Turno Mañana"
  code: String,              // "MORNING" (único)
  type: 'regular' | 'emergency',
  startTime: String,         // "09:00" (HH:MM)
  endTime: String,           // "18:00" (HH:MM)
  timezone: String,          // "America/Santiago"
  assignedUserId: ObjectId,      // Usuario asignado (opcional)
  checklistTemplateId: ObjectId, // Checklist asociado (opcional)
  emailReportConfig: {
    enabled: Boolean,
    includeChecklist: Boolean,
    includeEntries: Boolean,
    recipients: [String],
    subjectTemplate: String
  },
  order: Number,
  active: Boolean,
  color: String                  // Color hex para UI
}
```

**Rutas:** `backend/src/routes/work-shifts.js`

```
GET    /api/work-shifts              - Listar turnos
GET    /api/work-shifts/current      - Obtener turno actual
GET    /api/work-shifts/:id          - Obtener turno específico
POST   /api/work-shifts              - Crear turno (admin)
PUT    /api/work-shifts/:id          - Actualizar turno (admin)
DELETE /api/work-shifts/:id          - Eliminar turno (admin)
PUT    /api/work-shifts/reorder      - Reordenar turnos (admin)
POST   /api/work-shifts/:id/send-report - Enviar reporte manual (admin)
```

### Frontend

**Modelos:** `frontend/src/app/models/work-shift.model.ts`
**Servicio:** `frontend/src/app/services/work-shift.service.ts`
**Componente Admin:** `frontend/src/app/pages/work-shifts/work-shifts-admin/`

**Ruta:** `/main/work-shifts` (solo admin)
**Menú:** Configuración (Admin) → Turnos de Trabajo

---

## 🚀 Configuración Inicial

### 1. Crear turnos de ejemplo

```bash
# Desde backend/
node src/scripts/seed-work-shifts.js
```

El script incluye dos configuraciones:

**Opción 1: Turno único (actual - 9 a 18)**
- Turno Diurno (9:00 - 18:00)
- Emergencia No Hábil (18:00 - 09:00)

**Opción 2: Tres turnos (24h dividido en 3)**
- Turno Mañana (09:00 - 17:00)
- Turno Tarde (17:00 - 01:00)
- Turno Noche (01:00 - 09:00)
- Emergencia (backup, inactivo)

Editar `seed-work-shifts.js` línea 108 para cambiar entre opciones.

### 2. Acceder desde frontend

1. Login como **admin**
2. Menú lateral → **Configuración (Admin)** → **Turnos de Trabajo**
3. Crear/editar/eliminar turnos según necesidad

---

## 📖 Casos de Uso

### Caso 1: Turno único (configuración actual)

```json
POST /api/work-shifts
{
  "name": "Turno Diurno",
  "code": "DAY",
  "type": "regular",
  "startTime": "09:00",
  "endTime": "18:00",
  "timezone": "America/Santiago",
  "active": true
}
```

### Caso 2: Asignar usuario a turno

```json
PUT /api/work-shifts/{id}
{
  "assignedUserId": "507f1f77bcf86cd799439011"
}
```

### Caso 3: Asociar checklist específico

```json
PUT /api/work-shifts/{id}
{
  "checklistTemplateId": "507f1f77bcf86cd799439012"
}
```

### Caso 4: Obtener turno actual

```bash
GET /api/work-shifts/current
```

Respuesta:
```json
{
  "shift": {
    "_id": "...",
    "name": "Turno Diurno",
    "code": "DAY",
    "startTime": "09:00",
    "endTime": "18:00",
    "assignedUserName": "Juan Pérez",
    "assignedUserEmail": "juan@example.com"
  },
  "currentTime": "14:30",
  "timezone": "America/Santiago"
}
```

---

---

## 📧 Reporte de Turno por Correo (Email Reports)

### Descripción
Envía un reporte HTML al finalizar el turno con checklist de inicio/cierre y entradas del periodo.

### Configuración (por turno)

```typescript
emailReportConfig: {
  enabled: boolean,
  includeChecklist: boolean,
  includeEntries: boolean,
  recipients: string[],
  subjectTemplate: string // Variables: [fecha], [turno], [hora]
}
```

### Variables del asunto

| Variable   | Descripción | Ejemplo |
|------------|-------------|---------|
| `[fecha]`  | Fecha del turno | 03/02/2026 |
| `[turno]`  | Nombre del turno | Turno Mañana |
| `[hora]`   | Hora fin del turno | 18:00 |

### Envío automático (scheduler)
- Se ejecuta **cada minuto**.
- Condiciones:
  - `type: regular`
  - `active: true`
  - `emailReportConfig.enabled: true`
  - `hora actual == endTime` del turno

### Envío manual (admin)

```http
POST /api/work-shifts/:id/send-report
Authorization: Bearer {admin-token}
Content-Type: application/json

{ "date": "2026-02-03T12:00:00Z" }
```

### Criterio de datos incluidos
- Checklist de entrada/salida: último `inicio` y `cierre` dentro del rango del turno.
- Entradas: entre el `inicio` y el `cierre` (si no existen, usa el rango horario del turno).

---

## 🔄 Diferencias con Sistema de Escalación

| Concepto | Turnos de Trabajo | Escalación (N2/TI/N1_NO_HABIL) |
|----------|-------------------|--------------------------------|
| **Propósito** | Organizar trabajo diario | Contactos de escalación |
| **Horarios** | Flexibles por turno | Semanas completas |
| **Asignación** | Opcional | Obligatoria por semana |
| **Checklists** | Diferentes por turno | Independiente |
| **Tipo** | Regular/Emergencia | Roles fijos |

**Ejemplo:**
- **Turno de Trabajo**: Juan trabaja turno mañana (9-17), María trabaja turno tarde (17-01)
- **Escalación N2**: Pedro está de guardia N2 toda la semana (24/7)

---

## 🛠️ Funcionalidades Futuras

- [ ] Integración con checklist (seleccionar checklist según turno actual)
- [ ] Integración con envío de correos (usar turno actual para filtrar destinatarios)
- [ ] Dashboard de turnos (visualización calendario)
- [ ] Estadísticas por turno
- [ ] Intercambio de turnos entre usuarios
- [ ] Notificaciones automáticas de cambio de turno

---

## 🔧 Mantenimiento

### Agregar nuevo tipo de turno

1. Editar `backend/src/models/WorkShift.js` → `type` enum
2. Editar `frontend/src/app/models/work-shift.model.ts` → `ShiftType`
3. Actualizar `SHIFT_TYPE_OPTIONS` en frontend

### Cambiar validaciones de horario

Editar función `isTimeInRange()` en `backend/src/routes/work-shifts.js`

---

## 📝 Notas Técnicas

- **Cruces de medianoche**: El sistema detecta si `startTime > endTime` y ajusta lógica
- **Zona horaria**: Configurable por turno (por defecto: `America/Santiago`)
- **Orden**: Campo `order` para ordenar visualización (drag & drop en UI)
- **Color**: Hex color para identificar turnos en UI (`#1976d2`, `#f44336`, etc.)
- **Código único**: El campo `code` debe ser único (validación en backend)

---

## ✅ Testing

### Probar API

```bash
# Listar turnos
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/work-shifts

# Turno actual
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/work-shifts/current

# Crear turno
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Turno Noche","code":"NIGHT","type":"regular","startTime":"22:00","endTime":"06:00","timezone":"America/Santiago"}' \
  http://localhost:3000/api/work-shifts
```

---

## 📚 Referencias

- [Modelo WorkShift](../backend/src/models/WorkShift.js)
- [Rutas API](../backend/src/routes/work-shifts.js)
- [Servicio Frontend](../frontend/src/app/services/work-shift.service.ts)
- [Componente Admin](../frontend/src/app/pages/work-shifts/work-shifts-admin/)
- [Script Seed](../backend/src/scripts/seed-work-shifts.js)
