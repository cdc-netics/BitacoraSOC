# Plan de Trabajo: Bitácora SOC

## Estado general (tabla de control)

### ⏳ En Progreso / Pendiente

| ID | Estado | Seccion | Tarea | Notas |
| --- | --- | --- | --- | --- |
| 🔴 B-CRÍTICO-001 | ⚠️ BLOQUEANTE | Bugs CRÍTICO | Emails no llegan cuando se registra cierre checklist | **MAXIMA PRIORIDAD**: Backend estaba leyendo config SMTP de modelo separado SmtpConfig pero la UI Settings guarda en AppConfig.smtpConfig. SMTP **SÍ está configurado en UI** (Office 365: despinoza@netics.cl, estado: Conectado). PROBLEMA: email.js buscaba en colección SmtpConfig (no usada) en lugar de AppConfig.smtpConfig (donde se guarda). CORREGIDO: email.js ahora lee de AppConfig.smtpConfig. ESTADO: Código corregido + backend restarteado. PENDIENTE: Validación manual - registrar cierre checklist y confirmar que email llega a despinoza@netics.cl. IMPACTO: Sin fix, emails no llegan aunque SMTP esté configurado. |
| B5 | Pendiente | Bugs CRÍTICO | Acceso a rutas sin autenticación | Vulnerabilidad: posible acceso y modificación sin login |

---

## 🔴 BUG CRÍTICO DETALLE: Emails no llegan (B-CRÍTICO-001)

### Síntoma
Usuario: "ningun correo llego ahora y antes si llegaban"
- Cierre checklist se registra exitosamente en BD
- Email NO llega a la bandeja (despinoza@netics.cl)
- No hay error en frontend, parece exitoso
- Backend logs muestran: `❌ ERROR: SMTP configuration missing: Please configure email settings in Settings > Configuración SMTP`
- **PERO: Usuario confirmó desde el inicio: "la config existe en Settings, está conectada, dice 'Conectado'"**
  - El usuario tenía razón todo el tiempo
  - El problema NO era falta de config
  - El problema era que el backend LEÍA config del lugar equivocado

### Root Cause Identificado
**Mismatch de fuentes de configuración SMTP:**

⚠️ **NOTA IMPORTANTE DE DIAGNÓSTICO:**
El usuario reportó correctamente desde el inicio: "la config SMTP está en Settings, dice 'Conectado'". El error de diagnóstico fue asumir que la config faltaba en base de datos. La realidad:
- ✅ Config SMTP SÍ existe en AppConfig.smtpConfig
- ✅ El status en UI SÍ muestra "Conectado"
- ❌ Backend buscaba en lugar equivocado (modelo SmtpConfig)
- **Conclusión:** El usuario tenía razón, el código estaba roto

1. **Frontend Settings** (UI): Guarda config SMTP en `AppConfig.smtpConfig` 
   ```javascript
   // backend/src/routes/config.js línea 277
   const config = await AppConfig.findOne().select('emailReportConfig smtpConfig').lean();
   // Retorna: { smtpConfig: { host, port, secure, user, pass, from } }
   ```

2. **Backend email.js** (antes del fix): Intentaba leer de `SmtpConfig` (colección separada)
   ```javascript
   // backend/src/utils/email.js línea 28 (VIEJO - ROTO)
   const smtpConfig = await SmtpConfig.findOne().lean();
   // Retornaba null porque esa colección NO existe / NO se usa
   ```

3. **Resultado**: 
   - `getSMTPConfig()` retorna `null` a pesar de que config EXISTE
   - `sendEmail()` falla con error "SMTP configuration missing"
   - Email NO se envía
   - **Pero el checklist SÍ se registra** (email es asincrónico, no bloquea)

### Timeline del Bug
1. **Fase 1:** User configuró SMTP en UI Settings (Office 365: despinoza@netics.cl)
   - Guardó en `AppConfig.smtpConfig` ✅
   - Emails funcionaban cuando se activó sendChecklistEmail() en POST checklist

2. **Fase 2:** Se cambió arquitectura de emails
   - Se agregó `sendShiftReport()` para enviar UN email al cierre (no múltiples)
   - Se leyó código viejo que buscaba en modelo `SmtpConfig` ❌
   - Se comentó `sendChecklistEmail()` para no duplicar emails

3. **Fase 3:** Email automation se rompió
   - Código nuevo buscaba en `SmtpConfig` (no existe)
   - Config real está en `AppConfig.smtpConfig`
   - Resultado: "no hay config" → no envía → email no llega
   - Bug no fue evidente porque:
     - Frontend muestra "ok" en checklist
     - Email falla en backend (asincrónico)
     - Usuario solo se da cuenta después de esperar al email

### Diagnóstico Realizado
```bash
# Backend logs muestran claramente:
[2026-02-04 00:50:36.259 -0300] WARN: Error reading SMTP config from DB:
[2026-02-04 00:50:36.260 -0300] WARN: No SMTP configuration found in DB or environment
[2026-02-04 00:50:36.260 -0300] ERROR: SMTP configuration missing: Please configure email settings...
```

**Investigación:**
- Config SMTP guardada en `AppConfig.smtpConfig` ✅ (verificado en UI)
- Model `SmtpConfig` existe pero NO se usa ❌
- Routes en `config.js` usan `AppConfig.smtpConfig` ✅
- Routes en `smtp.js` usan `SmtpConfig` (legacy, no usado) ❌

### Fix Aplicado
**Cambio en `backend/src/utils/email.js` línea 1-50:**

```diff
- const SmtpConfig = require('../models/SmtpConfig');
+ const AppConfig = require('../models/AppConfig');

  async function getSMTPConfig() {
    try {
-     const smtpConfig = await SmtpConfig.findOne().lean();
+     const appConfig = await AppConfig.findOne().select('smtpConfig').lean();
+     const smtpConfig = appConfig?.smtpConfig;
      
      if (smtpConfig) {
+       logger.info('📧 SMTP config found in AppConfig', { user: smtpConfig.user });
        const config = {
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure === true,
-         user: smtpConfig.username,
-         pass: decrypt(smtpConfig.password),
-         from: smtpConfig.senderEmail
+         user: smtpConfig.user,
+         pass: smtpConfig.pass,
+         from: smtpConfig.from || smtpConfig.user
        };
```

**Cambios:**
1. ✅ Cambiar import: `SmtpConfig` → `AppConfig`
2. ✅ Cambiar query: `SmtpConfig.findOne()` → `AppConfig.findOne().select('smtpConfig')`
3. ✅ Acceder campo correcto: `appConfig.smtpConfig`
4. ✅ Usar nombres de campo correctos: `user`/`pass` (no `username`/`password`)
5. ✅ NO desencriptar (config en AppConfig está en texto plano desde UI)
6. ✅ Agregar logging con emoji 📧 para debugear

### ✅ Actualizaciones posteriores (formato + contenido del correo)
**Problemas reportados:**
- Correo con letras blancas/fondo blanco (Outlook).
- Checklist mostraba "No completado" aunque estaba completado.
- Entradas incluían TODO el día y salían "Sin descripción".
- Se truncaba el texto de entradas largas.

**Cambios aplicados (2026-02-04):**
1. ✅ `backend/src/utils/shift-report.js` usa **services + createdAt** reales de ShiftCheck.
2. ✅ Entradas filtradas **solo entre inicio y cierre** (no todo el día).
3. ✅ Contenido de entradas ahora usa `entry.content` completo (sin truncado).
4. ✅ HTML del correo convertido a **tablas + estilos inline** (mejor soporte Outlook).
5. ✅ Forzado de color negro absoluto + `mso-*` + `-webkit-text-fill-color`.
6. ✅ Se agrega **versión text/plain completa** como fallback.
7. ✅ Badge OK/ERROR con fondo verde/rojo (no solo texto).
8. ✅ Contenedor más ancho (max-width: 1100px).

**Resultado validado:** En Outlook ya se ve correctamente el texto (no blanco).

### Validación del Fix
**Requisitos para validar:**
1. ✅ **SMTP configurado en UI Settings** - VERIFICADO
   - **URL:** http://localhost:4200/main/settings → pestaña "📧 Reenvío de Información"
   - **Estado en UI:** "✅ Conectado"
   - **Provider:** Office 365
   - **Host:** smtp.office365.com
   - **Port:** 587
   - **User:** despinoza@netics.cl
   - **Pass:** (guardado y encriptado en BD)
   - **From:** despinoza@netics.cl
   - **Verificación:** Usuario confirmó "está ahi mierda y sale conectado" → Config EXISTE en BD ✅
   - **Ubicación en BD:** `db.appconfigs.findOne()` → campo `smtpConfig` contiene:
     ```json
     {
       "host": "smtp.office365.com",
       "port": 587,
       "secure": false,
       "user": "despinoza@netics.cl",
       "pass": "(valor encriptado)",
       "from": "despinoza@netics.cl"
     }
     ```

2. Backend debe encontrar config:
   ```bash
   docker logs bitacora-backend --tail 50 | grep "📧"
   # Buscar: "📧 SMTP config found in AppConfig"
   # Buscar: "📧 Sending mail with SMTP"
   ```

3. Cierre checklist debe enviar email:
   - UI: http://localhost:4200/main/shifts
   - Click en turno → Checklist → Registrar "cierre"
   - Esperar 3-5 segundos
   - Logs deben mostrar: "✅ EMAIL SENT SUCCESSFULLY"

4. Email debe llegar a bandeja:
   - despinoza@netics.cl debe recibir email
   - Asunto: "Reporte SOC [fecha] [turno]"
   - Body: Checklist inicio + cierre + entradas

### Testing Post-Fix
```bash
# 1. Restart backend
docker-compose restart backend

# 2. Esperar 5 segundos
sleep 5

# 3. Ver logs de startup
docker logs bitacora-backend --tail 20

# 4. IR a UI y registrar cierre checklist

# 5. Ver logs nuevamente
docker logs bitacora-backend --tail 100 | Select-String "📧|✅|❌|email"
```

**Marcadores esperados:**
- `📧 Reading SMTP config FROM DATABASE (AppConfig.smtpConfig)...`
- `📧 SMTP config found in AppConfig`
- `📧 SMTP config LOADED FROM DB`
- `📧 [sendEmail] Starting email send process`
- `✅ EMAIL SENT SUCCESSFULLY` ← ÉXITO

**Si NO aparecen estos marcadores:**
- Config SMTP no guardada en UI Settings
- O guardar config está fallando
- Revisar `backend/src/routes/config.js` PUT endpoint

### Archivos Modificados
- ✅ `backend/src/utils/email.js` - Cambiar fuente de config
- ✅ `ISSUES.md` - Documentar bug y fix (este documento)
- ⏳ Pendiente: Validación manual en vivo

### Impacto
- **Antes del fix**: Emails NO llegan → Feature crítica rota
- **Después del fix**: Emails deben llegar → Feature restaurada
- **Si falla la validación**: Significa que hay otro problema (ej: SMTP config no guardada correctamente en UI)

### Lecciones Aprendidas
1. **Consistencia de fuentes**: Backend debe leer de mismo lugar que frontend escribe
2. **Falta de tests**: Sin tests, este bug hubiera sido detectado automáticamente
3. **Logging insuficiente**: Agregar emoji markers para fácil identificación en prod
4. **Cambios asincronicos**: Errores en tasks background no alertan al usuario
5. **Migración de modelos**: Cuando se cambian modelos, actualizar TODOS los lugares que los usan

