# 📞 Módulo de Escalaciones - Bitácora SOC

Sistema centralizado para gestionar información de escalación: contactos externos por cliente/servicio y turnos internos con rotaciones semanales configurables.

---

## 🎯 Funcionalidades

### Para Analistas (Vista de Consulta)
- **Búsqueda rápida**: Seleccionar Cliente → Servicio
- **Contactos externos**: 
  - Correos Para/CC
  - Teléfono de emergencia
- **Turnos internos actuales**:
  - N2 (Nivel 2)
  - TI (Soporte TI)
  - N1 No Hábil
  - Muestra quién está de turno AHORA
  - Incluye overrides temporales (vacaciones, licencias, etc.)

### Para Administradores (Gestión Completa)
- **CRUD de Clientes**: Organizaciones (JUNJI, DPP, etc.)
- **CRUD de Servicios**: Servicios por cliente (JUNJI - Mundo, etc.)
- **CRUD de Contactos**: Base de datos de personas con email/teléfono
- **Reglas de Escalación**: Configurar Para/CC/Emergencia por servicio
- **Asignaciones de Turno**: Planificar turnos semanales por rol
- **Overrides Manuales**: Reemplazos temporales con vigencia y motivo
- **Ciclos de Rotación**: Definir hora/día de inicio de semanas (NO fijos a 00:00)

---

## 🚀 Instalación y Configuración

### 1. Inicializar Roles de Turno

```powershell
cd backend
node src/scripts/seed-shift-roles.js
```

Esto crea los 3 roles predefinidos: N2, TI, N1_NO_HABIL.

### 2. Acceder al Módulo

**Frontend:**
- Vista Analista: `http://localhost:4200/main/escalation/view`
- Vista Admin: `http://localhost:4200/main/escalation/admin`

**Backend API:**
- Base: `/api/escalation`
- Swagger: `http://localhost:3000/api-docs` (buscar "escalation")

---

## 📚 Guía de Uso

### Flujo Inicial (Administrador)

1. **Crear Clientes** (Tab "Clientes")
   ```json
   POST /api/escalation/admin/clients
   {
     "name": "JUNJI",
     "code": "JUNJI",
     "description": "Junta Nacional de Jardines Infantiles",
     "active": true
   }
   ```

2. **Crear Servicios** (Tab "Servicios")
   ```json
   POST /api/escalation/admin/services
   {
     "clientId": "64a1b2c3d4e5f6a7b8c9d0e1",
     "name": "JUNJI - Mundo",
     "code": "JUNJI_MUNDO",
     "active": true
   }
   ```

3. **Crear Contactos** (Tab "Contactos")
   ```json
   POST /api/escalation/admin/contacts
   {
     "name": "Milton Aranda",
     "email": "milton.aranda@mundotelecomunicaciones.cl",
     "organization": "Mundo Telecomunicaciones",
     "role": "Jefe Operaciones",
     "active": true
   }
   ```

4. **Configurar Regla de Escalación** (Tab "Reglas de Escalación")
   ```json
   POST /api/escalation/admin/rules
   {
     "serviceId": "64a1b2c3d4e5f6a7b8c9d0e2",
     "recipientsTo": ["64a1b2c3d4e5f6a7b8c9d0e3"],
     "recipientsCC": ["64a1b2c3d4e5f6a7b8c9d0e4"],
     "emergencyPhone": "+56923609140",
     "active": true
   }
   ```

5. **Configurar Ciclo de Rotación** (Tab "Ciclos de Rotación")
   ```json
   POST /api/escalation/admin/cycles
   {
     "roleCode": "N2",
     "startDayOfWeek": 5,
     "startTimeUTC": "11:00",
     "durationDays": 7,
     "timezone": "America/Santiago",
     "active": true
   }
   ```
   Esto significa: Turnos N2 comienzan Viernes a las 08:00 Chile (11:00 UTC).

6. **Asignar Persona a Turno** (Tab "Turnos")
   ```json
   POST /api/escalation/admin/assignments
   {
     "roleCode": "N2",
     "userId": "64a1b2c3d4e5f6a7b8c9d0e5",
     "weekStartDate": "2026-01-03T11:00:00Z",
     "weekEndDate": "2026-01-10T11:00:00Z",
     "notes": "Semana 1 de enero"
   }
   ```

