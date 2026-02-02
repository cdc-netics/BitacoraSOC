import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EntryService } from '../../../services/entry.service';
import { Entry } from '../../../models/entry.model';
import { AuthService } from '../../../services/auth.service';
import { EntryDetailDialogComponent } from './entry-detail-dialog.component';

@Component({
    selector: 'app-all-entries',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatTableModule,
        MatPaginatorModule,
        MatIconModule,
        MatChipsModule,
        MatSnackBarModule,
        MatDialogModule,
        EntryDetailDialogComponent
    ],
    templateUrl: './all-entries.component.html',
    styleUrl: './all-entries.component.scss'
})
export class AllEntriesComponent implements OnInit {
  searchForm: FormGroup;
  entries: Entry[] = [];
  totalEntries = 0;
  pageSize = 20;
  currentPage = 1;
  isGuest = false;

  displayedColumns: string[] = ['entryDate', 'entryTime', 'entryType', 'content', 'tags', 'author', 'actions'];

  entryTypeOptions: { value: string; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'operativa', label: 'Operativa' },
    { value: 'incidente', label: 'Incidente' }
  ];

  constructor(
    private fb: FormBuilder,
    private entryService: EntryService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.searchForm = this.fb.group({
      query: [''],
      entryType: [''],
      startDate: [''],
      endDate: [''],
      tags: ['']
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isGuest = user?.role === 'guest';
    if (this.isGuest) {
      this.displayedColumns = this.displayedColumns.filter(col => col !== 'actions');
    }
    this.loadEntries();
  }

  loadEntries(): void {
    const filters = this.searchForm.value;
    const params: any = {
      page: this.currentPage,
      limit: this.pageSize
    };

    if (filters.query?.trim()) params.query = filters.query.trim();
    if (filters.entryType) params.entryType = filters.entryType;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.tags?.trim()) params.tags = filters.tags.trim();

    this.entryService.getEntries(params).subscribe({
      next: (response) => {
        this.entries = response.entries;
        this.totalEntries = response.pagination?.total || 0;
      },
      error: (err) => {
        const msg = err.error?.message || 'Error cargando entradas';
        this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadEntries();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadEntries();
  }

  onDelete(entry: Entry): void {
    if (!confirm('¿Eliminar esta entrada?')) return;

    this.entryService.deleteEntry(entry._id).subscribe({
      next: () => {
        this.snackBar.open('✅ Entrada eliminada', 'Cerrar', { duration: 2000 });
        this.loadEntries();
      },
      error: (err) => {
        const msg = err.error?.message || 'Error eliminando entrada';
        this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
      }
    });
  }

  viewEntry(entry: Entry): void {
    const author = entry.createdByUsername || 'N/A';
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

  clearSearch(): void {
    this.searchForm.reset({
      query: '',
      entryType: '',
      startDate: '',
      endDate: '',
      tags: ''
    });
    this.currentPage = 1;
    this.loadEntries();
  }
}
