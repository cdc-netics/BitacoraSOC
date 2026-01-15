# 📋 Bitácora SOC v1.1.0

Sistema completo de registro y gestión de actividades para Security Operations Center (SOC).

**Stack:** Angular 17 + Express + MongoDB  
**Puerto Backend:** 3000 | **Puerto Frontend:** 4200

---

## ✨ Funcionalidades Principales

### 👥 Gestión de Usuarios
- **3 Roles:** Admin, User, Guest
- **Admin:** CRUD completo de usuarios, edición de perfil, activar/desactivar cuentas
- **User:** Registro de entradas, checklists, ver reportes
- **Guest:** Solo lectura (entradas y escalaciones)

### 📝 Bitácora de Entradas
- Registro de incidentes, mantenimientos y eventos generales
- Autocompletado inteligente con catálogos personalizables
- Tags y búsqueda por fecha
- Filtros por tipo, fuente de logs y operación
- Vista completa para todos, "Mis Entradas" para admins

### ✅ Checklists de Turno
- Plantillas personalizables con estructura padre/hijo
- Check de inicio y cierre de turno
- Estados: Verde (OK), Rojo (Con problema - observación obligatoria)
- **Historial Completo:** Todos los usuarios ven todos los checklists del equipo
- Validación automática de servicios

### 📞 Escalaciones y Contactos
- Directorio de contactos por cliente/servicio
- Matriz de escalación por nivel y horario
- Búsqueda rápida de contactos
- Gestión de clientes y servicios

### 📊 Reportes
- Vista general con estadísticas
- Exportación CSV de entradas y checklists
- Gráficos de actividad
- Accesible para admin y user

### ⚙️ Administración (Admin)
- **Catálogos:** Eventos, fuentes de logs, tipos de operación
- **Plantillas de Checklist:** Editor visual con preview
- **Configuración SMTP:** Email para notificaciones
- **Backup/Restore:** Exportar e importar datos
- **Logo Personalizado:** Branding del sistema
- **Tags:** Etiquetas personalizadas

### 📌 Notas
- **Nota del Admin:** Visible para todos (solo admin edita)
- **Nota Personal:** Privada de cada usuario
- Autosave automático

---

## � Instalación Rápida

```powershell
# 1. Backend
cd backend
npm install
# Copiar .env.example a .env y configurar MONGODB_URI
npm run seed    # Crear usuario admin inicial
npm start       # Puerto 3000

# 2. Frontend
cd frontend
npm install
npm start       # Puerto 4200
```

> ⚠️ **Importante:** Cambiar la contraseña del administrador después del primer login.

---

## 📁 Estructura del Proyecto

```
BitacoraSOC/
├── backend/              # API REST Express
│   ├── src/
│   │   ├── models/      # Modelos MongoDB (User, Entry, ChecklistTemplate, etc.)
│   │   ├── routes/      # Endpoints API
│   │   ├── middleware/  # Auth, validación, rate limiting
│   │   ├── utils/       # Logger, audit, encryption
│   │   └── server.js    # Entry point
│   └── package.json     # v1.1.0
│
├── frontend/            # Angular 17 SPA
│   ├── src/app/
│   │   ├── pages/       # Componentes principales
│   │   ├── services/    # HTTP services
│   │   ├── models/      # Interfaces TypeScript
│   │   └── guards/      # Protección de rutas
│   └── package.json     # v1.1.0
│
└── docs/                # Documentación técnica detallada
```

---

## 📚 Documentación Técnica

Para detalles técnicos completos, consulta:

- **[SETUP.md](docs/SETUP.md)**: Instalación y configuración avanzada
- **[API.md](docs/API.md)**: Referencia completa de endpoints
- **[CATALOGS.md](docs/CATALOGS.md)**: Sistema de catálogos y autocompletado
- **[ESCALATION.md](docs/ESCALATION.md)**: Módulo de escalaciones
- **[SECURITY.md](docs/SECURITY.md)**: Seguridad y autenticación

---

## 🔄 Changelog v1.1.0 (15-01-2026)

### ✅ Nuevas Funcionalidades
- **Historial de Checklists:** Vista completa de todos los checklists del equipo (entrada/salida de turno)
- **Gestión de Usuarios:** Edición y activación/desactivación de cuentas
- **Reportes para Users:** Acceso a reportes de overview para usuarios normales

### 🐛 Correcciones
- Fix: Validación de IDs en servicios de checklist (generación automática de ObjectId)
- Fix: Normalización de items y children en plantillas al cargar checklist activo
- Mejora: Badges de estado con colores consistentes (admin: pink, user: blue, guest: orange)

---

## 🐛 Issues y Roadmap

El estado actual de bugs conocidos y tareas pendientes se mantiene en **[ISSUES.md](ISSUES.md)**.

## 📄 Licencia

Este proyecto se distribuye bajo la **Business Source License 1.1 (BSL 1.1)**.
Ver archivo **[LICENSE.md](LICENSE.md)** para más detalles sobre permisos de uso comercial y no comercial.
