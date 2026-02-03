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
  timestamp: Date;
  status: 'success' | 'failure';
  errorMessage?: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'success' | 'failure';
  searchTerm?: string;
}

export interface AuditLogResponse {
  data: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
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
