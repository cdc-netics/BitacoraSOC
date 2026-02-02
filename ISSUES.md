# Plan de Trabajo: Bitácora SOC

## Estado general (tabla de control)

| ID | Seccion | Tarea | Estado | Notas |
| --- | --- | --- | --- | --- |
| P1 | Actualizacion Angular 20 | Plan general de actualizacion | Pendiente |  |
| F0-1 | Fase 0 (Preparacion) | Crear rama aislada | Completado | Rama `feature/angular-20-upgrade` creada |
| F0-2 | Fase 0 (Preparacion) | Limpieza del entorno | Completado | Reinstaladas dependencias en backend y frontend |
| F0-3 | Fase 0 (Preparacion) | Verificar pruebas | Completado | `ng test` no configurado (sin target de test) |
| F1-1 | Fase 1 (Angular 18) | ng update core/cli 18 + material 18 | Completado | Angular/CLI/Material/CDK actualizados a 18.2.x |
| F1-2 | Fase 1 (Angular 18) | Analisis y migracion | Completado | Migración HTTP aplicada en `app.module.ts` |
| F1-3 | Fase 1 (Angular 18) | Revision breaking changes | Completado | Sin advertencias adicionales; builder migration opcional pendiente |
| F1-4 | Fase 1 (Angular 18) | Verificacion (ng serve / ng test) | Completado | `ng build` OK; `ng test` no configurado |
| F1-5 | Fase 1 (Angular 18) | Commit upgrade 18 | Completado | Commit local listo |
| F2-1 | Fase 2 (Angular 19) | ng update core/cli 19 + material 19 | Bloqueado | Bug en @angular/build 19.2.x con NgModules |
| F2-2 | Fase 2 (Angular 19) | Analisis y migracion | Bloqueado | Dependiente de F2-1 |
| F2-3 | Fase 2 (Angular 19) | Revision breaking changes | Bloqueado | Dependiente de F2-1 |
| F2-4 | Fase 2 (Angular 19) | Verificacion (ng serve / ng test) | Bloqueado | Dependiente de F2-1 |
| F2-5 | Fase 2 (Angular 19) | Commit upgrade 19 | Bloqueado | Dependiente de F2-1 |
| F3-1 | Fase 3 (Angular 20) | ng update core/cli 20 + material 20 | Pendiente |  |
| F3-2 | Fase 3 (Angular 20) | Analisis y migracion | Pendiente |  |
| F3-3 | Fase 3 (Angular 20) | Revision breaking changes | Pendiente |  |
| F3-4 | Fase 3 (Angular 20) | Verificacion final | Pendiente |  |
| F3-5 | Fase 3 (Angular 20) | Commit upgrade 20 | Pendiente |  |
| F4-1 | Fase 4 (Post-actualizacion) | Revision de dependencias externas | Pendiente |  |
| F4-2 | Fase 4 (Post-actualizacion) | Limpieza de codigo | Pendiente |  |
| F4-3 | Fase 4 (Post-actualizacion) | Merge rama | Pendiente |  |
| B1a | Bugs | Visibilidad en tema oscuro | Pendiente |  |
| B1b | Bugs | Notas no se guardan | Pendiente | Potencialmente resuelto, falta verificacion |
| B2a | Mejoras | Reordenar y clarificar menu lateral | En proceso | Corregido texto "Escalacion"; falta mover "Checklist (Admin)" |
| B2b | Mejoras | Visualizador de logs de auditoria | Pendiente |  |
| B2c | Mejoras | Purgar datos segura | Pendiente |  |
| B2d | Mejoras | Gestion de tags: ver entradas por tag | Pendiente |  |
| B2e | Mejoras | Mis entradas / Ver todas: contenido completo | En proceso | Dialogo listo en "Ver todas", falta "Mis entradas" |
| B2f | Mejoras | Reportes: graficos | Pendiente |  |
| B2g | Mejoras | Recuperacion de contrasena | Pendiente |  |
| B2h | Mejoras | Reorganizacion pagina configuracion | Pendiente |  |
| B2i | Mejoras | Selector de cliente en Nueva Entrada + filtro/columna en busqueda | Pendiente |  |
| B2j | Mejoras | Tabla RACI por cliente (vista + admin Escalamiento) | Pendiente |  |
| B2k | Mejoras | Checklist: borrado admin + ocultar iconos + rehacer checklist diario | Pendiente |  |
| B2l | Mejoras | Integracion API generica (webhooks/conectores) para enviar datos a servicios externos | Pendiente | Ej: GLPI, payload y auth configurables |
| B2m | Mejoras | Estado de turno + cierre automatico: enviar checklist + entradas via integracion | Pendiente | Ticket diario con titulo configurable |
| B2n | Mejoras | Exportacion de metricas/uso para BI (Metabase, PowerBI, etc.) | Pendiente | Uso, entradas, tags, checklists, incidentes |
| B3a | Arquitectura | Etiquetas de cargo + rol auditor | Pendiente |  |
| B4-1 | Observaciones | Eliminar backup.js.bak | Pendiente |  |
| B4-2 | Observaciones | Validacion de variables de entorno | Pendiente |  |
| B4-3 | Observaciones | Pruebas automatizadas backend | Pendiente |  |
| B4-4 | Observaciones | Consistencia en nombres (kebab-case) | Pendiente |  |
| B4-5 | Observaciones | Error tipografico "escalamiento" lateral | Reparado |  |
| B4-6 | Observaciones | Login, poder entrar con  correo como con nombre de usuario | Pendiente |  |
| B4-7 | Observaciones | Aviso analistas de checklist | Pendiente |  |
| C1-1 | Revisiones de seguridad y auditoria | Analisis de seguridad general | Pendiente |  |
| D1-1 | Complementos | Modulo de complementos (plugins) | Pendiente |  |

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

