/**
 * Componente de Escribir Entradas de Bitácora
 * Pantalla simple para crear nuevas entradas con clasificación Operativa/Incidente
 */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EntryService } from '../../../services/entry.service';
import { CreateEntryRequest } from '../../../models/entry.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-entries',
  templateUrl: './entries.component.html',
  styleUrls: ['./entries.component.scss']
})
export class EntriesComponent implements OnInit {
  entryForm: FormGroup;
  today = new Date().toISOString().split('T')[0];
  nowTime = new Date().toTimeString().slice(0, 5);
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private entryService: EntryService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.entryForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(50000)]],
      entryType: ['operativa', Validators.required]
    });
  }

  ngOnInit(): void {
    // Componente inicializado
  }

  onSubmit(): void {
    if (this.isSubmitting || !this.entryForm.valid) {
      return;
    }

    const now = new Date();
    const entryDate = now.toISOString().split('T')[0];
    const entryTime = now.toTimeString().slice(0, 5);

    const data: CreateEntryRequest = {
      ...this.entryForm.value,
      entryDate,
      entryTime,
      tags: this.extractTagsFromContent(this.entryForm.value.content)
    };
    
    this.isSubmitting = true;
    this.entryService.createEntry(data).subscribe({
      next: () => {
        this.snackBar.open('✅ Entrada creada exitosamente', 'Cerrar', { duration: 3000 });
        this.entryForm.reset({
          entryType: 'operativa'
        });
        this.today = entryDate;
        this.nowTime = entryTime;
        this.logAction('entry.submit', 'ok', { length: data.content.length });
        this.isSubmitting = false;
      },
      error: (err) => {
        const msg = err.error?.message || 'Error creando entrada';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
        this.logAction('entry.submit', 'error', { message: msg });
        this.isSubmitting = false;
      }
    });
  }

  private extractTagsFromContent(content: string): string[] {
    const tagRegex = /#(\w+)/g;
    const matches = content.match(tagRegex);
    if (!matches) return [];
    
    return matches.map(tag => tag.substring(1).toLowerCase());
  }

  private logAction(action: string, result: 'ok' | 'error', data: Record<string, unknown> = {}): void {
    const user = this.authService.getCurrentUser();
    const payload = {
      ts: new Date().toISOString(),
      user: user?.username || 'anon',
      action,
      result,
      ...data
    };
    if (result === 'ok') {
      console.log('[ENTRY]', payload);
    } else {
      console.error('[ENTRY]', payload);
    }
  }
}
