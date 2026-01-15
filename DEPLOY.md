# 🚀 Guía de Despliegue a Producción

## 📋 Configuración Automática

La aplicación está configurada para detectar automáticamente el host donde se ejecuta. **No necesitas cambiar URLs hardcodeadas**.

### ✅ Funciona automáticamente en:
- **Desarrollo local**: `http://localhost`
- **Red local**: `http://192.168.x.x`
- **IP pública**: `http://tu-ip-publica`
- **Dominio**: `http://tusitio.com`

---

## 🔧 Variables de Entorno

### Backend (.env)
```bash
# Base de datos
MONGO_URI=mongodb://localhost:27017/bitacora-soc

# JWT
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion

# Entorno
NODE_ENV=production

# CORS - Lista de orígenes permitidos (separados por coma)
ALLOWED_ORIGINS=http://tu-ip-publica:4200,http://tusitio.com

# Puerto
PORT=3000
```

### Frontend
**No requiere configuración**. Usa `window.location.hostname` automáticamente.

---

## 📦 Build de Producción

### Backend
```bash
cd backend
npm install --production
npm start
```

### Frontend
```bash
cd frontend
npm run build --prod
# Los archivos compilados estarán en dist/
```

---

## 🌐 Configuración de URL del Backend

La aplicación usa URLs dinámicas basadas en `window.location.hostname`:

**Archivo**: `frontend/src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  apiUrl: `http://${window.location.hostname}:3000/api`,
  backendBaseUrl: `http://${window.location.hostname}:3000`
};
```

### Si necesitas cambiar el puerto del backend:

1. **Backend**: Cambia `PORT` en el archivo `.env`
2. **Frontend**: Actualiza el puerto en `environment.prod.ts`:
   ```typescript
   apiUrl: `http://${window.location.hostname}:TU_PUERTO/api`
   ```

---

## 🔒 Seguridad en Producción

### 1. Cambiar JWT_SECRET
```bash
# Generar un secreto aleatorio
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Configurar CORS
Agregar los orígenes permitidos en `.env`:
```bash
ALLOWED_ORIGINS=http://192.168.1.100:4200,http://tusitio.com
```

### 3. HTTPS (Recomendado)
Si usas HTTPS, cambia `http://` por `https://` en los environments:
```typescript
apiUrl: `https://${window.location.hostname}:3000/api`
```

---

## 🐳 Docker (Opcional)

### Dockerfile Backend
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Dockerfile Frontend
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/bitacora-soc
      - NODE_ENV=production
    depends_on:
      - mongo
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  
  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

---

## 🎯 Checklist de Despliegue

- [ ] Cambiar `JWT_SECRET` en `.env`
- [ ] Configurar `ALLOWED_ORIGINS` con las IPs/dominios permitidos
- [ ] Configurar `MONGO_URI` con la base de datos de producción
- [ ] Verificar que `NODE_ENV=production`
- [ ] Build del frontend: `npm run build --prod`
- [ ] Configurar backups automáticos de MongoDB
- [ ] Configurar HTTPS con certificados SSL
- [ ] Probar el logo en el login y sidebar
- [ ] Probar escalaciones y reportes
- [ ] Configurar monitoreo de logs

---

## 🔍 Verificación Post-Despliegue

1. **Logo**: Debe aparecer en login, sidebar y favicon
2. **API**: Debe responder en `http://tu-servidor:3000/api`
3. **CORS**: Sin errores en la consola del navegador
4. **MongoDB**: Conexión exitosa
5. **Autenticación**: Login y logout funcionando

---

## 📞 Soporte

Si encuentras problemas, revisa:
- Logs del backend: `pm2 logs` o `docker logs backend`
- Consola del navegador (F12)
- Archivo `TROUBLESHOOTING.md`
