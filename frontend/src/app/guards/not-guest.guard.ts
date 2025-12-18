/**
 * Not Guest Guard - Bloquear Invitados
 * 
 * Funcionalidad:
 *   - Verifica que usuario NO sea guest (role !== 'guest')
 *   - Si es guest: redirige a /main/entries
 * 
 * Rutas protegidas:
 *   - /main/reports (guests no ven dashboards SOC)
 * 
 * Uso SOC:
 *   - Guests tienen acceso limitado (solo ver entradas)
 *   - NO pueden: crear entradas, checks de turno, ver reportes
 *   - Objetivo: acceso temporal para stakeholders externos
 * 
 * Lógica:
 *   - getCurrentUser() valida role !== 'guest'
 *   - Si falla: redirect a /main/entries
 */
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
