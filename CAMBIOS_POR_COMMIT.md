## Commit 4a92cf3

**Autor:** BitacoraSOC
**Fecha:** 2025-12-18 09:41:55 -0300

**Mensaje:** Initial commit: Bitácora SOC v1.0

**Archivos modificados:**
A	.gitignore
A	GITHUB-READY.md
A	ISSUES.md
A	README.md
A	SECURITY_AUDIT_REPORT.md
A	backend/.env.example
A	backend/.gitignore
A	backend/package-lock.json
A	backend/package.json
A	backend/src/config/database.js
A	backend/src/docs/swagger.yaml
A	backend/src/middleware/auth.js
A	backend/src/middleware/metadata.js
A	backend/src/middleware/rateLimiter.js
A	backend/src/middleware/requestId.js
A	backend/src/middleware/validate.js
A	backend/src/models/AdminNote.js
A	backend/src/models/AppConfig.js
A	backend/src/models/AuditLog.js
A	backend/src/models/Entry.js
A	backend/src/models/LogForwardingConfig.js
A	backend/src/models/PersonalNote.js
A	backend/src/models/ServiceCatalog.js
A	backend/src/models/ShiftCheck.js
A	backend/src/models/SmtpConfig.js
A	backend/src/models/User.js
A	backend/src/routes/auth.js
A	backend/src/routes/backup.js
A	backend/src/routes/checklist.js
A	backend/src/routes/config.js
A	backend/src/routes/entries.js
A	backend/src/routes/logging.js
A	backend/src/routes/notes.js
A	backend/src/routes/reports.js
A	backend/src/routes/smtp.js
A	backend/src/routes/tags.js
A	backend/src/routes/users.js
A	backend/src/scripts/seed-services.js
A	backend/src/scripts/seed.js
A	backend/src/server.js
A	backend/src/utils/audit.js
A	backend/src/utils/encryption.js
A	backend/src/utils/logForwarder.js
A	backend/src/utils/logger.js
A	docs/API.md
A	docs/BACKUP.md
A	docs/LOGGING.md
A	docs/RUNBOOK.md
A	docs/SECURITY.md
A	docs/SETUP.md
A	docs/TROUBLESHOOTING.md
A	frontend/angular.json
A	frontend/package-lock.json
A	frontend/package.json
A	frontend/src/app/app-routing.module.ts
A	frontend/src/app/app.component.ts
A	frontend/src/app/app.module.ts
A	frontend/src/app/app.routes.ts
A	frontend/src/app/guards/admin.guard.ts
A	frontend/src/app/guards/auth.guard.ts
A	frontend/src/app/guards/not-guest.guard.ts
A	frontend/src/app/interceptors/auth.interceptor.ts
A	frontend/src/app/models/checklist.model.ts
A	frontend/src/app/models/config.model.ts
A	frontend/src/app/models/entry.model.ts
A	frontend/src/app/models/note.model.ts
A	frontend/src/app/models/report.model.ts
A	frontend/src/app/models/smtp.model.ts
A	frontend/src/app/models/user.model.ts
A	frontend/src/app/pages/login/login.component.html
A	frontend/src/app/pages/login/login.component.scss
A	frontend/src/app/pages/login/login.component.ts
A	frontend/src/app/pages/login/login.module.ts
A	frontend/src/app/pages/main/all-entries/all-entries.component.html
A	frontend/src/app/pages/main/all-entries/all-entries.component.scss
A	frontend/src/app/pages/main/all-entries/all-entries.component.ts
A	frontend/src/app/pages/main/backup/backup.component.html
A	frontend/src/app/pages/main/backup/backup.component.scss
A	frontend/src/app/pages/main/backup/backup.component.ts
A	frontend/src/app/pages/main/checklist/checklist.component.html
A	frontend/src/app/pages/main/checklist/checklist.component.scss
A	frontend/src/app/pages/main/checklist/checklist.component.ts
A	frontend/src/app/pages/main/entries/entries.component.html
A	frontend/src/app/pages/main/entries/entries.component.scss
A	frontend/src/app/pages/main/entries/entries.component.ts
A	frontend/src/app/pages/main/logo/logo.component.html
A	frontend/src/app/pages/main/logo/logo.component.scss
A	frontend/src/app/pages/main/logo/logo.component.ts
A	frontend/src/app/pages/main/main-layout.component.html
A	frontend/src/app/pages/main/main-layout.component.scss
A	frontend/src/app/pages/main/main-layout.component.ts
A	frontend/src/app/pages/main/main.module.ts
A	frontend/src/app/pages/main/my-entries/my-entries.component.html
A	frontend/src/app/pages/main/my-entries/my-entries.component.scss
A	frontend/src/app/pages/main/my-entries/my-entries.component.ts
A	frontend/src/app/pages/main/profile/profile.component.html
A	frontend/src/app/pages/main/profile/profile.component.scss
A	frontend/src/app/pages/main/profile/profile.component.ts
A	frontend/src/app/pages/main/reports/reports.component.html
A	frontend/src/app/pages/main/reports/reports.component.scss
A	frontend/src/app/pages/main/reports/reports.component.ts
A	frontend/src/app/pages/main/settings/settings.component.html
A	frontend/src/app/pages/main/settings/settings.component.scss
A	frontend/src/app/pages/main/settings/settings.component.ts
A	frontend/src/app/pages/main/tags/tags.component.html
A	frontend/src/app/pages/main/tags/tags.component.scss
A	frontend/src/app/pages/main/tags/tags.component.ts
A	frontend/src/app/pages/main/users/users.component.html
A	frontend/src/app/pages/main/users/users.component.scss
A	frontend/src/app/pages/main/users/users.component.ts
A	frontend/src/app/services/auth.service.ts
A	frontend/src/app/services/checklist.service.ts
A	frontend/src/app/services/config.service.ts
A	frontend/src/app/services/entry.service.ts
A	frontend/src/app/services/note.service.ts
A	frontend/src/app/services/report.service.ts
A	frontend/src/app/services/smtp.service.ts
A	frontend/src/app/services/tag.service.ts
A	frontend/src/app/services/theme.service.ts
A	frontend/src/app/services/user.service.ts
A	frontend/src/environments/environment.prod.ts
A	frontend/src/environments/environment.ts
A	frontend/src/index.html
A	frontend/src/main.ts
A	frontend/src/styles.scss
A	frontend/tsconfig.app.json
A	frontend/tsconfig.json
A	promp

## Commit a2a3293

**Autor:** BitacoraSOC
**Fecha:** 2025-12-18 10:25:59 -0300

**Mensaje:** Fix: Login optimizado y navegación corregida

**Archivos modificados:**
M	backend/src/models/User.js
M	backend/src/routes/auth.js
M	frontend/src/app/app-routing.module.ts
M	frontend/src/app/pages/login/login.component.ts
M	frontend/src/index.html

## Commit 8e87c52

**Autor:** cdc-netics
**Fecha:** 2025-12-22 16:01:28 -0300

**Mensaje:** Changes done, rigth side menu modified, accrodeon checklist added, radio button operative/problem added and configured, checklist added to the main menu

**Archivos modificados:**
M	ISSUES.md
A	backend/src/models/ChecklistTemplate.js
M	backend/src/models/ShiftCheck.js
M	backend/src/routes/checklist.js
M	backend/src/routes/tags.js
M	frontend/package-lock.json
M	frontend/src/app/models/checklist.model.ts
A	frontend/src/app/pages/main/checklist-admin/checklist-admin.component.html
A	frontend/src/app/pages/main/checklist-admin/checklist-admin.component.scss
A	frontend/src/app/pages/main/checklist-admin/checklist-admin.component.ts
M	frontend/src/app/pages/main/checklist/checklist.component.html
M	frontend/src/app/pages/main/checklist/checklist.component.scss
M	frontend/src/app/pages/main/checklist/checklist.component.ts
M	frontend/src/app/pages/main/main-layout.component.html
M	frontend/src/app/pages/main/main-layout.component.ts
M	frontend/src/app/pages/main/main.module.ts
M	frontend/src/app/pages/main/settings/settings.component.html
M	frontend/src/app/pages/main/settings/settings.component.ts
M	frontend/src/app/pages/main/tags/tags.component.html
M	frontend/src/app/pages/main/tags/tags.component.ts
M	frontend/src/app/services/checklist.service.ts
M	frontend/src/app/services/tag.service.ts

