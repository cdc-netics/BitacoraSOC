/**
 * Componente Layout Principal (Post-Login)
 * 
 * Funcionalidad:
 *   - Layout contenedor con sidebars izquierda/derecha
 *   - Sidebar izquierda: notas (admin + personal), autosave cada 3s
 *   - Sidebar derecha: checklist de turno (inicio/cierre)
 *   - Header con menú navegación + logout
 *   - Router outlet para vistas hijas (entries, reports, users, settings)
 * 
 * Sidebars:
 *   - Left: Nota admin (todos ven, solo admin edita) + nota personal (privada)
 *   - Right: Checklist servicios SOC (evaluar todos, rojos requieren observación)
 *   - Guests NO ven sidebars (solo contenido principal)
 * 
 * Autosave:
 *   - debounceTime(3000): guarda 3s después del último cambio
 *   - distinctUntilChanged: solo guarda si contenido realmente cambió
 *   - Subjects: adminNoteChange$, personalNoteChange$
 * 
 * Checklist:
 *   - Valida TODOS los servicios activos estén evaluados
 *   - Servicios en rojo REQUIEREN observación
 *   - NO permite tipos consecutivos (inicio->inicio bloqueado)
 *   - Valida cooldown configurable (default 4h)
 * 
 * Menú navegación (role-based):
 *   - Entries: todos los roles
 *   - Reports: admin + user (NO guests)
 *   - Users: solo admin
 *   - Settings: solo admin
 * 
 * RxJS:
 *   - destroy$: Subject para cleanup en ngOnDestroy (evita memory leaks)
 *   - takeUntil(destroy$): cancela subscriptions al destruir componente
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NoteService } from '../../services/note.service';
import { ChecklistService } from '../../services/checklist.service';
import { ThemeService } from '../../services/theme.service';
import { AdminNote, PersonalNote } from '../../models/note.model';
import { ServiceCatalog, ShiftCheck } from '../../models/checklist.model';
import { Theme } from '../../models/user.model';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private adminNoteChange$ = new Subject<string>();
  private personalNoteChange$ = new Subject<string>();

  currentUser: any = null;
  isAdmin = false;
  isUser = false;
  isGuest = false;

  // Sidebar states
  leftSidebarOpened = true;
  rightSidebarOpened = true;

  // Notas
  adminNote: Partial<AdminNote> = { content: '' };
  personalNote: Partial<PersonalNote> = { content: '' };

  // Checklist
  activeServices: ServiceCatalog[] = [];
  lastCheck: ShiftCheck | null = null;
  checkType: 'inicio' | 'cierre' = 'inicio';
  checklistServices: Array<{
    serviceId: string;
    serviceTitle: string;
    status: 'verde' | 'rojo' | null;
    observation: string;
  }> = [];
  checklistHasErrors = false;
  checklistErrorMessage = '';

  // Menú según prompt: Admin tiene todo, User solo básico, Guest limitado
  menuItems = [
    { icon: 'edit', label: 'Escribir', route: '/main/entries', roles: ['admin', 'user', 'guest'] },
    { icon: 'history', label: 'Mis Entradas', route: '/main/my-entries', roles: ['admin'] },
    { icon: 'public', label: '🌍 Ver todas', route: '/main/all-entries', roles: ['admin', 'user', 'guest'] },
    { icon: 'person', label: '👤 Mi Perfil', route: '/main/profile', roles: ['admin', 'user'] },
    { icon: 'people', label: 'Admin Usuarios', route: '/main/users', roles: ['admin'] },
    { icon: 'local_offer', label: 'Tags', route: '/main/tags', roles: ['admin'] },
    { icon: 'assessment', label: 'Reportes', route: '/main/reports', roles: ['admin', 'user'] },
    { icon: 'image', label: 'Logo', route: '/main/logo', roles: ['admin'] },
    { icon: 'backup', label: 'Backup', route: '/main/backup', roles: ['admin'] },
    { icon: 'checklist', label: 'Checklist', route: '/main/checklist', roles: ['admin', 'user'] },
    { icon: 'settings', label: 'Configuración', route: '/main/settings', roles: ['admin'] }
  ];

  constructor(
    private authService: AuthService,
    private noteService: NoteService,
    private checklistService: ChecklistService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadNotes();
    this.loadChecklist();
    this.setupAutosave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserData(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.isAdmin = this.currentUser.role === 'admin';
      this.isUser = this.currentUser.role === 'user';
      this.isGuest = this.currentUser.role === 'guest';
    }
  }

  setupAutosave(): void {
    // Autosave nota admin (solo para admins)
    this.adminNoteChange$
      .pipe(
        debounceTime(3000),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(content => {
        if (this.isAdmin && content !== null) {
          this.noteService.updateAdminNote({ content })
            .subscribe({
              next: () => console.log('✅ Nota admin guardada automáticamente'),
              error: (err) => console.error('Error en autosave nota admin:', err)
            });
        }
      });

    // Autosave nota personal
    this.personalNoteChange$
      .pipe(
        debounceTime(3000),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(content => {
        if (content !== null) {
          this.noteService.updatePersonalNote({ content })
            .subscribe({
              next: () => console.log('✅ Nota personal guardada automáticamente'),
              error: (err) => console.error('Error en autosave nota personal:', err)
            });
        }
      });
  }

  loadNotes(): void {
    if (!this.isGuest) {
      this.noteService.getAdminNote()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (note) => this.adminNote = note || { content: '' },
          error: (err) => console.error('Error cargando nota admin:', err)
        });

      this.noteService.getPersonalNote()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (note) => this.personalNote = note || { content: '' },
          error: (err) => console.error('Error cargando nota personal:', err)
        });
    }
  }

  loadChecklist(): void {
    this.checklistService.getActiveServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (services) => {
          this.activeServices = services;
          // Inicializar estructura de checklist
          this.checklistServices = services.map(s => ({
            serviceId: s._id,
            serviceTitle: s.title,
            status: null,
            observation: ''
          }));
        },
        error: (err) => console.error('Error cargando servicios:', err)
      });

    this.checklistService.getLastCheck()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.lastCheck = response.check || null;
          // Determinar próximo tipo según último check
          if (this.lastCheck) {
            this.checkType = this.lastCheck.type === 'inicio' ? 'cierre' : 'inicio';
          }
        },
        error: (err) => console.error('Error cargando último check:', err)
      });

    // 🔄 Refetch servicios cada 2 minutos para captar cambios del admin
    setInterval(() => {
      this.refreshChecklistServices();
    }, 120000); // 2 minutos
  }

  refreshChecklistServices(): void {
    this.checklistService.getActiveServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (services) => {
          // Solo actualizar si hay cambios (evitar reset innecesario)
          if (JSON.stringify(services) !== JSON.stringify(this.activeServices)) {
            console.log('ℹ️ Servicios actualizados por admin');
            this.activeServices = services;
            this.checklistServices = services.map(s => ({
              serviceId: s._id,
              serviceTitle: s.title,
              status: null,
              observation: ''
            }));
          }
        },
        error: (err) => console.error('Error refrescando servicios:', err)
      });
  }

  getVisibleMenuItems() {
    return this.menuItems.filter(item =>
      item.roles.includes(this.currentUser?.role || '')
    );
  }

  toggleLeftSidebar(): void {
    this.leftSidebarOpened = !this.leftSidebarOpened;
  }

  toggleRightSidebar(): void {
    this.rightSidebarOpened = !this.rightSidebarOpened;
  }

  saveAdminNote(): void {
    if (this.adminNote && this.isAdmin) {
      this.noteService.updateAdminNote({ content: this.adminNote.content || '' })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => console.log('Nota admin guardada'),
          error: (err) => console.error('Error guardando nota admin:', err)
        });
    }
  }

  onAdminNoteChange(content: string): void {
    this.adminNoteChange$.next(content);
  }

  savePersonalNote(): void {
    if (this.personalNote) {
      this.noteService.updatePersonalNote({ content: this.personalNote.content || '' })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => console.log('Nota personal guardada'),
          error: (err) => console.error('Error guardando nota personal:', err)
        });
    }
  }

  onPersonalNoteChange(content: string): void {
    this.personalNoteChange$.next(content);
  }

  onChecklistSubmit(): void {
    this.checklistHasErrors = false;
    this.checklistErrorMessage = '';

    // Validar que TODOS los servicios tengan estado
    const incompleteServices = this.checklistServices.filter(s => s.status === null);
    if (incompleteServices.length > 0) {
      this.checklistErrorMessage = `Debes evaluar todos los servicios. Faltan: ${incompleteServices.map(s => s.serviceTitle).join(', ')}`;
      this.checklistHasErrors = true;
      return;
    }

    // Validar que servicios en rojo tengan observación
    const redWithoutObservation = this.checklistServices.filter(s => 
      s.status === 'rojo' && (!s.observation || s.observation.trim() === '')
    );
    if (redWithoutObservation.length > 0) {
      this.checklistErrorMessage = `Los servicios en rojo requieren observación: ${redWithoutObservation.map(s => s.serviceTitle).join(', ')}`;
      this.checklistHasErrors = true;
      return;
    }

    // Construir payload
    const payload = {
      type: this.checkType,
      services: this.checklistServices.map(s => ({
        serviceId: s.serviceId,
        serviceTitle: s.serviceTitle,
        status: s.status!,
        observation: s.observation
      }))
    };

    this.checklistService.createCheck(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.lastCheck = response.check;
          // Alternar tipo para próximo check
          this.checkType = this.checkType === 'inicio' ? 'cierre' : 'inicio';
          // Resetear formulario
          this.checklistServices.forEach(s => {
            s.status = null;
            s.observation = '';
          });
          console.log('✅ Checklist enviado exitosamente');
        },
        error: (err) => {
          this.checklistErrorMessage = err.error?.message || 'Error enviando checklist';
          this.checklistHasErrors = true;
          console.error('Error enviando checklist:', err);
        }
      });
  }

  getChecklistIndicator(): 'ok' | 'warning' | 'none' {
    if (!this.lastCheck) return 'none';
    return this.lastCheck.hasRedServices ? 'warning' : 'ok';
  }

  getChecklistStatus(): 'ok' | 'warning' | 'none' {
    return this.getChecklistIndicator();
  }

  getChecklistStatusText(): string {
    const status = this.getChecklistStatus();
    switch (status) {
      case 'ok':
        return '✓ OK';
      case 'warning':
        return '⚠ Problemas';
      case 'none':
        return '— Sin registro';
      default:
        return '';
    }
  }

  changeTheme(theme: string): void {
    // Cast seguro: el selector HTML solo permite valores válidos
    this.themeService.setTheme(theme as Theme);
  }

  logout(): void {
    this.authService.logout();
  }
}
