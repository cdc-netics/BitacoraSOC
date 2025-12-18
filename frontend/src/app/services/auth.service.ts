/**
 * Servicio de Autenticación
 * 
 * Funcionalidad:
 *   - Login con JWT (almacenado en localStorage)
 *   - Logout con limpieza de storage y redirect a /login
 *   - getCurrentUser() observable para cambios reactivos
 *   - Validación de roles (isAdmin, isGuest, hasRole)
 * 
 * Flujo:
 *   1. Login: POST /api/auth/login → guarda token + user en localStorage
 *   2. Interceptor: agrega Authorization: Bearer {token} a todas las requests
 *   3. Guards: usan isAuthenticated() y hasRole() para proteger rutas
 *   4. Logout: limpia storage + navega a /login
 * 
 * Storage:
 *   - bitacora_token: JWT string
 *   - bitacora_user: JSON serializado del user
 * 
 * Roles SOC:
 *   - admin: Acceso total
 *   - user: Analista SOC (sin admin functions)
 *   - guest: Solo lectura (no puede crear entradas ni checks)
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { User, LoginRequest, LoginResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'bitacora_token';
  private readonly USER_KEY = 'bitacora_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          console.log('[AuthService] Login response:', response);
          console.log('[AuthService] User role:', response.user.role);
          this.setToken(response.token);
          this.setUser(response.user);
          this.currentUserSubject.next(response.user);
          console.log('[AuthService] User saved to localStorage');
          console.log('[AuthService] Current user now:', this.getCurrentUser());
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  isGuest(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'guest';
  }

  hasRole(...roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
}
