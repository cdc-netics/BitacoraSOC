export interface AppConfig {
  _id?: string;
  guestModeEnabled: boolean;
  guestMaxDurationDays: number;
  shiftCheckCooldownHours: number;
  logoUrl?: string;
  logoType?: 'url' | 'upload';
  lastUpdatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateConfigRequest {
  guestModeEnabled?: boolean;
  guestMaxDurationDays?: number;
  shiftCheckCooldownHours?: number;
  logoUrl?: string;
}
