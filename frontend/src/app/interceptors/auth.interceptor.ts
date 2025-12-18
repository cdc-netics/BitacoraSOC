/**
 * Interceptor de Autenticación HTTP
 * 
 * Funcionalidad:
 *   - Inyectar JWT en header Authorization de todas las requests
 *   - Manejar errores 401 (token inválido/expirado) con logout automático
 *   - Detectar backend offline (error 0) con mensaje descriptivo
 * 
 * Flujo:
 *   1. Intercepta TODA request HTTP saliente
 *   2. Si existe token JWT: agrega header "Authorization: Bearer {token}"
 *   3. Si backend responde 401: ejecuta logout() + redirect a /login
 *   4. Si backend offline (status 0): muestra error de conectividad
 * 
 * Uso:
 *   - Configurado en app.module.ts providers
 *   - Transparente para servicios (no necesitan agregar header manualmente)
 *   - Previene múltiples logins: logout automático si JWT expira
 * 
 * Errores manejados:
 *   - 0: Network error (backend no disponible)
 *   - 401: Unauthorized (token inválido/expirado, guest expirado)
 */
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Network error (backend unavailable)
        if (error.status === 0) {
          console.error('Backend no disponible. Verifica que el servidor esté corriendo.');
          return throwError(() => new Error('Backend no disponible. Intenta nuevamente más tarde.'));
        }

        if (error.status === 401) {
          // Token inválido o expirado
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}
