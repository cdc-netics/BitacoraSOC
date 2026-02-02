export interface ShiftClosure {
  _id: string;
  userId: string;
  shiftStartAt: Date;
  shiftEndAt: Date;
  closureCheckId: string;
  summary: {
    totalEntries: number;
    totalIncidents: number;
    servicesDown: string[];
    observaciones: string;
  };
  sentVia: 'email' | 'api' | 'webhook' | 'none';
  integrationName?: string;
  sentAt?: Date;
  sentStatus: 'pending' | 'success' | 'failed';
  sentError?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ShiftClosureRequest {
  checkId: string;
  observaciones?: string;
  servicesDown?: string[];
}