7. **Crear Override Temporal** (Tab "Turnos" → Overrides)
   ```json
   POST /api/escalation/admin/overrides
   {
     "roleCode": "N2",
     "replacementUserId": "64a1b2c3d4e5f6a7b8c9d0e6",
     "startDate": "2026-01-05T00:00:00Z",
     "endDate": "2026-01-12T23:59:59Z",
     "reason": "Vacaciones del titular",
     "active": true
   }
   ```

### Consulta (Analista)

1. Abrir `http://localhost:4200/main/escalation/view`
2. Seleccionar Cliente (ej: "JUNJI")
3. Seleccionar Servicio (ej: "JUNJI - Mundo")
4. Ver información:
   - **Contactos Externos**: Para/CC/Emergencia
   - **Turnos Internos**: Quién está de turno AHORA con badges de override

---

## 🔒 Seguridad

- **Vista de consulta**: Requiere autenticación (cualquier usuario)
- **Vista admin**: Requiere rol `admin`
- **Backend**: Middleware `requireAdmin` valida permisos en todas las rutas `/admin/*`

---

## 🕐 Manejo de Fechas

- **Backend**: Guarda todas las fechas en ISO 8601 UTC
- **Frontend**: Convierte y muestra en zona horaria `America/Santiago` (-03:00)
- **Resolución de turnos**: El backend calcula "quién está de turno" usando:
  1. Overrides activos (prioridad máxima)
  2. Asignaciones regulares
  3. Si no hay nadie, devuelve `null`

---

## 📊 Ejemplos de Payloads

### GET Escalation View (Principal)

**Request:**
```
GET /api/escalation/view/64a1b2c3d4e5f6a7b8c9d0e2
```

**Response:**
```json
{
  "service": {
    "id": "64a1b2c3d4e5f6a7b8c9d0e2",
    "name": "JUNJI - Mundo",
    "code": "JUNJI_MUNDO",
    "clientName": "JUNJI"
  },
  "externalContacts": {
    "to": [
      { "id": "...", "name": "Milton Aranda", "email": "milton.aranda@mundo.cl" }
    ],
    "cc": [
      { "id": "...", "name": "Claudio Schleyer", "email": "claudio.schleyer@mundo.cl" }
    ],
    "emergency": {
      "phone": "+56923609140",
      "contactName": null
    }
  },
  "internalShifts": [
    {
      "role": "N2",
      "roleName": "Nivel 2",
      "currentUser": {
        "id": "...",
        "name": "Juan Pérez",
        "email": "juan.perez@synet.cl"
      },
      "shiftPeriod": {
        "start": "2026-01-03T11:00:00Z",
        "end": "2026-01-10T11:00:00Z"
      },
      "isOverride": false
    },
    {
      "role": "TI",
      "roleName": "Soporte TI",
      "currentUser": {
        "id": "...",
        "name": "María González (Reemplazo)",
        "email": "maria.gonzalez@synet.cl"
      },
      "shiftPeriod": {
        "start": "2026-01-05T00:00:00Z",
        "end": "2026-01-12T23:59:59Z"
      },
      "isOverride": true,
      "overrideReason": "Vacaciones del titular"
    }
  ],
  "timestamp": "2026-01-03T18:30:00Z"
}
```

---

## 🛠️ Troubleshooting

### No aparece información de turnos

1. Verificar que existan asignaciones:
   ```
   GET /api/escalation/admin/assignments?roleCode=N2
   ```
2. Verificar fechas:
   - Las fechas deben estar en UTC
   - `weekStartDate <= now <= weekEndDate`

### Override no se aplica

1. Verificar que `active: true`
2. Verificar fechas: `startDate <= now <= endDate`
3. Los overrides tienen prioridad sobre asignaciones regulares

### Error al crear cliente/servicio con código duplicado

- Los campos `code` son únicos
- Usar códigos diferentes o modificar el existente

---

## 📝 TODO (Mejoras Futuras)

- [ ] Dialogs CRUD en admin (actualmente solo delete funciona)
- [ ] Filtros avanzados en tablas (búsqueda, paginación)
- [ ] Exportar configuración a Excel/CSV
- [ ] Notificaciones cuando cambia el turno
- [ ] Integración con calendario (Google Calendar, Outlook)
- [ ] Historial de cambios (auditoría de overrides)

---

## 📄 Licencia

MIT - Parte del proyecto Bitácora SOC