## Commit bd62c62

**Autor:** CDC-netics
**Fecha:** 2025-12-22 16:13:33 -0300

**Mensaje:** Merge pull request #1 from cdc-netics/Discovery-&-firstreview

**Archivos modificados:**
## Commit b230144

**Autor:** BitacoraSOC
**Fecha:** 2025-12-31 12:32:21 -0300

**Mensaje:** ceracion modulo de envio correo excel

**Archivos modificados:**
A	CATALOGS_QUICKSTART.md
A	backend/src/models/CatalogEvent.js
A	backend/src/models/CatalogLogSource.js
A	backend/src/models/CatalogOperationType.js
A	backend/src/routes/admin-catalog.js
A	backend/src/routes/catalog.js
A	backend/src/scripts/seed-catalogs.js
M	backend/src/server.js
A	docs/CATALOGS.md
M	frontend/package-lock.json
A	frontend/src/app/components/entity-autocomplete/entity-autocomplete.component.html
A	frontend/src/app/components/entity-autocomplete/entity-autocomplete.component.scss
A	frontend/src/app/components/entity-autocomplete/entity-autocomplete.component.ts
A	frontend/src/app/components/shared-components.module.ts
A	frontend/src/app/models/catalog.model.ts
A	frontend/src/app/pages/main/catalog-admin/catalog-admin.component.html
A	frontend/src/app/pages/main/catalog-admin/catalog-admin.component.scss
A	frontend/src/app/pages/main/catalog-admin/catalog-admin.component.ts
M	frontend/src/app/pages/main/main-layout.component.ts
M	frontend/src/app/pages/main/main.module.ts
A	frontend/src/app/pages/main/report-generator/report-generator.component.html
A	frontend/src/app/pages/main/report-generator/report-generator.component.scss
A	frontend/src/app/pages/main/report-generator/report-generator.component.ts
A	frontend/src/app/services/catalog.service.ts

## Commit 53ba10c

**Autor:** BitacoraSOC
**Fecha:** 2026-01-02 13:36:24 -0300

**Mensaje:** Se reparar modulo

**Archivos modificados:**
M	backend/src/middleware/rateLimiter.js
M	backend/src/routes/catalog.js
M	frontend/src/app/components/entity-autocomplete/entity-autocomplete.component.html
M	frontend/src/app/components/entity-autocomplete/entity-autocomplete.component.ts
M	frontend/src/app/pages/main/catalog-admin/catalog-admin.component.html
M	frontend/src/app/pages/main/catalog-admin/catalog-admin.component.ts
M	frontend/src/app/pages/main/report-generator/report-generator.component.html
M	frontend/src/app/pages/main/report-generator/report-generator.component.scss
M	frontend/src/app/pages/main/report-generator/report-generator.component.ts

## Commit f514da8

**Autor:** BitacoraSOC
**Fecha:** 2026-01-02 14:13:28 -0300

**Mensaje:** Se repara el tema de imagenes, pero en frontent falta reparar eso

**Archivos modificados:**
M	frontend/src/app/pages/main/report-generator/report-generator.component.html
M	frontend/src/app/pages/main/report-generator/report-generator.component.scss
M	frontend/src/app/pages/main/report-generator/report-generator.component.ts

## Commit 728ab32

**Autor:** BitacoraSOC
**Fecha:** 2026-01-04 14:08:15 -0300

**Mensaje:** crescion modulo escalaciones

**Archivos modificados:**
A	ESCALATION_MODULE_README.md
A	backend/src/controllers/escalationController.js
A	backend/src/models/Client.js
A	backend/src/models/Contact.js
A	backend/src/models/EscalationRule.js
A	backend/src/models/ExternalPerson.js
A	backend/src/models/Service.js
A	backend/src/models/ShiftAssignment.js
A	backend/src/models/ShiftOverride.js
A	backend/src/models/ShiftRole.js
A	backend/src/models/ShiftRotationCycle.js
M	backend/src/models/User.js
A	backend/src/routes/escalation.js
M	backend/src/routes/users.js
A	backend/src/scripts/seed-escalation-example.js
A	backend/src/scripts/seed-shift-roles.js
M	backend/src/server.js
A	backend/test-escalation.js
M	frontend/src/app/app.module.ts
A	frontend/src/app/models/escalation.model.ts
M	frontend/src/app/models/user.model.ts
A	frontend/src/app/pages/escalation/escalation-admin-simple/escalation-admin-simple.component.html
A	frontend/src/app/pages/escalation/escalation-admin-simple/escalation-admin-simple.component.scss
A	frontend/src/app/pages/escalation/escalation-admin-simple/escalation-admin-simple.component.ts
A	frontend/src/app/pages/escalation/escalation-admin/escalation-admin.component.html
A	frontend/src/app/pages/escalation/escalation-admin/escalation-admin.component.scss
A	frontend/src/app/pages/escalation/escalation-admin/escalation-admin.component.ts
A	frontend/src/app/pages/escalation/escalation-routing.module.ts
A	frontend/src/app/pages/escalation/escalation-simple/escalation-simple.component.html
A	frontend/src/app/pages/escalation/escalation-simple/escalation-simple.component.scss
A	frontend/src/app/pages/escalation/escalation-simple/escalation-simple.component.ts
A	frontend/src/app/pages/escalation/escalation-view/escalation-view.component.html
A	frontend/src/app/pages/escalation/escalation-view/escalation-view.component.scss
A	frontend/src/app/pages/escalation/escalation-view/escalation-view.component.ts
A	frontend/src/app/pages/escalation/escalation.module.ts
M	frontend/src/app/pages/main/main-layout.component.ts
M	frontend/src/app/pages/main/main.module.ts
M	frontend/src/app/pages/main/users/users.component.html
M	frontend/src/app/pages/main/users/users.component.ts
A	frontend/src/app/services/escalation.service.ts
M	frontend/src/app/services/user.service.ts
M	promp

## Commit c50118e

**Autor:** BitacoraSOC
**Fecha:** 2026-01-04 14:32:55 -0300

**Mensaje:** mejoras en  escalaciones

**Archivos modificados:**
M	frontend/src/app/pages/escalation/escalation-admin/escalation-admin.component.html
M	frontend/src/app/pages/escalation/escalation-admin/escalation-admin.component.ts
M	frontend/src/app/pages/escalation/escalation-simple/escalation-simple.component.html
M	frontend/src/app/pages/escalation/escalation-simple/escalation-simple.component.ts

## Commit 12c5721

**Autor:** BitacoraSOC
**Fecha:** 2026-01-04 14:49:26 -0300

**Mensaje:** modificacion isuses

**Archivos modificados:**
M	ISSUES.md

## Commit 63f7347

**Autor:** BitacoraSOC
**Fecha:** 2026-01-05 09:37:04 -0300

**Mensaje:** mejora en documentaciones

**Archivos modificados:**
D	CATALOGS_QUICKSTART.md
D	GITHUB-READY.md
A	LICENSE.md
M	README.md
D	SECURITY_AUDIT_REPORT.md
R099	ESCALATION_MODULE_README.md	docs/ESCALATION.md

## Commit 8b1ca30

**Autor:** BitacoraSOC
**Fecha:** 2026-01-05 09:48:17 -0300

**Mensaje:** cambios de documentos

**Archivos modificados:**
M	backend/src/scripts/seed-escalation-example.js
M	docs/ESCALATION.md
M	frontend/src/app/pages/escalation/escalation-admin-simple/escalation-admin-simple.component.html
M	frontend/src/app/pages/escalation/escalation-admin/escalation-admin.component.html

## Commit cf5e1ec

