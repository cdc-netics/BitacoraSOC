/**
 * 🔍 ENTITY AUTOCOMPLETE - Componente Reutilizable
 * 
 * Autocomplete genérico con Angular Material para catálogos grandes (1900+ items).
 * 
 * Features UX:
 *   ✅ Búsqueda incremental (typeahead) con debounce 250ms
 *   ✅ Spinner "Buscando..." durante búsqueda
 *   ✅ Mensaje "Sin resultados"
 *   ✅ Keyboard friendly (↑↓ flechas, Enter, Esc)
 *   ✅ Mouse friendly (click para seleccionar)
 *   ✅ Botón "X" para limpiar selección
 *   ✅ Soporta paste (Ctrl+V)
 *   ✅ Muestra: name (principal), parent (si existe), description truncada
 * 
 * Performance:
 *   ✅ ChangeDetectionStrategy.OnPush
 *   ✅ trackBy en *ngFor
 *   ✅ switchMap para cancelar requests anteriores
 *   ✅ Máximo 20 resultados por búsqueda (server-side)
 * 
 * Uso:
 *   <app-entity-autocomplete
 *     label="Evento"
 *     placeholder="Buscar evento..."
 *     [apiFn]="searchEventsFn"
 *     [displayFn]="displayEventFn"
 *     [minChars]="2"
 *     [disabled]="false"
 *     (selected)="onEventSelected($event)"
 *     (cleared)="onEventCleared()"
 *   ></app-entity-autocomplete>
 */
import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { 
  map, 
  debounceTime, 
  distinctUntilChanged, 
  switchMap, 
  catchError, 
  startWith,
  tap
} from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { MatFormField, MatLabel, MatSuffix, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatOption } from '@angular/material/core';

export interface AutocompleteItem {
  _id: string;
  name: string;
  parent?: string | null;
  description?: string;
  [key: string]: any; // Permite campos adicionales como motivoDefault, infoAdicionalDefault
}

export interface AutocompleteResponse {
  items: AutocompleteItem[];
  nextCursor?: string | null;
}

@Component({
    selector: 'app-entity-autocomplete',
    templateUrl: './entity-autocomplete.component.html',
    styleUrls: ['./entity-autocomplete.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatFormField, MatLabel, MatInput, ReactiveFormsModule, MatAutocompleteTrigger, NgIf, MatIconButton, MatSuffix, MatIcon, MatProgressSpinner, MatHint, MatAutocomplete, NgFor, MatOption, AsyncPipe]
})
export class EntityAutocompleteComponent implements OnInit {
  @ViewChild('inputField', { static: false }) inputField?: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger?: MatAutocompleteTrigger;

  // Inputs
  @Input() label = 'Buscar';
  @Input() placeholder = 'Escribe para buscar...';
  @Input() apiFn?: (query: string, cursor?: string) => Observable<AutocompleteResponse>;
  @Input() searchFn?: (query: string, cursor?: string) => Observable<AutocompleteResponse>;
  @Input() displayFn: (item: AutocompleteItem) => string = (item) => item.name || '';
  @Input() minChars = 2;
  @Input() disabled = false;

  // Outputs
  @Output() selected = new EventEmitter<AutocompleteItem>();
  @Output() cleared = new EventEmitter<void>();

  // Control del input
  searchControl = new FormControl('');

  // Observables
  filteredItems$!: Observable<AutocompleteItem[]>;
  isLoading = false;

  // Item seleccionado actual
  selectedItem: AutocompleteItem | null = null;

  ngOnInit(): void {
    if (!this.apiFn && this.searchFn) {
      this.apiFn = this.searchFn;
    }

    if (!this.apiFn) {
      throw new Error('EntityAutocomplete: apiFn es requerido');
    }

    const apiFn = this.apiFn;

    this.filteredItems$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value.trim() : ''),
      distinctUntilChanged(),
      debounceTime(250),
      switchMap(query => {
        if (query.length < this.minChars) {
          this.isLoading = false;
          return of([]);
        }

        this.isLoading = true;
        return apiFn(query).pipe(
          map(response => response.items || []),
          catchError(err => {
            console.error('Error en búsqueda de autocomplete:', err);
            return of([]);
          }),
          tap(() => this.isLoading = false)
        );
      })
    );
  }

  /**
   * Maneja la selección de un item del autocomplete
   */
  onItemSelected(event: MatAutocompleteSelectedEvent): void {
    const item = event.option.value as AutocompleteItem;
    this.selectedItem = item;
    
    // Mostrar el nombre en el input
    this.searchControl.setValue(this.displayFn(item), { emitEvent: false });
    
    // Emitir el objeto completo al componente padre
    this.selected.emit(item);
  }

  /**
   * Limpia la selección actual
   */
  clearSelection(): void {
    this.selectedItem = null;
    this.searchControl.setValue('', { emitEvent: false });
    this.cleared.emit();
    
    // Focus en el input después de limpiar
    setTimeout(() => this.inputField?.nativeElement.focus(), 100);
  }

  openPanel(): void {
    if (this.disabled) return;
    const value = this.searchControl.value ?? '';
    this.searchControl.setValue(value as string, { emitEvent: true });
    setTimeout(() => this.autocompleteTrigger?.openPanel(), 0);
  }

  /**
   * Función de display para mat-autocomplete
   * Evita que se muestre "[object Object]" en el input
   */
  displayWith = (item: AutocompleteItem | string): string => {
    if (typeof item === 'string') {
      return item;
    }
    return item ? this.displayFn(item) : '';
  };

  /**
   * TrackBy function para *ngFor (performance)
   */
  trackByItemId(index: number, item: AutocompleteItem): string {
    return item._id;
  }

  /**
   * Trunca texto largo para descripción
   */
  truncateText(text: string | undefined, maxLength: number = 60): string {
    if (!text) return '';
    return text.length > maxLength 
      ? text.substring(0, maxLength) + '...' 
      : text;
  }

  get shouldShowNoResults(): boolean {
    if (this.isLoading) return false;
    if (!this.selectedItem) {
      const value = this.searchControl.value;
      if (typeof value !== 'string') return false;
      return value.trim().length >= this.minChars;
    }
    return false;
  }
}
