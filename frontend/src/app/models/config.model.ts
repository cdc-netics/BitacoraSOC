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
  emailReportConfig?: EmailReportConfig;
  smtpConfig?: SmtpConfig;
  lastUpdatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmailReportConfig {
  enabled: boolean;
  recipients: string[];
  includeChecklist: boolean;
  includeEntries: boolean;
  subjectTemplate: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export interface UpdateConfigRequest {
  guestModeEnabled?: boolean;
  guestMaxDurationDays?: number;
  shiftCheckCooldownHours?: number;
  checklistAlertEnabled?: boolean;
  checklistAlertTime?: string;
  logoUrl?: string;
  defaultLogSourceId?: string | null;
  emailReportConfig?: EmailReportConfig;
  smtpConfig?: SmtpConfig;
}
