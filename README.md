# 📋 Bitácora SOC

Sistema de registro y gestión de actividades para Security Operations Center (SOC).

**Stack:** Angular 17 + Express + MongoDB

---

## 📚 Documentación

Toda la documentación técnica y operativa se encuentra centralizada en la carpeta `docs/`:

- **[Instalación y Configuración](docs/SETUP.md)**: Guía paso a paso para desplegar el entorno de desarrollo.
- **[Seguridad](docs/SECURITY.md)**: Políticas de seguridad, manejo de secretos y autenticación.
- **[Catálogos](docs/CATALOGS.md)**: Documentación del sistema de autocompletado y gestión de eventos.
- **[Escalaciones](docs/ESCALATION.md)**: Manual del módulo de gestión de turnos y contactos.
- **[API](docs/API.md)**: Referencia de endpoints del backend.

## 🚀 Quick Start

Para poner en marcha el proyecto rápidamente, consulta la guía de **[SETUP](docs/SETUP.md)**.

Resumen de comandos:

```powershell
# 1. Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# 2. Configurar entorno
# Copiar .env.example a .env en backend/ y configurar variables

# 3. Inicializar datos
cd backend
npm run seed

# 4. Iniciar
# Backend: npm start (puerto 3000)
# Frontend: npm start (puerto 4200)
```

## 🐛 Issues y Roadmap

El estado actual de bugs conocidos y tareas pendientes se mantiene en **[ISSUES.md](ISSUES.md)**.

## 📄 Licencia

Este proyecto se distribuye bajo la **Business Source License 1.1 (BSL 1.1)**.
Ver archivo **[LICENSE.md](LICENSE.md)** para más detalles sobre permisos de uso comercial y no comercial.
