# 🚀 QUICK START - Sistema de Catálogos con Autocomplete

## ✅ Instalación Completa

Todo el código está implementado y funcionando. Solo necesitas:

### 1. Poblar Datos de Ejemplo

```bash
cd backend
node src/scripts/seed-catalogs.js
```

Esto creará:
- ✅ 8 eventos SOC
- ✅ 8 log sources / clientes  
- ✅ 6 tipos de operación

### 2. Iniciar Backend

```bash
cd backend
npm start
```

Backend corriendo en: http://localhost:3000

### 3. Iniciar Frontend

```bash
cd frontend
npm start
```

Frontend corriendo en: http://localhost:4200

## 🎯 Probar el Sistema

### 1. Login
- Navega a: http://localhost:4200/login
- Usuario: tu usuario existente

### 2. Demo de Autocompletes
- Navega a: http://localhost:4200/main/email-builder
- Prueba los 3 autocompletes:
  - **Evento**: Escribe "phishing", "malware", "vulnerability"
  - **Log Source**: Escribe "firewall", "defender", "trellix"
  - **Operation Type**: Escribe "investigación", "monitoreo", "respuesta"

### 3. Observa el Comportamiento
- ✅ Debounce de 250ms (espera mientras escribes)
- ✅ Spinner "Buscando..."
- ✅ Máximo 20 resultados
- ✅ Navegación con teclado (↑↓ Enter Esc)
- ✅ Click para seleccionar
- ✅ Botón X para limpiar
- ✅ Autocompletado de campos:
  - Al seleccionar Evento → autocompleta "Motivo"
  - Al seleccionar Operation Type → autocompleta "Info Adicional"

## 📡 Endpoints Backend

Todos funcionando:

```bash
# Buscar eventos
GET http://localhost:3000/api/catalog/events?search=phishing&enabled=true&limit=20

# Buscar log sources
GET http://localhost:3000/api/catalog/log-sources?search=firewall&enabled=true&limit=20

# Buscar operation types
GET http://localhost:3000/api/catalog/operation-types?search=investigacion&enabled=true&limit=20
```

**Respuesta**:
```json
{
  "items": [
    {
      "_id": "...",
      "name": "Phishing detectado",
      "parent": "Email Security",
      "description": "Correo electrónico de phishing...",
      "motivoDefault": "Se detectó correo de phishing...",
      "enabled": true
    }
  ],
  "nextCursor": null
}
```

## 🔧 Uso en Tus Componentes

### Importar Módulo

En tu módulo (ej: `my-feature.module.ts`):

```typescript
import { SharedComponentsModule } from '@app/components/shared-components.module';

@NgModule({
  imports: [
    // ...otros imports
    SharedComponentsModule
  ]
})
```

### Usar en Componente

```typescript
import { Component } from '@angular/core';
import { CatalogService } from '@app/services/catalog.service';
import { CatalogEvent } from '@app/models/catalog.model';

@Component({
  selector: 'app-my-form',
  template: `
    <app-entity-autocomplete
      label="Evento"
      placeholder="Buscar evento..."
      [apiFn]="searchEventsFn"
      [displayFn]="displayEventFn"
      (selected)="onEventSelected($event)"
    ></app-entity-autocomplete>
  `
})
export class MyFormComponent {
  searchEventsFn = (query: string) => this.catalogService.searchEvents(query);
  
  displayEventFn = (item: CatalogEvent) => {
    return item.parent ? `${item.name} (${item.parent})` : item.name;
  };

  constructor(private catalogService: CatalogService) {}

  onEventSelected(event: CatalogEvent) {
    console.log('Seleccionado:', event);
    // Hacer algo con el evento
  }
}
```

## 📊 Verificar en MongoDB

```bash
mongosh

use bitacora-soc

# Ver eventos
db.catalog_events.find().pretty()

# Ver índices
db.catalog_events.getIndexes()

# Probar búsqueda
db.catalog_events.find(
  { $text: { $search: "phishing" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })
```

## 🎨 Personalización

### Cambiar Mínimo de Caracteres

```html
<app-entity-autocomplete
  [minChars]="3"
  ...
></app-entity-autocomplete>
```

### Cambiar Límite de Resultados

```typescript
searchEventsFn = (query: string) => 
  this.catalogService.searchEvents(query, undefined, 30); // 30 items
```

### Función de Display Personalizada

```typescript
displayEventFn = (item: CatalogEvent) => {
  return `${item.name} - ${item.parent || 'General'}`;
};
```

## 📚 Documentación Completa

Ver: `docs/CATALOGS.md`

## 🐛 Problemas Comunes

### "Sin resultados" siempre
- ✅ Ejecutaste el seed? `node src/scripts/seed-catalogs.js`
- ✅ Backend está corriendo? `npm start` en carpeta backend

### Errores de compilación Angular
- ✅ `SharedComponentsModule` importado en tu módulo?
- ✅ `npm install` ejecutado?

### Backend no responde
- ✅ MongoDB está corriendo?
- ✅ Puerto 3000 está libre?
- ✅ Variables de entorno en `.env`?

## ✨ ¡Listo!

Sistema completamente funcional con:
- ✅ Backend Express con 3 endpoints
- ✅ 3 modelos MongoDB con índices
- ✅ Componente Angular reutilizable
- ✅ Servicio Angular con RxJS
- ✅ Ejemplo completo (Email Builder)
- ✅ Datos de seed
- ✅ Performance optimizada
- ✅ UX pulido con Material Design

**Próximos pasos**: Integra `<app-entity-autocomplete>` en tus formularios!
