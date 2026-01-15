# Issues Detectados - Bitacora SOC

Fecha revision: 2026-01-15
Fuente: revision de codigo y docs.

## Estado general (real)
- Implementado: SMTP estilo Passbolt (UI + API con test y guardado condicionado).
- Implementado: Tags extraidos desde hashtags y gestion con conteo.
- Implementado: Orden descendente de entradas.
- Implementado: Checklist con plantillas y acordeon.
- Pendiente: Validacion de telefonos (frontend + backend).
- Pendiente: CRUD admin de escalaciones en UI (reglas/ciclos/asignaciones).
- Pendiente: Telefono de emergencia en vista simple (API no entrega).
- Pendiente: CRUD admin de catalogos en backend (UI llama /api/admin/catalog/*).

## Detalle por issue

### 1. SMTP estilo Passbolt
Estado: Implementado (retest en ambiente).
Notas:
- UI en /main/settings y endpoints /api/smtp, /api/smtp/test.

### 2. Checklist
2.1 Menu "Escribir" vs "Checklist"
Estado: Pendiente.
Notas:
- "Escribir" apunta a /main/checklist. Se necesita decidir si "Escribir" debe ser entradas.

2.2 Configuracion de servicios
Estado: Implementado.
Notas:
- Admin de plantillas en /main/checklist-admin.

2.3 Acordeon
Estado: Implementado.

### 3. Gestion de tags
Estado: Implementado (retest sugerido).
Notas:
- Tags se extraen en backend y la pagina de tags usa agregacion.

### 4. Ver todas las entradas - orden
Estado: Implementado (sort por entryDate/entryTime/createdAt desc).

### 5. Menu desorganizado
Estado: Parcial.
Notas:
- Items admin (usuarios/tags/logo/backup/SMTP) estan en Configuracion.
- "Checklist (Admin)" sigue en menu principal.

### 6. Perfil de usuario
Estado: Implementado (cambio de tema, perfil, password).
Notas:
- Falta prueba funcional en ambiente.

### 7. Validacion de telefonos (escalaciones)
Estado: Pendiente.
Notas:
- No hay validacion en formularios ni en modelos.

### 8. CRUD admin escalaciones
Estado: Pendiente.
Notas:
- UI tiene placeholders para reglas/ciclos/asignaciones; solo delete y override completo.

### 9. Telefono de emergencia no visible (vista simple)
Estado: Pendiente.
Notas:
- La vista espera service.emergencyPhone pero el endpoint getServices no lo entrega.

### 10. CRUD admin catalogos
Estado: Pendiente.
Notas:
- Frontend llama /api/admin/catalog/* pero backend no tiene rutas admin.

## Proximos pasos cortos
1. Definir si "Escribir" es entradas o checklist y ajustar menu/rutas.
2. Agregar validacion de telefono en frontend y backend.
3. Implementar /api/admin/catalog/* o remover la UI admin de catalogos.
4. Exponer telefono de emergencia en getServices o resolver via reglas.
5. Completar dialogs CRUD en escalaciones admin.