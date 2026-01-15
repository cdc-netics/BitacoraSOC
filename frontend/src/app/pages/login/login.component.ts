/**
 * Componente de Login
 * 
 * Funcionalidad:
 *   - Formulario de autenticación (username + password)
 *   - Validación reactive forms (min 3 chars user, min 6 chars pass)
 *   - Loading state durante request
 *   - Redirect automático si ya está autenticado
 * 
 * Flujo:
 *   1. Usuario ingresa credenciales
 *   2. POST /api/auth/login (rate limited 5 intentos/15min)
 *   3. Backend retorna JWT + user
 *   4. AuthService guarda en localStorage
 *   5. Redirect a /main/checklist
 * 
 * Errores manejados:
 *   - Credenciales inválidas (401)
 *   - Usuario inactivo (401)
 *   - Guest expirado (401)
 *   - Rate limit superado (429)
 */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  hidePassword = true;
  logoUrl: string = '';
  private backendBaseUrl = environment.backendBaseUrl;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private configService: ConfigService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  getAssetUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${this.backendBaseUrl}${url}`;
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }

    // Cargar logo
    this.configService.getLogo().subscribe({
      next: (response) => {
        this.logoUrl = response.logoUrl;
      },
      error: () => {
        this.logoUrl = '';
      }
    });

    // ⚠️ DESARROLLO: Credenciales por defecto (borrar en producción)
    const devUsername = 'admin';
    const devPassword = 'Admin123!';

    this.loginForm = this.fb.group({
      username: [devUsername, [Validators.required, Validators.minLength(3)]],
      password: [devPassword, [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        this.snackBar.open(`¡Bienvenido, ${response.user.fullName}!`, 'Cerrar', {
          duration: 3000
        });
        this.router.navigate(['/main/checklist']);
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(
          error.error?.message || 'Error al iniciar sesión',
          'Cerrar',
          { duration: 5000 }
        );
      }
    });
  }
}
