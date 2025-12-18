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

### 2.1 Duplicación de UI
**Problema:**
- Existe un link "Checklist" y abajo otro link que también muestra el campo de entradas
- Confusión entre "Escribir" y "Checklist"

**Esperado:**
- "Escribir" → Solo para crear entradas de bitácora
- "Checklist" → Solo para marcar servicios verificados

### 2.2 Configuración de Servicios NO Funciona
**Estado:** ❌ No implementado

**Problema:**
- El admin no puede configurar qué servicios aparecen en el checklist
- No hay opción para agregar/quitar servicios

**Esperado:**
- En Configuración → Sección "Checklist"
- Lista editable de servicios (agregar, editar, eliminar)
- Cada servicio con: nombre, descripción, orden
- Activar/desactivar servicios

### 2.3 Menú Acordeón NO Funciona
**Estado:** ❌ No implementado

**Problema:**
- El checklist no se muestra en formato acordeón/expandible
- Debería mostrar categorías colapsables con servicios dentro

**Esperado:**
- Acordeón con categorías (ej: "Firewalls", "Servidores", "Backups")
- Cada categoría expandible con sus servicios
- Estado visual: ✅ verificado, ⏳ pendiente, ❌ con problemas

---

## 🏷️ 3. Gestión de Tags - No Sincroniza

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

## 📋 4. Ver Todas las Entradas - Orden Incorrecto

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
- [ ] Cambio de tema (light/dark/sepia/pastel)
- [ ] Cambio de contraseña
- [ ] Ver datos del usuario actual
- [ ] Guardar preferencias

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

---

## 🔧 Próximos Pasos

1. **Inmediato:** Arreglar orden de entradas (descendente)
2. **Corto plazo:** Sincronizar tags entre entradas y gestión
3. **Medio plazo:** Reorganizar menú de configuración
4. **Largo plazo:** Implementar checklist configurable + SMTP Passbolt

---

*Documento generado para tracking de issues - Bitácora SOC*
