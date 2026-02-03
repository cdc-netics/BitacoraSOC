export interface AuditLog {
  _id: string;
  userId: string;
  username: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: 'success' | 'failure';
  errorMessage?: string;
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  userId?: string;
  event?: string;
  level?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export interface AuditStats {
  totalLogs: number;
  totalUsers: number;
  successCount: number;
  failureCount: number;
  topActions: Array<{
    action: string;
    count: number;
  }>;
  topUsers: Array<{
    username: string;
    count: number;
  }>;
}
