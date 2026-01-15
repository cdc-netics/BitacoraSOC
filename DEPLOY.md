# 🚀 Guía de Despliegue Docker - Bitácora SOC v1.1.0

## ⚡ Quick Start (5 minutos)

```bash
# 1. Configurar variables de entorno
cp .env.docker.example .env
nano .env  # Cambiar TODAS las contraseñas y secrets

# 2. Generar secrets seguros
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "ENCRYPTION_KEY=$(openssl rand -hex 16)"

# 3. Levantar todos los servicios
docker-compose up -d

# 4. Crear usuario administrador inicial (IMPORTANTE)
docker exec bitacora-backend node src/scripts/seed.js
# Usuario: admin
# Contraseña: la que configuraste en ADMIN_PASSWORD del .env

# 5. Acceder: http://localhost:4200 (o http://IP-SERVIDOR:4200)
```

---

## 📋 Servicios Incluidos

- **Frontend**: Angular + Nginx (puerto configurable, default: 4200)
- **Backend**: Node.js + Express (puerto interno: 3000)
- **MongoDB**: Base de datos con persistencia

**Health Checks configurados**:
- MongoDB: Ping cada 10s
- Backend: HTTP GET a `/health` cada 5s (30s de gracia inicial)
- Frontend: Depende de backend healthy

---

## ⚠️ Notas Importantes de Despliegue

### Health Check del Backend
El backend tiene configurado un health check que verifica `http://127.0.0.1:3000/health`:
- **start_period**: 30s - Da tiempo a MongoDB para conectar
- **interval**: 5s - Verifica cada 5 segundos
- **retries**: 5 - 5 intentos antes de marcar unhealthy

**IMPORTANTE**: Usar `127.0.0.1` en lugar de `localhost` para evitar problemas con resolución IPv6.

### Orden de inicio
1. **MongoDB** inicia primero y debe estar `(healthy)`
2. **Backend** espera a MongoDB healthy, luego inicia (30-40s para healthy)
3. **Frontend** espera a Backend healthy, luego inicia

Si ves "dependency failed to start", es porque el backend aún no pasó su health check. Espera 40-50 segundos.

### Usuario Administrador
El usuario admin **NO se crea automáticamente**. Debes ejecutar:
```bash
docker exec bitacora-backend node src/scripts/seed.js
```

Las credenciales se toman del `.env`:
- Usuario: `ADMIN_USERNAME`
- Contraseña: `ADMIN_PASSWORD`
- Email: `ADMIN_EMAIL`

---

## 🔧 Configuración Obligatoria (.env)

```bash
# Puerto público
FRONTEND_PORT=80

# MongoDB
MONGO_ROOT_PASSWORD=cambiar_por_password_fuerte_123

# Backend - GENERAR NUEVOS VALORES
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 16)

# SMTP (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

---

## 🐳 Comandos Docker Útiles

### Estado y logs
```bash
# Ver servicios activos
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Últimas 100 líneas
docker-compose logs --tail=100 backend
```

### Control de servicios
```bash
# Detener
docker-compose stop

# Reiniciar
docker-compose restart
docker-compose restart backend

# Reiniciar desde cero

# NOTA: Después de docker-compose down, el backend puede tardar 30-40 segundos
# en pasar el health check. El frontend no iniciará hasta que backend esté healthy.
# Monitorear con: docker ps | grep backend
# Debe mostrar "(healthy)" antes de que el frontend inicie.
docker-compose down
docker-compose up -d
```

### Backups

#### MongoDB
```bash
# Backup manual
docker-compose exec mongodb mongodump \
  --uri="mongodb://admin:PASSWORD@localhost/bitacora_soc?authSource=admin" \
  --out=/data/backup/$(date +%Y%m%d)

# Copiar al host
docker cp bitacora-mongodb:/data/backup ./backups/
```

#### Archivos (logos, logs)
```bash
# Ver volúmenes
docker volume ls

# Backup de uploads
docker run --rm -v bitacorasoc_backend_uploads:/source \
  -v $(pwd)/backups:/backup alpine \
  tar czf /backup/uploads-$(date +%Y%m%d).tar.gz -C /source .
```

### Actualizar aplicación
```bash
# 1. Detener
docker-compose down

# 2. Actualizar código
git pull

# 3. Reconstruir (sin caché)
docker-compose build --no-cache

# 4. Levantar nueva versión
docker-compose up -d

# 5. Verificar
docker-compose logs -f
```

### Monitoreo
```bash
# Recursos en tiempo real
docker stats

# Espacio en disco
docker system df