**Autor:** BitacoraSOC
**Fecha:** 2026-01-05 10:12:23 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	docs/TROUBLESHOOTING.md

## Commit d2ed6f2

**Autor:** cdc-netics
**Fecha:** 2026-01-14 17:54:10 -0300

**Mensaje:** menu smtp added, user preferences tested and working, minor hotfix

**Archivos modificados:**
M	ISSUES.md
M	backend/src/routes/auth.js
M	backend/src/routes/smtp.js
M	backend/src/routes/users.js
M	frontend/src/app/pages/main/main-layout.component.ts
M	frontend/src/app/pages/main/profile/profile.component.html
M	frontend/src/app/pages/main/profile/profile.component.ts
M	frontend/src/app/pages/main/settings/settings.component.html
M	frontend/src/app/pages/main/settings/settings.component.scss
M	frontend/src/app/pages/main/settings/settings.component.ts
M	frontend/src/app/services/auth.service.ts
M	frontend/src/app/services/smtp.service.ts

## Commit 81bd198

**Autor:** CDC-netics
**Fecha:** 2026-01-14 17:57:36 -0300

**Mensaje:** Merge pull request #2 from cdc-netics/issues.md-hotfix

**Archivos modificados:**
## Commit bdc5717

**Autor:** CDC-netics
**Fecha:** 2026-01-15 10:42:31 -0300

**Mensaje:** Merge branch 'main' into ad_modificacion_excel

**Archivos modificados:**
## Commit 036415a

**Autor:** CDC-netics
**Fecha:** 2026-01-15 10:42:57 -0300

**Mensaje:** Merge pull request #3 from cdc-netics/ad_modificacion_excel

**Archivos modificados:**
## Commit 3788ef9

**Autor:** BitacoraSOC
**Fecha:** 2026-01-15 15:31:18 -0300

**Mensaje:** se agregan mejoras y reparacion checklist, user, catalogos, reportes

**Archivos modificados:**
A	DEPLOY.md
M	ISSUES.md
M	README.md
M	backend/package-lock.json
M	backend/package.json
M	backend/src/models/AppConfig.js
M	backend/src/routes/backup.js
A	backend/src/routes/backup.js.bak
M	backend/src/routes/checklist.js
M	backend/src/routes/config.js
M	backend/src/routes/reports.js
M	backend/src/server.js
M	frontend/package-lock.json
M	frontend/package.json
M	frontend/src/app/app.component.ts
M	frontend/src/app/app.module.ts
M	frontend/src/app/pages/escalation/escalation-admin-simple/escalation-admin-simple.component.ts
M	frontend/src/app/pages/login/login.component.html
M	frontend/src/app/pages/login/login.component.scss
M	frontend/src/app/pages/login/login.component.ts
M	frontend/src/app/pages/main/backup/backup.component.html
M	frontend/src/app/pages/main/backup/backup.component.ts
M	frontend/src/app/pages/main/checklist-admin/checklist-admin.component.html
M	frontend/src/app/pages/main/checklist-admin/checklist-admin.component.ts
A	frontend/src/app/pages/main/checklist-history/checklist-history.component.html
A	frontend/src/app/pages/main/checklist-history/checklist-history.component.scss
A	frontend/src/app/pages/main/checklist-history/checklist-history.component.ts
M	frontend/src/app/pages/main/checklist/checklist.component.html
M	frontend/src/app/pages/main/checklist/checklist.component.ts
M	frontend/src/app/pages/main/logo/logo.component.html
M	frontend/src/app/pages/main/logo/logo.component.ts
M	frontend/src/app/pages/main/main-layout.component.html
M	frontend/src/app/pages/main/main-layout.component.scss
M	frontend/src/app/pages/main/main-layout.component.ts
M	frontend/src/app/pages/main/main.module.ts
M	frontend/src/app/pages/main/profile/profile.component.ts
M	frontend/src/app/pages/main/users/users.component.html
M	frontend/src/app/pages/main/users/users.component.scss
M	frontend/src/app/pages/main/users/users.component.ts
M	frontend/src/app/services/checklist.service.ts
M	frontend/src/app/services/config.service.ts
M	frontend/src/environments/environment.prod.ts
M	frontend/src/environments/environment.ts

## Commit e690eae

**Autor:** BitacoraSOC
**Fecha:** 2026-01-15 15:31:48 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	ISSUES.md

## Commit 26db09b

**Autor:** BitacoraSOC
**Fecha:** 2026-01-15 15:41:25 -0300

**Mensaje:** dockerizacion

**Archivos modificados:**
A	.env.docker.example
M	.gitignore
M	DEPLOY.md
M	README.md
A	backend/Dockerfile
M	backend/src/server.js
A	docker-compose.yml
A	frontend/Dockerfile
A	frontend/nginx.conf

## Commit 4566402

**Autor:** BitacoraSOC
**Fecha:** 2026-01-15 17:43:18 -0300

**Mensaje:** cambios para implementacion docker

**Archivos modificados:**
D	.env.docker.example
A	.env.example
M	backend/Dockerfile
M	backend/package.json
M	backend/src/scripts/seed.js
M	backend/src/server.js
M	docker-compose.yml
M	frontend/Dockerfile
M	frontend/src/app/pages/login/login.component.ts

## Commit b81e766

**Autor:** BitacoraSOC
**Fecha:** 2026-01-15 18:11:46 -0300

**Mensaje:** cambio

**Archivos modificados:**
M	docker-compose.yml

## Commit 5bdc219

**Autor:** BitacoraSOC
**Fecha:** 2026-01-15 19:38:29 -0300

**Mensaje:** Ajustar health check: interval 5s, retries 5

**Archivos modificados:**
M	docker-compose.yml

## Commit eb37096

**Autor:** BitacoraSOC
**Fecha:** 2026-01-15 19:48:01 -0300

**Mensaje:** mejoras  y cambios

**Archivos modificados:**
M	DEPLOY.md

## Commit 743bb9e

**Autor:** BitacoraSOC
**Fecha:** 2026-01-15 19:57:57 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	backend/Dockerfile

## Commit 0069b67

**Autor:** BitacoraSOC
**Fecha:** 2026-01-15 22:09:20 -0300

**Mensaje:** mejoras

**Archivos modificados:**
A	backend/scripts/eventos-ejemplo.json
A	backend/scripts/import-catalog-events.js
M	docker-compose.yml

## Commit 8363684

**Autor:** BitacoraSOC
**Fecha:** 2026-01-15 22:13:23 -0300

**Mensaje:** feat: importación masiva de eventos + fix rate limiter

**Archivos modificados:**
M	backend/src/middleware/rateLimiter.js

## Commit 464f200

**Autor:** BitacoraSOC
**Fecha:** 2026-01-15 22:29:52 -0300

**Mensaje:** docs: agregar configuración de rate limiter al .env.example

**Archivos modificados:**
M	.env.example

## Commit 2323023

**Autor:** BitacoraSOC
**Fecha:** 2026-01-15 23:23:56 -0300

**Mensaje:** cambios en temas de  migraciones

**Archivos modificados:**
A	backend/scripts/archivo1.csv
A	backend/scripts/create-users.js
A	backend/scripts/csv-to-json-entries.js
A	backend/scripts/delete-entries.js
A	backend/scripts/entradas-ejemplo.json
A	backend/scripts/import-entries.js
A	backend/scripts/mfuentes.csv
A	entradas-mfuentes.json
A	entradas-todas.json
A	entradas1.json
M	frontend/src/app/pages/main/all-entries/all-entries.component.html
M	frontend/src/app/pages/main/all-entries/all-entries.component.ts
M	frontend/src/app/pages/main/my-entries/my-entries.component.html

## Commit 9bb4f1e

**Autor:** BitacoraSOC
**Fecha:** 2026-01-15 23:40:12 -0300

**Mensaje:** security: remover archivos con datos reales y agregar documentación

