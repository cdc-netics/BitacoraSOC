# 🧭 Arquitectura y Flujos - Bitacora SOC

Documentacion visual del funcionamiento general del sistema.

---

## 🗺️ Mapa Conceptual (alto nivel)

```mermaid
flowchart LR
  U[Usuarios SOC] -->|UI Web| FE[Angular 20 SPA]
  FE -->|REST| BE[Express API]
  BE --> DB[(MongoDB)]
  BE --> SMTP[Servidor SMTP]
  BE --> SIEM[SIEM/SOAR Syslog/TLS]
  BE --> FS[Uploads y Backups]

  subgraph Schedulers
    CRON[Shift Scheduler] --> BE
    ALERT[Checklist Alert Scheduler] --> BE
  end
```

---

## 🔐 Flujo de Autenticacion y Auditoria

```mermaid
sequenceDiagram
  participant User as Usuario
  participant FE as Frontend
  participant API as Backend
  participant DB as MongoDB
  participant AUD as AuditLog

  User->>FE: Login
  FE->>API: POST /api/auth/login
  API->>DB: Verifica usuario
  API->>AUD: Registra auth.login.*
  API-->>FE: JWT
  FE->>API: Request con Bearer token
  API->>AUD: Registra evento (entry.create, shiftcheck.submit, etc.)
  API-->>FE: Respuesta
```

---

## 📧 Flujo de Reporte de Turno

```mermaid
flowchart TD
  A[Fin de turno] --> B{Scheduler o Cierre manual}
  B --> C[Recolecta check inicio/cierre]
  C --> D[Recolecta entradas del periodo]
  D --> E[Genera HTML + texto]
  E --> F[Envia correo SMTP]
```
