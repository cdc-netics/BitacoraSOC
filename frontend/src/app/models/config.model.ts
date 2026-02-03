export interface AppConfig {
  _id?: string;
  guestModeEnabled: boolean;
  guestMaxDurationDays: number;
  shiftCheckCooldownHours: number;
  checklistAlertEnabled?: boolean;
  checklistAlertTime?: string;
  lastChecklistAlertDate?: Date;
  logoUrl?: string;
  logoType?: 'url' | 'upload';
  defaultLogSourceId?: string | { _id: string; name: string; enabled: boolean };
  lastUpdatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateConfigRequest {
  guestModeEnabled?: boolean;
  guestMaxDurationDays?: number;
  shiftCheckCooldownHours?: number;
  checklistAlertEnabled?: boolean;
  checklistAlertTime?: string;
  logoUrl?: string;
  defaultLogSourceId?: string | null;
}
