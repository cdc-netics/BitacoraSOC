import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Tag {
  _id: string;
  name: string;
  count: number;
  createdAt: string;
}

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit {
  tags: Tag[] = [];
  isLoading = false;
  tagForm!: FormGroup;
  displayedColumns: string[] = ['name', 'count', 'actions'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.tagForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
    this.loadTags();
  }

  loadTags(): void {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/tags`).subscribe({
      next: (response) => {
        this.tags = response.tags || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando tags:', err);
        this.isLoading = false;
      }
    });
  }

  addTag(): void {
    if (this.tagForm.invalid) return;
    
    const tagName = this.tagForm.value.name.toLowerCase().trim();
    this.http.post<any>(`${environment.apiUrl}/tags`, { name: tagName }).subscribe({
      next: () => {
        this.snackBar.open('Tag creado', 'Cerrar', { duration: 3000 });
        this.tagForm.reset();
        this.loadTags();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error creando tag', 'Cerrar', { duration: 3000 });
      }
    });
  }

  deleteTag(tag: Tag): void {
    if (!confirm(`¿Eliminar el tag "${tag.name}"?`)) return;
    
    this.http.delete(`${environment.apiUrl}/tags/${tag._id}`).subscribe({
      next: () => {
        this.snackBar.open('Tag eliminado', 'Cerrar', { duration: 3000 });
        this.loadTags();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error eliminando tag', 'Cerrar', { duration: 3000 });
      }
    });
  }

  normalizeTag(tag: Tag): void {
    const newName = prompt('Nuevo nombre para el tag:', tag.name);
    if (!newName || newName === tag.name) return;
    
    this.http.put(`${environment.apiUrl}/tags/${tag._id}`, { name: newName.toLowerCase() }).subscribe({
      next: () => {
        this.snackBar.open('Tag actualizado', 'Cerrar', { duration: 3000 });
        this.loadTags();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error actualizando tag', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
