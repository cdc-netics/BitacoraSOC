# 📚 Sistema de Catálogos con Autocomplete

Sistema de autocomplete reutilizable con Angular Material para datasets grandes (1900+ items).

## 🎯 Componentes Implementados

### Backend (Express + MongoDB)

#### Modelos:
- **CatalogEvent** - Eventos SOC (phishing, malware, vulnerabilidades, etc)
- **CatalogLogSource** - Fuentes de logs / Clientes
- **CatalogOperationType** - Tipos de operación SOC

#### Endpoints:
```
GET /api/catalog/events?search={q}&enabled=true&limit=20
GET /api/catalog/log-sources?search={q}&enabled=true&limit=20
GET /api/catalog/operation-types?search={q}&enabled=true&limit=20
```

**Características**:
- ✅ Búsqueda server-side con índice de texto MongoDB
- ✅ Máximo 20 resultados por request (performance)
- ✅ Cursor-based pagination (opcional)
- ✅ Solo registros `enabled=true`
- ✅ Ordenamiento por relevancia (textScore)

### Frontend (Angular 17 + Material)

#### Componente Reutilizable:
**EntityAutocompleteComponent** - `<app-entity-autocomplete>`

**Features UX**:
- ✅ Typeahead con debounce 250ms
- ✅ Spinner "Buscando..."
- ✅ Mensaje "Sin resultados"
- ✅ Keyboard friendly (↑↓, Enter, Esc)
- ✅ Mouse friendly (click)
- ✅ Botón "X" para limpiar
- ✅ Paste support (Ctrl+V)
- ✅ Muestra name, parent, description truncada

**Performance**:
- ✅ ChangeDetectionStrategy.OnPush
- ✅ trackBy en *ngFor
- ✅ RxJS switchMap (cancela requests anteriores)
- ✅ Sin filtrado en frontend

## 🚀 Instalación

### 1. Seed de Datos

Poblar catálogos con datos de ejemplo:

```bash
cd backend
node src/scripts/seed-catalogs.js
```

Esto insertará:
- 8 eventos SOC de ejemplo
- 8 log sources / clientes
- 6 tipos de operación

### 2. Verificar Índices MongoDB

Los índices de texto se crean automáticamente al insertar el primer documento. Verificar:

```javascript
db.catalog_events.getIndexes()
db.catalog_log_sources.getIndexes()
db.catalog_operation_types.getIndexes()
```

Deberías ver índices:
- `catalog_event_search_index` (text search)
- `enabled_1_name_1` (queries rápidas)

## 📖 Uso

### Ejemplo Básico

```typescript
// Component
import { CatalogService } from '@app/services/catalog.service';
import { CatalogEvent } from '@app/models/catalog.model';

export class MyComponent {
  searchEventsFn = (query: string) => this.catalogService.searchEvents(query);
  
  displayEventFn = (item: CatalogEvent): string => {
    return item.parent ? `${item.name} (${item.parent})` : item.name;
  };

  onEventSelected(event: CatalogEvent): void {
    console.log('Evento seleccionado:', event);
    // Autocompletar otros campos
    this.form.patchValue({
      eventId: event._id,
      motivo: event.motivoDefault
    });
  }
}
```

```html
<!-- Template -->
<app-entity-autocomplete
  label="Evento"
  placeholder="Buscar evento..."
  [apiFn]="searchEventsFn"
  [displayFn]="displayEventFn"
  [minChars]="2"
  (selected)="onEventSelected($event)"
  (cleared)="onEventCleared()"
></app-entity-autocomplete>
```

### Ejemplo Completo

Ver: `frontend/src/app/pages/main/email-builder/`

Componente demo con 3 autocompletes integrados:
- Evento → autocompleta "Motivo"
- Log Source → selección simple
- Operation Type → autocompleta "Info Adicional"

**Ruta**: `/main/email-builder`

## 🔧 API Reference

### EntityAutocompleteComponent

**Inputs**:
- `label: string` - Label del campo
- `placeholder: string` - Placeholder del input
- `apiFn: (query: string) => Observable<{items, nextCursor}>` - Función de búsqueda
- `displayFn: (item) => string` - Función para mostrar texto en input
- `minChars: number = 2` - Mínimo caracteres para buscar
- `disabled: boolean = false` - Deshabilitar input

**Outputs**:
- `selected: EventEmitter<AutocompleteItem>` - Emite cuando se selecciona un item
- `cleared: EventEmitter<void>` - Emite cuando se limpia la selección

**Interfaces**:
```typescript
interface AutocompleteItem {
  _id: string;
  name: string;
  parent?: string | null;
  description?: string;
  [key: string]: any; // Campos adicionales
}

interface AutocompleteResponse {
  items: AutocompleteItem[];
  nextCursor?: string | null;
}
```

### CatalogService

```typescript
// Buscar eventos
searchEvents(query: string, cursor?: string, limit = 20): Observable<CatalogSearchResponse<CatalogEvent>>

// Buscar log sources
searchLogSources(query: string, cursor?: string, limit = 20): Observable<CatalogSearchResponse<CatalogLogSource>>

// Buscar tipos de operación
searchOperationTypes(query: string, cursor?: string, limit = 20): Observable<CatalogSearchResponse<CatalogOperationType>>
```