### Seguimiento
- [ ] Usuario valida que emails llegan post-fix
- [ ] Agregar tests automatizados para email sending
- [ ] Documentar en SETUP.md el flujo de configuración SMTP
- [ ] Agregar health check endpoint que valide SMTP está configurado
| B6 | Pendiente | Bugs | Dark Mode: contraste y legibilidad | Textos/botones invisibles, inputs blancos con letra blanca |
| B7 | ✅ Resuelto | Bugs | No se podían editar entradas | Implementado diálogo de edición en my-entries component |
| M7 | Pendiente | Mejoras | Tema Cyberpunk/Neon | Investigar implementación sin los problemas del dark mode |
| B1c | Pendiente | Bugs | Version no se muestra en sidebar | Placeholder __APP_VERSION__ no reemplazado en build |
| B2p | Pendiente | Mejoras | Config TLS/SSL en backend (admin) | Permitir cargar certificados sin reconstruir imagen |
| B2l | Pendiente | Mejoras | Integracion API generica (webhooks/conectores) para enviar datos a servicios externos | Ej: GLPI, payload y auth configurables |
| B2o | Pendiente | Mejoras | Envio automatico de entradas a GLPI al cierre de turno | Depende de B2l; toma entradas del día y crea ticket |
| B2n | Pendiente | Mejoras | Exportacion de metricas/uso para BI (Metabase, PowerBI, etc.) | Uso, entradas, tags, checklists, incidentes |
| B4-7 | Pendiente | Observaciones | Aviso analistas de checklist | Depende de B3a (etiquetas de cargo) |
| C1-1 | Pendiente | Revisiones de seguridad y auditoria | Analisis de seguridad general |  |
| D1-1 | Pendiente | Complementos | Modulo de complementos (plugins) |  |

### ✅ Completado

| ID | Seccion | Tarea | Notas |
| --- | --- | --- | --- |
| P1 | Actualizacion Angular 20 | Plan general de actualizacion | Actualización completa Angular 17→20 |
| F4-3 | Fase 4 (Post-actualizacion) | Merge rama | Listo para merge |
| F0-1 | Fase 0 (Preparacion) | Crear rama aislada | Rama `feature/angular-20-upgrade` creada |
| F0-2 | Fase 0 (Preparacion) | Limpieza del entorno | Reinstaladas dependencias en backend y frontend |
| F0-3 | Fase 0 (Preparacion) | Verificar pruebas | `ng test` no configurado (sin target de test) |
| F1-1 | Fase 1 (Angular 18) | ng update core/cli 18 + material 18 | Angular/CLI/Material/CDK actualizados a 18.2.x |
| F1-2 | Fase 1 (Angular 18) | Analisis y migracion | Migración HTTP aplicada en `app.module.ts` |
| F1-3 | Fase 1 (Angular 18) | Revision breaking changes | Sin advertencias adicionales; builder migration opcional pendiente |
| F1-4 | Fase 1 (Angular 18) | Verificacion (ng serve / ng test) | `ng build` OK; `ng test` no configurado |
| F1-5 | Fase 1 (Angular 18) | Commit upgrade 18 | Commit local listo |
| F2-1 | Fase 2 (Angular 19) | ng update core/cli 19 + material 19 | Migrado a standalone components primero |
| F2-2 | Fase 2 (Angular 19) | Analisis y migracion | Migraciones automáticas aplicadas |
| F2-3 | Fase 2 (Angular 19) | Revision breaking changes | Sin breaking changes críticos |
| F2-4 | Fase 2 (Angular 19) | Verificacion (ng serve / ng test) | Build OK con standalone components |
| F2-5 | Fase 2 (Angular 19) | Commit upgrade 19 | Commit 8afdb02 + e292d7c |
| F3-1 | Fase 3 (Angular 20) | ng update core/cli 20 + material 20 | Angular 20.3.16 + Material 20.2.14 |
| F3-2 | Fase 3 (Angular 20) | Analisis y migracion | Migraciones de v19 a v20 aplicadas |
| F3-3 | Fase 3 (Angular 20) | Revision breaking changes | TypeScript 5.9.3, sin breaking changes |
| F3-4 | Fase 3 (Angular 20) | Verificacion final | Build exitoso, advertencia menor |
| F3-5 | Fase 3 (Angular 20) | Commit upgrade 20 | Commits c102e7d + fa45c38 |
| F4-1 | Fase 4 (Post-actualizacion) | Revision de dependencias externas | animejs@3.2.2 funcionando OK |
| F4-2 | Fase 4 (Post-actualizacion) | Limpieza de codigo | Código limpio, solo 1 warning menor |
| B1a | Bugs | Visibilidad en tema oscuro | Commit d3112bd: Agregados estilos mat-menu-item y options en dark mode |
| B1b | Bugs | Notas no se guardan | Verificado: autosave con debounce 3s funciona correctamente |
| B2a | Mejoras | Reordenar y clarificar menu lateral | Checklist (Admin) movido a Configuración (Admin); texto Escalación ok |
| B2b | Mejoras | Visualizador de logs de auditoria | Backend: 3 endpoints (logs, events, stats). Frontend: componente con filtros, paginación, badges por tipo entrada |
| B2c | Mejoras | Purgar datos segura | Botón en Backup con confirmación de frase + endpoint admin |
| B2g | Mejoras | Recuperacion de contrasena | Endpoints forgot/reset + componentes Angular + email HTML + rutas |
| B2g-smtp | Mejoras | SMTP destinatarios opcionales | Recipients optional + SSL auto-detect + ENCRYPTION_KEY 64 chars | 
| B2d | Mejoras | Gestion de tags: ver entradas por tag | Contador ahora navega a /main/all-entries?tag=... |
| B2e | Mejoras | Mis entradas / Ver todas: contenido completo | Dialogo listo en "Ver todas" y agregado en "Mis entradas" |
| B2g | Mejoras | Recuperacion de contrasena | Backend: forgot-password + reset-password endpoints con token SHA256. Frontend: 2 componentes (forgot/reset) + routes |
| B2h | Mejoras | Reorganizacion pagina configuracion | Cooldown movido a Checklist Admin + texto SMTP clarificado |
| B2i | Mejoras | Selector de cliente en Nueva Entrada + filtro/columna en busqueda | Cliente/LogSource como campo estructurado en entries, filtro + columna en results |
| B2k | Mejoras | Checklist: borrado admin + ocultar iconos + rehacer checklist diario | Borrado admin en historial + UI oculta para no-admin + cooldown solo mismo día | 
| B2m | Mejoras | Estado de turno + cierre automatico: enviar checklist + entradas via integracion | Modelo ShiftClosure + endpoints POST/GET, resumen de turno con entradas/incidentes |
| B3a | Arquitectura | Etiquetas de cargo + rol auditor | Rol 'auditor' en User model, cargoLabel para cada usuario, ShiftRole flexible |
| B4-1 | Observaciones | Eliminar backup.js.bak | Archivo eliminado |
| B4-2 | Observaciones | Validacion de variables de entorno | Validación al inicio del server |
| B4-3 | Observaciones | Pruebas automatizadas backend | Jest config + test base encryption | 
| B4-4 | Observaciones | Consistencia en nombres (kebab-case) | Alcance acotado: backend/src/middleware (rate-limiter, request-id) + shims camelCase por compatibilidad |
| B4-5 | Observaciones | Error tipografico "escalamiento" lateral | Commit d3112bd: Corregido en ambos menús |
| B4-6 | Observaciones | Login, poder entrar con correo como con nombre de usuario | Backend: $or query, Frontend: label actualizado |
| B4-8 | Infraestructura | Deshabilitar Rate Limiter en desarrollo | NODE_ENV=development en docker-compose |
| B4-9 | Bugs | Navegacion password recovery (NG04002 auth/login) | Corregido en forgot-password.component.ts |
| B4-10 | Configuracion | ENCRYPTION_KEY longitud invalida | Actualizado a 64 hex chars (32 bytes) |
| B4-11 | UI/UX | Mejora visibilidad texto login/recovery CRT theme | Todos los elementos forzados a #ffffff con !important + text-shadow green glow |
| B2j | Mejoras | Tabla RACI por cliente (vista + admin Escalamiento) | Backend: RaciEntry con contactos {name, email, phone}. Frontend: form admin + vista analista con iconos |
| B2f | Mejoras | Reportes: graficos | NGX-Charts: line chart (tendencia), pie chart (tipos), bar charts (usuarios/tags/servicios/log-sources), multi-line (comparación tags), heatmap (día vs hora). Backend: endpoints /tags-trend, /entries-by-logsource y /heatmap |
| C5 | Cambios | Token de recuperación: reducir a 5 min | Reducido de 1h a 5 minutos en auth.js. Email y frontend actualizados con aviso temporal |
| C6 | Cambios | Sesión JWT reducida a 4h | JWT reducido de 24h a 4h para admin/user, guest mantiene 2h. Aviso en login sobre duración |
| B8 | ⏳ Pendiente | Mejoras | Edición masiva/individual de entradas (admin) | Backend implementado. Frontend: botón "Guardar Cambios" en dialog no responde al clickear. Revisar formulario submit handler |

## **P1** **Prioridad #1: Estrategia Detallada de Actualización a Angular 20**

**Justificación:** Para asegurar la estabilidad, seguridad y mantenibilidad a largo plazo del proyecto, la actualización del framework es la máxima prioridad. Abordar esta tarea primero nos proporcionará una base moderna y sólida sobre la cual implementar futuras mejoras y correcciones de manera eficiente, evitando la acumulación de deuda técnica. **Todas las demás tareas de este documento quedan en espera hasta que esta actualización se complete.**

**Versión Actual:** Angular 17.0.0

**Versión Objetivo:** Angular 20.x.x

---

### Plan de Actualización Incremental

La actualización se realizará de forma incremental, versión por versión, para minimizar riesgos y facilitar la depuración de "breaking changes" en cada etapa.

#### Fase 0: Preparación
1.  **F0-1** **Crear Rama Aislada:** Crear una nueva rama en Git dedicada exclusivamente a la actualización (ej. `feature/angular-20-upgrade`).
2.  **F0-2** **Limpieza del Entorno:** Eliminar `node_modules` y `package-lock.json` para asegurar un entorno de dependencias limpio. Ejecutar `npm install` para verificar que el proyecto base está estable.
3.  **F0-3** **Verificar Pruebas (si existen):** Ejecutar `ng test` para asegurar que el estado actual es conocido y funcional.

#### Fase 1: Actualización a Angular 18
1.  **F1-1** **Ejecutar Comandos de Actualización:**
    ```bash
    ng update @angular/core@18 @angular/cli@18
    ng update @angular/material@18
    ```
2.  **F1-2** **Análisis y Migración:**
    - Revisar la salida de la terminal en busca de advertencias y errores.
    - `ng update` aplicará migraciones automáticas. Es crucial revisar los cambios realizados.
3.  **F1-3** **Revisión Manual de Breaking Changes:**
    - Consultar la guía oficial de actualización de Angular v17 a v18.
    - Poner especial atención a cambios en APIs de `CommonModule`, `Router` y el manejo de Zoneless.
4.  **F1-4** **Verificación:**
    - Ejecutar `npm install` si es necesario.
    - Iniciar la aplicación (`ng serve`) y realizar una prueba de humo de las funcionalidades principales.
    - Ejecutar `ng test`.
5.  **F1-5** **Commit:** Una vez estable, hacer commit de la actualización a la v18: `git commit -m "feat(ng): Upgrade to Angular 18"`.

#### Fase 2: Actualización a Angular 19 ✅ **COMPLETADO**

**PROBLEMA DETECTADO Y RESUELTO (2026-02-02):**

Angular 19.2.x con el nuevo builder `@angular/build:application` tenía un bug donde detectaba incorrectamente componentes NgModule-based como standalone.

