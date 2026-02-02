export interface AuditLog {
  _id: string;
  timestamp: string;
  event: string;
  level: 'info' | 'warn' | 'error';
  actor: {
    userId?: string;
    username?: string;
    role?: string;
    isGuest?: boolean;
  };
  request: {
    requestId?: string;
    ip?: string;
    userAgent?: string;
    method?: string;
    path?: string;
  };
  result: {
    success: boolean;
    reason?: string;
    statusCode?: number;
  };
  metadata?: any;
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  userId?: string;
  event?: string;
  level?: 'info' | 'warn' | 'error';
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface AuditStats {
  total: number;
  last24h: number;
  last7d: number;
  byLevel: {
    info?: number;
    warn?: number;
    error?: number;
  };
  topEvents: Array<{
    _id: string;
    count: number;
  }>;
}
