/**
 * Servicio de Checklist de Turno
 * 
 * Funcionalidad:
 *   - CRUD de servicios SOC (solo admin)
 *   - Registrar checks de turno (inicio/cierre)
 *   - Ver último check y historial
 * 
 * Endpoints Servicios:
 *   - GET    /api/checklist/services     - Servicios activos (para checklist)
 *   - GET    /api/checklist/services/all - Todos los servicios (admin)
 *   - POST   /api/checklist/services     - Crear servicio (admin)
 *   - PUT    /api/checklist/services/:id - Editar servicio (admin)
 *   - DELETE /api/checklist/services/:id - Eliminar servicio (admin)
 * 
 * Endpoints Checks:
 *   - POST /api/checklist/check         - Registrar check de turno
 *   - GET  /api/checklist/check/last    - Último check del usuario
 *   - GET  /api/checklist/check/history - Historial con paginación
 * 
 * Reglas SOC:
 *   - Guests NO pueden registrar checks (solo ver historial)
 *   - Todos los servicios activos deben evaluarse (backend valida)
 *   - Servicios en rojo REQUIEREN observación obligatoria
 *   - No permitir tipos consecutivos (inicio->inicio bloqueado)
 *   - Cooldown configurable entre checks (default 4h)
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  ServiceCatalog,
  ShiftCheck,
  CreateCheckRequest,
  CheckHistoryResponse
} from '../models/checklist.model';

@Injectable({
  providedIn: 'root'
})
export class ChecklistService {
  private readonly API_URL = `${environment.apiUrl}/checklist`;

  constructor(private http: HttpClient) {}

  // ========== SERVICIOS ==========
  
  getActiveServices(): Observable<ServiceCatalog[]> {
    return this.http.get<ServiceCatalog[]>(`${this.API_URL}/services`);
  }

  getAllServices(): Observable<ServiceCatalog[]> {
    return this.http.get<ServiceCatalog[]>(`${this.API_URL}/services/all`);
  }

  createService(data: Partial<ServiceCatalog>): Observable<{ message: string; service: ServiceCatalog }> {
    return this.http.post<{ message: string; service: ServiceCatalog }>(`${this.API_URL}/services`, data);
  }

  updateService(id: string, data: Partial<ServiceCatalog>): Observable<{ message: string; service: ServiceCatalog }> {
    return this.http.put<{ message: string; service: ServiceCatalog }>(`${this.API_URL}/services/${id}`, data);
  }

  deleteService(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/services/${id}`);
  }

  // ========== CHECKS ==========
  
  createCheck(data: CreateCheckRequest): Observable<{ message: string; check: ShiftCheck }> {
    return this.http.post<{ message: string; check: ShiftCheck }>(`${this.API_URL}/check`, data);
  }

  getLastCheck(): Observable<ShiftCheck | { message: string; check: null }> {
    return this.http.get<ShiftCheck | { message: string; check: null }>(`${this.API_URL}/check/last`);
  }

  getCheckHistory(page = 1, limit = 20): Observable<CheckHistoryResponse> {
    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    return this.http.get<CheckHistoryResponse>(`${this.API_URL}/check/history`, { params });
  }
}
