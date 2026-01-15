# 📋 Bitácora SOC v1.1.0

Sistema completo de registro y gestión de actividades para Security Operations Center (SOC).

**Stack:** Angular 17 + Express + MongoDB  
**Despliegue:** Docker Compose (Frontend + Backend + MongoDB)  
**Producción:** ✅ Listo para deploy con Docker

---

## 🚀 Quick Start

```bash
# Con Docker (Recomendado para producción)
cp .env.docker.example .env  # Configurar variables
docker-compose up -d          # Levantar servicios
docker-compose exec backend npm run seed  # Crear admin

# Sin Docker (Desarrollo)
cd backend && npm install && npm start
cd frontend && npm install && npm start
```

**Acceso:** http://localhost (Docker) o http://localhost:4200 (desarrollo)

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

## � Despliegue con Docker (Producción)

### Requisitos
- Docker 20.10+
- Docker Compose 2.0+

### Instalación

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd BitacoraSOC

# 2. Configurar variables de entorno
cp .env.docker.example .env

# 3. Editar .env y cambiar:
#    - MONGO_ROOT_PASSWORD (contraseña MongoDB)
#    - JWT_SECRET (32+ caracteres aleatorios)
#    - ENCRYPTION_KEY (exactamente 32 caracteres)
#    - FRONTEND_PORT (puerto público, default: 80)

# 4. Generar secrets seguros (Linux/Mac)
openssl rand -base64 32  # Para JWT_SECRET
openssl rand -hex 16     # Para ENCRYPTION_KEY

# 5. Construir y levantar servicios
docker-compose up -d

# 6. Ver logs
docker-compose logs -f

# 7. Crear usuario administrador inicial
docker-compose exec backend npm run seed
```

### Servicios incluidos
- **Frontend:** Nginx sirviendo Angular (puerto configurable)
- **Backend:** Node.js + Express (puerto interno 3000)
- **MongoDB:** Base de datos con persistencia

### Volúmenes persistentes
- `mongodb_data`: Datos de la base de datos
- `backend_uploads`: Logos y archivos subidos
- `backend_logs`: Logs del sistema

### Comandos útiles

```bash
# Ver estado
docker-compose ps

# Detener servicios
docker-compose stop

# Reiniciar servicios
docker-compose restart

# Ver logs de un servicio específico
docker-compose logs -f backend

# Backup de MongoDB
docker-compose exec mongodb mongodump --uri="mongodb://admin:PASSWORD@localhost:27017/bitacora_soc?authSource=admin" --out=/data/backup

# Actualizar servicios
docker-compose pull
docker-compose up -d --build

# Limpiar todo (¡cuidado! elimina volúmenes)
docker-compose down -v
```

---

## �📚 Documentación Técnica

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
- **Docker Ready:** Configuración completa para despliegue en contenedores

### 🐛 Correcciones
- Fix: Validación de IDs en servicios de checklist (generación automática de ObjectId)
- Fix: Normalización de items y children en plantillas al cargar checklist activo
- Mejora: Badges de estado con colores consistentes (admin: pink, user: blue, guest: orange)

### 🐳 Docker
- Multi-stage builds para imágenes optimizadas
- Health checks en todos los servicios
- Persistencia con volúmenes (MongoDB, uploads, logs)
- Nginx optimizado con gzip y cache control
- Variables de entorno seguras con .env

---

## 🐛 Issues y Roadmap

El estado actual de bugs conocidos y tareas pendientes se mantiene en **[ISSUES.md](ISSUES.md)**.

## 📄 Licencia

Este proyecto se distribuye bajo la **Business Source License 1.1 (BSL 1.1)**.
Ver archivo **[LICENSE.md](LICENSE.md)** para más detalles sobre permisos de uso comercial y no comercial.
