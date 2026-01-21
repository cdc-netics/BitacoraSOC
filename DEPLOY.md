# Bitacora SOC - Docker Deploy Guide

> Nota: Los comandos usan `docker compose`. Si tu instalacion usa `docker-compose`, reemplaza el comando.

## Requisitos
- Docker Desktop / Docker Engine
- Git

## Quick Start (primer despliegue)
```bash
# 1. Clonar y entrar
cd /ruta/del/proyecto

# 2. Variables de entorno
cp .env.docker.example .env
nano .env  # Cambia TODAS las credenciales y secrets

# 3. Generar secrets (ejemplos)
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "ENCRYPTION_KEY=$(openssl rand -hex 16)"

# 4. Levantar servicios
docker compose up -d --build

# 5. Crear admin inicial (IMPORTANTE)
docker compose exec backend node src/scripts/seed.js

# 6. Abrir UI
# http://IP-SERVIDOR:PUERTO
```

## Version automatica (recomendado)
Para evitar editar numeros a mano, usa los scripts que calculan la version desde Git:

```bash
# PowerShell (Windows)
.\scripts\compose-up.ps1

# Bash (Linux/Mac)
sh ./scripts/compose-up.sh
```

Esto inyecta `APP_VERSION` al build (ej: `v1.2.3-5-gabc1234`) y lo muestra en login y /health.

## Actualizar la aplicacion
### Actualizacion normal (recomendada)
```bash
cd /ruta/del/proyecto
git pull origin main

# Reconstruye solo lo necesario y reinicia servicios
docker compose up -d --build
```

### Rebuild forzado (sin cache y recreando contenedores)
```bash
cd /ruta/del/proyecto
git pull origin main

docker compose build --no-cache
docker compose up -d --force-recreate
```
Alternativa automatica:
```bash
# PowerShell
.\scripts\compose-rebuild.ps1

# Bash
sh ./scripts/compose-rebuild.sh
```

### Solo cambios de .env (sin rebuild)
```bash
cd /ruta/del/proyecto
docker compose up -d
```

## Variables clave (.env)
```bash
# Puerto publico del frontend
FRONTEND_PORT=80

# MongoDB
MONGO_ROOT_PASSWORD=tu_password_seguro
MONGO_DATABASE=bitacora_soc

# Backend - generar valores nuevos
JWT_SECRET=...
ENCRYPTION_KEY=...

# Version (opcional si usas scripts)
APP_VERSION=dev

# Admin inicial
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin123!
ADMIN_EMAIL=admin@bitacora.local
```

## Health checks (importante)
- Backend y frontend tienen health checks en sus Dockerfile.
- En algunos entornos, `localhost` resuelve a IPv6 (`::1`) y el health check marca `unhealthy`.
- Solucion: usar `127.0.0.1` en los health checks y reconstruir imagenes.

## Comandos utiles
```bash
# Estado
docker compose ps

# Logs
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# Reiniciar
docker compose restart

docker compose restart backend
```

## Backups
### MongoDB
```bash
docker compose exec mongodb mongodump \
  --uri="mongodb://admin:PASSWORD@localhost/bitacora_soc?authSource=admin" \
  --out=/data/backup/$(date +%Y%m%d)

docker cp bitacora-mongodb:/data/backup ./backups/
```

### Archivos (logos, logs)
```bash
# Ver volumenes
docker volume ls

# Backup uploads
docker run --rm -v bitacorasoc_backend_uploads:/source \
  -v $(pwd)/backups:/backup alpine \
  tar czf /backup/uploads-$(date +%Y%m%d).tar.gz -C /source .
```

## Troubleshooting
### Backend/Frontend unhealthy
```bash
# Verificar respuesta directa
docker compose exec backend wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health
```
Si responde OK pero sigue unhealthy, revisa el health check (localhost vs 127.0.0.1).

### Error 401 en login
```bash
# Eliminar admin y recrear

docker compose exec backend node -e "const mongoose=require('mongoose'); const User=require('./src/models/User'); mongoose.connect(process.env.MONGODB_URI).then(async()=>{ await User.deleteOne({username:'admin'}); console.log('Usuario admin eliminado'); process.exit(0); })"

docker compose exec backend node src/scripts/seed.js
```

### Frontend no carga
```bash
docker compose logs -f frontend

docker compose exec frontend ls -la /usr/share/nginx/html

docker compose exec frontend nginx -t
```

### Puerto ocupado
```bash
# Cambiar en .env
FRONTEND_PORT=8080

docker compose up -d
```

## Produccion (checklist)
- .env configurado y secretos seguros
- Servicios healthy
- Admin inicial creado y password cambiado
- Backups configurados
- Firewall/HTTPS configurado si aplica

## Soporte rapido
- Logs: `docker compose logs -f`
- Estado: `docker compose ps`
