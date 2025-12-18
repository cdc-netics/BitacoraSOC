import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { EntryService } from '../../../services/entry.service';
import { AuthService } from '../../../services/auth.service';
import { Entry } from '../../../models/entry.model';

@Component({
  selector: 'app-my-entries',
  templateUrl: './my-entries.component.html',
  styleUrls: ['./my-entries.component.scss']
})
export class MyEntriesComponent implements OnInit {
  displayedColumns: string[] = ['date', 'time', 'type', 'content', 'tags', 'actions'];
  dataSource = new MatTableDataSource<Entry>([]);
  isLoading = false;
  currentUser: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private entryService: EntryService,
    private authService: AuthService
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
}