**Archivos modificados:**
M	.gitignore
A	backend/scripts/README.md
D	backend/scripts/archivo1.csv
A	backend/scripts/entradas-ejemplo.csv
D	backend/scripts/mfuentes.csv
D	entradas-mfuentes.json
D	entradas-todas.json
D	entradas1.json

## Commit f57ed8b

**Autor:** BitacoraSOC
**Fecha:** 2026-01-15 23:41:41 -0300

**Mensaje:** docs: agregar documentación completa de backup y restauración

**Archivos modificados:**
M	backend/scripts/README.md

## Commit 6ea1bb7

**Autor:** BitacoraSOC
**Fecha:** 2026-01-15 23:45:36 -0300

**Mensaje:** docs: agregar documentación visual con screenshots

**Archivos modificados:**
M	.gitignore
A	docs/SCREENSHOTS.md
A	docs/images/screenshots/README.md

## Commit f4f8b05

**Autor:** BitacoraSOC
**Fecha:** 2026-01-15 23:53:07 -0300

**Mensaje:** docs: agregar 7 screenshots del sistema y actualizar documentación

**Archivos modificados:**
M	README.md
M	docs/SCREENSHOTS.md
A	docs/images/screenshots/01-main-nueva-entrada.png
A	docs/images/screenshots/02-escalacion-turnos.png
A	docs/images/screenshots/03-buscar-entradas.png
A	docs/images/screenshots/04-generador-reportes.png
A	docs/images/screenshots/05-menu-configuracion.png
A	docs/images/screenshots/06-menu-admin-backup.png
A	docs/images/screenshots/07-sidebar-menu.png
M	docs/images/screenshots/README.md

## Commit dcb62ea

**Autor:** BitacoraSOC
**Fecha:** 2026-01-15 23:55:03 -0300

**Mensaje:** z

**Archivos modificados:**
M	docs/images/screenshots/01-main-nueva-entrada.png

## Commit bc5243d

**Autor:** BitacoraSOC
**Fecha:** 2026-01-20 14:24:23 -0300

**Mensaje:** cambios en issues

**Archivos modificados:**
M	ISSUES.md
M	README.md
M	docs/images/screenshots/01-main-nueva-entrada.png
M	docs/images/screenshots/02-escalacion-turnos.png
M	docs/images/screenshots/03-buscar-entradas.png
M	docs/images/screenshots/04-generador-reportes.png
M	docs/images/screenshots/05-menu-configuracion.png
M	docs/images/screenshots/06-menu-admin-backup.png
M	docs/images/screenshots/README.md

## Commit bd20837

**Autor:** BitacoraSOC
**Fecha:** 2026-01-20 14:40:01 -0300

**Mensaje:** mejoras en issues

**Archivos modificados:**
M	ISSUES.md

## Commit ce442e8

**Autor:** BitacoraSOC
**Fecha:** 2026-01-20 18:16:36 -0300

**Mensaje:** reparacion de modulos de  copiar y vista de eventos

**Archivos modificados:**
M	ISSUES.md
M	frontend/src/app/pages/main/all-entries/all-entries.component.ts
A	frontend/src/app/pages/main/all-entries/entry-detail-dialog.component.html
A	frontend/src/app/pages/main/all-entries/entry-detail-dialog.component.scss
A	frontend/src/app/pages/main/all-entries/entry-detail-dialog.component.ts
M	frontend/src/app/pages/main/report-generator/report-generator.component.ts

## Commit 7f42179

**Autor:** BitacoraSOC
**Fecha:** 2026-01-20 21:50:44 -0300

**Mensaje:** mejoras en versionado y reparacion de deploy

**Archivos modificados:**
M	.env.example
M	DEPLOY.md
M	README.md
M	backend/Dockerfile
M	backend/src/server.js
M	docker-compose.yml
M	frontend/Dockerfile
M	frontend/src/app/pages/login/login.component.html
M	frontend/src/app/pages/login/login.component.ts
M	frontend/src/environments/environment.prod.ts
M	frontend/src/environments/environment.ts
A	scripts/compose-rebuild.ps1
A	scripts/compose-rebuild.sh
A	scripts/compose-up.ps1
A	scripts/compose-up.sh
A	scripts/get-version.ps1
A	scripts/get-version.sh

## Commit c5c9080

**Autor:** BitacoraSOC
**Fecha:** 2026-01-20 22:23:02 -0300

**Mensaje:** reparaciones

**Archivos modificados:**
M	ISSUES.md
M	frontend/src/app/pages/main/main-layout.component.ts

## Commit 1ff2adb

**Autor:** BitacoraSOC
**Fecha:** 2026-01-21 10:12:33 -0300

**Mensaje:** mejoras ver eventos

**Archivos modificados:**
M	ISSUES.md
M	frontend/src/app/pages/main/all-entries/all-entries.component.html
M	frontend/src/app/pages/main/entries/entries.component.ts
M	frontend/src/app/pages/main/my-entries/my-entries.component.html

## Commit b2f72e3

**Autor:** BitacoraSOC
**Fecha:** 2026-01-22 10:19:31 -0300

**Mensaje:** cambios en Issues

**Archivos modificados:**
M	ISSUES.md

## Commit 0b5b796

**Autor:** BitacoraSOC
**Fecha:** 2026-01-22 10:59:42 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	ISSUES.md

## Commit 723531e

**Autor:** BitacoraSOC
**Fecha:** 2026-01-22 11:22:45 -0300

**Mensaje:** mejoras

**Archivos modificados:**
M	ISSUES.md

## Commit 72fe6ca

**Autor:** BitacoraSOC
**Fecha:** 2026-01-22 11:56:28 -0300

**Mensaje:** se agregan cosas

**Archivos modificados:**
M	ISSUES.md

## Commit c1ee040

**Autor:** BitacoraSOC
**Fecha:** 2026-01-22 11:57:00 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	ISSUES.md

## Commit 3a9dbbd

**Autor:** BitacoraSOC
**Fecha:** 2026-01-22 12:49:06 -0300

**Mensaje:** se agregan mejoras

**Archivos modificados:**
M	ISSUES.md

## Commit ebc8316

**Autor:** BitacoraSOC
**Fecha:** 2026-01-22 12:51:33 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	ISSUES.md

## Commit 7ae1d48

**Autor:** BitacoraSOC
**Fecha:** 2026-01-23 15:47:17 -0300

**Mensaje:** mejoras  y cambios nuevos para nueva version

**Archivos modificados:**
M	ISSUES.md

## Commit 95f7651

**Autor:** BitacoraSOC
**Fecha:** 2026-01-26 13:31:56 -0300

**Mensaje:** cambios  y mejoras

**Archivos modificados:**
M	ISSUES.md
M	frontend/src/app/pages/escalation/escalation-admin-simple/escalation-admin-simple.component.html
M	frontend/src/app/pages/escalation/escalation-admin/escalation-admin.component.html
M	frontend/src/app/pages/escalation/escalation-simple/escalation-simple.component.html
M	frontend/src/app/pages/escalation/escalation-simple/escalation-simple.component.ts
M	frontend/src/app/pages/escalation/escalation-view/escalation-view.component.html
M	frontend/src/app/pages/escalation/escalation-view/escalation-view.component.ts
M	frontend/src/app/pages/main/main-layout.component.ts
M	frontend/src/app/services/escalation.service.ts

## Commit 3da495a

**Autor:** BitacoraSOC
**Fecha:** 2026-01-27 14:15:36 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	ISSUES.md

## Commit 0b6c022

**Autor:** BitacoraSOC
**Fecha:** 2026-01-29 00:33:38 -0300

**Mensaje:** se agregan mas issues

**Archivos modificados:**
M	ISSUES.md

## Commit 9ee1ec3

**Autor:** BitacoraSOC
**Fecha:** 2026-01-29 15:02:34 -0300

**Mensaje:** mejoras

**Archivos modificados:**
M	DEPLOY.md

## Commit e5c8179

**Autor:** BitacoraSOC
**Fecha:** 2026-01-29 15:54:09 -0300

**Mensaje:** implementando  subida de version