#### Fase 2: Actualización a Angular 19 ⚠️ **BLOQUEADO**

**PROBLEMA DETECTADO (2026-02-02):**

Angular 19.2.x con el nuevo builder `@angular/build:application` tiene un bug donde detecta incorrectamente TODOS los componentes basados en NgModules como componentes `standalone`, causando errores de compilación:

```
ERROR TS-996008: Component AppComponent is standalone, and cannot be declared in an NgModule. 
Did you mean to import it instead?
```

**Componentes afectados:** 
- AppComponent, LoginComponent, MainLayoutComponent, EntriesComponent, ChecklistComponent, ReportsComponent, UsersComponent, SettingsComponent, ProfileComponent, MyEntriesComponent, TagsComponent, LogoComponent, BackupComponent, ChecklistAdminComponent, ChecklistHistoryComponent, CatalogAdminComponent, ReportGeneratorComponent, EntityAutocompleteComponent
- En resumen: TODOS los componentes declarados en NgModules

**Detalles técnicos:**
- El nuevo `@angular/build:application` builder reemplaza a `@angular-devkit/build-angular`
- Está optimizado para aplicaciones standalone (el nuevo estándar de Angular 19+)
- Tiene problemas de compatibilidad con proyectos legacy basados en NgModules
- El compilador falla en la detección de componentes standalone vs NgModule-based

**Soluciones evaluadas:**
1. ❌ Ajustar tsconfig (probado, no funciona)
2. ❌ Usar builder anterior (no disponible en Angular 19)
3. ✅ **Migrar todo el proyecto a Standalone Components** (solución correcta pero requiere migración masiva)
4. ✅ Esperar fix oficial de Angular CLI (recomendado)
5. ✅ Saltar Angular 19 e intentar upgrade directo a Angular 20

**Decisión tomada:** Mantener Angular 18.2.x (estable) y evaluar:
- Esperar Angular 19.3+ con fix
- Evaluar migración a standalone components como proyecto aparte
- Intentar salto directo a Angular 20 cuando esté disponible

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

#### Fase 3: Actualización a Angular 20 (Versión Final)
1.  **F3-1** **Ejecutar Comandos de Actualización:**
    ```bash
    ng update @angular/core@20 @angular/cli@20
    ng update @angular/material@20
    ```
2.  **F3-2** **Análisis y Migración:**
    - Revisar los cambios finales aplicados por `ng update`.
3.  **F3-3** **Revisión Manual de Breaking Changes:**
    - Consultar la guía oficial de v19 a v20.
    - Investigar cambios relacionados con el "Signal-based component features" y APIs del CLI.
4.  **F3-4** **Verificación Final:**
    - Realizar una regresión completa y exhaustiva de toda la aplicación, probando cada vista, formulario y acción del usuario.
5.  **F3-5** **Commit:** `git commit -m "feat(ng): Complete upgrade to Angular 20"`.

#### Fase 4: Post-Actualización
1.  **F4-1** **Revisión de Dependencias Externas:**
    - La dependencia `animejs` no es específica de Angular y debería seguir funcionando, pero se debe verificar su comportamiento.
2.  **F4-2** **Limpieza de Código:** Eliminar cualquier solución temporal o código obsoleto introducido durante el proceso de actualización.
3.  **F4-3** **Merge:** Una vez que la rama `feature/angular-20-upgrade` sea 100% estable y probada, fusionarla con la rama de desarrollo principal.

---

## Backlog de Tareas (Post-Actualización a Angular 20)

### 1. Problemas y Depuración (Bugs)

