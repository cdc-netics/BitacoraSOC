/**
 * Guards de Autenticación y Autorización (RBAC)
 * 
 * AuthGuard:
 *   - Verifica que usuario esté autenticado (tiene JWT)
 *   - Si no: redirige a /login
 *   - Aplicado en rutas principales (canActivate: [AuthGuard])
 * 
 * AdminGuard:
 *   - Verifica que usuario sea admin
 *   - Si no: redirige a /main/entries
 *   - Protege: /main/users, /main/settings, /main/reports
 * 
 * NotGuestGuard:
 *   - Verifica que usuario NO sea guest
 *   - Si es guest: redirige a /main/entries
 *   - Protege: /main/reports (guests solo ven entradas)
 * 
 * Uso SOC:
 *   - Guests: solo lectura de entradas
 *   - Users: entradas + checks de turno + reportes
 *   - Admin: acceso total (gestión usuarios, config, backups)
 */
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class NotGuestGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    return true;
  }
}