**Archivos modificados:**
M	ISSUES.md
M	backend/package-lock.json
M	frontend/package-lock.json

## Commit deb9c11

**Autor:** BitacoraSOC
**Fecha:** 2026-01-29 15:56:36 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	frontend/package-lock.json

## Commit f8460ca

**Autor:** BitacoraSOC
**Fecha:** 2026-01-29 16:35:18 -0300

**Mensaje:** feat(ng): Upgrade to Angular 18

**Archivos modificados:**
M	ISSUES.md
M	frontend/package-lock.json
M	frontend/package.json
M	frontend/src/app/app.module.ts

## Commit 69488fd

**Autor:** BitacoraSOC
**Fecha:** 2026-01-30 14:00:41 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	ISSUES.md

## Commit 3b58de6

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 12:29:32 -0300

**Mensaje:** docs: Document Angular 19 upgrade blocker (NgModules bug)

**Archivos modificados:**
M	ISSUES.md

## Commit 2abd954

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 12:44:18 -0300

**Mensaje:** refactor: Migrate entire project to Standalone Components

**Archivos modificados:**
M	frontend/package-lock.json
M	frontend/package.json
M	frontend/src/app/app.component.ts
M	frontend/src/app/app.module.ts
M	frontend/src/app/components/entity-autocomplete/entity-autocomplete.component.ts
D	frontend/src/app/components/shared-components.module.ts
M	frontend/src/app/pages/login/login.component.ts
M	frontend/src/app/pages/login/login.module.ts
M	frontend/src/app/pages/main/backup/backup.component.ts
M	frontend/src/app/pages/main/catalog-admin/catalog-admin.component.ts
M	frontend/src/app/pages/main/checklist-admin/checklist-admin.component.ts
M	frontend/src/app/pages/main/checklist-history/checklist-history.component.ts
M	frontend/src/app/pages/main/checklist/checklist.component.ts
M	frontend/src/app/pages/main/entries/entries.component.ts
M	frontend/src/app/pages/main/logo/logo.component.ts
M	frontend/src/app/pages/main/main-layout.component.ts
M	frontend/src/app/pages/main/main.module.ts
M	frontend/src/app/pages/main/my-entries/my-entries.component.ts
M	frontend/src/app/pages/main/profile/profile.component.ts
M	frontend/src/app/pages/main/report-generator/report-generator.component.ts
M	frontend/src/app/pages/main/reports/reports.component.ts
M	frontend/src/app/pages/main/settings/settings.component.ts
M	frontend/src/app/pages/main/tags/tags.component.ts
M	frontend/src/app/pages/main/users/users.component.ts
M	frontend/src/main.ts

## Commit 8afdb02

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 12:50:24 -0300

**Mensaje:** feat(ng): Upgrade to Angular 19.2.18

**Archivos modificados:**
M	frontend/angular.json
M	frontend/package-lock.json
M	frontend/package.json
M	frontend/src/app/app.component.ts
M	frontend/src/app/components/entity-autocomplete/entity-autocomplete.component.ts
M	frontend/src/app/pages/escalation/escalation-admin-simple/escalation-admin-simple.component.ts
M	frontend/src/app/pages/escalation/escalation-simple/escalation-simple.component.ts
M	frontend/src/app/pages/login/login.component.ts
M	frontend/src/app/pages/main/all-entries/all-entries.component.ts
M	frontend/src/app/pages/main/all-entries/entry-detail-dialog.component.ts
M	frontend/src/app/pages/main/backup/backup.component.ts
M	frontend/src/app/pages/main/catalog-admin/catalog-admin.component.ts
M	frontend/src/app/pages/main/checklist-admin/checklist-admin.component.ts
M	frontend/src/app/pages/main/checklist-history/checklist-history.component.ts
M	frontend/src/app/pages/main/checklist/checklist.component.ts
M	frontend/src/app/pages/main/entries/entries.component.ts
M	frontend/src/app/pages/main/logo/logo.component.ts
M	frontend/src/app/pages/main/main-layout.component.ts
M	frontend/src/app/pages/main/my-entries/my-entries.component.ts
M	frontend/src/app/pages/main/profile/profile.component.ts
M	frontend/src/app/pages/main/report-generator/report-generator.component.ts
M	frontend/src/app/pages/main/reports/reports.component.ts
M	frontend/src/app/pages/main/settings/settings.component.ts
M	frontend/src/app/pages/main/tags/tags.component.ts
M	frontend/src/app/pages/main/users/users.component.ts
M	frontend/tsconfig.json

## Commit e292d7c

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 12:51:50 -0300

**Mensaje:** feat(ng): Update Angular Material to 19.2.19

**Archivos modificados:**
M	frontend/package-lock.json
M	frontend/package.json

## Commit c102e7d

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 12:54:41 -0300

**Mensaje:** feat(ng): Upgrade to Angular 20.3.16

**Archivos modificados:**
M	frontend/angular.json
M	frontend/package-lock.json
M	frontend/package.json

## Commit fa45c38

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 12:56:08 -0300

**Mensaje:** feat(ng): Complete upgrade to Angular 20.3.16 + Material 20.2.14

**Archivos modificados:**
M	frontend/package-lock.json
M	frontend/package.json
M	frontend/src/app/pages/main/entries/entries.component.scss

## Commit a2c0148

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 12:58:12 -0300

**Mensaje:** docs: Complete Angular 20 upgrade documentation

**Archivos modificados:**
M	ISSUES.md

## Commit c93762c

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 13:07:44 -0300

**Mensaje:** docs: Update Angular version references to 20.x in documentation

**Archivos modificados:**
M	README.md
M	docs/SETUP.md

## Commit d3112bd

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 13:13:56 -0300

**Mensaje:** fix: Reparar bugs B1a, B4-5 y actualizar Dockerfile

**Archivos modificados:**
M	frontend/Dockerfile
M	frontend/src/app/pages/main/main-layout.component.ts
M	frontend/src/styles.scss

## Commit fb5bbdd

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 13:14:27 -0300

**Mensaje:** docs: Actualizar estado de bugs reparados en ISSUES.md

**Archivos modificados:**
M	ISSUES.md

## Commit 87d03a5

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 13:17:41 -0300

**Mensaje:** fix(docker): Corregir ruta de build Angular 20 en Dockerfile

**Archivos modificados:**
M	frontend/Dockerfile

## Commit da9e5d1

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 13:25:55 -0300

**Mensaje:** fix: Improve dark mode contrast for secondary text and UI elements

**Archivos modificados:**
M	frontend/src/app/pages/main/backup/backup.component.html
M	frontend/src/app/pages/main/backup/backup.component.scss
M	frontend/src/app/pages/main/checklist-admin/checklist-admin.component.scss
M	frontend/src/styles.scss

## Commit a381728

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 13:42:24 -0300

**Mensaje:** docs: Update ISSUES.md with complete dark mode fix documentation

**Archivos modificados:**
M	ISSUES.md

## Commit 3ca0478

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 14:33:49 -0300

**Mensaje:** fix: Reorganizar CSS para aplicar colores correctamente en todos los temas

**Archivos modificados:**
M	frontend/src/styles.scss

## Commit 9fcf7f1

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 14:41:07 -0300

**Mensaje:** fix: FORZAR todos los colores de texto en dark mode con reglas globales agresivas

**Archivos modificados:**
M	frontend/src/styles.scss

## Commit 9a86aaa

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 15:21:11 -0300

**Mensaje:** fix: Dark mode text visibility + ⚡ Escalación

**Archivos modificados:**
M	frontend/src/app/pages/escalation/escalation-simple/escalation-simple.component.html
M	frontend/src/app/pages/main/checklist-admin/checklist-admin.component.scss
M	frontend/src/styles.scss

## Commit 0f9ddf8

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 16:40:30 -0300

**Mensaje:** fix: Corregidos errores de compilación TypeScript y HTML