# Limpieza (libera espacio)
docker system prune -a
```

---

## 🛡️ Seguridad Post-Despliegue

### 1. Cambiar contraseña del administrador
```bash
# Después del primer login, ir a "Mi Perfil" y cambiar contraseña
```

### 2. Verificar variables críticas
```bash
# Revisar que no estén valores por defecto
docker-compose config | grep -E "JWT_SECRET|MONGO_ROOT_PASSWORD|ENCRYPTION_KEY"
```

### 3. Firewall (opcional pero recomendado)
```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

### 4. HTTPS con Let's Encrypt
```bash
# Instalar Certbot
sudo apt install certbot

# Obtener certificado
sudo certbot certonly --standalone -d tu-dominio.com

# Modificar nginx.conf para usar HTTPS
# Certificados en: /etc/letsencrypt/live/tu-dominio.com/
```

---

## 🐛 Troubleshooting

### Backend unhealthy (contenedor no pasa health check)
```bash
# El problema común es que Docker health check usa localhost en lugar de 127.0.0.1
# Verificar manualmente si el backend responde:
docker exec bitacora-backend wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health

# Si responde "remote file exists", el backend está OK
# El health check en docker-compose.yml debe usar 127.0.0.1:
# test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1:3000/health"]

# Ajustar tiempos de health check si tarda mucho:
# interval: 5s (verifica cada 5 segundos)
# start_period: 30s (da 30 segundos antes del primer check)
# retries: 5 (intenta 5 veces antes de marcar unhealthy)
```

### Error 401 Unauthorized en login
```bash
# El usuario admin aún no existe o tiene contraseña incorrecta
# Recrear usuario admin con credenciales del .env:

# 1. Eliminar usuario existente
docker exec bitacora-backend node -e "const mongoose = require('mongoose'); const User = require('./src/models/User'); mongoose.connect(process.env.MONGODB_URI).then(async () => { await User.deleteOne({username: 'admin'}); console.log('Usuario admin eliminado'); process.exit(0); })"

# 2. Crear nuevo usuario con .env
docker exec bitacora-backend node src/scripts/seed.js

# Ahora puedes hacer login con:
# Usuario: admin
# Contraseña: (la que está en ADMIN_PASSWORD del .env)
```

### Servicios no inician
```bash
# Ver logs detallados
docker-compose logs backend
docker-compose logs mongodb

# Verificar salud de contenedores
docker-compose ps
```

### Error de conexión a MongoDB
```bash
# Verificar que MongoDB esté healthy
docker-compose ps | grep mongodb

# Ver logs de MongoDB
docker-compose logs mongodb

# Reiniciar MongoDB
docker-compose restart mongodb
```

### Frontend no carga
```bash
# Verificar build de Angular
docker-compose logs frontend

# Ver archivos servidos por Nginx
docker-compose exec frontend ls -la /usr/share/nginx/html

# Test de configuración Nginx
docker-compose exec frontend nginx -t
```

### Puerto 80 ocupado
```bash
# Ver qué proceso usa el puerto
sudo netstat -tulpn | grep :80

# Cambiar puerto en .env
FRONTEND_PORT=8080

# Reiniciar
docker-compose down
docker-compose up -d
```

### Limpiar completamente (¡CUIDADO! Borra datos)
```bash
# Detener y eliminar contenedores, redes y volúmenes
docker-compose down -v

# Limpiar imágenes
docker system prune -a
```

---

## 📊 Volúmenes Persistentes

Los siguientes datos persisten entre reinicios:

- **mongodb_data**: Todos los datos de la aplicación
- **backend_uploads**: Logos y archivos subidos  
- **backend_logs**: Logs del sistema

```bash
# Ver volúmenes
docker volume ls

# Inspeccionar un volumen
docker volume inspect bitacorasoc_mongodb_data
```

---

## ✅ Checklist de Producción

- [ ] **.env configurado** con valores seguros
- [ ] **JWT_SECRET y ENCRYPTION_KEY** generados aleatoriamente
- [ ] **MONGO_ROOT_PASSWORD** cambiado
- [ ] **Servicios levantados**: `docker-compose ps` muestra todos "healthy"
- [ ] **Admin inicial creado**: `docker-compose exec backend npm run seed`
- [ ] **Password admin cambiado** desde la interfaz
- [ ] **Backups configurados** (cron job)
- [ ] **Firewall configurado** (solo puertos necesarios)
- [ ] **HTTPS configurado** (si aplica)
- [ ] **Monitoreo activo**: logs y recursos

---

## 📞 Soporte

**Logs**: `docker-compose logs -f`  
**Estado**: `docker-compose ps`  
**Docs completas**: [README.md](README.md#-despliegue-con-docker-producción)