#### **B1a** **Problemas de visibilidad en el tema oscuro (Dark Mode)**
- **Descripción:** Al activar el tema oscuro, varios textos se vuelven ilegibles debido a un bajo contraste. Esto afecta a elementos generales de la interfaz y es particularmente notorio en el menú desplegable para seleccionar el tema, donde las opciones no son visibles.
- **Solución Sugerida:** Revisar y corregir la paleta de colores del tema oscuro. Asegurarse de que los colores de fuente se inviertan correctamente para garantizar un contraste adecuado sobre fondos oscuros.

#### **B1b** **Las notas no se guardan (Potencialmente resuelto)**
- **Reporte:** El contenido introducido en las notas no se guardaba.
- **Diagnóstico:** El código de autoguardado parecía correcto, sugiriendo un error de ejecución o de entorno.
- **Pasos para Verificar:** Confirmar si el problema persiste. Si es así, revisar la consola del navegador (F12) en busca de errores y la pestaña de Red (Network) para verificar las peticiones `PUT` a la API de notas.

---

### 2. Propuestas de Mejora y Nuevas Funcionalidades

#### **B2a** **Reordenar y Clarificar Menú Lateral**
- **Descripción:** El menú lateral puede ser más intuitivo y tiene errores tipográficos.
- **Propuestas:**
    - Mover el enlace "Checklist (Admin)" para que aparezca directamente debajo de "Configuraciones (Admin)".
    - Corregir el texto "Escalaciones" a "Escalación" para que sea consistente.

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

#### **B2d** **Gestión de Tags: Ver Entradas por Tag**
- **Problema:** La página de gestión de tags no permite ver las entradas asociadas a él.
- **Propuesta:**
    - En la tabla de "Tags", hacer que el contador de uso sea un enlace.
    - Este enlace redirigirá a la vista "Todas las Entradas", filtrada por el tag seleccionado.
    - **Backend:** Requiere un endpoint `GET /api/entries?tag=nombre-del-tag`.

#### **B2e** **"Mis Entradas" y "Ver Todas": Mejorar Visualización de Contenido**
- **Problema:** El contenido de las entradas está truncado o se muestra en un `alert()` poco funcional.
- **Propuesta:**
    - Añadir un botón de "Ver" (`visibility`) que abra una ventana modal (`MatDialog`) para mostrar el contenido completo y formateado de la entrada.
    - Reutilizar este componente de diálogo en ambas secciones ("Mis Entradas" y "Ver Todas").

#### **B2f** **Reportes y Estadísticas: Añadir Gráficos**
- **Problema:** La sección de "Reportes y Estadísticas" necesita ser más visual.
- **Propuesta:**
    - Añadir un gráfico de líneas que muestre la tendencia de entradas creadas por día (últimos 7/15/30 o custom días).
    - **Implementación:** Usar una librería como **NGX-Charts** y consumir los datos del endpoint `GET /api/reports/overview` (campo `entriesTrend`).
    - Poder ver los  incidentes  tambien graficamente
    - Graficas  por tag  qu tiene el sistema  asi ver  que tag por tendencia (líneas múltiples) comparar 3–5 tags (seleccionables) y ver su curva. 
    - Un mapa de calor día vs hora para ver: horas muertas, picos reales  de entradas

#### **B2g** **Módulo de Recuperación de Contraseña**
- **Problema:** No hay opción para recuperar contraseñas olvidadas.
- **Propuesta:**
    - Implementar un flujo completo de "Olvidé mi contraseña" con envío de correo electrónico y un token de reseteo con tiempo de expiración.
    - **Backend:** Nuevos endpoints (`/forgot-password`, `/reset-password`) y campos en el modelo `User`.
    - **Frontend:** Nuevas vistas para solicitar y completar el reseteo.

#### **B2h** **Reorganización de la Página de Configuración**
- **Problema:** La página de configuración es poco clara y mezcla opciones.
- **Propuesta:**
    - Mover el "Cooldown Checklist" a la página de "Checklist (Admin)".
    - Clarificar el texto de la opción "Enviar solo si hay servicios en rojo".
    - Reestructurar la página de Ajustes para separar la configuración de SMTP y el "Modo Invitado".

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

-   **B4-1** **Archivo de Backup:** Eliminar `backend/src/routes/backup.js.bak`.
-   **B4-2** **Validación de Variables de Entorno:** Añadir validación al inicio del servidor (ej. usando Joi o Zod) para asegurar que las variables de entorno requeridas están presentes.
-   **B4-3** **Pruebas Automatizadas:** Considerar añadir un framework de pruebas (como Jest) al backend.
-   **B4-4** **Consistencia en Nombres:** Estandarizar el nombrado de archivos a `kebab-case`.
-   **B4-5** **Error Tipográfico:** Corregir el texto "titulo escalamiento en el lateral esta mal escrito hay que reparar eso".
-   **B4-6** **login con correo como con nombre de usuario:** mejorar esa situacion para que login tambien se pueda usar el correo como usuario
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