**Archivos modificados:**
M	ISSUES.md
A	backend/jest.config.js
A	backend/jest.setup.js
M	backend/src/models/Entry.js
A	backend/src/models/ShiftClosure.js
M	backend/src/models/ShiftRole.js
M	backend/src/models/User.js
M	backend/src/routes/auth.js
M	backend/src/routes/backup.js
M	backend/src/routes/checklist.js
M	backend/src/routes/entries.js
M	backend/src/server.js
A	backend/tests/encryption.test.js
M	frontend/src/app/models/entry.model.ts
A	frontend/src/app/models/shift-closure.model.ts
M	frontend/src/app/models/user.model.ts
M	frontend/src/app/pages/login/login.component.html
M	frontend/src/app/pages/main/all-entries/all-entries.component.html
M	frontend/src/app/pages/main/all-entries/all-entries.component.ts
M	frontend/src/app/pages/main/backup/backup.component.html
M	frontend/src/app/pages/main/backup/backup.component.scss
M	frontend/src/app/pages/main/backup/backup.component.ts
M	frontend/src/app/pages/main/checklist-admin/checklist-admin.component.html
M	frontend/src/app/pages/main/checklist-admin/checklist-admin.component.scss
M	frontend/src/app/pages/main/checklist-admin/checklist-admin.component.ts
M	frontend/src/app/pages/main/checklist-history/checklist-history.component.html
M	frontend/src/app/pages/main/checklist-history/checklist-history.component.scss
M	frontend/src/app/pages/main/checklist-history/checklist-history.component.ts
M	frontend/src/app/pages/main/entries/entries.component.html
M	frontend/src/app/pages/main/entries/entries.component.ts
M	frontend/src/app/pages/main/main-layout.component.ts
M	frontend/src/app/pages/main/my-entries/my-entries.component.html
M	frontend/src/app/pages/main/my-entries/my-entries.component.ts
M	frontend/src/app/pages/main/settings/settings.component.html
M	frontend/src/app/pages/main/settings/settings.component.ts
M	frontend/src/app/pages/main/tags/tags.component.html
M	frontend/src/app/pages/main/tags/tags.component.scss
M	frontend/src/app/pages/main/tags/tags.component.ts
M	frontend/src/app/services/checklist.service.ts
A	frontend/src/app/services/shift-closure.service.ts

## Commit 8dba3b5

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 16:41:50 -0300

**Mensaje:** fix: Ajuste de propiedades CatalogLogSource (source.name en lugar de source.code)

**Archivos modificados:**
M	frontend/src/app/pages/main/all-entries/all-entries.component.html
M	frontend/src/app/pages/main/entries/entries.component.html

## Commit 64869d2

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 16:42:09 -0300

**Mensaje:** docs: Actualizado ISSUES.md - B2i, B2m, B3a marcados como Completado

**Archivos modificados:**
M	ISSUES.md

## Commit 60143ef

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 18:10:45 -0300

**Mensaje:** cambios y mas cambios

**Archivos modificados:**
M	.env.example
M	ISSUES.md
M	backend/.env.example
M	backend/src/models/User.js
A	backend/src/routes/audit-logs.js
M	backend/src/routes/auth.js
M	backend/src/routes/entries.js
M	backend/src/routes/smtp.js
M	backend/src/server.js
M	docker-compose.yml
M	frontend/src/app/app-routing.module.ts
M	frontend/src/app/app.routes.ts
A	frontend/src/app/models/audit-log.model.ts
A	frontend/src/app/pages/auth/forgot-password/forgot-password.component.html
A	frontend/src/app/pages/auth/forgot-password/forgot-password.component.scss
A	frontend/src/app/pages/auth/forgot-password/forgot-password.component.ts
A	frontend/src/app/pages/auth/forgot-password/forgot-password.module.ts
A	frontend/src/app/pages/auth/reset-password/reset-password.component.html
A	frontend/src/app/pages/auth/reset-password/reset-password.component.scss
A	frontend/src/app/pages/auth/reset-password/reset-password.component.ts
A	frontend/src/app/pages/auth/reset-password/reset-password.module.ts
M	frontend/src/app/pages/login/login.component.html
M	frontend/src/app/pages/login/login.component.scss
M	frontend/src/app/pages/login/login.component.ts
A	frontend/src/app/pages/main/audit-logs/audit-logs.component.html
A	frontend/src/app/pages/main/audit-logs/audit-logs.component.scss
A	frontend/src/app/pages/main/audit-logs/audit-logs.component.ts
M	frontend/src/app/pages/main/checklist/checklist.component.html
M	frontend/src/app/pages/main/main-layout.component.ts
M	frontend/src/app/pages/main/main.module.ts
M	frontend/src/app/pages/main/settings/settings.component.html
M	frontend/src/app/pages/main/settings/settings.component.ts
A	frontend/src/app/services/audit-log.service.ts
M	frontend/src/app/services/auth.service.ts

## Commit c6942e2

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 18:11:26 -0300

**Mensaje:** Merge branch 'feature/angular-20-upgrade' of https://github.com/cdc-netics/BitacoraSOC into feature/angular-20-upgrade

**Archivos modificados:**
## Commit 05093c8

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 21:56:58 -0300

**Mensaje:** feat(login): Implementar diseño CRT retro con recuperación de contraseña integrada

**Archivos modificados:**
M	frontend/src/app/pages/login/login.component.html
M	frontend/src/app/pages/login/login.component.scss
M	frontend/src/app/pages/login/login.component.ts

## Commit 8afce02

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 21:57:16 -0300

**Mensaje:** fix(login): Agregar CommonModule y limpiar imports no utilizados

**Archivos modificados:**
M	frontend/src/app/pages/login/login.component.ts

## Commit 979c55f

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 22:17:28 -0300

**Mensaje:** cambios

**Archivos modificados:**
D	backend/jest.config.js
D	backend/jest.setup.js
D	backend/src/models/ShiftClosure.js
D	backend/src/routes/audit-logs.js
D	backend/tests/encryption.test.js
D	frontend/src/app/models/audit-log.model.ts

## Commit 1c78572

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 22:30:48 -0300

**Mensaje:** fix: add missing audit-log.model.ts

**Archivos modificados:**
A	frontend/src/app/models/audit-log.model.ts

## Commit a3befc9

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 22:33:36 -0300

**Mensaje:** fix: correct audit-log.model interface structure

**Archivos modificados:**
M	frontend/src/app/models/audit-log.model.ts

## Commit 65cf504

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 22:42:09 -0300

**Mensaje:** fix: improve login title clarity and case-insensitive auth

**Archivos modificados:**
M	backend/src/routes/auth.js
M	frontend/src/app/pages/login/login.component.scss

## Commit fc07a07

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 22:51:58 -0300

**Mensaje:** fix: add ShiftClosure model

**Archivos modificados:**
A	backend/src/models/ShiftClosure.js

## Commit 8d205d2

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 22:57:37 -0300

**Mensaje:** fix: add audit-logs routes

**Archivos modificados:**
A	backend/src/routes/audit-logs.js

## Commit f5c264c

**Autor:** BitacoraSOC
**Fecha:** 2026-02-02 23:16:54 -0300

**Mensaje:** feat: add RACI management and checklist alert config

**Archivos modificados:**
M	backend/src/controllers/escalationController.js
M	backend/src/models/AppConfig.js
A	backend/src/models/RaciEntry.js
M	backend/src/routes/config.js
M	backend/src/routes/escalation.js
M	backend/src/routes/smtp.js
M	backend/src/server.js
A	backend/src/utils/checklistAlertScheduler.js
M	frontend/src/app/models/config.model.ts
M	frontend/src/app/models/escalation.model.ts
M	frontend/src/app/pages/escalation/escalation-admin-simple/escalation-admin-simple.component.html
M	frontend/src/app/pages/escalation/escalation-admin-simple/escalation-admin-simple.component.ts
M	frontend/src/app/pages/escalation/escalation-simple/escalation-simple.component.html
M	frontend/src/app/pages/escalation/escalation-simple/escalation-simple.component.ts
M	frontend/src/app/pages/main/settings/settings.component.html
M	frontend/src/app/pages/main/settings/settings.component.scss
M	frontend/src/app/pages/main/settings/settings.component.ts
M	frontend/src/app/services/escalation.service.ts

