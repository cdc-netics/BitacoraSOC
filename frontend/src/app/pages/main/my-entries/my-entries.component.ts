import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { EntryService } from '../../../services/entry.service';
import { AuthService } from '../../../services/auth.service';
import { Entry } from '../../../models/entry.model';
import { NgIf, NgFor, SlicePipe, DatePipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatChipSet, MatChip } from '@angular/material/chips';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EntryDetailDialogComponent } from '../all-entries/entry-detail-dialog.component';

@Component({
    selector: 'app-my-entries',
    templateUrl: './my-entries.component.html',
    styleUrls: ['./my-entries.component.scss'],
  imports: [NgIf, MatProgressSpinner, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatChipSet, NgFor, MatChip, MatIconButton, MatTooltip, MatIcon, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, SlicePipe, DatePipe, MatDialogModule, EntryDetailDialogComponent]
})
export class MyEntriesComponent implements OnInit {
  displayedColumns: string[] = ['date', 'time', 'type', 'content', 'tags', 'actions'];
  dataSource = new MatTableDataSource<Entry>([]);
  isLoading = false;
  currentUser: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private entryService: EntryService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadMyEntries();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadMyEntries(): void {
    this.isLoading = true;
    // Usar getEntries con filtro por userId (usuario actual)
    this.entryService.getEntries({ userId: this.currentUser?._id }).subscribe({
      next: (response: any) => {
        this.dataSource.data = response.entries || [];
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error cargando mis entradas:', err);
        this.isLoading = false;
      }
    });
  }

  getTypeLabel(type: string): string {
    return type === 'incidente' ? '🚨 Incidente' : '📋 Operativa';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CL');
  }

  editEntry(entry: Entry): void {
    // TODO: Implementar edición
    console.log('Editar:', entry);
  }

  deleteEntry(entry: Entry): void {
    if (confirm('¿Estás seguro de eliminar esta entrada?')) {
      // TODO: Implementar eliminación
      console.log('Eliminar:', entry);
    }
  }

  viewEntry(entry: Entry): void {
    const author = entry.createdByUsername || this.currentUser?.username || 'N/A';
    const date = entry.entryDate;
    const time = entry.entryTime;
    const type = entry.entryType === 'incidente' ? 'INCIDENTE' : 'Operativa';
    const tags = entry.tags?.join(', ') || 'Sin tags';

    const details = `Fecha: ${date} ${time}
Autor: ${author}
Tags: ${tags}`;

    this.dialog.open(EntryDetailDialogComponent, {
      data: {
        title: `Entrada ${type}`,
        details,
        content: entry.content || ''
      },
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '85vh'
    });
  }
}
