import { Component, OnInit, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatSelect, MatOption } from '@angular/material/select';
import { NgFor } from '@angular/common';
import { CatalogService } from '../../services/catalog.service';
import { ConfigService } from '../../services/config.service';

@Component({
    selector: 'app-logo',
    templateUrl: './logo.component.html',
    styleUrls: ['./logo.component.scss'],
    imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, NgIf, MatIcon, MatButton, MatProgressSpinner, MatFormField, MatLabel, MatInput, ReactiveFormsModule, FormsModule, MatHint, MatSelect, MatOption, NgFor]
})
export class LogoComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private catalogService = inject(CatalogService);
  private configService = inject(ConfigService);

  currentLogo: string = '';
  logoUrl: string = '';
  isLoading = false;
  previewUrl: string = '';
  private backendBaseUrl = environment.backendBaseUrl;

  // LogSource
  logSources: any[] = [];
  brandingForm: FormGroup;
  savingBranding = false;

  constructor() {
    this.brandingForm = this.fb.group({
      defaultLogSourceId: [null]
    });
  }

  ngOnInit(): void {
    this.loadCurrentLogo();
    this.loadLogSources();
    this.loadBrandingConfig();
  }

  loadLogSources(): void {
    this.catalogService.getAllLogSources().subscribe({
      next: (response: any) => {
        this.logSources = response.items || response || [];
      },
      error: (err) => {
        console.error('Error cargando LogSources:', err);
        this.snackBar.open('Error cargando LogSources', 'Cerrar', { duration: 3000 });
      }
    });
  }

  loadBrandingConfig(): void {
    this.configService.getConfig().subscribe({
      next: (config: any) => {
        if (config.defaultLogSourceId) {
          const sourceId = typeof config.defaultLogSourceId === 'object' 
            ? config.defaultLogSourceId._id 
            : config.defaultLogSourceId;
          this.brandingForm.patchValue({
            defaultLogSourceId: sourceId
          });
        }
      },
      error: (err) => {
        console.error('Error cargando config:', err);
      }
    });
  }

  saveBrandingConfig(): void {
    if (!this.brandingForm.valid) return;

    this.savingBranding = true;
    const data = {
      defaultLogSourceId: this.brandingForm.value.defaultLogSourceId
    };

    this.configService.updateConfig(data).subscribe({
      next: () => {
        this.savingBranding = false;
        this.snackBar.open('Configuración de branding guardada', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.savingBranding = false;
        this.snackBar.open(err.error?.message || 'Error guardando configuración', 'Cerrar', { duration: 3000 });
      }
    });
  }

  getAssetUrl(url: string): string {
    if (!url) return '';
    // Si es URL completa (http/https), retornarla tal cual
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Si es ruta relativa, construir URL del backend
    return `${this.backendBaseUrl}${url}`;
  }

  loadCurrentLogo(): void {
    this.http.get<any>(`${environment.apiUrl}/config/logo`).subscribe({
      next: (response) => {
        this.currentLogo = response.logoUrl || '';
        this.logoUrl = this.currentLogo;
      },
      error: () => {
        this.currentLogo = '';
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.match('image.*')) {
      this.snackBar.open('Solo se permiten imágenes', 'Cerrar', { duration: 3000 });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.snackBar.open('El archivo es muy grande (máx 2MB)', 'Cerrar', { duration: 3000 });
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  uploadLogo(): void {
    if (!this.previewUrl) {
      this.snackBar.open('Selecciona una imagen primero', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.http.post<any>(`${environment.apiUrl}/config/logo`, { 
      logoData: this.previewUrl 
    }).subscribe({
      next: (response) => {
        this.currentLogo = response.logoUrl;
        this.previewUrl = '';
        this.isLoading = false;
        this.snackBar.open('Logo actualizado', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(err.error?.message || 'Error subiendo logo', 'Cerrar', { duration: 3000 });
      }
    });
  }

  saveLogo(): void {
    if (!this.logoUrl) {
      this.snackBar.open('Ingresa una URL', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.http.post<any>(`${environment.apiUrl}/config/logo`, { 
      logoUrl: this.logoUrl 
    }).subscribe({
      next: (response) => {
        this.currentLogo = response.logoUrl;
        this.isLoading = false;
        this.snackBar.open('Logo actualizado', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(err.error?.message || 'Error guardando logo', 'Cerrar', { duration: 3000 });
      }
    });
  }

  removeLogo(): void {
    if (!confirm('¿Eliminar el logo actual?')) return;

    this.isLoading = true;
    this.http.delete(`${environment.apiUrl}/config/logo`).subscribe({
      next: () => {
        this.currentLogo = '';
        this.logoUrl = '';
        this.previewUrl = '';
        this.isLoading = false;
        this.snackBar.open('Logo eliminado', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(err.error?.message || 'Error eliminando logo', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
