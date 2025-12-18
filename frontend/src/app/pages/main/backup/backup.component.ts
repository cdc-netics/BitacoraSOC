import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-backup',
  templateUrl: './backup.component.html',
  styleUrls: ['./backup.component.scss']
})
export class BackupComponent implements OnInit {
  isExporting = false;
  isImporting = false;
  backupHistory: any[] = [];

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
    if (!confirm(`¿Restaurar backup "${backup.filename}"? Esto sobrescribirá los datos actuales.`)) return;

    this.isImporting = true;
    this.http.post<any>(`${environment.apiUrl}/backup/restore`, { 
      filename: backup.filename 
    }).subscribe({
      next: () => {
        this.isImporting = false;
        this.snackBar.open('Backup restaurado correctamente', 'Cerrar', { duration: 3000 });
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

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-CL');
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