## Commit 09ae638

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 00:13:11 -0300

**Mensaje:** se agregan mejoras al login y tabla RACI

**Archivos modificados:**
M	ISSUES.md
M	backend/src/models/RaciEntry.js
M	frontend/src/app/models/escalation.model.ts
M	frontend/src/app/pages/escalation/escalation-admin-simple/escalation-admin-simple.component.html
M	frontend/src/app/pages/escalation/escalation-admin-simple/escalation-admin-simple.component.ts
M	frontend/src/app/pages/escalation/escalation-simple/escalation-simple.component.html
M	frontend/src/app/pages/escalation/escalation-simple/escalation-simple.component.ts
M	frontend/src/app/pages/login/login.component.scss
M	frontend/src/app/pages/login/login.component.ts
A	temp-styles.css

## Commit 73c030c

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 00:25:42 -0300

**Mensaje:** feat(B2f): add interactive charts to reports with NGX-Charts

**Archivos modificados:**
M	ISSUES.md
M	backend/src/routes/reports.js
M	frontend/package-lock.json
M	frontend/package.json
M	frontend/src/app/pages/main/reports/reports.component.html
M	frontend/src/app/pages/main/reports/reports.component.scss
M	frontend/src/app/pages/main/reports/reports.component.ts
M	frontend/src/app/services/report.service.ts

## Commit f84d5a9

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 00:37:57 -0300

**Mensaje:** Cambios en reportes y estadisticas

**Archivos modificados:**
M	ISSUES.md
M	frontend/package-lock.json
M	frontend/package.json
M	frontend/src/app/pages/main/reports/reports.component.ts

## Commit bc8f167

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 00:48:31 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	ISSUES.md
M	backend/src/routes/reports.js
M	frontend/src/app/pages/main/reports/reports.component.html
M	frontend/src/app/pages/main/reports/reports.component.ts
M	frontend/src/app/services/report.service.ts

## Commit fa86f2f

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 01:03:30 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	frontend/src/app/pages/main/reports/reports.component.html
M	frontend/src/app/pages/main/reports/reports.component.scss
M	frontend/src/app/pages/main/reports/reports.component.ts

## Commit 839b1ee

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 01:21:27 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	ISSUES.md
A	backend/src/middleware/rate-limiter.js
M	backend/src/middleware/rateLimiter.js
A	backend/src/middleware/request-id.js
M	backend/src/middleware/requestId.js
M	backend/src/routes/reports.js
M	backend/src/server.js
M	frontend/src/app/pages/main/reports/reports.component.html

## Commit 84d1eff

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 01:27:28 -0300

**Mensaje:** mejoras  en mapa calor

**Archivos modificados:**
M	frontend/src/app/pages/main/reports/reports.component.html
M	frontend/src/app/pages/main/reports/reports.component.ts

## Commit 42b6454

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 01:33:12 -0300

**Mensaje:** docs: add B2o issue - auto GLPI ticket on shift close (depends on B2l)

**Archivos modificados:**
M	ISSUES.md

## Commit 9d458ef

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 01:34:29 -0300

**Mensaje:** docs: add B2o technical implementation details with GLPI integration code

**Archivos modificados:**
M	ISSUES.md

## Commit ec73fa9

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 01:35:59 -0300

**Mensaje:** docs: add B1c bug - version placeholder not replaced in build

**Archivos modificados:**
M	ISSUES.md

## Commit e4100e4

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 01:40:02 -0300

**Mensaje:** feat: B2p - Add TLS/SSL configuration feature with technical implementation details

**Archivos modificados:**
M	ISSUES.md

## Commit f891706

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 09:14:22 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	ISSUES.md
M	backend/src/routes/entries.js

## Commit 1cde06b

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 09:21:27 -0300

**Mensaje:** mejora en campo de  entrada

**Archivos modificados:**
M	backend/src/routes/entries.js
M	frontend/src/app/pages/main/entries/entries.component.html

## Commit 95a791a

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 09:33:11 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	ISSUES.md
A	frontend/src/app/pages/main/my-entries/entry-edit-dialog.component.ts
M	frontend/src/app/pages/main/my-entries/my-entries.component.ts

## Commit 6310a31

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 09:37:05 -0300

**Mensaje:** bug

**Archivos modificados:**
M	frontend/src/app/pages/main/my-entries/entry-edit-dialog.component.ts
M	frontend/src/app/pages/main/my-entries/my-entries.component.ts

## Commit 33ec7fe

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 09:50:01 -0300

**Mensaje:** feat: LogSource por defecto 'Netics' + columna visible + edición

**Archivos modificados:**
A	DEPLOYMENT-LOGSOURCE.md
A	backend/scripts/add-netics.js
M	backend/src/routes/entries.js
M	backend/src/scripts/seed-catalogs.js
M	frontend/src/app/pages/main/my-entries/entry-edit-dialog.component.ts
M	frontend/src/app/pages/main/my-entries/my-entries.component.html
M	frontend/src/app/pages/main/my-entries/my-entries.component.ts

## Commit 0e2141c

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 09:52:24 -0300

**Mensaje:** feat: Scripts automatizados de migración para LogSource Netics

**Archivos modificados:**
M	DEPLOYMENT-LOGSOURCE.md
A	scripts/migrate-netics-logsource.ps1
A	scripts/migrate-netics-logsource.sh

## Commit 38248b7

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 09:53:50 -0300

**Mensaje:** fix: Eliminar opciones deprecadas de mongoose.connect

**Archivos modificados:**
M	backend/src/scripts/seed-catalogs.js
M	backend/src/scripts/seed-shift-roles.js

## Commit 67f528f

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 10:00:18 -0300

**Mensaje:** feat: LogSource por defecto configurable por admin (agnóstico)

**Archivos modificados:**
M	backend/src/models/AppConfig.js
M	backend/src/routes/config.js
M	backend/src/routes/entries.js
M	frontend/src/app/models/config.model.ts
M	frontend/src/app/pages/main/entries/entries.component.html
M	frontend/src/app/pages/main/my-entries/entry-edit-dialog.component.ts
M	frontend/src/app/pages/main/settings/settings.component.html
M	frontend/src/app/pages/main/settings/settings.component.ts
M	scripts/migrate-netics-logsource.ps1

## Commit 3912878

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 10:01:50 -0300

**Mensaje:** fix: Corregir carga de LogSources en dialog de edición

**Archivos modificados:**
M	frontend/src/app/pages/main/my-entries/entry-edit-dialog.component.ts

## Commit 84adb78

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 10:02:53 -0300

**Mensaje:** eliminacion

**Archivos modificados:**
D	scripts/migrate-netics-logsource.ps1
D	scripts/migrate-netics-logsource.sh

## Commit 6f58775

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 10:09:42 -0300

**Mensaje:** fix: Eliminar último fallback hardcodeado 'Netics' en tabla de mis entradas

**Archivos modificados:**
M	frontend/src/app/pages/main/my-entries/my-entries.component.html

## Commit 0bbcd95

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 10:13:28 -0300

**Mensaje:** refactor: Mover configuración de LogSource a Branding, renombrar menú de Logo

**Archivos modificados:**
M	frontend/src/app/pages/main/logo/logo.component.html
M	frontend/src/app/pages/main/logo/logo.component.ts
M	frontend/src/app/pages/main/main-layout.component.ts
M	frontend/src/app/pages/main/settings/settings.component.html
M	frontend/src/app/pages/main/settings/settings.component.ts

## Commit 9523411

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 10:27:37 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	frontend/src/app/pages/main/logo/logo.component.ts
M	frontend/src/app/pages/main/settings/settings.component.ts

## Commit c3e0e33

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 10:38:20 -0300

**Mensaje:** borrar logsources

**Archivos modificados:**
M	backend/src/routes/admin-catalog.js
M	frontend/src/app/pages/main/catalog-admin/catalog-admin.component.ts

