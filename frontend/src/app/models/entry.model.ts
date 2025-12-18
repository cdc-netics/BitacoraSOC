/**
 * Modelo de Entry - DEBE coincidir con backend Entry schema
 * 
 * Campos críticos SOC:
 *   - entryType: OBLIGATORIO ('operativa' | 'incidente')
 *   - entryDate + entryTime: fecha/hora del evento (no creación)
 *   - tags: extraídos automáticamente de hashtags en backend
 */
export interface Entry {
  _id: string;
  content: string;
  entryType: EntryType;
  entryDate: string; // ISO date string
  entryTime: string; // HH:mm format
  tags: string[];
  createdBy: {
    _id: string;
    username: string;
    fullName: string;
    role: string;
  };
  createdByUsername: string;
  isGuestEntry: boolean;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export type EntryType = 'operativa' | 'incidente';

export interface CreateEntryRequest {
  content: string;
  entryType: EntryType;
  entryDate: string;
  entryTime: string;
}

export interface EntriesResponse {
  entries: Entry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EntryFilters {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string;
  entryType?: EntryType;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export interface TagSuggestion {
  tag: string;
  count: number;
}
