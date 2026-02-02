import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatCheckbox } from '@angular/material/checkbox';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-backup',
    templateUrl: './backup.component.html',
    styleUrls: ['./backup.component.scss'],
    standalone: true,
    imports: [MatCard, MatCardHeader, MatCardTitle, MatIcon, MatCardContent, MatButton, NgIf, MatProgressSpinner, MatCheckbox, ReactiveFormsModule, FormsModule, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatIconButton, MatTooltip, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow]
})
export class BackupComponent implements OnInit {
  isExporting = false;
  isImporting = false;
  backupHistory: any[] = [];
  clearBeforeRestore = false;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadBackupHistory();
  }

  loadBackupHistory(): void {
    this.http.get<any>(`${environment.apiUrl}/backup/history`).subscribe({
      next: (response) => {
        this.backupHistory = response.backups || [];
      },
      error: () => {
        this.backupHistory = [];
      }
    });
  }

  exportCSV(type: 'entries' | 'checks' | 'all'): void {
    this.isExporting = true;
    
    this.http.get(`${environment.apiUrl}/backup/export/${type}`, { 
      responseType: 'blob' 
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bitacora-soc-${type}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.isExporting = false;
        this.snackBar.open('Exportación completada', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.isExporting = false;
        this.snackBar.open(err.error?.message || 'Error exportando', 'Cerrar', { duration: 3000 });
      }
    });
  }

  createBackup(): void {
    if (!confirm('¿Crear backup completo de la base de datos?')) return;

    this.isExporting = true;
    this.http.post<any>(`${environment.apiUrl}/backup/create`, {}).subscribe({
      next: (response) => {
        this.isExporting = false;
        this.snackBar.open('Backup creado: ' + response.filename, 'Cerrar', { duration: 5000 });
        this.loadBackupHistory();
      },
      error: (err) => {
        this.isExporting = false;
        this.snackBar.open(err.error?.message || 'Error creando backup', 'Cerrar', { duration: 3000 });
      }
    });
  }

  restoreBackup(backup: any): void {
    const action = this.clearBeforeRestore ? 'BORRAR TODOS LOS DATOS y restaurar' : 'agregar datos del';
    if (!confirm(`¿Confirmar ${action} backup ${backup.filename}? Esta operación no se puede deshacer.`)) return;

    this.isImporting = true;
    this.http.post<any>(`${environment.apiUrl}/backup/restore`, { 
      filename: backup.filename,
      clearBeforeRestore: this.clearBeforeRestore
    }).subscribe({
      next: (response) => {
        this.isImporting = false;
        this.snackBar.open(`Backup restaurado: ${response.imported} documentos`, 'Cerrar', { duration: 5000 });
      },
      error: (err) => {
        this.isImporting = false;
        this.snackBar.open(err.error?.message || 'Error restaurando', 'Cerrar', { duration: 3000 });
      }
    });
  }

  deleteBackup(backup: any): void {
    if (!confirm(`¿Eliminar backup "${backup.filename}"?`)) return;

    this.http.delete(`${environment.apiUrl}/backup/${backup._id}`).subscribe({
      next: () => {
        this.snackBar.open('Backup eliminado', 'Cerrar', { duration: 3000 });
        this.loadBackupHistory();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error eliminando', 'Cerrar', { duration: 3000 });
      }
    });
  }

  importBackup(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.name.endsWith('.json')) {
      this.snackBar.open('Solo se permiten archivos JSON', 'Cerrar', { duration: 3000 });
      return;
    }

    if (!confirm('¿Importar este backup? Esto agregará los datos al sistema.')) return;

    const formData = new FormData();
    formData.append('file', file);

    this.isImporting = true;
    this.http.post<any>(`${environment.apiUrl}/backup/import`, formData).subscribe({
      next: (response) => {
        this.isImporting = false;
        this.snackBar.open(`Importados ${response.imported} registros`, 'Cerrar', { duration: 5000 });
        input.value = ''; // Limpiar el input
      },
      error: (err) => {
        this.isImporting = false;
        this.snackBar.open(err.error?.message || 'Error importando', 'Cerrar', { duration: 3000 });
        input.value = '';
      }
    });
  }

  downloadBackup(backup: any): void {
    this.http.get(`${environment.apiUrl}/backup/download/${backup.filename}`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = backup.filename;
        a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Descarga completada', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error descargando', 'Cerrar', { duration: 3000 });
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-CL');
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
