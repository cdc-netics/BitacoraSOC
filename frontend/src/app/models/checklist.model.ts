/**
 * Modelos de Checklist de Turno
 * 
 * Reglas SOC:
 *   - type: 'inicio' | 'cierre' (no consecutivos iguales)
 *   - services: TODOS los servicios activos deben incluirse
 *   - status: 'verde' | 'rojo'
 *   - observation: obligatoria si status='rojo', max 1000 chars
 */

export interface ServiceCatalog {
  _id: string;
  title: string;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ServiceCheck {
  serviceId: string;
  serviceTitle: string;
  status: ServiceStatus;
  observation: string;
}

export type ServiceStatus = 'verde' | 'rojo';
export type CheckType = 'inicio' | 'cierre';

export interface ShiftCheck {
  _id: string;
  userId: {
    _id: string;
    username: string;
    fullName: string;
  };
  username: string;
  type: CheckType;
  checkDate: Date;
  services: ServiceCheck[];
  hasRedServices: boolean;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface CreateCheckRequest {
  type: CheckType;
  services: Array<{
    serviceId: string;
    serviceTitle: string;
    status: ServiceStatus;
    observation: string;
  }>;
}

export interface CheckHistoryResponse {
  checks: ShiftCheck[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
