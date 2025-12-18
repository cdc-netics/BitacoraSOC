import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChecklistService } from '../../../services/checklist.service';
import { ServiceCatalog, ShiftCheck } from '../../../models/checklist.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.scss']
})
export class ChecklistComponent implements OnInit {
  activeServices: ServiceCatalog[] = [];
  lastCheck: ShiftCheck | null = null;
  checkType: 'inicio' | 'cierre' = 'inicio';
  isSubmitting = false;
  
  checklistServices: Array<{
    serviceId: string;
    serviceTitle: string;
    status: 'verde' | 'rojo' | null;
    observation: string;
  }> = [];

  constructor(
    private checklistService: ChecklistService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadServices();
    this.loadLastCheck();
  }

  loadServices(): void {
    this.checklistService.getActiveServices().subscribe({
      next: (services) => {
        this.activeServices = services;
        this.checklistServices = services.map(s => ({
          serviceId: s._id,
          serviceTitle: s.title,
          status: null,
          observation: ''
        }));
        this.logAction('checklist.services.load', 'ok', { count: services.length });
      },
      error: (err) => {
        this.logAction('checklist.services.load', 'error', { message: err?.message });
        this.snackBar.open('Error cargando servicios', 'Cerrar', { duration: 3000 });
      }
    });
  }

  loadLastCheck(): void {
    this.checklistService.getLastCheck().subscribe({
      next: (check: any) => {
        this.lastCheck = check?.check || null;
        this.logAction('checklist.last.load', 'ok', { exists: !!this.lastCheck });
      },
      error: (err) => this.logAction('checklist.last.load', 'error', { message: err?.message })
    });
  }

  getLastCheckStatus(): string {
    if (!this.lastCheck) return '— Sin registro';
    const type = this.lastCheck.type === 'inicio' ? 'Inicio' : 'Cierre';
    const status = this.lastCheck.hasRedServices ? '⛔ Con problemas' : '✅ OK';
    return `${type} - ${status}`;
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    const allHaveStatus = this.checklistServices.every(s => s.status !== null);
    if (!allHaveStatus) {
      this.snackBar.open('Todos los servicios deben tener estado', 'Cerrar', { duration: 3000 });
      return;
    }

    const invalidRed = this.checklistServices.find(s => 
      s.status === 'rojo' && (!s.observation || s.observation.trim() === '')
    );
    if (invalidRed) {
      this.snackBar.open(`El servicio "${invalidRed.serviceTitle}" está en rojo y requiere observación`, 'Cerrar', { duration: 4000 });
      return;
    }

    this.isSubmitting = true;
    const payload = {
      type: this.checkType,
      services: this.checklistServices.map(s => ({
        serviceId: s.serviceId,
        serviceTitle: s.serviceTitle,
        status: s.status!,
        observation: s.observation
      }))
    };

    this.checklistService.createCheck(payload).subscribe({
      next: () => {
        this.snackBar.open('✅ Checklist enviado exitosamente', 'Cerrar', { duration: 3000 });
        this.loadLastCheck();
        this.resetForm();
        this.logAction('checklist.submit', 'ok', { services: payload.services.length });
        this.isSubmitting = false;
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Error enviando checklist';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
        this.logAction('checklist.submit', 'error', { message: msg });
        this.isSubmitting = false;
      }
    });
  }

  private logAction(action: string, result: 'ok' | 'error', data: Record<string, unknown> = {}): void {
    const user = this.authService.getCurrentUser();
    const payload = {
      ts: new Date().toISOString(),
      user: user?.username || 'anon',
      action,
      result,
      ...data
    };
    if (result === 'ok') {
      console.log('[CHECKLIST]', payload);
    } else {
      console.error('[CHECKLIST]', payload);
    }
  }

  resetForm(): void {
    this.checklistServices.forEach(s => {
      s.status = null;
      s.observation = '';
    });
  }
}