## Commit 1f46adb

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 10:45:20 -0300

**Mensaje:** mejoras de tiempos

**Archivos modificados:**
M	backend/src/routes/auth.js
M	frontend/src/app/pages/auth/forgot-password/forgot-password.component.html
M	frontend/src/app/pages/auth/forgot-password/forgot-password.component.scss
M	frontend/src/app/pages/login/login.component.html
M	frontend/src/app/pages/login/login.component.scss

## Commit 0f466db

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 10:49:16 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	ISSUES.md

## Commit b64ed5a

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 11:02:58 -0300

**Mensaje:** cambio de masivo de eventos

**Archivos modificados:**
M	ISSUES.md
M	backend/src/routes/entries.js
A	frontend/src/app/pages/main/all-entries/admin-edit-dialog.component.ts
M	frontend/src/app/pages/main/all-entries/all-entries.component.html
M	frontend/src/app/pages/main/all-entries/all-entries.component.scss
M	frontend/src/app/pages/main/all-entries/all-entries.component.ts
M	frontend/src/app/services/entry.service.ts

## Commit ae04e43

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 11:08:30 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	backend/src/routes/entries.js

## Commit 05cde9a

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 11:12:59 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	backend/src/routes/entries.js

## Commit 1eda5a9

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 11:21:16 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	backend/src/routes/entries.js

## Commit 7934dc8

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 11:29:07 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	backend/src/routes/entries.js

## Commit 8f468a6

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 11:34:41 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	ISSUES.md

## Commit 8c7cc12

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 12:38:46 -0300

**Mensaje:** bug de modificacion masiva

**Archivos modificados:**
M	backend/src/routes/entries.js
M	frontend/src/app/pages/main/all-entries/admin-edit-dialog.component.ts
M	frontend/src/app/pages/main/all-entries/all-entries.component.ts

## Commit 2260be3

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 13:22:31 -0300

**Mensaje:** mejora en el campo de entradas  se agrega ofensas

**Archivos modificados:**
M	backend/src/models/Entry.js
M	backend/src/routes/entries.js
M	frontend/src/app/models/entry.model.ts
M	frontend/src/app/models/report.model.ts
M	frontend/src/app/pages/main/all-entries/admin-edit-dialog.component.ts
M	frontend/src/app/pages/main/all-entries/all-entries.component.html
M	frontend/src/app/pages/main/all-entries/all-entries.component.scss
M	frontend/src/app/pages/main/all-entries/all-entries.component.ts
M	frontend/src/app/pages/main/entries/entries.component.html
M	frontend/src/app/pages/main/my-entries/entry-edit-dialog.component.ts
M	frontend/src/app/pages/main/my-entries/my-entries.component.ts
M	frontend/src/app/services/entry.service.ts

## Commit 3bc3360

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 13:42:49 -0300

**Mensaje:** mejora en busquedas

**Archivos modificados:**
M	frontend/src/app/pages/main/all-entries/all-entries.component.html
M	frontend/src/app/pages/main/all-entries/all-entries.component.ts

## Commit 413ca30

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 13:53:36 -0300

**Mensaje:** mejoras

**Archivos modificados:**
M	frontend/src/app/pages/main/reports/reports.component.html
M	frontend/src/app/pages/main/reports/reports.component.scss

## Commit ffb5ce8

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 16:05:18 -0300

**Mensaje:** cambio localhost

**Archivos modificados:**
M	backend/src/routes/auth.js

## Commit c3aee38

**Autor:** BitacoraSOC
**Fecha:** 2026-02-03 16:09:09 -0300

**Mensaje:** mejora en reset contraseña

**Archivos modificados:**
M	frontend/src/app/pages/auth/reset-password/reset-password.component.html
M	frontend/src/app/pages/auth/reset-password/reset-password.component.scss

## Commit 342bae7

**Autor:** BitacoraSOC
**Fecha:** 2026-02-04 01:51:15 -0300

**Mensaje:** se agrega envio reporte  de fin de turno

**Archivos modificados:**
M	ISSUES.md
M	backend/package-lock.json
M	backend/package.json
M	backend/src/docs/swagger.yaml
M	backend/src/models/AppConfig.js
M	backend/src/models/Client.js
M	backend/src/models/Service.js
M	backend/src/models/ShiftCheck.js
A	backend/src/models/WorkShift.js
M	backend/src/routes/checklist.js
M	backend/src/routes/config.js
M	backend/src/routes/smtp.js
A	backend/src/routes/work-shifts.js
A	backend/src/scripts/seed-work-shifts.js
M	backend/src/server.js
A	backend/src/utils/email.js
A	backend/src/utils/shift-report.js
A	backend/src/utils/shift-scheduler.js
A	docs/EMAIL-REPORTS.md
A	docs/WORK-SHIFTS.md
A	frontend/src/app/components/current-shift/current-shift.component.ts
M	frontend/src/app/models/config.model.ts
A	frontend/src/app/models/work-shift.model.ts
M	frontend/src/app/pages/login/login.component.scss
M	frontend/src/app/pages/main/checklist-admin/checklist-admin.component.html
M	frontend/src/app/pages/main/checklist-admin/checklist-admin.component.ts
M	frontend/src/app/pages/main/main-layout.component.ts
M	frontend/src/app/pages/main/main.module.ts
A	frontend/src/app/pages/work-shifts/work-shifts-admin/work-shifts-admin.component.html
A	frontend/src/app/pages/work-shifts/work-shifts-admin/work-shifts-admin.component.scss
A	frontend/src/app/pages/work-shifts/work-shifts-admin/work-shifts-admin.component.ts
A	frontend/src/app/services/work-shift.service.ts

## Commit 17bd7f1

**Autor:** BitacoraSOC
**Fecha:** 2026-02-08 00:12:15 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	ISSUES.md

## Commit 3466c09

**Autor:** BitacoraSOC
**Fecha:** 2026-02-08 00:24:06 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	frontend/src/app/pages/login/login.component.html
M	frontend/src/app/pages/login/login.component.scss

## Commit 0a0c355

**Autor:** BitacoraSOC
**Fecha:** 2026-02-08 00:40:45 -0300

**Mensaje:** mejoras favicon y  correos

**Archivos modificados:**
M	ISSUES.md
M	README.md
M	backend/src/models/AppConfig.js
M	backend/src/routes/config.js
M	backend/src/utils/shift-report.js
M	frontend/src/app/app.component.ts
M	frontend/src/app/models/config.model.ts
M	frontend/src/app/pages/main/logo/logo.component.html
M	frontend/src/app/pages/main/logo/logo.component.scss
M	frontend/src/app/pages/main/logo/logo.component.ts
M	frontend/src/app/services/config.service.ts

## Commit bf9952e

**Autor:** BitacoraSOC
**Fecha:** 2026-02-08 12:32:35 -0300

**Mensaje:** cambios

**Archivos modificados:**
A	.markdownlint.json
M	ISSUES.md

## Commit 2431fc3

**Autor:** BitacoraSOC
**Fecha:** 2026-02-08 14:07:24 -0300

**Mensaje:** cambio de documentacion

**Archivos modificados:**
M	.env.example
M	README.md
M	backend/src/docs/swagger.yaml
M	docs/API.md
A	docs/ARCHITECTURE.md
M	docs/BACKUP.md
M	docs/CATALOGS.md
D	docs/EMAIL-REPORTS.md
M	docs/ESCALATION.md
M	docs/LOGGING.md
M	docs/RUNBOOK.md
M	docs/SCREENSHOTS.md
M	docs/SECURITY.md
M	docs/SETUP.md
M	docs/TROUBLESHOOTING.md
M	docs/WORK-SHIFTS.md

## Commit 5341189

**Autor:** BitacoraSOC
**Fecha:** 2026-02-08 14:14:54 -0300

**Mensaje:** cambios

**Archivos modificados:**
M	DEPLOY.md
D	DEPLOYMENT-LOGSOURCE.md
M	README.md
M	docs/API.md
M	docs/SETUP.md