**SOLUCIÓN IMPLEMENTADA:** ✅ Migración completa a Standalone Components

Se utilizó el schematic oficial de Angular para migrar automáticamente:
```bash
npx ng generate @angular/core:standalone --mode=convert-to-standalone
npx ng generate @angular/core:standalone --mode=prune-ng-modules  
npx ng generate @angular/core:standalone --mode=standalone-bootstrap
```

**Resultado:**
- ✅ 20+ componentes migrados a `standalone: true`
- ✅ Eliminado `shared-components.module.ts`
- ✅ Actualizado `main.ts` a `bootstrapApplication`
- ✅ NgModules innecesarios eliminados
- ✅ Build exitoso con Angular 19
- ✅ Path desbloqueado para Angular 20

**Referencias:**
- https://angular.dev/tools/cli/build-system-migration
- https://github.com/angular/angular-cli/issues (tracking del bug)

---

1.  **F2-1** **Ejecutar Comandos de Actualización:**
    ```bash
    ng update @angular/core@19 @angular/cli@19
    ng update @angular/material@19
    ```
    **Estado:** ✅ Ejecutado exitosamente  
    **Resultado:** ❌ Bug detectado en compilación  
    **Revertido:** ✅ Proyecto vuelto a Angular 18.2.x
    
2.  **F2-2** **Análisis y Migración:**
    - ❌ Bloqueado por bug del compilador
    - Migraciones automáticas se aplicaron pero el build falla
3.  **F2-3** **Revisión Manual de Breaking Changes:**
    - Consultar la guía oficial de v18 a v19.
    - **Análisis de `ng-content` y Vistas:** Se ha revisado el código y no se han encontrado usos de la directiva `<ng-content>`. Por lo tanto, no se esperan problemas de migración relacionados con la proyección de contenido. El manejo de vistas en la aplicación utiliza patrones estándar que no deberían verse afectados por cambios en la v19.
4.  **F2-4** **Verificación:**
    - Repetir el proceso de `npm install`, `ng serve`, `ng test`.
5.  **F2-5** **Commit:** `git commit -m "feat(ng): Upgrade to Angular 19"`.

#### Fase 3: Actualización a Angular 20 (Versión Final) ✅ **COMPLETADO**

1.  **F3-1** **Ejecutar Comandos de Actualización:**
    ```bash
    ng update @angular/core@20 @angular/cli@20
    ng update @angular/material@20
    ```
    **Estado:** ✅ Ejecutado exitosamente
    - Angular Core: 20.3.16
    - Angular CLI: 20.3.15
    - Material/CDK: 20.2.14
    - TypeScript: 5.9.3
    
2.  **F3-2** **Análisis y Migración:**
    ✅ Migraciones automáticas aplicadas:
    - Workspace generation defaults actualizados
    - Imports de server rendering verificados (sin cambios)
    - moduleResolution verificado (ya en 'bundler')
    
3.  **F3-3** **Revisión Manual de Breaking Changes:**
    ✅ Revisado:
    - Signal-based features: No requieren cambios inmediatos
    - afterRender API: Funciona correctamente con Material 20
    - TypeScript 5.9.3: Compatible con el código actual
    
4.  **F3-4** **Verificación Final:**
    ✅ Build exitoso
    ⚠️ Solo 1 advertencia menor: EntryDetailDialogComponent no usado en template (no afecta funcionamiento)
    Bundle size: Similar a versión anterior (~1.28 MB)
    
5.  **F3-5** **Commit:** 
    - Commit c102e7d: Angular 20.3.16
    - Commit fa45c38: Material 20.2.14

#### Fase 4: Post-Actualización ✅ **COMPLETADO**

1.  **F4-1** **Revisión de Dependencias Externas:**
    ✅ Verificado:
    - `animejs@3.2.2`: Funcionando correctamente
    - `@types/animejs@3.1.12`: Tipos OK
    - Todas las dependencias externas compatibles
    
2.  **F4-2** **Limpieza de Código:** 
    ✅ Realizado:
    - Código standalone limpio
    - NgModules innecesarios eliminados  
    - Solo 1 advertencia menor pendiente (no crítica)
    - Sin código temporal o soluciones parche
    
3.  **F4-3** **Merge:** 
    ⏳ Pendiente de decisión del equipo
    - Rama `feature/angular-20-upgrade` estable y lista
    - Todos los commits documentados
    - Build verificado

---

## 🎉 RESUMEN FINAL DEL UPGRADE

### ✅ Upgrade Completado Exitosamente

**Versión Inicial:** Angular 17.0.0  
**Versión Final:** Angular 20.3.16  

### 📊 Versiones Actualizadas

| Paquete | Antes | Después | Estado |
|---------|-------|---------|--------|
| @angular/core | 17.0.0 | 20.3.16 | ✅ |
| @angular/cli | 17.x | 20.3.15 | ✅ |
| @angular/material | 17.x | 20.2.14 | ✅ |
| @angular/cdk | 17.x | 20.2.14 | ✅ |
| TypeScript | 5.2.x | 5.9.3 | ✅ |
| zone.js | 0.14.x | 0.15.1 | ✅ |

### 🔧 Cambios Arquitectónicos Mayores

1. **Migración a Standalone Components**
   - Convertidos 20+ componentes a arquitectura standalone
   - Eliminados NgModules innecesarios
   - Actualizado bootstrap a `bootstrapApplication`
   
2. **Nuevo Build System**
   - Migrado a `@angular/build:application` builder
   - Output path actualizado a `dist/bitacora-soc`
   
3. **Dependencias**
   - animejs: Funciona correctamente
   - Material Components: Todos funcionando

### 📝 Commits Principales

- `2abd954`: Migración a Standalone Components
- `8afdb02`: Upgrade a Angular 19.2.18
- `e292d7c`: Update Material 19
- `c102e7d`: Upgrade a Angular 20.3.16
- `fa45c38`: Update Material 20
- `c93762c`: Documentación versiones (README, SETUP)
- `a2c0148`: Documentación completa ISSUES.md
- `d3112bd`: Bug fixes (B1a dark mode, B4-5 typo, B1b verificación, Docker Node.js)
- `87d03a5`: Docker build path fix (/browser subfolder)
- `fb5bbdd`: ISSUES.md status updates
- `da9e5d1`: Dark mode contrast improvements (secundario, headers, warnings)

### ⚠️ Notas Importantes

- **Warning menor:** EntryDetailDialogComponent no usado en template (no crítico)
- **Build time:** ~12-15 segundos (~18s en Docker)
- **Bundle size:** ~1.28 MB (sin cambio significativo)
- **Compatibilidad:** Todas las funcionalidades existentes funcionan
- **Accesibilidad:** Contraste dark mode mejorado para cumplir WCAG AA

---

## Backlog de Tareas (Post-Actualización a Angular 20)

### 1. Problemas y Depuración (Bugs)

