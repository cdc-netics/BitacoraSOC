# Deployment: LogSource "Netics" por defecto

## Cambios implementados

### Backend:
1. **Rutas**: `backend/src/routes/entries.js`
   - POST: Auto-asigna "Netics" cuando clientId es null
   - PUT: Permite editar clientId y auto-asigna "Netics" si se establece null

2. **Seed**: `backend/src/scripts/seed-catalogs.js`
   - Agregado "Netics" como primer LogSource en sampleLogSources

3. **Script de migración**: `backend/scripts/add-netics.js`
   - Script para crear "Netics" en MongoDB y actualizar entradas existentes

### Frontend:
1. **Tabla**: `frontend/src/app/pages/main/my-entries/my-entries.component.html`
   - Agregada columna "Cliente / Log Source"

2. **Componente**: `frontend/src/app/pages/main/my-entries/my-entries.component.ts`
   - Actualizado displayedColumns con 'clientName'

3. **Dialog**: `frontend/src/app/pages/main/my-entries/entry-edit-dialog.component.ts`
   - Agregado selector de LogSource en formulario de edición
   - Implementado OnInit para cargar LogSources
   - Agregado clientId al updateData

---

## Pasos de deployment en producción

### 1. Push de cambios a GitHub

```bash
cd /path/to/BitacoraSOC
git add .
git commit -m "feat: LogSource por defecto 'Netics' + columna en tabla + edición"
git push origin main
```

### 2. En el servidor de producción

**A. Detener servicios:**
```bash
cd /path/to/BitacoraSOC
docker-compose down
```

**B. Actualizar código:**
```bash
git pull origin main
```

**C. Rebuild containers (si es necesario):**
```bash
docker-compose build
docker-compose up -d
```

**D. Ejecutar script de migración:**

**Opción 1 (RECOMENDADO): Script automatizado**

Linux/Mac:
```bash
chmod +x scripts/migrate-netics-logsource.sh
./scripts/migrate-netics-logsource.sh
```

Windows (PowerShell):
```powershell
.\scripts\migrate-netics-logsource.ps1
```

**Opción 2: Ejecutar desde el contenedor backend**
```bash
docker exec bitacora-backend node scripts/add-netics.js
```

**Opción 3: Ejecutar directamente en MongoDB**
```bash
docker exec bitacora-mongodb mongosh \
  --username admin \
  --password YOUR_MONGO_PASSWORD \
  --authenticationDatabase admin \
  --eval '
    db = db.getSiblingDB("bitacora_soc");
    
    // 1. Crear o verificar LogSource "Netics"
    const existing = db.catalog_log_sources.findOne({ name: "Netics" });
    if (existing) {
      print("✅ Netics ya existe");
      if (!existing.enabled) {
        db.catalog_log_sources.updateOne(
          { _id: existing._id },
          { $set: { enabled: true } }
        );
        print("   Habilitado");
      }
    } else {
      const result = db.catalog_log_sources.insertOne({
        name: "Netics",
        parent: "Sistema Interno",
        description: "Log source por defecto del sistema",
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      print(`✅ Netics creado con ID: ${result.insertedId}`);
    }
    
    // 2. Actualizar entradas existentes sin clientId
    const netics = db.catalog_log_sources.findOne({ name: "Netics" });
    if (netics) {
      const updateResult = db.entries.updateMany(
        { clientId: null },
        { $set: { clientId: netics._id, clientName: "Netics" } }
      );
      print(`✅ ${updateResult.modifiedCount} entradas actualizadas con Netics`);
    }
  '
```

**E. Verificar deployment:**
```bash
# Ver logs
docker-compose logs -f backend

# Verificar que los servicios estén corriendo
docker-compose ps

# Verificar MongoDB
docker exec bitacora-mongodb mongosh \
  --username admin \
  --password YOUR_MONGO_PASSWORD \
  --authenticationDatabase admin \
  --eval 'db.getSiblingDB("bitacora_soc").catalog_log_sources.findOne({ name: "Netics" })'
```

---

## Validación post-deployment

1. **Frontend**: Abrir "Mis Entradas" y verificar que se muestra columna "Cliente / Log Source"
2. **Crear entrada**: Crear entrada sin seleccionar LogSource → debe aparecer "Netics"
3. **Editar entrada**: Abrir edición y verificar que se muestra selector de LogSource
4. **Tabla**: Verificar que todas las entradas muestran "Netics" o su cliente asignado

---

## Rollback (si es necesario)

Si hay problemas, revertir:

```bash
git revert HEAD
git push origin main
cd /path/to/server
git pull origin main
docker-compose down
docker-compose up -d
```

---

## Variables de entorno requeridas

Asegurarse de que `.env` en producción tenga:

```env
MONGODB_URI=mongodb://admin:PASSWORD@mongodb:27017/bitacora_soc?authSource=admin
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=YOUR_PASSWORD_HERE
```

---

## Notas importantes

- ⚠️ El script de migración es **idempotente** (se puede ejecutar múltiples veces sin problemas)
- ✅ Las entradas existentes se actualizarán automáticamente con "Netics"
- ✅ Las nuevas entradas sin LogSource se asignarán automáticamente a "Netics"
- ✅ Los usuarios pueden cambiar el LogSource editando la entrada
