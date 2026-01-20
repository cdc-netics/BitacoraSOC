# Reporte de Análisis y Mejoras: Bitácora SOC

## Resumen General

Este documento detalla los hallazgos del análisis del código, problemas conocidos y propuestas de mejora para el proyecto "Bitácora SOC".

En general, el código está bien estructurado. Las siguientes secciones se dividen en:
1.  **Problemas y Depuración:** Bugs o comportamientos inesperados.
2.  **Propuestas de Mejora y Nuevas Funcionalidades:** Sugerencias para mejorar la UX y añadir características.
3.  **Propuestas Arquitectónicas:** Cambios de mayor escala en la estructura de la aplicación.
4.  **Observaciones Técnicas Adicionales:** Otros puntos de mejora a nivel de código.


---

## 1. Problemas y Depuración (Bugs)

### a. Problemas de visibilidad en el tema oscuro (Dark Mode)
- **Descripción:** Al activar el tema oscuro, varios textos se vuelven ilegibles debido a un bajo contraste. Esto afecta a elementos generales de la interfaz y es particularmente notorio en el menú desplegable para seleccionar el tema, donde las opciones no son visibles.
- **Solución Sugerida:** Revisar y corregir la paleta de colores del tema oscuro. Asegurarse de que los colores de fuente se inviertan correctamente para garantizar un contraste adecuado sobre fondos oscuros.

### b. Las notas no se guardan (Potencialmente resuelto)
- **Reporte:** El contenido introducido en las notas no se guardaba.
- **Diagnóstico:** El código de autoguardado parecía correcto, sugiriendo un error de ejecución o de entorno.
- **Pasos para Verificar:** Confirmar si el problema persiste. Si es así, revisar la consola del navegador (F12) en busca de errores y la pestaña de Red (Network) para verificar las peticiones `PUT` a la API de notas.

---

## 2. Propuestas de Mejora y Nuevas Funcionalidades

### a. Reordenar y Clarificar Menú Lateral
- **Descripción:** El menú lateral puede ser más intuitivo.
- **Propuestas:**
    - Mover el enlace "Checklist (Admin)" para que aparezca directamente debajo de "Configuraciones (Admin)".
    - Corregir la etiqueta "Escalaciones" a "Escalación".

### b. Visualizador de Logs de Auditoría
- **Descripción:** El backend registra la actividad de los usuarios (`AuditLog`), pero no hay una interfaz para que un administrador pueda consultar esta información. La trazabilidad es fundamental.
- **Propuesta:**
    - Crear una nueva sección en el área de administración llamada "Logs de Auditoría" o "Trazabilidad".
    - Esta vista debe mostrar un registro de eventos: inicios de sesión (éxito/fallo), dirección IP, fecha/hora, y acciones de CRUD sobre registros importantes.
    - Implementar filtros por usuario, rango de fechas y tipo de acción.
    - Asegurarse de que el middleware de auditoría (`audit.js`) se aplique a todas las rutas críticas del backend.

### c. Funcionalidad de "Purgar Datos" Segura
- **Descripción:** No existe una forma de eliminar todos los datos de la aplicación de forma masiva.
- **Propuesta:**
    - Añadir un botón en "Backup y Exportación" llamado "Purgar Todos los Datos".
    - Implementar un mecanismo de confirmación de alta seguridad para prevenir la activación accidental (ej. requerir escribir una frase de confirmación y/o re-autenticación).

### d. Gestión de Tags: Ver Entradas por Tag
- **Problema:** La página de gestión de tags no permite ver las entradas asociadas a él.
- **Propuesta:**
    - En la tabla de "Tags", hacer que el contador de uso sea un enlace.
    - Este enlace redirigirá a la vista "Todas las Entradas", filtrada por el tag seleccionado.
    - **Backend:** Requiere un endpoint `GET /api/entries?tag=nombre-del-tag`.

### e. "Mis Entradas" y "Ver Todas": Mejorar Visualización de Contenido
- **Problema:** El contenido de las entradas está truncado o se muestra en un `alert()` poco funcional.
- **Propuesta:**
    - Añadir un botón de "Ver" (`visibility`) que abra una ventana modal (`MatDialog`) para mostrar el contenido completo y formateado de la entrada.
    - Reutilizar este componente de diálogo en ambas secciones ("Mis Entradas" y "Ver Todas").

### f. Reportes y Estadísticas: Añadir Gráficos
- **Problema:** La sección de "Reportes y Estadísticas" necesita ser más visual.
- **Propuesta:**
    - Añadir un gráfico de líneas que muestre la tendencia de entradas creadas por día (últimos 30 días).
    - **Implementación:** Usar una librería como **NGX-Charts** y consumir los datos del endpoint `GET /api/reports/overview` (campo `entriesTrend`).

### g. Módulo de Recuperación de Contraseña
- **Problema:** No hay opción para recuperar contraseñas olvidadas.
- **Propuesta:**
    - Implementar un flujo completo de "Olvidé mi contraseña" con envío de correo electrónico y un token de reseteo con tiempo de expiración.
    - **Backend:** Nuevos endpoints (`/forgot-password`, `/reset-password`) y campos en el modelo `User`.
    - **Frontend:** Nuevas vistas para solicitar y completar el reseteo.

### h. Reorganización de la Página de Configuración
- **Problema:** La página de configuración es poco clara y mezcla opciones.
- **Propuesta:**
    - Mover el "Cooldown Checklist" a la página de "Checklist (Admin)".
    - Clarificar el texto de la opción "Enviar solo si hay servicios en rojo".
    - Reestructurar la página de Ajustes para separar la configuración de SMTP y el "Modo Invitado".

---

## 3. Propuestas Arquitectónicas

### a. Sistema de Permisos y Roles Granulares (RBAC)
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

## 4. Observaciones Técnicas Adicionales

-   **Archivo de Backup:** Eliminar `backend/src/routes/backup.js.bak`.
-   **Validación de Variables de Entorno:** Añadir validación al inicio del servidor (ej. usando Joi o Zod) para asegurar que las variables de entorno requeridas están presentes.
-   **Pruebas Automatizadas:** Considerar añadir un framework de pruebas (como Jest) al backend.
-   **Consistencia en Nombres:** Estandarizar el nombrado de archivos a `kebab-case`.
-   **Análisis de Actualización a Angular 20:** La versión actual es 17.0.0. Planificar una actualización incremental (`17 -> 18 -> 19 -> 20`) usando `ng update` y revisando los "breaking changes" en cada paso.
-  **titulo escalamiento**   en el lateral esta mal escrito hay que reparar eso