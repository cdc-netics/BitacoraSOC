# 🐛 Issues Detectados - Bitácora SOC

**Fecha:** 18 de Diciembre 2025  
**Versión:** 1.0.0

---

## 📧 1. SMTP No Funciona (Estilo Passbolt)

**Estado:** ❌ No implementado correctamente

**Problema:**
- La configuración SMTP actual no funciona como se especificó en el promp
- Debería ser estilo Passbolt (con prueba de envío, validación de conexión)

**Esperado:**
- Formulario con: Host, Puerto, Usuario, Contraseña, From, SSL/TLS
- Botón "Probar conexión" que envíe email de prueba
- Guardar configuración solo si la prueba es exitosa
- Mostrar estado de conexión (conectado/desconectado)

---

## ✅ 2. Checklist - Múltiples Problemas

### 2.1 Duplicación de UI ---DONE
**Problema:**
- Existe un link "Checklist" y abajo otro link que también muestra el campo de entradas
- Confusión entre "Escribir" y "Checklist"
ELIMIANR EL PRINCIPAL, DEJAR EL CHECKLIST Y CAMBIARLE EL NOMBRE A ESCRIBIR

**Esperado:**
- "Escribir" → Solo para crear entradas de bitácora
- "Checklist" → Solo para marcar servicios verificados

### 2.2 Configuración de Servicios NO Funciona  ---DONE
**Estado:** ❌ No implementado

**Problema:**
- El admin no puede configurar qué servicios aparecen en el checklist ---DONE
- No hay opción para agregar/quitar servicios ---DONE

**Esperado:**
- En Configuración → Sección "Checklist"
- Lista editable de servicios (agregar, editar, eliminar) ---DONE
- Cada servicio con: nombre, descripción, orden
- Activar/desactivar servicios

### 2.3 Menú Acordeón NO Funciona
**Estado:** ❌ No implementado

**Problema:**
- El checklist no se muestra en formato acordeón/expandible ---DONE
- Debería mostrar categorías colapsables con servicios dentro ---DONE

**Esperado:**
- Acordeón con categorías (ej: "Firewalls", "Servidores", "Backups") ---DONE
- Cada categoría expandible con sus servicios ---DONE
- Estado visual: ✅ verificado, ⏳ pendiente, ❌ con problemas

---

## 🏷️ 3. Gestión de Tags - No Sincroniza ---DONE

**Estado:** ❌ Bug

**Problema:**
- Los tags creados con `#` en las entradas NO se guardan en la gestión de tags
- La gestión de tags está desconectada del sistema de entradas

**Pasos para reproducir:**
1. Crear entrada con `#nuevo-tag`
2. Ir a Gestión de Tags
3. El tag `nuevo-tag` NO aparece

**Esperado:**
- Tags creados en entradas deben aparecer automáticamente en gestión
- Gestión de tags muestra todos los tags existentes con contador de uso
- Poder renombrar/eliminar tags (afecta todas las entradas)

---

## 📋 4. Ver Todas las Entradas - Orden Incorrecto --DONE

**Estado:** ❌ Bug

**Problema:**
- Las entradas están ordenadas de forma incorrecta
- Se muestra la más antigua primero

**Esperado:**
- Ordenar por fecha descendente (más reciente primero)
- La última entrada escrita debe aparecer arriba

**Archivo a modificar:** `backend/src/routes/entries.routes.js` o controller

---

## ⚙️ 5. Menú Desorganizado

**Estado:** ⚠️ UX Problem

**Problema:**
- Estos items están como links separados en el menú:
  - Logo
  - Backup  
  - Tags
  - Admin Usuarios
- Debería estar todo dentro de "Configuración"

**Estructura actual (incorrecta):**
```
├── Escribir
├── Mis Entradas
├── Ver todas
├── Mi Perfil
├── Admin Usuarios    ← Mover a Config
├── Tags              ← Mover a Config
├── Reportes
├── Logo              ← Mover a Config
├── Backup            ← Mover a Config
├── Checklist
└── Configuración
    └── SMTP
    └── Modo Invitado
```

**Estructura esperada:**
```
├── Escribir
├── Mis Entradas
├── Ver todas
├── Mi Perfil
├── Checklist
├── Reportes
└── Configuración (Admin)
    ├── General
    │   ├── Logo
    │   └── Modo Invitado
    ├── Usuarios
    ├── Tags
    ├── Checklist (servicios)
    ├── SMTP
    └── Backup
```