#### **B1a** ✅ **COMPLETADO - Problemas de visibilidad en el tema oscuro (Dark Mode)**
- **Descripción Original:** Al activar el tema oscuro, varios textos se volvían ilegibles debido a un bajo contraste. Esto afectaba elementos generales de la interfaz y era particularmente notorio en el menú desplegable para seleccionar el tema.
- **Solución Aplicada (Commit d3112bd + da9e5d1):**
  - Primera ronda: Corregidos mat-mdc-menu-item y mat-mdc-option con colores específicos para dark mode
  - Segunda ronda (basada en capturas de pantalla del usuario):
    - Mejorado color de `--text-secondary` de #c7ccda → #d0d5e3 para mejor contraste WCAG
    - Corregido texto hint "Sin sub-items" en Checklist Admin (cambió de hardcoded #555 a CSS variable)
    - Agregados estilos específicos para mat-card-subtitle con mejor contraste
    - Mejorado contraste de headers de tabla (Contenido/Tags/Autor) con font-weight: 600
    - Refactorizado warning box en Backup de estilos inline a clase .warning-box con dark mode (#3d3316 bg, #f5e6a3 text)
    - Texto secundario en Tags, Generador de Reportes y otros componentes ahora visible
- **Archivos modificados:**
  - `frontend/src/styles.scss` - Variables de tema y overrides de Material
  - `frontend/src/app/pages/main/checklist-admin/checklist-admin.component.scss`
  - `frontend/src/app/pages/main/backup/backup.component.html`
  - `frontend/src/app/pages/main/backup/backup.component.scss`
- **Estado:** Todos los problemas de contraste identificados en screenshots ahora resueltos

#### **B1b** ✅ **COMPLETADO - Las notas se guardan correctamente**
- **Reporte Original:** El contenido introducido en las notas no se guardaba.
- **Verificación:** Código de autoguardado funcionando correctamente (commit d3112bd).
- **Estado:** Confirmado funcionando. Autoguardado cada 3 segundos operando sin errores.

#### **B1c** **Versión no se muestra en sidebar**
- **Problema:** El placeholder `__APP_VERSION__` en `frontend/src/environments/environment.prod.ts` no se reemplaza durante el build Docker, quedando como texto literal en lugar de mostrar la versión real.
- **Síntomas:** En la barra de herramientas del sidebar izquierdo dice "Bitácora SOC VDEV" pero debería mostrar "Bitácora SOC 1.1.0" (o la versión correspondiente).
- **Causa:** El script de build en `frontend/Dockerfile` usa `sed` para reemplazar `__APP_VERSION__`, pero el patrón no coincide porque:
  - El archivo environment.ts tiene `appVersion: '__APP_VERSION__'` (comillas simples)
  - El comando `sed` debe buscar con delimitadores correctos
- **Solución propuesta:**
  1. Actualizar el Dockerfile para usar patrón correcto: `sed -i "s|__APP_VERSION__|1.1.0|g"` en lugar de patrón incorrecto
  2. O mejor: leer versión desde `package.json` dinámicamente: `VERSION=$(grep '"version"' package.json | grep -o '[0-9.]*')`
  3. Mostrar versión en el componente principal (MainLayoutComponent) leyendo desde `environment.appVersion`
  4. Agregar tests para validar que la versión se reemplaza correctamente en build
- **Archivos afectados:**
  - `frontend/Dockerfile` - Script de build
  - `frontend/src/environments/environment.prod.ts` - Placeholder
  - `frontend/src/app/pages/main/main-layout.component.html` - Mostrar versión
  - `frontend/src/app/pages/main/main-layout.component.ts` - Importar versión
- **Ejemplos:**
  - Antes: "Bitácora SOC __APP_VERSION__" o "Bitácora SOC VDEV"
  - Después: "Bitácora SOC 1.1.0" (en prod) o "Bitácora SOC dev" (en dev)

#### **B2p** **Configuración TLS/SSL en backend (sin reconstruir imagen)**
- **Objetivo:** Permitir que el admin pueda cargar certificados SSL/TLS en tiempo de ejecución (sin rebuild de Docker) para habilitar HTTPS en el backend. Similar a Portainer.
- **Casos de uso:**
  - Desarrollo local: carga de certificados autofirmados (self-signed)
  - Producción: carga de certificados válidos (Let's Encrypt, DigiCert, etc.)
  - Cambio de certificados sin reiniciar contenedores
- **Requisitos:**
  - UI en Admin Panel para subir archivo `.crt` (certificate) y `.key` (private key)
  - Validación de certificados antes de activar HTTPS
  - Fallback a HTTP si HTTPS falla (no bloquear aplicación)
  - Almacenar certificados encriptados en modelo MongoDB
  - Endpoint `/health` disponible en ambos puertos (HTTP y HTTPS)
  - Reinicio de servidor Express (sin reinicio de contenedor)
- **Flujo de usuario:**
  1. Admin va a "Configuración → Seguridad TLS/SSL"
  2. Ve estado actual: "HTTP activado, HTTPS desactivado"
  3. Sube archivo `.crt` y `.key`
  4. Sistema valida certificados (fecha expiración, dominio coincide, etc.)
  5. Guarda certificados encriptados en DB
  6. Reinicia servidor Express en HTTPS
  7. Todos los nuevos requests van a HTTPS (puerto 443 ó 8443)
  8. HTTP redirecciona a HTTPS (opcional)
- **Archivos relevantes:**
  - `backend/src/server.js` - Agregar soporte HTTPS con `https` module de Node
  - `backend/src/models/TlsConfig.js` - Modelo para certificados (nuevo)
  - `backend/src/routes/config.js` - Endpoint para subir/validar certificados
  - `backend/src/utils/certificateValidator.js` - Validar certificados
  - `frontend/src/app/pages/main/settings/` - UI para cargar certificados (nuevo tab)
- **Archivos que NO cambian (importante):**
  - `backend/Dockerfile` - Sin cambios; soporta HTTPS vía env vars
  - `docker-compose.yml` - Agregar puertos 443 y 8443 opcionalmente
  - Estructura de `uploads/` ya existe (reutilizar)

**Implementación técnica propuesta:**

**1. Modelo: TlsConfig.js (nuevo)**
```javascript
const tlsConfigSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  protocol: { type: String, enum: ['http', 'https'], default: 'http' },
  httpPort: { type: Number, default: 3000 },
  httpsPort: { type: Number, default: 8443 },
  certificatePem: String, // Encriptado (utils/encryption)
  privateKeyPem: String, // Encriptado (utils/encryption)
  certificatePath: String, // Ruta en /app/certs/ ej: /app/certs/server.crt
  privateKeyPath: String, // Ruta en /app/certs/ ej: /app/certs/server.key
  certificateValidFrom: Date,
  certificateValidUntil: Date,
  certificateIssuer: String,
  certificateSubject: String,
  certificateError: String, // Error si validación falló
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  redirectHttpToHttps: { type: Boolean, default: false },
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('TlsConfig', tlsConfigSchema);
```

**2. Modificación en server.js (agregar HTTPS)**
```javascript
const https = require('https');
const TlsConfig = require('./models/TlsConfig');

let server = null;

const initializeServer = async () => {
  const tlsConfig = await TlsConfig.findOne();
  
  if (tlsConfig?.enabled && tlsConfig?.certificatePem && tlsConfig?.privateKeyPem) {
    try {
      const { decrypt } = require('./utils/encryption');
      const httpsOptions = {
        cert: decrypt(tlsConfig.certificatePem),
        key: decrypt(tlsConfig.privateKeyPem)
      };
      
      server = https.createServer(httpsOptions, app);
      const httpsPort = tlsConfig.httpsPort || 8443;
      
      server.listen(httpsPort, HOST, () => {
        console.log(`✅ HTTPS activado en puerto ${httpsPort}`);
      });
    } catch (error) {
      logger.error({ err: error }, 'Error iniciando HTTPS');
      startHttpServer();
    }
  } else {
    startHttpServer();
  }
};

const startHttpServer = () => {
  server = app.listen(PORT, HOST, () => {
    console.log(`✅ HTTP activado en puerto ${PORT}`);
  });
};

// Llamar en el startup
(async () => {
  await initializeServer();
})();
```

**3. Utilidad: certificateValidator.js (nuevo)**
```javascript
const crypto = require('crypto');
const { X509Certificate } = require('crypto');

const validateCertificates = (certPem, keyPem) => {
  try {
    // Validar formato PEM
    if (!certPem.includes('-----BEGIN CERTIFICATE-----') || 
        !keyPem.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Formato PEM inválido');
    }
    
    // Parsear certificado
    const cert = new X509Certificate(certPem);
    
    // Extraer datos
    const now = new Date();
    const validFrom = new Date(cert.validFrom);
    const validUntil = new Date(cert.validTo);
    
    // Validar fechas
    if (now < validFrom) {
      throw new Error('Certificado aún no es válido');
    }
    if (now > validUntil) {
      throw new Error('Certificado expirado');
    }
    
    // Validar que falten menos de 30 días (warning)
    const daysLeft = Math.ceil((validUntil - now) / (1000 * 60 * 60 * 24));
    if (daysLeft < 30) {
      console.warn(`⚠️ Certificado expirará en ${daysLeft} días`);
    }
    
    return {
      valid: true,
      issuer: cert.issuer,
      subject: cert.subject,
      validFrom,
      validUntil,
      daysLeft
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};

module.exports = { validateCertificates };
```

**4. Ruta: POST /api/config/tls (en config.js)**
```javascript
const multer = require('multer');
const TlsConfig = require('../models/TlsConfig');
const { validateCertificates } = require('../utils/certificateValidator');
const { encrypt, decrypt } = require('../utils/encryption');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 } // 1MB max
});

// POST /api/config/tls - Subir y validar certificados
router.post('/tls', 
  authenticate, 
  authorize('admin'), 
  upload.fields([{ name: 'certificate' }, { name: 'privateKey' }]),
  async (req, res) => {
    try {
      const certFile = req.files.certificate?.[0];
      const keyFile = req.files.privateKey?.[0];
      
      if (!certFile || !keyFile) {
        return res.status(400).json({ message: 'Debes subir certificado y private key' });
      }
      
      const certPem = certFile.buffer.toString('utf-8');
      const keyPem = keyFile.buffer.toString('utf-8');
      
      // Validar certificados
      const validation = validateCertificates(certPem, keyPem);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }
      
      // Guardar encriptado
      let tlsConfig = await TlsConfig.findOne();
      if (!tlsConfig) tlsConfig = new TlsConfig();
      
      tlsConfig.certificatePem = encrypt(certPem);
      tlsConfig.privateKeyPem = encrypt(keyPem);
      tlsConfig.certificateValidFrom = validation.validFrom;
      tlsConfig.certificateValidUntil = validation.validUntil;
      tlsConfig.certificateIssuer = validation.issuer;
      tlsConfig.certificateSubject = validation.subject;
      tlsConfig.certificateError = null;
      tlsConfig.lastUpdatedBy = req.user._id;
      
      await tlsConfig.save();
      
      res.json({
        message: 'Certificados subidos exitosamente',
        validUntil: validation.validUntil,
        daysLeft: validation.daysLeft
      });
    } catch (error) {
      logger.error({ err: error }, 'Error subiendo certificados');
      res.status(500).json({ message: 'Error al subir certificados' });
    }
  }
);

// POST /api/config/tls/enable - Activar HTTPS
router.post('/tls/enable', authenticate, authorize('admin'), async (req, res) => {
  try {
    let tlsConfig = await TlsConfig.findOne();
    if (!tlsConfig || !tlsConfig.certificatePem) {
      return res.status(400).json({ message: 'No hay certificados cargados' });
    }
    
    tlsConfig.enabled = true;
    await tlsConfig.save();
    
    // Aquí se reiniciaría el servidor Express
    // (podría ser vía signal, API call, etc.)
    
    res.json({ message: 'HTTPS activado. El servidor se reiniciará en 5s' });
  } catch (error) {
    res.status(500).json({ message: 'Error activando HTTPS' });
  }
});

// GET /api/config/tls - Obtener estado TLS
router.get('/tls', authenticate, authorize('admin'), async (req, res) => {
  try {
    const tlsConfig = await TlsConfig.findOne();
    if (!tlsConfig) {
      return res.json({
        enabled: false,
        protocol: 'http',
        httpPort: 3000,
        message: 'Sin certificados cargados'
      });
    }
    
    res.json({
      enabled: tlsConfig.enabled,
      protocol: tlsConfig.enabled ? 'https' : 'http',
      httpPort: tlsConfig.httpPort,
      httpsPort: tlsConfig.httpsPort,
      certificateValidUntil: tlsConfig.certificateValidUntil,
      daysLeft: Math.ceil((tlsConfig.certificateValidUntil - new Date()) / (1000 * 60 * 60 * 24))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo config TLS' });
  }
});
```

**5. UI Frontend (nuevo tab en Settings)**
```html
<!-- settings.component.html - agregar tab TLS -->
<mat-tab label="🔒 TLS/SSL">
  <mat-card>
    <mat-card-header>
      <mat-card-title>Configuración TLS/SSL (HTTPS)</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <div class="tls-status">
        <p><strong>Estado actual:</strong> {{ tlsStatus?.enabled ? 'HTTPS Activado' : 'HTTP Activado' }}</p>
        <p *ngIf="tlsStatus?.certificateValidUntil">
          <strong>Válido hasta:</strong> {{ tlsStatus.certificateValidUntil | date:'short' }}
          ({{ tlsStatus.daysLeft }} días restantes)
        </p>
        <div *ngIf="tlsStatus?.daysLeft && tlsStatus?.daysLeft < 30" class="warning-box">
          ⚠️ Certificado expirará pronto. Por favor renovar.
        </div>
      </div>
      
      <mat-divider></mat-divider>
      
      <h3>Cargar Certificados</h3>
      <div class="upload-section">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Certificado (.crt o .pem)</mat-label>
          <input matInput type="file" 
                 #certInput accept=".crt,.pem" (change)="onCertificateSelected($event)">
          {{ certificateFile?.name || 'Sin seleccionar' }}
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Private Key (.key o .pem)</mat-label>
          <input matInput type="file" 
                 #keyInput accept=".key,.pem" (change)="onPrivateKeySelected($event)">
          {{ privateKeyFile?.name || 'Sin seleccionar' }}
        </mat-form-field>
        
        <button mat-raised-button color="primary" (click)="uploadCertificates()">
          <mat-icon>upload</mat-icon> Subir Certificados
        </button>
      </div>
      
      <mat-divider></mat-divider>
      
      <div *ngIf="tlsStatus?.enabled">
        <button mat-raised-button color="warn" (click)="disableHttps()">
          <mat-icon>security_off</mat-icon> Desactivar HTTPS
        </button>
      </div>
      <div *ngIf="!tlsStatus?.enabled && certificateFile && privateKeyFile">
        <button mat-raised-button color="accent" (click)="enableHttps()">
          <mat-icon>security</mat-icon> Activar HTTPS
        </button>
      </div>
    </mat-card-content>
  </mat-card>
</mat-tab>
```

**6. docker-compose.yml (agregar puertos HTTPS)**
```yaml
backend:
  ports:
    - "3000:3000"    # HTTP
    - "8443:8443"    # HTTPS (opcional)
  volumes:
    - ./certs:/app/certs   # Volumen para certificados (compartir con host)
```

**Ventajas de esta implementación:**
✅ No requiere reconstruir imagen Docker
✅ Certificados almacenados encriptados en MongoDB
✅ Validación automática de certificados
✅ UI intuitiva (similar a Portainer)
✅ Warnings si certificado está por expirar
✅ Fallback a HTTP si HTTPS falla
✅ Soporte para cambiar certificados sin restart de contenedor
✅ Compatible con certificados autofirmados y válidos

---

### 2. Propuestas de Mejora y Nuevas Funcionalidades

#### **B2a** ✅ **COMPLETADO - Reordenar y Clarificar Menú Lateral**
- **Cambios aplicados:**
    - Checklist (Admin) movido al bloque de Configuración (Admin).
    - Texto "Escalación" ya corregido.
- **Archivo modificado:**
    - `frontend/src/app/pages/main/main-layout.component.ts`

#### **B2b** **Visualizador de Logs de Auditoría**
- **Descripción:** El backend registra la actividad de los usuarios (`AuditLog`), pero no hay una interfaz para que un administrador/auditor pueda consultar esta información. La trazabilidad es fundamental.
- **Propuesta:**
    - Crear una nueva sección en el área de administración llamada "Logs de Auditoría" o "Trazabilidad".
    - Esta vista debe mostrar un registro de eventos: inicios de sesión (éxito/fallo), dirección IP, fecha/hora, y acciones de CRUD sobre registros importantes.
    - Implementar filtros por usuario, rango de fechas y tipo de acción.
    - Asegurarse de que el middleware de auditoría (`audit.js`) se aplique a todas las rutas críticas del backend.
    - estos log no seran las entradas  que va agregando el n1  todos los dias, pero si podre ver que el user agrego una nueva entrada mas no su conetanido ya que eos esta en otro sector, tambien  si realizo el checklist mas no su contenido  ya que tambein eso se puede ver en otra seccion del desarrollo

#### **B2c** **Funcionalidad de "Purgar Datos" Segura**
- **Descripción:** No existe una forma de eliminar todos los datos de la aplicación de forma masiva.
- **Propuesta:**
    - Añadir un botón en "Backup y Exportación" llamado "Purgar Todos los Datos".
    - Implementar un mecanismo de confirmación de alta seguridad para prevenir la activación accidental (ej. requerir escribir una frase de confirmación y/o re-autenticación).
    - ✅ Implementado: tarjeta en Backup con confirmación "PURGAR TODO" y endpoint admin `/api/backup/purge`.

#### **B2d** ✅ **COMPLETADO - Gestión de Tags: Ver Entradas por Tag**
- **Solución aplicada:**
    - En la tabla de "Tags", el contador de uso ahora es clickeable.
    - Navega a "Todas las Entradas" con filtro `?tag=...`.
    - No requiere cambios de backend (se usa filtro existente por tags).
- **Archivos modificados:**
    - `frontend/src/app/pages/main/tags/tags.component.html`
    - `frontend/src/app/pages/main/tags/tags.component.ts`
    - `frontend/src/app/pages/main/tags/tags.component.scss`
    - `frontend/src/app/pages/main/all-entries/all-entries.component.ts`

#### **B2e** ✅ **COMPLETADO - "Mis Entradas" y "Ver Todas": Mejorar Visualización de Contenido**
- **Solución aplicada:**
    - Se agregó botón "Ver" (`visibility`) en "Mis Entradas".
    - Reutiliza el diálogo `EntryDetailDialogComponent` ya usado en "Ver Todas".
- **Archivos modificados:**
    - `frontend/src/app/pages/main/my-entries/my-entries.component.ts`
    - `frontend/src/app/pages/main/my-entries/my-entries.component.html`

#### **B2f** **Reportes y Estadísticas: Añadir Gráficos**
- **Problema:** La sección de "Reportes y Estadísticas" necesita ser más visual.
- **Propuesta:**
    - Añadir un gráfico de líneas que muestre la tendencia de entradas creadas por día (últimos 7/15/30 o custom días).
    - **Implementación:** Usar una librería como **NGX-Charts** y consumir los datos del endpoint `GET /api/reports/overview` (campo `entriesTrend`).
    - Poder ver los  incidentes  tambien graficamente
    - Graficas  por tag  qu tiene el sistema  asi ver  que tag por tendencia (líneas múltiples) comparar 3–5 tags (seleccionables) y ver su curva. 
    - Un mapa de calor día vs hora para ver: horas muertas, picos reales  de entradas

#### **B2g** ✅ **COMPLETADO - Módulo de Recuperación de Contraseña**
- **Solución implementada:**
    - Backend: Endpoints `/api/auth/forgot-password` y `/api/auth/reset-password` con tokens SHA256 de 1 hora
    - Modelo User: Campos `resetPasswordToken` y `resetPasswordExpires`
    - Frontend: ForgotPasswordComponent y ResetPasswordComponent con rutas `/auth/forgot-password` y `/auth/reset-password`
    - Email HTML con estilos y botón de acción (solo envía si SMTP configurado)
    - Tokens de desarrollo mostrados si SMTP no configurado (fallback seguro)
- **Archivos modificados:**
    - `backend/src/routes/auth.js` - Endpoints de password recovery
    - `backend/src/models/User.js` - Campos de reset token
    - `frontend/src/app/pages/auth/forgot-password/` - Componente + módulo + ruta
    - `frontend/src/app/pages/auth/reset-password/` - Componente + módulo + ruta
    - `frontend/src/app/app-routing.module.ts` - Rutas de password recovery
- **Notas:**
    - Email enviado cuando SMTP configurado (independiente de NODE_ENV)
    - URL de reset: `{FRONTEND_URL}/auth/reset-password?token=...`
    - Navegación corregida: todos los botones usan `/login` (no `/auth/login`)

#### **B2g-smtp** ✅ **COMPLETADO - Configuración SMTP con Destinatarios Opcionales**
- **Problema:** No se podía guardar la configuración SMTP sin destinatarios
- **Solución implementada:**
    - Backend: Validación de `recipients` cambiada a `.optional()`
    - Frontend: Campo `recipientsText` sin Validators.required
    - Test de conexión funciona sin destinatarios (solo verifica SMTP)
    - Auto-detección SSL: Puerto 465 = SSL directo, Puerto 587 = STARTTLS
    - ENCRYPTION_KEY corregido: 64 caracteres hex (32 bytes) para AES-256-GCM
- **Archivos modificados:**
    - `backend/src/routes/smtp.js` - Validadores y lógica de prueba
    - `backend/src/utils/encryption.js` - Verificado soporte 32 bytes
    - `frontend/src/app/pages/main/settings/settings.component.ts` - Validación opcional
    - `frontend/src/app/pages/main/settings/settings.component.html` - Hints actualizados
    - `.env` - ENCRYPTION_KEY actualizado a 64 caracteres hex
- **Beneficios:**
    - Se puede probar conexión SMTP sin configurar destinatarios
    - Los emails se envían automáticamente en password recovery si SMTP configurado
    - Compatible con Office365 y otros proveedores SMTP estándar

#### **B2h** ✅ **COMPLETADO - Reorganización de la Página de Configuración**
- **Cambios aplicados:**
    - "Cooldown Checklist" movido a "Checklist (Admin)".
    - Texto de SMTP clarificado: "Enviar correo solo si hay servicios en rojo (si no, envía siempre)".
    - Ajustes ahora separa Modo Invitado y SMTP claramente.
- **Archivos modificados:**
    - `frontend/src/app/pages/main/settings/settings.component.html`
    - `frontend/src/app/pages/main/settings/settings.component.ts`
    - `frontend/src/app/pages/main/checklist-admin/checklist-admin.component.html`
    - `frontend/src/app/pages/main/checklist-admin/checklist-admin.component.ts`
    - `frontend/src/app/pages/main/checklist-admin/checklist-admin.component.scss`

#### **B2i** **Selector de Cliente en “Nueva Entrada” + Cliente en búsqueda y resultados (sin depender de tags)**
- **Contexto:** En la pantalla **Nueva Entrada** hay espacio libre en el panel derecho para mostrar los **clientes (Log Sources)**. Los clientes se gestionan en **Catalog Admin → 🖥️ Log Sources / Clientes**.
- **Objetivo:** Seleccionar cliente al crear entrada, guardar `clientId` como campo estructurado, autoinyectar tag del cliente y permitir filtro/columna por cliente sin depender solo de tags.
- **Alcance funcional:**
    1. **Nueva Entrada:** agregar bloque “Cliente” con combo/autocomplete; al seleccionar se setea `clientId`; se agrega el tag del cliente si no existe; al cambiar se reemplaza solo el tag de cliente.
    2. **Modelo de datos:** agregar `clientId` y opcional `clientName`/`clientTag` en `Entry` para filtrado consistente.
    3. **Buscar Entradas:** filtro “Cliente” con opción “Todos”; filtrar por `clientId`; botón “Limpiar” también lo resetea.
    4. **Resultados:** columna “Cliente” (ideal código corto con tooltip de descripción).
- **Backend/API:**
    - Reutilizar `GET /api/catalog/log-sources` (listado/autocomplete) y devolver también `tag`/`slug`.
    - `POST /api/entries` acepta `clientId`, valida activo y (opcional) inyecta `clientTag` en `tags`.
    - `GET /api/entries` agrega filtro por `clientId`.
- **Migración:** agregar `clientId` en DB; opcional job para mapear histórico desde tags usando `tag/slug`.
- **Permisos:** lectura de clientes para cualquier rol que crea/ve entradas; catálogo sigue solo admin.
- **Definition of Done:**
    - [ ] Bloque “Cliente” visible en “Nueva Entrada” y carga desde catálogo (sin hardcode).
    - [ ] Selección agrega tag del cliente y guarda `clientId`.
    - [ ] Cambio de cliente reemplaza solo el tag de cliente.
    - [ ] Filtro “Cliente” en búsqueda + columna en resultados.
    - [ ] DB guarda `clientId` en nuevas entradas.
- **Implementación sugerida (código):**
    - **Backend:** `backend/src/models/CatalogLogSource.js` agregar `tag`/`slug`; `backend/src/routes/catalog.js` incluir `tag` en `.select`; `backend/src/models/Entry.js` agregar `clientId`/`clientName` + índices; `backend/src/routes/entries.js` validar `clientId`, inyectar tag y filtrar.
    - **Frontend:** `frontend/src/app/models/catalog.model.ts` agregar `tag`; `frontend/src/app/pages/main/entries/entries.component.html` agregar selector (ideal `app-entity-autocomplete`); `frontend/src/app/pages/main/entries/entries.component.ts` manejar `clientId` y merge de tag; `frontend/src/app/models/entry.model.ts` y `frontend/src/app/services/entry.service.ts` agregar `clientId`; `frontend/src/app/pages/main/all-entries/all-entries.component.html` y `frontend/src/app/pages/main/all-entries/all-entries.component.ts` añadir filtro/columna.
- **Nota técnica:** hoy los tags se extraen del `content`; para el tag cliente se puede (a) insertar `#tag` en el texto en UI o (b) permitir `clientTag` en backend y mergear con `extractHashtags`.

#### **B2j** **Tabla RACI por cliente en Escalamiento**
- **Contexto:** En `/main/escalation/view` se usa `frontend/src/app/pages/escalation/escalation-simple/escalation-simple.component.ts` con un combo de cliente y una tabla de contactos. Se requiere agregar una tabla RACI debajo, reutilizando el mismo selector de cliente.
- **Objetivo:** Mostrar la matriz RACI de cada cliente (y opcionalmente por servicio) con un formato similar a la tabla de contactos de escalamiento.
- **UI propuesta:**
    - Nueva sección “📋 RACI” debajo de “Contactos de Escalamiento”.
    - Reusar `selectedClient`/`selectedClientData` para filtrar.
    - Mostrar mensaje tipo “No hay datos de RACI disponibles” si no hay registros.
- **Admin:** Agregar un menú/pestaña “RACI” en `frontend/src/app/pages/escalation/escalation-admin-simple/escalation-admin-simple.component.html` para crear/editar/borrar RACI, análogo al flujo de contactos.
- **Backend/API:**
    - Nuevo modelo `RaciEntry` (o similar) con `clientId`, `serviceId` (opcional), `actividad`/`proceso`, `responsable`, `aprobador`, `consultado`, `informado`, `notas`, `active`.
    - Lectura: `GET /api/escalation/raci?clientId=...` (analyst/admin).
    - Admin: `GET/POST/PUT/DELETE /api/escalation/admin/raci`.
- **Frontend:** Extender `frontend/src/app/services/escalation.service.ts` y `frontend/src/app/models/escalation.model.ts` con modelos y métodos RACI.
- **Preguntas abiertas:** ¿RACI debe referenciar contactos (IDs) o texto libre? ¿Es por cliente completo o por servicio? ¿Se necesitan emails/teléfonos visibles en la tabla?

#### **B2k** **Checklist: borrado admin + ocultar iconos + rehacer checklist diario**
- Solo admins pueden borrar un checklist.
- Usuarios normales no ven iconos/acciones de borrado.
- Si se borra el checklist del día, se puede crear nuevamente para ese mismo día.
- ✅ Implementado: botón de borrar en historial solo para admin + endpoint `/api/checklist/check/:id` + cooldown solo aplica mismo día.


#### **B2l** **Integracion API generica / Webhooks (GLPI y otros)**
- **Objetivo:** Permitir integrar la Bitacora con servicios externos via API para enviar entradas, checklists o resumenes automaticos.
- **Requisitos clave:**
    - Soportar distintos tipos de API (REST/HTTP) con metodo, URL, headers y body configurables.
    - Autenticacion flexible: API Key, Bearer, Basic, OAuth2 (client credentials).
    - Plantillas de payload con variables (ej: `{{date}}`, `{{entries}}`, `{{checklist}}`, `{{shift}}`) y soporte JSON / form-data.
    - Reintentos + cola si el servicio externo falla (no bloquear la app).
- **UI/Admin:**
    - Nueva seccion "Integraciones" (similar a SMTP) para crear/editar/testear conectores.
    - Boton "Probar envio" y vista de historial de envios (ok/fail).
- **Backend (sugerido):**
    - Nuevo modelo `IntegrationConfig` (y opcional `IntegrationDelivery`/`OutboundJob` para cola/reintentos).
    - Rutas nuevas `/api/integrations` (CRUD + `/test` + `/deliveries`).
    - Util `integrationDispatcher` para enviar requests (reusar patron de `backend/src/utils/logForwarder.js`).
    - Cifrar secretos como en `backend/src/routes/smtp.js` (`utils/encryption`).
- **Ejemplo GLPI:**
    - Conector predefinido para crear ticket desde entradas del dia.
    - Titulo personalizable (ej: `Ticket CSC {{date}}`).
    - Cuerpo con resumen + listado de entradas (formato HTML o texto).
- **Archivos relevantes para implementar:** `backend/src/routes/entries.js`, `backend/src/routes/checklist.js`, `backend/src/utils/logForwarder.js`, `backend/src/routes/smtp.js`.

#### **B2o** **Envío automático de entradas a GLPI al cierre de turno (depende de B2l)**
- **Objetivo:** Configurar una integración específica con GLPI para que, al hacer cierre de turno, se envíen automáticamente todas las entradas del día como un ticket.
- **Flujo propuesto:**
    1. Admin configura conector GLPI en "Integraciones" (URL, API token, etc.) - reutiliza B2l.
    2. Al registrar `POST /api/checklist/check` con `type = cierre`, verificar si existe conector GLPI activo.
    3. Si sí, obtener todas las entradas del día para el usuario (`createdAt >= 00:00:00 && createdAt <= 23:59:59`).
    4. Construir payload con formato de ticket (título personalizable, descripción, tags, incidentes).
    5. Enviar a GLPI via API; registrar resultado (ok/fallo) en una tabla de auditoría.
- **Datos que se envían a GLPI:**
    - Título: `Turno SOC - {fecha} - {analista}` (personalizable)
    - Descripción: resumen de entradas (cantidad total, incidentes, tags top)
    - Listado de entradas: fecha, tipo, tags, contenido (si configurado)
    - Estado general: ok/con problemas (basado en rojos en checklist)
- **UI/Admin:**
    - En "Integraciones", opción para marcar conector como "auto-enviar al cierre de turno"
    - Checkbox: "Incluir detalles de entradas en ticket"
    - Vista de historial: últimos envíos a GLPI (fecha, resultado, ticket ID si aplica)
- **Backend (basado en B2l):**
    - Usar modelo `IntegrationConfig` de B2l con campo adicional `autoOnShiftClose: boolean`
    - En `backend/src/routes/checklist.js`, al procesar cierre: buscar `IntegrationConfig` con `autoOnShiftClose=true`
    - Construir payload y llamar a `integrationDispatcher` (de B2l)
    - Guardar resultado en tabla `ShiftClosureLog` (o similar)
- **Validación:**
    - Si GLPI no responde, registrar error pero permitir que el cierre de turno se complete normalmente (no bloquear)
    - Log de todos los intentos de envío
- **Archivos relevantes:** `backend/src/models/IntegrationConfig.js`, `backend/src/routes/checklist.js`, `backend/src/routes/integrations.js`, `backend/src/utils/integrationDispatcher.js`

**Implementación técnica propuesta:**

**1. Modelo: IntegrationConfig.js (de B2l, extendido para B2o)**
```javascript
const integrationConfigSchema = new mongoose.Schema({
  name: String, // 'GLPI', 'Zendesk', etc.
  provider: { type: String, enum: ['glpi', 'generic'], default: 'generic' },
  url: String,
  authType: { type: String, enum: ['api-key', 'bearer', 'basic', 'oauth2'] },
  apiKey: String, // Encriptado con utils/encryption
  // Campos GLPI específicos
  projectId: Number, // ID del proyecto en GLPI
  categoryId: Number, // ID categoría de ticket
  assignedGroup: String, // Grupo asignado
  // Auto-envío al cierre
  autoOnShiftClose: { type: Boolean, default: false },
  includeEntryDetails: { type: Boolean, default: true },
  templateTitle: { type: String, default: 'Turno SOC - {{date}} - {{analyst}}' },
  active: { type: Boolean, default: true }
}, { timestamps: true });
```

**2. Modificación en checklist.js (línea ~550, después de sendChecklistEmail):**
```javascript
// Si es cierre de turno, intentar enviar a GLPI
if (type === 'cierre') {
  try {
    const IntegrationConfig = require('../models/IntegrationConfig');
    const glpiConfig = await IntegrationConfig.findOne({ 
      name: 'GLPI', 
      active: true,
      autoOnShiftClose: true 
    });

    if (glpiConfig) {
      // Obtener entradas del día
      const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
      const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));
      
      const entries = await Entry.find({
        createdBy: userId,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }).sort({ createdAt: -1 });

      // Contar tipos
      const incidents = entries.filter(e => e.entryType === 'incidente').length;
      const operational = entries.filter(e => e.entryType === 'operativa').length;

      // Top tags
      const tagCounts = {};
      entries.forEach(e => {
        e.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag);

      // Construir payload GLPI
      const glpiPayload = {
        input: {
          name: glpiConfig.templateTitle
            .replace('{{date}}', new Date().toLocaleDateString('es-CL'))
            .replace('{{analyst}}', req.user.fullName || req.user.username),
          content: `
**Resumen de Turno SOC**
- Total entradas: ${entries.length}
- Incidentes: ${incidents}
- Operativas: ${operational}
- Tags principales: ${topTags.join(', ') || 'N/A'}
- Servicios con problemas: ${normalizedServices.filter(s => s.status === 'rojo').map(s => s.serviceTitle).join(', ') || 'Ninguno'}

**Detalles:**
${glpiConfig.includeEntryDetails ? entries.map(e => 
  `- [${e.entryType}] ${e.entryDate} ${e.entryTime}: ${e.content.substring(0, 100)}...`
).join('\n') : 'Detalles omitidos'}
          `,
          type: 'incident',
          itilcategories_id: glpiConfig.categoryId,
          groups_id_assign: glpiConfig.assignedGroup
        }
      };

      // Llamar a integrationDispatcher (de B2l)
      const { sendViaIntegration } = require('../utils/integrationDispatcher');
      const result = await sendViaIntegration(glpiConfig, glpiPayload);

      // Guardar en ShiftClosure
      const closure = new ShiftClosure({
        userId,
        shiftStartAt: lastCheck?.createdAt || startOfDay,
        shiftEndAt: new Date(),
        closureCheckId: check._id,
        summary: {
          totalEntries: entries.length,
          totalIncidents: incidents,
          servicesDown: normalizedServices.filter(s => s.status === 'rojo').map(s => s.serviceTitle)
        },
        sentVia: 'api',
        integrationName: 'GLPI',
        sentAt: new Date(),
        sentStatus: result.success ? 'success' : 'failed',
        sentError: result.error || null
      });
      await closure.save();

      logger.info({ userId, ticketId: result.ticketId }, 'GLPI ticket sent successfully');
    }
  } catch (glpiError) {
    logger.error({ err: glpiError, userId }, 'Error sending to GLPI');
    // No bloquear el cierre si falla GLPI
  }
}
```

**3. Modelo: IntegrationDelivery.js (para auditoría)**
```javascript
const integrationDeliverySchema = new mongoose.Schema({
  integrationConfigId: { type: mongoose.Schema.Types.ObjectId, ref: 'IntegrationConfig' },
  event: { type: String, enum: ['shift-close', 'manual-trigger', 'scheduled'] },
  payload: mongoose.Schema.Types.Mixed, // payload enviado
  response: mongoose.Schema.Types.Mixed, // respuesta de GLPI
  statusCode: Number,
  success: Boolean,
  externalId: String, // ticket ID en GLPI
  error: String,
  sentAt: Date
}, { timestamps: true });

integrationDeliverySchema.index({ integrationConfigId: 1, createdAt: -1 });
```

**4. Ruta /api/integrations (de B2l)**
```javascript
// GET /api/integrations - Listar integraciones (admin)
router.get('/integrations', authenticate, authorize('admin'), async (req, res) => {
  const configs = await IntegrationConfig.find({});
  res.json(configs);
});

// POST /api/integrations - Crear/actualizar integración (admin)
router.post('/integrations', authenticate, authorize('admin'), async (req, res) => {
  const { name, provider, url, authType, apiKey, autoOnShiftClose, includeEntryDetails, templateTitle, active } = req.body;
  let config = await IntegrationConfig.findOne({ name });
  
  if (!config) {
    config = new IntegrationConfig({ name, provider });
  }
  
  Object.assign(config, {
    url, authType, autoOnShiftClose, includeEntryDetails, templateTitle, active,
    apiKey: encrypt(apiKey) // Encriptar
  });
  
  await config.save();
  res.json(config);
});

// GET /api/integrations/deliveries - Historial de envíos
router.get('/integrations/deliveries', authenticate, authorize('admin'), async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const deliveries = await IntegrationDelivery.find({})
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  
  res.json(deliveries);
});
```

**5. Utilidad: integrationDispatcher.js (de B2l)**
```javascript
const nodemailer = require('nodemailer');
const axios = require('axios');
const { decrypt } = require('./encryption');

const sendViaIntegration = async (config, payload) => {
  try {
    const authHeader = {
      'api-key': `${decrypt(config.apiKey)}`,
      'bearer': `Bearer ${decrypt(config.apiKey)}`,
      'basic': `Basic ${Buffer.from(`${decrypt(config.apiKey)}`).toString('base64')}`
    };

    const response = await axios.post(config.url, payload, {
      headers: {
        'Authorization': authHeader[config.authType],
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    return {
      success: true,
      ticketId: response.data?.id || response.data?.ticket_id,
      statusCode: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      statusCode: error.response?.status || 0
    };
  }
};

module.exports = { sendViaIntegration };
```

**Flujo de uso:**
1. Admin crea integración GLPI: URL, API token, categoría, grupo.
2. Admin activa "Auto-enviar al cierre de turno".
3. Analista hace cierre: endpoint POST /api/checklist/check con `type=cierre`.
4. Backend valida checklist, crea registro ShiftCheck.
5. Backend detecta configuración GLPI activa y reúne entradas del día.
6. Construye payload y envía via integrationDispatcher.
7. Resultado se guarda en ShiftClosure (success/failed/error).
8. Admin puede ver historial en "Integraciones → Historial de Envíos".

#### **B2m** **Estado de turno + cierre automatico (envio via integracion)**
- **Objetivo:** Registrar el estado del turno y, al hacer "cierre de turno", enviar automaticamente checklist + entradas del periodo a una integracion (ej: GLPI).
- **Flujo propuesto:**
    1. Al registrar `POST /api/checklist/check` con `type = cierre`, construir resumen del turno.
    2. Determinar rango de entradas: desde el ultimo `inicio` del usuario (o 00:00 si no existe) hasta la hora de cierre.
    3. Enviar el payload a la integracion seleccionada (si falla, reintentos en cola).
- **Datos que deben viajar:**
    - Checklist cierre (servicios, rojos, observaciones).
    - Entradas del periodo (y/o resumen por tipo + tags top).
    - Metadatos del turno: analista, fechas, estado general.
- **UI:**
    - Mostrar "Estado de turno" (ultimo inicio/cierre y si el cierre fue enviado).
    - Confirmacion de envio y estado (ok/pendiente/fallo).
    - Configuracion admin: elegir envio via API o via correo; si es correo permitir multiples destinatarios.
    - Nota: el envio por correo requiere SMTP configurado previamente.
- **Backend (sugerido):**
    - Servicio `shiftClosureService` que arma el payload y dispara `integrationDispatcher`.
    - Guardar un registro `ShiftClosure` para evitar doble envio.
- **Archivos relevantes:** `frontend/src/app/pages/main/checklist/checklist.component.ts`, `frontend/src/app/pages/main/checklist/checklist.component.html`, `backend/src/routes/checklist.js`, `backend/src/models/ShiftCheck.js`, `backend/src/models/Entry.js`.
---

#### **B2n** **Exportacion de metricas/uso para BI (Metabase, PowerBI, etc.)**
- **Objetivo:** Exponer metricas de uso (entradas por cliente/tag, checklists, incidentes, actividad por usuario/turno) de forma simple y consumible por herramientas BI.
- **Alcance propuesto:**
    - Dataset agregado: entradas por dia/cliente/tag, checklists por estado, incidentes por severidad/estado, actividad por usuario/turno.
    - Dataset detallado opcional: entradas y checklists con campos normalizados (sin contenido sensible).
    - Rango de fechas, filtros por cliente/tag/usuario/estado.
- **Opciones de entrega:**
    1. **API de reportes/metricas** (JSON): `GET /api/metrics/*` con endpoints agregados y paginacion.
    2. **Exportacion programada** (CSV/JSON) a almacenamiento o endpoint externo (reutilizar B2l integraciones).
    3. **Conector directo BI**: vista "read-only" con token dedicado y permisos de solo lectura.
- **Seguridad:**
    - Campos anonimizados o sin texto libre (contenido de entradas fuera).
    - Roles: solo admin o rol auditor.
    - Rate limit y logging de accesos.
- **Sugerencia tecnica:**
    - Crear un modelo/vista `metrics` en backend (aggregation pipeline) con cache por dia.
    - Reutilizar indices existentes y agregar indices en `clientId`, `createdAt`, `tags`, `severity`.
    - Exponer un endpoint de "schema" para que BI pueda descubrir campos.

### 3. Propuestas Arquitectónicas

#### **B3a** **Etiquetas de Cargo + Rol Auditor (sobre roles existentes)**
- **Contexto:** Ya existen los roles base (`user` y `admin`); no es necesario rehacer RBAC completo.
- **Propuesta:**
    1.  **Etiquetas de cargo:** Crear/editar etiquetas como "N1", "N2", "N3", "Custom", etc. Deben estar conectadas a los roles existentes.
    2.  **Reglas de combinacion:** Un usuario con etiqueta "N1" nunca puede ser `admin`. Las etiquetas "N2" y "N3" si pueden ser `admin` solo si un admin lo habilita.
    3.  **Rol/Usuario Auditor:** Usuario con etiqueta/rol "Auditor" con acceso de solo lectura a todo lo que ve un admin, sin modificar nada.
    4.  **UI de administracion:** El admin puede crear/editar etiquetas y asignarlas a los usuarios.
---

### 4. Observaciones Técnicas Adicionales

-   **B4-1** ✅ **COMPLETADO - Archivo de Backup:** Eliminado `backend/src/routes/backup.js.bak`.
-   **B4-2** ✅ **COMPLETADO - Validación de Variables de Entorno:** Validación al inicio del servidor para `MONGODB_URI`, `JWT_SECRET` y `ALLOWED_ORIGINS` en producción.
-   **B4-3** **Pruebas Automatizadas:** Considerar añadir un framework de pruebas (como Jest) al backend.
-   ✅ Implementado: `jest.config.js` + `jest.setup.js` y test base de `utils/encryption`.
-   **B4-4** **Consistencia en Nombres:** Estandarizar el nombrado de archivos a `kebab-case`.
    - **Nota:** No hacer renombre masivo. Definir alcance (ej: solo `backend/src/routes` o una carpeta específica) y actualizar imports manualmente.
    - **Motivo:** Cambio masivo rompe rutas/imports y requiere mucha verificación.
-   **B4-5** ✅ **COMPLETADO - Error Tipográfico:** Corregir el texto "titulo escalamiento en el lateral esta mal escrito hay que reparar eso" (Commit d3112bd).
-   **B4-6** ✅ **COMPLETADO - Login con correo como con nombre de usuario:** 
    - **Solución implementada:**
      - Backend: Modificado `POST /api/auth/login` para buscar usuario con `$or: [{ username }, { email: username }]`
      - Frontend: Actualizado label "Usuario o Email" y mensaje de error
    - **Archivos modificados:**
      - `backend/src/routes/auth.js` - Query con $or
      - `frontend/src/app/pages/login/login.component.html` - Label y mensajes
    - **Beneficio:** Usuarios pueden iniciar sesión con username o email indistintamente
-   **B4-7** **Aviso analistas de checklist:**  (depende de B3a): Avisar al analista de turno (etiqueta N1_NO_HABIL) y a usuarios con etiqueta N2 cuando el checklist no se realiza antes de 09:30 (el horario se puede cambiar, solo admins pueden hacerlo). En Administracion de Escalaciones, los turnos se definen con etiquetas de cargo (B3a) y se respeta la regla: N1 nunca es admin; N2/N3 pueden ser admin si el admin lo habilita. esto evita enviar correos a admins que no sean N2.


### 5. Revisiones de seguridad y auditoria

#### **C1-1** **Analisis de seguridad general (revision + reparacion segura)**
- **Objetivo:** revisar backend + frontend y aplicar hardening sin romper flujos (evitar CSP/CORS tan restrictivos que dejen el sistema inutilizable).
- **Hallazgos concretos en el codigo (sugerencias puntuales):**
    - **Rate limit de login no aplicado:** existe `loginLimiter` en `backend/src/middleware/rateLimiter.js`, pero no se usa en `backend/src/routes/auth.js`. Agregarlo en `POST /api/auth/login` y un limiter suave en `POST /api/auth/refresh` para evitar abuso sin bloquear usuarios reales.
    - **Logs sensibles en auth:** hay `console.log` con detalles de login en `backend/src/routes/auth.js` y `frontend/src/app/services/auth.service.ts`. Dejar solo en `NODE_ENV !== 'production'` o eliminarlos para no filtrar info en logs.
    - **CORS en prod puede abrirse con `*`:** en `backend/src/server.js` se permite `*` si `ALLOWED_ORIGINS` lo contiene. Como el requisito SOC es "sin *", bloquearlo en produccion y dejar el wildcard solo en desarrollo, con log de advertencia si se detecta.
    - **CSP deshabilitado:** `helmet` tiene `contentSecurityPolicy: false` en `backend/src/server.js`. Habilitar CSP primero en `Report-Only` (1-2 semanas) y con allowlist realista (`img-src 'self' data:`, `style-src 'self' 'unsafe-inline'` si Angular lo requiere) para no romper UI.
    - **Uploads de logo con SVG:** `backend/src/routes/config.js` permite `svg`. Si se mantiene, sanitizar o convertir a PNG antes de guardar; si no, restringir a `png/jpg`. Para `logoUrl` externa, exigir `https` y (ideal) allowlist de dominios.
    - **Path traversal en backups:** `backend/src/routes/backup.js` arma paths con `filename`/`id` directo. Usar `path.basename` + validar extension `.json` para evitar `../` y accesos fuera de `backups/`.
    - **Import de backups sin validacion de archivo:** `POST /api/backup/import` acepta cualquier archivo. Validar MIME/extension y limpiar el temporal siempre, aunque falle el parse.
    - **Autorizaciones inconsistentes:** `GET /api/reports/overview` y `GET /api/notes/admin` solo usan `authenticate` aunque los comentarios sugieren admin. Definir si deben ser admin y ajustar para no exponer datos globales por error.
    - **Sesion JWT de guests:** `POST /api/auth/refresh` permite renovar tokens de invitados indefinidamente (comentado). Limitar ventana de refresh o bloquear guests para evitar sesiones eternas.
    - **JWT en localStorage:** en `frontend/src/app/services/auth.service.ts` el token vive en localStorage. Mitigar XSS (evitar `[innerHTML]` con datos no confiables y revisar sanitizacion) o planificar migracion a cookies httpOnly con CSRF si se requiere mayor robustez.
    - **Password hashing y politicas:** `backend/src/models/User.js` usa bcrypt con 8 rounds y password min 6. Evaluar subir costo de hash (con migracion progresiva en login/cambio de clave) y reglas basicas de complejidad sin afectar usuarios existentes.
- **Plan de reparacion segura (no romper):**
    - Implementar cambios con feature flags o en staging primero; CSP en `Report-Only` con recoleccion de reportes antes de bloquear.
    - CORS/headers: aplicar allowlist y dejar override solo en desarrollo; agregar logs para diagnosticar bloqueos reales.
    - Validar endpoints nuevos de a poco (empezar por backups/auth), con mensajes de error claros para no romper integraciones.
    - Documentar rollback rapido (ej: volver a CSP deshabilitado si algo critico falla).
- **Validacion minima:** smoke tests de login/logout, carga de logo, reportes, backups/restore y creacion de entradas; revisar logs de CSP y CORS antes de endurecer.


### 6. Complementos

#### **D1-1** **Modulo de complementos (plugins)**
- **Objetivo:** habilitar herramientas "extra" (no core) sin incrustarlas en el codigo principal, con activacion/desactivacion rapida por admin y sin romper dependencias del sistema.
- **Casos de uso:** migrar planillas Excel con macros a micro-apps web (ej: generador de consultas AQL, plantillas de analisis, validadores, calculadoras SOC).
- **Principios de diseno:**
    - **Aislado:** cada complemento vive separado del core (carpeta y rutas propias).
    - **Controlado:** solo el admin habilita/deshabilita; usuarios solo usan lo habilitado.
    - **No intrusivo:** no toca modelos principales si no es necesario; si necesita datos, lo hace via API dedicada.
- **Arquitectura propuesta:**
    - **Manifest:** archivo por complemento (`complement.json`) con `id`, `name`, `version`, `description`, `roles`, `entryRoute`, `configSchema`, `dependencies`.
    - **Backend loader:** registra rutas solo para complementos habilitados; expone `GET /api/complements` (lista) y `GET/PUT /api/complements/:id/config` (admin).
    - **Frontend loader:** menu dinamico basado en `GET /api/complements`; cada complemento con su modulo lazy-loaded.
- **Seguridad y gobernanza (para no dejar la embarrada):**
    - Nada de "subir codigo" desde UI; los complementos deben venir versionados desde el repo.
    - Permisos por complemento (roles permitidos) y auditoria de uso (quien, cuando, que accion).
    - Inputs validados y rate-limit en endpoints sensibles (especialmente si genera queries o exportaciones).
- **Modo admin por complemento:** cada complemento puede traer su propia UI admin para cargar/configurar datos (ej: plantillas, consultas validadas, parametros), separada del core.
    - Si necesita datos persistentes, usar **colecciones propias** o una **mini base** separada (mismo MongoDB pero namespace propio) para no mezclar con datos core.
- **Primer complemento recomendado (piloto):**
    - **Generador AQL:** plantillas guardadas, editor con validacion basica, ejemplos por escenario, y export a texto/clipboard.
    - Esto es solo un ejemplo: **Base de ejemplos AQL:** consultas curadas y documentadas por el admin, versionadas por fecha/autor y separadas del core.
    - Evitar ejecucion directa en prod; si se permite, usar modo read-only o ambiente controlado.
**Nota:** AQL es un ejemplo ilustrativo; el modulo sirve para cualquier complemento futuro.
- **Plan de implementacion seguro:**
    1. Definir modelo `Complement` (enabled, config, allowedRoles, updatedBy).
    2. Implementar loader backend con allowlist y feature flag global.
    3. Crear UI admin (activar/desactivar + config) y UI usuario (catalogo de complementos).
    4. Implementar el primer complemento (AQL) y documentar buenas practicas.
    5. Tests de smoke + auditoria basica de uso/errores.

---

## 🔴 BUGS CRÍTICOS - SEGURIDAD Y FUNCIONALIDAD

### B5 - CRÍTICO: Acceso a rutas sin autenticación

**Descripción:**  
Se identificó una vulnerabilidad crítica donde es posible ingresar al sistema y modificar datos sin estar autenticado, conociendo directamente las direcciones/rutas de API.

**Root Cause (investigación):**
- Las rutas de admin (`/api/admin/catalog/*`) aplican `authenticate` + `requireAdmin` middleware correctamente
- Las rutas protegidas (`/api/entries`, `/api/notes`, `/api/checklist`, etc.) requieren JWT válido
- **Sin embargo**, el middleware de autenticación solo valida la presencia del token pero hay casos donde:
  - Rutas desprotegidas pueden ser accedidas sin token
  - Posibles brechas en validación de permisos en ciertos endpoints
  - Falta auditoría de accesos no autorizados

**Impacto:** CRÍTICO - Modificación de datos sin autenticación, acceso a información sensible

**Solución recomendada:**
1. Auditar todas las rutas para asegurar que `authenticate` middleware está aplicado
2. Implementar validación de JWT más estricta (verificar expiración, revocación)
3. Agregar rate limiting por IP para endpoints de recuperación de contraseña
4. Implementar CSRF tokens para cambios de estado críticos
5. Agregar logging detallado de intentos de acceso no autorizado

**Prioridad:** 🔴 CRÍTICO - Solucionar antes de cualquier despliegue

---

### B6 - Dark Mode: Contraste y legibilidad deficientes

**Descripción:**  
El tema oscuro tiene múltiples problemas de legibilidad:
- Cajas de texto blancas con letras blancas (texto invisible)
- Botones ilegibles por falta de contraste
- Líneas/bordes no visibles en componentes
- Información que se pierde por cambio de color a oscuro

**Root Cause (investigación):**
- En `frontend/src/styles.scss` hay variables CSS para tema dark: `--text-primary: #f7f9ff`, `--surface-color: #1a1d27`
- Las reglas de Material Design no se aplican correctamente para inputs y campos
- Los estilos `!important` fuerzan colores pero no tienen suficiente contraste
- Componentes de Material (mdc) no reaccionan bien a los cambios de tema

**Impacto:** ALTO - Imposibilidad de usar la aplicación en modo dark, experiencia de usuario pésima

**Solución recomendada:**
1. Revisar todas las combinaciones color/fondo en dark mode
2. Validar contraste mínimo WCAG AA (4.5:1 para texto, 3:1 para componentes)
3. Ajustar variables CSS para asegurar legibilidad
4. Aplicar estilos específicos a inputs, buttons, labels en dark mode
5. Testear en navegador real con DevTools dark mode
6. Considerar borders/outlines adicionales para componentes sin suficiente contraste

**Prioridad:** 🟠 ALTO - Afecta usabilidad general

---

### C5 - Mejora: Token de recuperación de contraseña - Reducir duración

**Descripción:**  
El token de recuperación de contraseña (`resetPasswordToken`) tiene una duración de **1 hora**, lo cual es demasiado tiempo. Debería reducirse a **5 minutos** por seguridad.

**Root Cause (investigación):**
- En `backend/src/routes/auth.js` línea ~206:
  ```javascript
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
  ```
- No hay validación de intentos fallidos o rate limiting específico para este endpoint
- El token se almacena en BD sin encriptación adicional (solo hash SHA256)

**Impacto:** MEDIO - Riesgo de seguridad (ventana de ataque de 60 min vs 5 min)

**Solución recomendada:**
1. Cambiar duración de 1 hora a 5 minutos: `5 * 60 * 1000`
2. Agregar rate limiting al endpoint `/api/auth/forgot-password` (máx 3 intentos/15 min)
3. Implementar rate limiting al endpoint `/api/auth/reset-password` (máx 5 intentos/token)
4. Considerar token de un solo uso (invalidar después de primer intento fallido)
5. Enviar notificación de seguridad si se solicita reset sin iniciar sesión

**Prioridad:** 🟠 ALTO - Mejora de seguridad

---

### C6 - Mejora: Duración de sesión (JWT) muy larga

**Descripción:**  
Los tokens JWT tienen una duración de **24 horas**, lo cual es muy largo. Para una aplicación SOC, debería reducirse a un tiempo más seguro (ej: 1-2 horas).

**Root Cause (investigación):**
- En `backend/src/routes/auth.js` línea ~30:
  ```javascript
  const expiresIn = role === 'guest' ? '2h' : (process.env.JWT_EXPIRES_IN || '24h');
  ```
- Los tokens de admin/user duran 24 horas (rol 'guest' dura solo 2h)
- No hay refresh token rotation o revocación centralizada
- Las sesiones no se validan contra una lista negra

**Impacto:** MEDIO - Si un token se roba, el atacante tiene 24 horas de acceso

**Solución recomendada:**
1. Reducir duración de JWT a **2 horas** (o 1 hora para admin)
2. Implementar **refresh tokens** con duración mayor (7 días) rotados en cada refresh
3. Agregar endpoint de revocación de tokens (`/api/auth/logout`)
4. Implementar blacklist de tokens revocados en Redis o BD
5. Mostrar advertencia cuando token esté próximo a expirar (~15 min antes)
6. Hacer refresh automático en background antes de expiración

**Prioridad:** 🟠 ALTO - Mejora de seguridad

---

## 🟢 MEJORAS - UX/INTERFACE

### M7 - Agregar tema Cyberpunk/Neon

**Descripción:**  
Agregar un nuevo tema visual estilo "cyberpunk/neon" con colores neón, efectos de brillo, y estética futurista. Similar a interfaces hacker en películas.

**Características deseadas:**
- Colores neón (cian, magenta, verde, amarillo)
- Textos con glow/sombra
- Efectos de hover con animaciones
- Fondo oscuro con tonos azul/púrpura
- Bordes con brillo o efecto neon
- NO replicar los problemas de contraste del dark mode

**Recomendaciones técnicas (pre-investigación):**
1. Agregar nuevo tema en `frontend/src/styles.scss` (ej: `[data-theme="cyberpunk"]`)
2. Variables CSS necesarias:
   - `--primary-color: #0ff` (cian)
   - `--accent-color: #ff00ff` (magenta)
   - `--background-color: #0a0e27` (azul oscuro profundo)
   - `--text-glow-color: #0ff` o `#ff00ff`
   - Nuevas variables para efectos: `--glow-shadow`, `--border-glow`
3. Usar `text-shadow` y `box-shadow` para efecto neón
4. Agregar transiciones suaves para animar cambios
5. Aplicar a través del ThemeService (agregar 'cyberpunk' al enum `Theme`)
6. **Validar contraste** para asegurar legibilidad (evitar problemas dark mode)
7. Testear en componentes principales: inputs, buttons, cards, modals

**Prioridad:** 🟢 BAJA - Feature nice-to-have, no crítica

---

### B8 - Mejora: Edición masiva/individual de entradas (Admin)

**Descripción:**  
Los administradores necesitan poder editar entradas de otros usuarios (de forma individual o masiva) para correcciones y ajustes, pero sin poder alterar la integridad de los datos originales (contenido, hora, fecha, autor).

**Casos de uso:**
- Admin ajusta tipo de entrada (operativa → incidente) de múltiples registros
- Admin reclasifica entradas con tags correctos
- Admin cambia LogSource/Cliente asociado
- Admin modifica entryType en lote para reorganizar datos
- Auditoría: autor/fecha/hora/contenido permanecen intactos (trazabilidad)

**Campos que Admin PUEDE modificar:**
- ✅ `entryType` (operativa/incidente)
- ✅ `tags` (agregar/remover)
- ✅ `clientId` (cambiar Log Source/Cliente)
- ✅ Otros metadatos que se agreguen

**Campos que Admin NO PUEDE modificar (inmutables):**
- ❌ `content` (contenido original)
- ❌ `entryTime` (hora del evento)
- ❌ `entryDate` (fecha del evento)
- ❌ `createdBy` / `createdByUsername` (autor original)
- ❌ `createdAt` / `updatedAt` (timestamps)

**Root Cause (análisis):**
- Actualmente, los usuarios solo pueden editar sus propias entradas
- No existe interfaz de admin para editar/reclasificar entradas de otros
- No existe funcionalidad de edición en lote (bulk edit)
- El backend permite edición de cualquier campo por admin, sin restricciones

**Impacto:** MEDIO - Mejora operacional, necesario para auditoría y correcciones

**Solución recomendada:**

1. **Backend:**
   - Crear endpoint `PATCH /api/entries/admin/bulk-edit` (edición masiva)
   - Crear endpoint `PATCH /api/entries/:id/admin` (edición individual por admin)
   - Validar que solo ciertos campos pueden ser editados por admin
   - Agregar auditoría: registrar quién hizo el cambio y qué se modificó
   - No permitir cambios en: content, entryTime, entryDate, createdBy

2. **Frontend:**
   - Crear componente `AdminEntriesComponent` (similar a All-Entries)
   - Agregar opción de edición en tabla (icono de lápiz)
   - Crear diálogo `AdminEntryEditDialogComponent` con campos restringidos
   - Implementar checkbox en tabla para seleccionar múltiples entradas
   - Agregar botón de "Editar seleccionadas" con formulario de bulk-edit
   - Mostrar advertencia: "Campos no editables: contenido, hora, fecha, autor"

3. **Validaciones:**
   - Solo admin puede usar estos endpoints
   - Validar que nuevos valores sean válidos (ej: entryType ∈ ['operativa', 'incidente'])
   - Validar clientId si se proporciona (debe existir y estar habilitado)
   - No permitir cambios que afecten integridad (ej: cambiar createdBy)

4. **Auditoría:**
   - Registrar en AuditLog cada cambio realizado por admin
   - Campos modificados, valores anteriores/nuevos
   - Admin que realizó el cambio
   - Timestamp del cambio

**Prioridad:** 🟠 MEDIO - Mejora operacional importante

---


