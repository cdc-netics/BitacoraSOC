# Plan de Trabajo: Bitácora SOC

## Estado general (tabla de control)

| ID | Seccion | Tarea | Estado | Notas |
| --- | --- | --- | --- | --- |
| P1 | Actualizacion Angular 20 | Plan general de actualizacion | Pendiente |  |
| F0-1 | Fase 0 (Preparacion) | Crear rama aislada | Pendiente |  |
| F0-2 | Fase 0 (Preparacion) | Limpieza del entorno | Pendiente |  |
| F0-3 | Fase 0 (Preparacion) | Verificar pruebas | Pendiente |  |
| F1-1 | Fase 1 (Angular 18) | ng update core/cli 18 + material 18 | Pendiente |  |
| F1-2 | Fase 1 (Angular 18) | Analisis y migracion | Pendiente |  |
| F1-3 | Fase 1 (Angular 18) | Revision breaking changes | Pendiente |  |
| F1-4 | Fase 1 (Angular 18) | Verificacion (ng serve / ng test) | Pendiente |  |
| F1-5 | Fase 1 (Angular 18) | Commit upgrade 18 | Pendiente |  |
| F2-1 | Fase 2 (Angular 19) | ng update core/cli 19 + material 19 | Pendiente |  |
| F2-2 | Fase 2 (Angular 19) | Analisis y migracion | Pendiente |  |
| F2-3 | Fase 2 (Angular 19) | Revision breaking changes | Pendiente |  |
| F2-4 | Fase 2 (Angular 19) | Verificacion (ng serve / ng test) | Pendiente |  |
| F2-5 | Fase 2 (Angular 19) | Commit upgrade 19 | Pendiente |  |
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
| B3a | Arquitectura | RBAC granular | Pendiente |  |
| B4-1 | Observaciones | Eliminar backup.js.bak | Pendiente |  |
| B4-2 | Observaciones | Validacion de variables de entorno | Pendiente |  |
| B4-3 | Observaciones | Pruebas automatizadas backend | Pendiente |  |
| B4-4 | Observaciones | Consistencia en nombres (kebab-case) | Pendiente |  |
| B4-5 | Observaciones | Error tipografico "escalamiento" lateral | Reparado |  |
| B4-6 | Observaciones | Login, poder entrar con  correo como con nombre de usuario | Pendiente |  |
| B4-7 | Observaciones | Aviso analistas de checklist | Pendiente |  |

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

#### Fase 2: Actualización a Angular 19
1.  **F2-1** **Ejecutar Comandos de Actualización:**
    ```bash
    ng update @angular/core@19 @angular/cli@19
    ng update @angular/material@19
    ```
2.  **F2-2** **Análisis y Migración:**
    - Repetir el proceso de revisión de migraciones automáticas.
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
- **Descripción:** El backend registra la actividad de los usuarios (`AuditLog`), pero no hay una interfaz para que un administrador pueda consultar esta información. La trazabilidad es fundamental.
- **Propuesta:**
    - Crear una nueva sección en el área de administración llamada "Logs de Auditoría" o "Trazabilidad".
    - Esta vista debe mostrar un registro de eventos: inicios de sesión (éxito/fallo), dirección IP, fecha/hora, y acciones de CRUD sobre registros importantes.
    - Implementar filtros por usuario, rango de fechas y tipo de acción.
    - Asegurarse de que el middleware de auditoría (`audit.js`) se aplique a todas las rutas críticas del backend.

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
    - Añadir un gráfico de líneas que muestre la tendencia de entradas creadas por día (últimos 30 días).
    - **Implementación:** Usar una librería como **NGX-Charts** y consumir los datos del endpoint `GET /api/reports/overview` (campo `entriesTrend`).

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

---

### 3. Propuestas Arquitectónicas

#### **B3a** **Sistema de Permisos y Roles Granulares (RBAC)**
- **Problema:** El sistema actual de roles (`admin`, `user`, `guest`) es insuficiente. Se necesita poder asignar permisos específicos a grupos de usuarios.
- **Propuesta:**
    1.  **Backend:** Introducir modelos para `Permission` (ej. `view-reports`) y `Role`. Un `Role` agrupará varios `Permission`. El `User` se asignará a un `Role`.
    2.  **Etiquetas de Rol:** Los roles deben ser personalizables, permitiendo crear etiquetas como "N1", "N2", "N3", "Auditor", "Custom", etc.
    3.  **UI de Administración:** Crear una interfaz para que el admin pueda:
        - Crear/editar roles.
        - Asignar permisos a cada rol.
        - Asignar usuarios a un rol.
    4.  **Aplicación de Permisos:** Actualizar los `guards` de rutas y la lógica de visibilidad de menús para que se basen en permisos específicos, no en roles fijos.

---

### 4. Observaciones Técnicas Adicionales

-   **B4-1** **Archivo de Backup:** Eliminar `backend/src/routes/backup.js.bak`.
-   **B4-2** **Validación de Variables de Entorno:** Añadir validación al inicio del servidor (ej. usando Joi o Zod) para asegurar que las variables de entorno requeridas están presentes.
-   **B4-3** **Pruebas Automatizadas:** Considerar añadir un framework de pruebas (como Jest) al backend.
-   **B4-4** **Consistencia en Nombres:** Estandarizar el nombrado de archivos a `kebab-case`.
-   **B4-5** **Error Tipográfico:** Corregir el texto "titulo escalamiento en el lateral esta mal escrito hay que reparar eso".
-   **B4-6** **login con correo como con nombre de usuario:** mejorar esa situacion para que login tambien se pueda usar el correo como usuario
-   **B4-7** **Aviso analistas de checklist:**  Tiene que avisar - Via correo Electronico- al analista de turno y a los n2  cuanod el checklist no se realiza  antes de 09:30 (el horario se puede cambiar solo los admin pueden hacerlo), en  Administración de Escalaciones  cuando   hago los turnos podriamos ocuar el rol de N1_NO_HABIL  para saber quien esta de turno  y  n2,  igual con el tema de  usuarios de los roles generales de usuarios  habria que agregar  si los admin  son N2  asi no enviar  correos a otros admin que no son N2