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
 *   5. Redirect a /main/entries
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
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }

    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.snackBar.open(`¡Bienvenido, ${response.user.fullName}!`, 'Cerrar', {
          duration: 3000
        });
        this.router.navigate(['/']);
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
