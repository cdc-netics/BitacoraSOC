# 💾 Backup y Recuperacion - Bitacora SOC

Procedimientos de respaldo, restauracion e importacion/exportacion.

---

## ✅ Respaldo JSON (backup completo)

### Crear backup

**Endpoint:** `POST /api/backup/create` (admin)

**Respuesta:**
```json
{
  "message": "Backup creado exitosamente",
  "filename": "backup-2026-02-08T18-22-10-123Z.json",
  "collections": 23,
  "documents": 4120
}
```

### Historial

**Endpoint:** `GET /api/backup/history` (admin)

**Respuesta:**
```json
{
  "backups": [
    {
      "_id": "backup-2026-02-08T18-22-10-123Z.json",
      "filename": "backup-2026-02-08T18-22-10-123Z.json",
      "createdAt": "2026-02-08T18:22:10.123Z",
      "size": 2489012
    }
  ]
}
```

### Restaurar backup

**Endpoint:** `POST /api/backup/restore` (admin)

**Body:**
```json
{
  "filename": "backup-2026-02-08T18-22-10-123Z.json",
  "clearBeforeRestore": true
}
```

**Notas:**
- `clearBeforeRestore=true` borra todas las colecciones antes de restaurar.
- El restore valida estructura del JSON antes de aplicar.

### Eliminar backup

**Endpoint:** `DELETE /api/backup/:id` (admin)

Ejemplo: `DELETE /api/backup/backup-2026-02-08T18-22-10-123Z.json`

---

## 📤 Exportacion CSV

**Endpoint:** `GET /api/backup/export/:type` (admin)

Tipos soportados:
- `entries`
- `checks`
- `all` (exporta multiples archivos)

Ejemplo:
```bash
curl -X GET http://localhost:3000/api/backup/export/entries \
  -H "Authorization: Bearer $TOKEN" \
  -o entradas.csv
```

---

## 📥 Importacion CSV/JSON

**Endpoint:** `POST /api/backup/import` (admin)

**Contenido:** `multipart/form-data`
- `file`: archivo `.json` o `.csv`
- `type`: `entries` | `checks` | `users` | `catalogs` (segun el formato)

---

## 🗂️ Ubicacion de archivos

Los backups JSON se guardan en:
```
backend/backups/
```

---

## 🔒 Seguridad

- Solo admin puede crear/restaurar/importar/eliminar.
- Auditoria de operaciones: `admin.backup.*`.
- Sanitizacion de rutas y validacion de nombres de archivo.
