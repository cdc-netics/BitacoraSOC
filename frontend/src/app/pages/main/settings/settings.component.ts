import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigService } from '../../../services/config.service';
import { SmtpService } from '../../../services/smtp.service';
import { UpdateConfigRequest } from '../../../models/config.model';
import { SmtpConfigRequest, SmtpConfig } from '../../../models/smtp.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  appConfigForm: FormGroup;
  smtpForm: FormGroup;
  smtpTestPassed = false;
  connectionStatus: 'conectado' | 'desconectado' | 'sin-config' = 'sin-config';
  testing = false;
  savingSmtp = false;

  providers = [
    { value: 'office365', label: 'Office 365' },
    { value: 'aws-ses', label: 'AWS SES' },
    { value: 'elastic-email', label: 'Elastic Email' },
    { value: 'google-mail', label: 'Google Mail' },
    { value: 'google-workspace', label: 'Google Workspace' },
    { value: 'mailgun', label: 'Mailgun' },
    { value: 'custom', label: 'Custom' }
  ];

  constructor(
    private fb: FormBuilder,
    private configService: ConfigService,
    private smtpService: SmtpService,
    private snackBar: MatSnackBar
  ) {
    this.appConfigForm = this.fb.group({
      guestEnabled: [false],
      checklistCooldownHours: [24, [Validators.required, Validators.min(1)]]
    });

    this.smtpForm = this.fb.group({
      provider: ['custom', Validators.required],
      host: ['', Validators.required],
      port: [587, [Validators.required, Validators.min(1)]],
      useTLS: [true, Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      senderName: ['', Validators.required],
      senderEmail: ['', [Validators.required, Validators.email]],
      recipientsText: ['', Validators.required],
      sendOnlyIfRed: [false],
      isActive: [true]
    });

    this.smtpForm.valueChanges.subscribe(() => {
      this.smtpTestPassed = false;
    });
  }

  ngOnInit(): void {
    this.loadConfig();
    this.loadSmtpConfig();
  }

  loadConfig(): void {
    this.configService.getConfig().subscribe({
      next: (config) => {
        this.appConfigForm.patchValue({
          guestEnabled: config.guestModeEnabled,
          checklistCooldownHours: config.shiftCheckCooldownHours
        });
      },
      error: (err) => console.error('Error cargando config:', err)
    });
  }

  loadSmtpConfig(): void {
    this.smtpService.getConfig().subscribe({
      next: (config) => this.patchSmtpConfig(config),
      error: (err) => console.error('Error cargando SMTP:', err)
    });
  }

  private patchSmtpConfig(config: SmtpConfig | null): void {
    if (!config) {
      this.connectionStatus = 'sin-config';
      return;
    }

    this.smtpForm.patchValue({
      provider: config.provider || 'custom',
      host: config.host,
      port: config.port,
      useTLS: config.useTLS,
      username: config.username,
      password: '',
      senderName: config.senderName,
      senderEmail: config.senderEmail,
      recipientsText: (config.recipients || []).join(', '),
      sendOnlyIfRed: config.sendOnlyIfRed ?? false,
      isActive: config.isActive ?? true
    });

    this.smtpTestPassed = !!config.lastTestSuccess;
    this.connectionStatus = config.lastTestSuccess ? 'conectado' : 'desconectado';
  }

  saveAppConfig(): void {
    if (this.appConfigForm.valid) {
      const data: UpdateConfigRequest = this.appConfigForm.value;
      this.configService.updateConfig(data).subscribe({
        next: () => this.snackBar.open('Configuracion guardada', 'Cerrar', { duration: 2000 }),
        error: () => this.snackBar.open('Error guardando configuracion', 'Cerrar', { duration: 3000 })
      });
    }
  }

  saveSmtpConfig(): void {
    if (!this.smtpForm.valid || !this.smtpTestPassed) {
      this.snackBar.open('Primero realiza una prueba SMTP exitosa', 'Cerrar', { duration: 3000 });
      return;
    }

    this.savingSmtp = true;
    const payload = this.buildSmtpPayload();
    this.smtpService.saveConfig(payload).subscribe({
      next: (resp) => {
        this.snackBar.open(resp.message || 'SMTP guardado', 'Cerrar', { duration: 2000 });
        this.patchSmtpConfig(resp.config);
      },
      error: () => this.snackBar.open('Error guardando SMTP', 'Cerrar', { duration: 3000 }),
      complete: () => this.savingSmtp = false
    });
  }

  testSmtp(): void {
    if (!this.smtpForm.valid) {
      this.snackBar.open('Completa los campos SMTP antes de probar', 'Cerrar', { duration: 3000 });
      return;
    }
    this.testing = true;
    const payload = this.buildSmtpPayload();
    this.smtpService.testConfig(payload).subscribe({
      next: (response) => {
        this.smtpTestPassed = true;
        this.connectionStatus = 'conectado';
        this.snackBar.open(response.message, 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.connectionStatus = 'desconectado';
        this.snackBar.open('Error en test SMTP', 'Cerrar', { duration: 3000 });
      },
      complete: () => this.testing = false
    });
  }

  private buildSmtpPayload(): SmtpConfigRequest {
    const value = this.smtpForm.value;
    const recipients = (value.recipientsText as string || '')
      .split(',')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    return {
      provider: value.provider,
      authMethod: 'credentials',
      username: value.username,
      password: value.password,
      host: value.host,
      port: Number(value.port),
      useTLS: value.useTLS,
      senderName: value.senderName,
      senderEmail: value.senderEmail,
      recipients,
      sendOnlyIfRed: value.sendOnlyIfRed,
      isActive: value.isActive
    };
  }
}
