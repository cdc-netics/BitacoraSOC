import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { ChecklistService } from '../../../services/checklist.service';
import { ChecklistTemplate, ChecklistItem, ShiftCheck } from '../../../models/checklist.model';
import { AuthService } from '../../../services/auth.service';

type ChecklistNode = {
  serviceId: string;
  serviceTitle: string;
  description?: string;
  parentId?: string;
  parent?: ChecklistNode;
  status: 'verde' | 'rojo' | null;
  observation: string;
  children?: ChecklistNode[];
};

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.scss']
})
export class ChecklistComponent implements OnInit {
  activeChecklist: ChecklistTemplate | null = null;
  lastCheck: ShiftCheck | null = null;
  checkType: 'inicio' | 'cierre' = 'inicio';
  isSubmitting = false;
  isLoading = false;
  checklistTree: ChecklistNode[] = [];

  constructor(
    private checklistService: ChecklistService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private expansionModule: MatExpansionModule
  ) {}

  ngOnInit(): void {
    this.loadActiveChecklist();
    this.loadLastCheck();
  }

  private buildNodes(items: ChecklistItem[], parent?: ChecklistNode): ChecklistNode[] {
    return (items || []).map(item => {
      const node: ChecklistNode = {
        serviceId: item._id,
        serviceTitle: item.title,
        description: item.description,
        parentId: parent?.serviceId,
        parent,
        status: null,
        observation: '',
        children: []
      };
      node.children = this.buildNodes(item.children || [], node);
      return node;
    });
  }

  private flattenNodes(nodes: ChecklistNode[]): ChecklistNode[] {
    return nodes.reduce<ChecklistNode[]>((acc, node) => {
      acc.push(node);
      if (node.children?.length) {
        acc.push(...this.flattenNodes(node.children));
      }
      return acc;
    }, []);
  }

  onStatusChange(node: ChecklistNode, status: 'verde' | 'rojo'): void {
    node.status = status;
    if (status !== 'rojo') {
      node.observation = '';
    }
    this.syncAncestors(node);
  }

  private syncAncestors(node: ChecklistNode): void {
    let current = node.parent;
    while (current) {
      if (this.hasDescendantInRed(current)) {
        current.status = 'rojo';
      } else if (current.status === 'rojo' && !current.observation) {
        current.status = null;
      }
      current = current.parent;
    }
  }

  private hasDescendantInRed(node: ChecklistNode): boolean {
    return (node.children || []).some(child =>
      child.status === 'rojo' || this.hasDescendantInRed(child)
    );
  }

  loadActiveChecklist(): void {
    this.isLoading = true;
    this.checklistService.getActiveChecklist().subscribe({
      next: (template) => {
        this.activeChecklist = template;
        this.checklistTree = this.buildNodes(template?.items || []);
        this.logAction('checklist.template.load', 'ok', { count: this.flattenNodes(this.checklistTree).length });
        this.isLoading = false;
      },
      error: (err) => {
        this.logAction('checklist.template.load', 'error', { message: err?.message });
        this.snackBar.open('Error cargando checklist activo', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadLastCheck(): void {
    this.checklistService.getLastCheck().subscribe({
      next: (check: any) => {
        this.lastCheck = (check as any)?.check || check || null;
        this.logAction('checklist.last.load', 'ok', { exists: !!this.lastCheck });
      },
      error: (err) => this.logAction('checklist.last.load', 'error', { message: err?.message })
    });
  }

  getLastCheckStatus(): string {
    if (!this.lastCheck) return 'Sin registro';
    const type = this.lastCheck.type === 'inicio' ? 'Inicio' : 'Cierre';
    const status = this.lastCheck.hasRedServices ? 'Con problemas' : 'OK';
    return `${type} - ${status}`;
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    const flat = this.flattenNodes(this.checklistTree);
    const allHaveStatus = flat.every(s => s.status !== null);
    if (!allHaveStatus) {
      this.snackBar.open('Todos los servicios y sub-items deben tener estado', 'Cerrar', { duration: 3000 });
      return;
    }

    const invalidRed = flat.find(s =>
      s.status === 'rojo' &&
      !this.hasDescendantInRed(s) &&
      (!s.observation || s.observation.trim() === '')
    );
    if (invalidRed) {
      this.snackBar.open(`El servicio "${invalidRed.serviceTitle}" esta en rojo y requiere observacion`, 'Cerrar', { duration: 4000 });
      return;
    }

    this.isSubmitting = true;
    const payload = {
      checklistId: this.activeChecklist?._id || undefined,
      type: this.checkType,
      services: flat.map(s => ({
        serviceId: s.serviceId,
        parentServiceId: s.parentId || null,
        serviceTitle: s.serviceTitle,
        status: s.status!,
        observation: s.observation
      }))
    };

    this.checklistService.createCheck(payload).subscribe({
      next: () => {
        this.snackBar.open('Checklist enviado exitosamente', 'Cerrar', { duration: 3000 });
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
    this.checklistTree.forEach(node => this.resetNode(node));
  }

  private resetNode(node: ChecklistNode): void {
    node.status = null;
    node.observation = '';
    node.children?.forEach(child => this.resetNode(child));
  }
}