## 🎨 Customización

### Cambiar Estilos

Editar: `frontend/src/app/components/entity-autocomplete/entity-autocomplete.component.scss`

Variables CSS disponibles:
- `--mat-primary-color` - Color principal del tema

### Cambiar Límite de Resultados

En el componente:
```typescript
searchEventsFn = (query: string) => this.catalogService.searchEvents(query, undefined, 30); // 30 items
```

En backend: editar límite máximo en `routes/catalog.js`:
```javascript
const limitNum = Math.min(parseInt(limit) || 20, 50); // Max 50
```

## 📊 Performance

### Métricas Esperadas:
- Query MongoDB con text search: **< 50ms**
- Request completa: **< 200ms**
- Renderizado de 20 items: **< 100ms**

### Optimizaciones Implementadas:
1. **Índices MongoDB**: text search + compuesto (enabled + name)
2. **Debounce 250ms**: reduce requests innecesarias
3. **switchMap**: cancela requests anteriores
4. **Cursor pagination**: carga incremental (si se necesita)
5. **OnPush**: reduce ciclos de detección de cambios
6. **trackBy**: evita re-render de items ya renderizados

## 🔒 RBAC / Permisos

### Lectura (GET):
✅ Todos los usuarios autenticados pueden buscar catálogos

### Escritura (POST/PUT/DELETE):
❌ Solo rol `admin` (endpoints en `/api/admin/catalog/*` - no implementados en esta versión)

### Regla:
No se borran registros, solo se marcan como `enabled: false`

## 🧪 Testing

### Test Manual:
1. Iniciar backend: `cd backend && npm start`
2. Iniciar frontend: `cd frontend && npm start`
3. Login en `/login`
4. Navegar a `/main/email-builder`
5. Probar los 3 autocompletes

### Test de Performance:
```bash
# Insertar 2000 eventos para probar performance
node backend/src/scripts/seed-large-catalog.js
```

## 📝 Notas de Implementación

### MongoDB Text Search:
- Busca en: `name` (peso 10), `parent` (peso 5), `description` (peso 1)
- Case-insensitive
- Acepta múltiples palabras
- Ordenamiento automático por relevancia

### RxJS Pipeline:
```typescript
valueChanges.pipe(
  map(v => typeof v === 'string' ? v.trim() : ''),
  distinctUntilChanged(),
  filter(q => q.length >= minChars),
  debounceTime(250),
  switchMap(q => apiFn(q).pipe(
    catchError(() => of({ items: [], nextCursor: null }))
  ))
)
```

### Angular Material:
- `mat-autocomplete` con `displayWith`
- `mat-form-field` con appearance="outline"
- `mat-progress-spinner` para loading
- `mat-icon` para botón de limpiar

## 🐛 Troubleshooting

### "Sin resultados" siempre:
- Verificar que existen registros con `enabled: true`
- Verificar índice de texto en MongoDB
- Verificar que el backend está corriendo
- Verificar CORS en backend

### Performance lenta:
- Verificar índices: `db.catalog_events.getIndexes()`
- Reducir límite de resultados
- Verificar red/latencia

### Errores en consola:
- Verificar que `SharedComponentsModule` está importado
- Verificar que `CatalogService` está en `providedIn: 'root'`
- Verificar ruta de API en `environment.ts`

## 📦 Archivos Creados

### Backend:
```
backend/src/models/
  ├── CatalogEvent.js
  ├── CatalogLogSource.js
  └── CatalogOperationType.js

backend/src/routes/
  └── catalog.js

backend/src/scripts/
  └── seed-catalogs.js

backend/src/server.js (modificado)
```

### Frontend:
```
frontend/src/app/models/
  └── catalog.model.ts

frontend/src/app/services/
  └── catalog.service.ts

frontend/src/app/components/
  ├── entity-autocomplete/
  │   ├── entity-autocomplete.component.ts
  │   ├── entity-autocomplete.component.html
  │   └── entity-autocomplete.component.scss
  └── shared-components.module.ts

frontend/src/app/pages/main/
  ├── email-builder/ (ejemplo completo)
  │   ├── email-builder.component.ts
  │   ├── email-builder.component.html
  │   └── email-builder.component.scss
  └── main.module.ts (modificado)
```

## 🚀 Próximos Pasos

1. **Admin Panel**: Implementar CRUD de catálogos para rol admin
2. **Import CSV**: Importación masiva de eventos desde CSV/Excel
3. **Analytics**: Dashboard de eventos más usados
4. **Cache**: Implementar cache en Redis para queries frecuentes
5. **Infinite Scroll**: Usar `nextCursor` para load-more
6. **Multi-Select**: Variante para selección múltiple

## 📞 Soporte

Para issues o dudas:
1. Revisar esta documentación
2. Verificar logs de backend (consola)
3. Verificar logs de frontend (DevTools)
4. Revisar código de ejemplo en `email-builder.component.ts`
