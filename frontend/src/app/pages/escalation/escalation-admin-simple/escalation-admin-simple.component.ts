import { Component, OnInit, ChangeDetectorRef, NgZone, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, NativeDateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { EscalationService } from '../../../services/escalation.service';
import { UserService } from '../../../services/user.service';

@Injectable()
class MondayFirstNativeDateAdapter extends NativeDateAdapter {
  // Mostrar lunes como inicio de semana en el datepicker
  override getFirstDayOfWeek(): number {
    return 1;
  }
}

@Component({
  selector: 'app-escalation-admin-simple',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-CL' },
    {
      provide: DateAdapter,
      useClass: MondayFirstNativeDateAdapter
    }
  ],
  templateUrl: './escalation-admin-simple.component.html',
  styleUrls: ['./escalation-admin-simple.component.scss']
})
export class EscalationAdminSimpleComponent implements OnInit {
  // Turnos internos
  assignments: any[] = [];
  loadingAssignments = false;
  savingAssignment = false;
  showAssignmentForm = false;
  assignmentForm!: FormGroup;
  users: any[] = [];
  roles = ['N2', 'TI', 'N1_NO_HABIL'];

  // Personas externas (no usuarios del sistema)
  externalPeople: any[] = [];
  loadingExternalPeople = false;
  showExternalPersonForm = false;
  externalPersonForm!: FormGroup;
  editingExternalPersonId: string | null = null;

  // Contactos de clientes
  clients: any[] = [];
  services: any[] = [];
  contacts: any[] = [];
  loadingClients = false;
  loadingServices = false;
  loadingContacts = false;

  showClientForm = false;
  clientForm!: FormGroup;
  editingClientId: string | null = null;

  showServiceForm = false;
  serviceForm!: FormGroup;
  editingServiceId: string | null = null;

