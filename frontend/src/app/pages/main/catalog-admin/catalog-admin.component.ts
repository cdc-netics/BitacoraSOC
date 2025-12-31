import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CatalogService } from '../../../services/catalog.service';
import { CatalogEvent, CatalogLogSource, CatalogOperationType } from '../../../models/catalog.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-catalog-admin',
  templateUrl: './catalog-admin.component.html',
  styleUrls: ['./catalog-admin.component.scss']
})
export class CatalogAdminComponent implements OnInit {
  activeTab = 'events'; // 'events' | 'log-sources' | 'operation-types'

  // Listas
  events: CatalogEvent[] = [];
  logSources: CatalogLogSource[] = [];
  operationTypes: CatalogOperationType[] = [];

  // Estados
  isLoading = false;
  editingId: string | null = null;

  // Formularios
  eventForm: FormGroup;
  logSourceForm: FormGroup;
  operationTypeForm: FormGroup;

  constructor(
    private catalogService: CatalogService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.eventForm = this.fb.group({
      name: ['', Validators.required],
      parent: [''],
      description: [''],
      motivoDefault: [''],
      enabled: [true]
    });

    this.logSourceForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      enabled: [true]
    });

    this.operationTypeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      infoAdicionalDefault: [''],
      enabled: [true]
    });
  }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loadEvents();
    this.loadLogSources();
    this.loadOperationTypes();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EVENTOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  loadEvents(): void {
    this.isLoading = true;
    this.catalogService.getAllEvents().subscribe({
      next: (response: any) => {
        this.events = response.items || response;
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Error cargando eventos', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  saveEvent(): void {
    if (this.eventForm.invalid) {
      this.snackBar.open('Completa los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    const data = this.eventForm.value;

    if (this.editingId) {
      this.catalogService.updateEvent(this.editingId, data).subscribe({
        next: () => {
          this.snackBar.open('✅ Evento actualizado', 'Cerrar', { duration: 2000 });
          this.loadEvents();
          this.cancelEdit();
        },
        error: () => this.snackBar.open('Error actualizando', 'Cerrar', { duration: 3000 })
      });
    } else {
      this.catalogService.createEvent(data).subscribe({
        next: () => {
          this.snackBar.open('✅ Evento creado', 'Cerrar', { duration: 2000 });
          this.loadEvents();
          this.eventForm.reset({ enabled: true });
        },
        error: () => this.snackBar.open('Error creando', 'Cerrar', { duration: 3000 })
      });
    }
  }

  editEvent(event: CatalogEvent): void {
    this.editingId = event._id;
    this.eventForm.patchValue(event);
  }

  deleteEvent(id: string): void {
    if (!confirm('¿Deshabilitar este evento?')) return;

    this.catalogService.deleteEvent(id).subscribe({
      next: () => {
        this.snackBar.open('✅ Evento deshabilitado', 'Cerrar', { duration: 2000 });
        this.loadEvents();
      },
      error: () => this.snackBar.open('Error deshabilitando', 'Cerrar', { duration: 3000 })
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LOG SOURCES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  loadLogSources(): void {
    this.catalogService.getAllLogSources().subscribe({
      next: (response: any) => {
        this.logSources = response.items || response;
      },
      error: () => this.snackBar.open('Error cargando log sources', 'Cerrar', { duration: 3000 })
    });
  }

  saveLogSource(): void {
    if (this.logSourceForm.invalid) return;

    const data = this.logSourceForm.value;

    if (this.editingId) {
      this.catalogService.updateLogSource(this.editingId, data).subscribe({
        next: () => {
          this.snackBar.open('✅ Log Source actualizado', 'Cerrar', { duration: 2000 });
          this.loadLogSources();
          this.cancelEdit();
        },
        error: () => this.snackBar.open('Error actualizando', 'Cerrar', { duration: 3000 })
      });
    } else {
      this.catalogService.createLogSource(data).subscribe({
        next: () => {
          this.snackBar.open('✅ Log Source creado', 'Cerrar', { duration: 2000 });
          this.loadLogSources();
          this.logSourceForm.reset({ enabled: true });
        },
        error: () => this.snackBar.open('Error creando', 'Cerrar', { duration: 3000 })
      });
    }
  }

  editLogSource(source: CatalogLogSource): void {
    this.editingId = source._id;
    this.logSourceForm.patchValue(source);
  }

  deleteLogSource(id: string): void {
    if (!confirm('¿Deshabilitar este log source?')) return;

    this.catalogService.deleteLogSource(id).subscribe({
      next: () => {
        this.snackBar.open('✅ Log Source deshabilitado', 'Cerrar', { duration: 2000 });
        this.loadLogSources();
      },
      error: () => this.snackBar.open('Error deshabilitando', 'Cerrar', { duration: 3000 })
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OPERATION TYPES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  loadOperationTypes(): void {
    this.catalogService.getAllOperationTypes().subscribe({
      next: (response: any) => {
        this.operationTypes = response.items || response;
      },
      error: () => this.snackBar.open('Error cargando tipos de operación', 'Cerrar', { duration: 3000 })
    });
  }

  saveOperationType(): void {
    if (this.operationTypeForm.invalid) return;

    const data = this.operationTypeForm.value;

    if (this.editingId) {
      this.catalogService.updateOperationType(this.editingId, data).subscribe({
        next: () => {
          this.snackBar.open('✅ Tipo de operación actualizado', 'Cerrar', { duration: 2000 });
          this.loadOperationTypes();
          this.cancelEdit();
        },
        error: () => this.snackBar.open('Error actualizando', 'Cerrar', { duration: 3000 })
      });
    } else {
      this.catalogService.createOperationType(data).subscribe({
        next: () => {
          this.snackBar.open('✅ Tipo de operación creado', 'Cerrar', { duration: 2000 });
          this.loadOperationTypes();
          this.operationTypeForm.reset({ enabled: true });
        },
        error: () => this.snackBar.open('Error creando', 'Cerrar', { duration: 3000 })
      });
    }
  }

  editOperationType(type: CatalogOperationType): void {
    this.editingId = type._id;
    this.operationTypeForm.reset({ enabled: true });
    this.operationTypeForm.patchValue(type);
  }

  deleteOperationType(id: string): void {
    if (!confirm('¿Deshabilitar este tipo de operación?')) return;

    this.catalogService.deleteOperationType(id).subscribe({
      next: () => {
        this.snackBar.open('✅ Tipo de operación deshabilitado', 'Cerrar', { duration: 2000 });
        this.loadOperationTypes();
      },
      error: () => this.snackBar.open('Error deshabilitando', 'Cerrar', { duration: 3000 })
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.eventForm.reset({ enabled: true });
    this.logSourceForm.reset({ enabled: true });
    this.operationTypeForm.reset({ enabled: true });
  }
}
