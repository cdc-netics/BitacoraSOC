import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuditLogService } from '../../../services/audit-log.service';
import { AuditLog, AuditLogFilters } from '../../../models/audit-log.model';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.scss']
})
export class AuditLogsComponent implements OnInit {
  displayedColumns: string[] = ['timestamp', 'level', 'event', 'username', 'ip', 'reason'];
  logs: AuditLog[] = [];
  totalLogs = 0;
  pageSize = 20;
  currentPage = 1;

  filterForm: FormGroup;
  events: string[] = [];
  levelOptions = [
    { value: '', label: 'Todos' },
    { value: 'info', label: 'Info' },
    { value: 'warn', label: 'Advertencia' },
    { value: 'error', label: 'Error' }
  ];

  constructor(
    private auditLogService: AuditLogService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      event: [''],
      level: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadLogs();
    this.loadEvents();
  }

  loadLogs(): void {
    const filters: AuditLogFilters = {
      page: this.currentPage,
      limit: this.pageSize,
      ...this.filterForm.value
    };

    // Filtrar valores vacíos
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof AuditLogFilters] === '' || filters[key as keyof AuditLogFilters] === null) {
        delete filters[key as keyof AuditLogFilters];
      }
    });

    this.auditLogService.getAuditLogs(filters).subscribe({
      next: (response) => {
        this.logs = response.logs;
        this.totalLogs = response.pagination.totalItems;
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
      }
    });
  }

  loadEvents(): void {
    this.auditLogService.getEvents().subscribe({
      next: (response) => {
        this.events = response.events;
      },
      error: (error) => {
        console.error('Error loading events:', error);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadLogs();
  }

  onClearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadLogs();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadLogs();
  }

  getLevelColor(level: string): string {
    switch (level) {
      case 'error':
        return 'warn';
      case 'warn':
        return 'accent';
      case 'info':
      default:
        return 'primary';
    }
  }

  getSuccessIcon(success: boolean): string {
    return success ? 'check_circle' : 'error';
  }

  getSuccessColor(success: boolean): string {
    return success ? 'primary' : 'warn';
  }

  getEventType(event: string): 'operativa' | 'checklist' | null {
    // Eventos operativos
    const operativos = [
      'entry.create',
      'entry.update',
      'entry.delete',
      'escalation.trigger',
      'user.login',
      'user.logout',
      'config.update',
      'admin.action'
    ];

    // Eventos de checklist
    const checklists = [
      'checklist.create',
      'checklist.update',
      'checklist.complete',
      'checklist.delete',
      'shiftcheck.create',
      'shiftcheck.update',
      'shiftcheck.complete'
    ];

    if (operativos.some(op => event.includes(op))) return 'operativa';
    if (checklists.some(ch => event.includes(ch))) return 'checklist';
    return null;
  }

  getEntryTypeBadge(entryType: string): string {
    const badges: { [key: string]: string } = {
      'incidente': '🚨 Incidente',
      'operativa': '🔧 Operativa',
      'urgente': '⚡ Urgente',
      'checklist': '✓ Checklist',
      'nota': '📝 Nota',
      'reporte': '📊 Reporte'
    };
    return badges[entryType.toLowerCase()] || `📌 ${entryType}`;
  }

  getEntryTypeBadgeClass(entryType: string): string {
    const classes: { [key: string]: string } = {
      'incidente': 'incidente',
      'operativa': 'operativa',
      'urgente': 'urgente',
      'checklist': 'checklist',
      'nota': 'nota',
      'reporte': 'reporte'
    };
    return classes[entryType.toLowerCase()] || 'default';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}
