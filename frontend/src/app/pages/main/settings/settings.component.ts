/**
 * Componente de Configuración Global (Admin)
 * 
 * Funcionalidad:
 *   - Configuración de aplicación SOC (guests, cooldown, logo)
 *   - Configuración SMTP (notificaciones email)
 *   - Tabs Material: "General" y "Email"
 * 
 * Configuración General:
 *   - guestModeEnabled: Permitir creación de invitados
 *   - shiftCheckCooldownHours: Tiempo mínimo entre checks (1-24h)
 *   - Logo personalizado (upload o URL)
 * 
 * Configuración SMTP:
 *   - Provider: Office365, AWS SES, Gmail, Mailgun, Custom
 *   - Auth: username + password (cifrado AES-256 en backend)
 *   - Advanced: host, port, TLS
 *   - Sender: nombre + email
 *   - Recipients: array de emails
 *   - Test: botón para enviar email de prueba (rate limited)
 * 
 * Uso SOC:
 *   - Solo admin accede (AdminGuard)
 *   - Cambios aplican inmediatamente (sin reiniciar)
 *   - Password SMTP NUNCA se muestra (solo se envía al guardar)
 */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigService } from '../../../services/config.service';
import { SmtpService } from '../../../services/smtp.service';
import { AppConfig, UpdateConfigRequest } from '../../../models/config.model';
import { SmtpConfigRequest } from '../../../models/smtp.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  appConfigForm: FormGroup;
  smtpForm: FormGroup;

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
      host: ['', Validators.required],
      port: [587, [Validators.required, Validators.min(1)]],
      secure: [false],
      user: ['', Validators.required],
      pass: ['', [Validators.required, Validators.minLength(8)]],
      from: ['', [Validators.required, Validators.email]],
      recipients: [[]]
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
      next: (config) => {
        if (config) {
          this.smtpForm.patchValue(config);
        }
      },
      error: (err) => console.error('Error cargando SMTP:', err)
    });
  }

  saveAppConfig(): void {
    if (this.appConfigForm.valid) {
      const data: UpdateConfigRequest = this.appConfigForm.value;
      this.configService.updateConfig(data).subscribe({
        next: () => this.snackBar.open('Configuración guardada', 'Cerrar', { duration: 2000 }),
        error: (err) => this.snackBar.open('Error guardando configuración', 'Cerrar', { duration: 3000 })
      });
    }
  }

  saveSmtpConfig(): void {
    if (this.smtpForm.valid) {
      const data: SmtpConfigRequest = this.smtpForm.value;
      this.smtpService.saveConfig(data).subscribe({
        next: () => this.snackBar.open('SMTP guardado', 'Cerrar', { duration: 2000 }),
        error: (err) => this.snackBar.open('Error guardando SMTP', 'Cerrar', { duration: 3000 })
      });
    }
  }

  testSmtp(): void {
    this.smtpService.testConfig().subscribe({
      next: (response) => this.snackBar.open(response.message, 'Cerrar', { duration: 3000 }),
      error: (err) => this.snackBar.open('Error en test SMTP', 'Cerrar', { duration: 3000 })
    });
  }
}