  showContactForm = false;
  contactForm!: FormGroup;
  editingContactId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private escalationService: EscalationService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadAllData();
  }

  initForms(): void {
    this.assignmentForm = this.fb.group({
      roleCode: ['', Validators.required],
      assignedUserId: ['', Validators.required],
      weekStartDate: ['', Validators.required],
      weekEndDate: ['', Validators.required],
      startTime: ['08:00', Validators.required],
      endTime: ['18:00', Validators.required]
    });

    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      active: [true]
    });

    this.serviceForm = this.fb.group({
      clientId: ['', Validators.required],
      name: ['', Validators.required],
      active: [true]
    });

    this.contactForm = this.fb.group({
      serviceId: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      role: ['PARA', Validators.required],
      active: [true]
    });

    this.externalPersonForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      position: [''],
      active: [true]
    });
  }

  loadAllData(): void {
    this.loadUsers();
    this.loadExternalPeople();
    this.loadAssignments();
    this.loadClients();
    this.loadServices();
    this.loadContacts();
  }

  // ============ TURNOS INTERNOS ============
  loadUsers(): void {
    this.escalationService.getUsers().subscribe({
      next: (data) => {
        this.users = [...data];
        console.log('✅ Users loaded from escalation service:', this.users.length, 'users');
        if (this.users.length > 0) {
          console.log('First user:', this.users[0]);
        }
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: (err) => {
        console.log('⚠️ Escalation service failed, trying user service...', err.message);
        // Si falla, intentar con endpoint público de users
        this.userService.getUsersList().subscribe({
          next: (data) => {
            this.users = [...data];
            console.log('✅ Users loaded from user service:', this.users.length, 'users');
            if (this.users.length > 0) {
              console.log('First user:', this.users[0]);
            }
            setTimeout(() => this.cdr.detectChanges(), 0);
          },
          error: (err2) => {
            console.error('❌ Error loading users from user service:', err2);
            this.showError('Error al cargar usuarios');
            this.users = [];
            setTimeout(() => this.cdr.detectChanges(), 0);
          }
        });
      }
    });
  }

  loadAssignments(): void {
    this.loadingAssignments = true;
    this.escalationService.getAssignments().subscribe({
      next: (data) => {
        this.assignments = [...data].sort((a: any, b: any) => 
          new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime()
        );
        this.loadingAssignments = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading assignments:', err);
        this.loadingAssignments = false;
      }
    });
  }

  addAssignment(): void {
    this.showAssignmentForm = true;
    this.assignmentForm.reset({
      roleCode: '',
      assignedUserId: '',
      weekStartDate: '',
      weekEndDate: '',
      startTime: '08:00',
      endTime: '18:00'
    });
  }

  saveAssignment(): void {
    if (this.assignmentForm.invalid || this.savingAssignment) {
      this.showError('Complete todos los campos');
      return;
    }

    this.savingAssignment = true;
    const formData = this.assignmentForm.value;
    const isExternal = typeof formData.assignedUserId === 'string' && formData.assignedUserId.startsWith('ext_');
    const externalPersonId = isExternal ? formData.assignedUserId.replace('ext_', '') : undefined;
    // Combinar fecha con hora para crear datetime completo
    const startDateTime = new Date(formData.weekStartDate);
    const [startHour, startMin] = formData.startTime.split(':');
    startDateTime.setHours(parseInt(startHour), parseInt(startMin), 0);
    
    const endDateTime = new Date(formData.weekEndDate);
    const [endHour, endMin] = formData.endTime.split(':');
    endDateTime.setHours(parseInt(endHour), parseInt(endMin), 0);

    const data = {
      roleCode: formData.roleCode,
      userId: isExternal ? undefined : formData.assignedUserId,
      externalPersonId: isExternal ? externalPersonId : undefined,
      weekStartDate: startDateTime.toISOString(),
      weekEndDate: endDateTime.toISOString()
    };

    this.escalationService.createAssignment(data).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.showSuccess('Turno asignado correctamente');
          this.showAssignmentForm = false;
          this.loadAssignments();
          this.savingAssignment = false;
        });
      },
      error: (err) => {
        console.error('Error:', err);
        this.showError('Error al asignar turno');
        this.savingAssignment = false;
      }
    });
  }

  deleteAssignment(id: string): void {
    if (confirm('¿Eliminar esta asignación?')) {
      this.escalationService.deleteAssignment(id).subscribe({
        next: () => {
          this.showSuccess('Asignación eliminada');
          this.loadAssignments();
        },
        error: (err) => {
          console.error('Error:', err);
          this.showError('Error al eliminar');
        }
      });
    }
  }

  // ============ CLIENTES ============
  loadClients(): void {
    this.loadingClients = true;
    this.escalationService.getAllClients().subscribe({
      next: (data) => {
        this.clients = [...data];
        this.loadingClients = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.loadingClients = false;
      }
    });
  }

  addClient(): void {
    this.showClientForm = true;
    this.editingClientId = null;
    this.clientForm.reset({ name: '', active: true });
  }

  saveClient(): void {
    if (this.clientForm.invalid) return;

    const data = this.clientForm.value;
    this.escalationService.createClient(data).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.showSuccess('Cliente creado');
          this.showClientForm = false;
          this.loadClients();
        });
      },
      error: (err) => {
        console.error('Error:', err);
        this.showError('Error al crear cliente');
      }
    });
  }

  deleteClient(id: string): void {
    if (confirm('¿Eliminar cliente?')) {
      this.escalationService.deleteClient(id).subscribe({
        next: () => {
          this.showSuccess('Cliente eliminado');
          this.loadClients();
        },
        error: (err) => this.showError('Error al eliminar')
      });
    }
  }

  // ============ SERVICIOS ============
  loadServices(): void {
    this.loadingServices = true;
    this.escalationService.getAllServices().subscribe({
      next: (data) => {
        this.services = [...data];
        this.loadingServices = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.loadingServices = false;
      }
    });
  }

  addService(): void {
    this.showServiceForm = true;
    this.editingServiceId = null;
    this.serviceForm.reset({ clientId: '', name: '', active: true });
  }

  saveService(): void {
    if (this.serviceForm.invalid) return;

    const data = this.serviceForm.value;
    this.escalationService.createService(data).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.showSuccess('Servicio creado');
          this.showServiceForm = false;
          this.loadServices();
        });
      },
      error: (err) => {
        console.error('Error:', err);
        this.showError('Error al crear servicio');
      }
    });
  }

  deleteService(id: string): void {
    if (confirm('¿Eliminar servicio?')) {
      this.escalationService.deleteService(id).subscribe({
        next: () => {
          this.showSuccess('Servicio eliminado');
          this.loadServices();
        },
        error: (err) => this.showError('Error al eliminar')
      });
    }
  }

  // ============ CONTACTOS ============
  loadContacts(): void {
    this.loadingContacts = true;
    this.escalationService.getAllContacts().subscribe({
      next: (data) => {
        this.contacts = [...data];
        this.loadingContacts = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.loadingContacts = false;
      }
    });
  }

  addContact(): void {
    this.showContactForm = true;
    this.editingContactId = null;
    this.contactForm.reset({ 
      serviceId: '', 
      name: '', 
      email: '', 
      phone: '', 
      role: 'PARA',
      active: true 
    });
  }

  saveContact(): void {
    if (this.contactForm.invalid) return;

    const data = this.contactForm.value;
    const request$ = this.editingContactId
      ? this.escalationService.updateContact(this.editingContactId, data)
      : this.escalationService.createContact(data);

    request$.subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.showSuccess(this.editingContactId ? 'Contacto actualizado' : 'Contacto creado');
          this.showContactForm = false;
          this.editingContactId = null;
          this.loadContacts();
        });
      },
      error: (err) => {
        console.error('Error:', err);
        this.showError('Error al guardar contacto');
      }
    });
  }

  deleteContact(id: string): void {
    if (confirm('¿Eliminar contacto?')) {
      this.escalationService.deleteContact(id).subscribe({
        next: () => {
          this.showSuccess('Contacto eliminado');
          this.loadContacts();
        },
        error: (err) => this.showError('Error al eliminar')
      });
    }
  }

  editContact(contact: any): void {
    this.showContactForm = true;
    this.editingContactId = contact._id;
    const serviceId = typeof contact.serviceId === 'object' && contact.serviceId !== null
      ? contact.serviceId._id
      : (contact.serviceId || '');
    this.contactForm.patchValue({
      serviceId,
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      role: contact.role || 'PARA',
      active: contact.active !== false
    });
  }

  // ============ PERSONAS EXTERNAS ============
  loadExternalPeople(): void {
    this.loadingExternalPeople = true;
    this.escalationService.getExternalPeople().subscribe({
      next: (data) => {
        this.externalPeople = [...data];
        this.loadingExternalPeople = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading external people:', err);
        this.loadingExternalPeople = false;
      }
    });
  }

  addExternalPerson(): void {
    this.showExternalPersonForm = true;
    this.editingExternalPersonId = null;
    this.externalPersonForm.reset({
      name: '',
      email: '',
      phone: '',
      position: '',
      active: true
    });
  }

  saveExternalPerson(): void {
    if (this.externalPersonForm.invalid) {
      this.showError('Complete todos los campos obligatorios');
      return;
    }

    const data = this.externalPersonForm.value;
    this.escalationService.createExternalPerson(data).subscribe({
      next: () => {
        this.showSuccess('Persona agregada');
        this.showExternalPersonForm = false;
        this.loadExternalPeople();
      },
      error: (err) => {
        console.error('Error creating external person:', err);
        this.showError('Error al agregar persona');
      }
    });
  }

  deleteExternalPerson(id: string): void {
    if (confirm('¿Eliminar esta persona?')) {
      this.escalationService.deleteExternalPerson(id).subscribe({
        next: () => {
          this.showSuccess('Persona eliminada');
          this.loadExternalPeople();
        },
        error: (err) => {
          console.error('Error deleting external person:', err);
          this.showError('Error al eliminar persona');
        }
      });
    }
  }

  // ============ UTILIDADES ============
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CL');
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 4000 });
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }
}
