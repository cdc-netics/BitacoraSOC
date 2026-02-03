/**
 * Componente de Login - Estilo CRT Retro
 * 
 * Funcionalidad:
 *   - Formulario de autenticación (username + password)
 *   - Validación reactive forms (min 3 chars user, min 6 chars pass)
 *   - Vista switcheable entre login y recovery
 *   - Animaciones CRT y glow effects
 *   - Loading state con pulse animation
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
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatPrefix, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

type ViewState = 'login' | 'recovery';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [
      NgIf,
      RouterModule,
      MatIcon,
      ReactiveFormsModule,
      MatFormField,
      MatLabel,
      MatInput,
      MatPrefix,
      MatError,
      MatIconButton,
      MatSuffix,
      MatButton,
      MatProgressSpinner
    ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  recoveryForm!: FormGroup;
  loading = false;
  hidePassword = true;
  logoUrl: string = '';
  currentView: ViewState = 'login';
  bannerMessage: string = '';
  showBanner = false;
  bannerType: 'success' | 'error' | 'info' = 'info';
  
  private backendBaseUrl = environment.backendBaseUrl;
  appVersion = environment.appVersion === '__APP_VERSION__' ? 'dev' : environment.appVersion;

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

    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        this.showSuccessBanner(`ACCESS GRANTED - WELCOME ${response.user.fullName?.toUpperCase()}`);
        setTimeout(() => {
          this.router.navigate(['/main/checklist']);
        }, 1500);
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.message || 'ACCESS DENIED';
        this.showErrorBanner(errorMsg);
      }
    });
  }

  onRecoverySubmit(): void {
    if (this.recoveryForm.invalid) {
      return;
    }

    this.loading = true;
    const email = this.recoveryForm.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.loading = false;
        this.showSuccessBanner('REQUEST RECEIVED');
        setTimeout(() => {
          this.showBanner = false;
          this.recoveryForm.reset();
        }, 2500);
      },
      error: (error) => {
        this.loading = false;
        // Proteger contra enumeración de cuentas - mostrar el mismo mensaje
        this.showSuccessBanner('REQUEST RECEIVED');
        setTimeout(() => {
          this.showBanner = false;
          this.recoveryForm.reset();
        }, 2500);
      }
    });
  }

  switchToRecovery(): void {
    this.currentView = 'recovery';
    this.showBanner = false;
    this.loginForm.reset();
  }

  switchToLogin(): void {
    this.currentView = 'login';
    this.showBanner = false;
    this.recoveryForm.reset();
  }

  private showSuccessBanner(message: string): void {
    this.bannerMessage = message;
    this.bannerType = 'success';
    this.showBanner = true;
  }

  private showErrorBanner(message: string): void {
    this.bannerMessage = message;
    this.bannerType = 'error';
    this.showBanner = true;
  }
}