---

## 👤 6. Perfil de Usuario - Sin Probar

**Estado:** ⏳ Pendiente de prueba

**Funcionalidades a verificar:**
- [ ] Cambio de tema (light/dark/sepia/pastel) Verificar color de header (Azul-Rosa)
- [ ] Cambio de contraseña ---No funciona
- [ ] Ver datos del usuario actual ---DONE
- [ ] Guardar preferencias ---No funciona

---

## 📞 Escalaciones - Pendientes

### 7. Validación de teléfonos ausente

**Estado:** ⚠️ Falta de validación

**Problema:**
- Los formularios de contactos (`frontend/src/app/pages/escalation/escalation-admin/escalation-admin.component.ts` y `frontend/src/app/pages/escalation/escalation-admin-simple/escalation-admin-simple.component.ts`) permiten cualquier texto en teléfono sin validar dígitos ni longitud.
- Los esquemas backend (`backend/src/models/Contact.js`, `backend/src/models/ExternalPerson.js` y campo `emergencyPhone` en `backend/src/models/EscalationRule.js`) aceptan cadenas sin restricciones, por lo que pueden guardarse caracteres inválidos.

**Esperado:**
- Validación de números en frontend (regex para `+56` o dígitos, longitud mínima/máxima, normalización).
- Validaciones en backend para rechazar textos no numéricos y limitar longitud; ideal sanitizar/normalizar antes de guardar.

### 8. CRUD admin incompleto

**Estado:** ❌ Sin UI funcional

**Problema:**
- En `frontend/src/app/pages/escalation/escalation-admin/escalation-admin.component.ts` las acciones de agregar/editar reglas, ciclos, asignaciones y overrides están como placeholders que solo muestran un mensaje ("Funcionalidad en desarrollo") y no permiten CRUD desde la interfaz.
- Esto obliga a usar la API manualmente y deja al módulo admin sin gestión completa de reglas y turnos.

**Esperado:**
- Implementar formularios y diálogos para crear/editar reglas de escalación, ciclos de rotación, asignaciones y overrides directamente desde la UI admin, con validación y feedback.

### 9. Teléfono de emergencia no se muestra en vista simple

**Estado:** ❌ Bug funcional

**Problema:**
- En la vista Excel/simple (`frontend/src/app/pages/escalation/escalation-simple/escalation-simple.component.ts`) se pinta `service.emergencyPhone`, pero el endpoint `getServices` no devuelve ese campo; la información está en `EscalationRule`. Resultado: el número de emergencia nunca aparece para los analistas.

**Esperado:**
- Traer y mostrar el teléfono de emergencia real por servicio (consultar reglas de escalación o extender el endpoint para incluirlo); agregar fallback claro si no existe.

---

## 📊 Resumen de Prioridades

| # | Issue | Prioridad | Complejidad |
|---|-------|-----------|-------------|
| 1 | SMTP estilo Passbolt | 🔴 Alta | Media |
| 2 | Checklist configurable | 🔴 Alta | Alta |
| 3 | Tags no sincroniza | 🔴 Alta | Media |
| 4 | Orden de entradas | 🟢 Baja | Baja |
| 5 | Reorganizar menú | 🟡 Media | Media |
| 6 | Probar perfil | 🟢 Baja | - |
| 7 | Escalaciones: Validar teléfonos | 🟡 Media | Baja |
| 8 | Escalaciones: CRUD admin incompleto | 🔴 Alta | Media |
| 9 | Escalaciones: Teléfono emergencia no visible | 🟡 Media | Media |
| 10 | CRUD de  Lista de Eventos, Log Sources y Tipos de Operación en admin catalogos | 🟡 Media | Media |
---

## 🔧 Próximos Pasos

1. **Inmediato:** Arreglar orden de entradas (descendente)
2. **Corto plazo:** Sincronizar tags entre entradas y gestión
3. **Medio plazo:** Reorganizar menú de configuración
4. **Largo plazo:** Implementar checklist configurable + SMTP Passbolt
5. **Escalaciones:** Validar teléfonos, habilitar CRUD admin completo y mostrar teléfono de emergencia en la vista simple

*Documento generado para tracking de issues - Bitácora SOC*
