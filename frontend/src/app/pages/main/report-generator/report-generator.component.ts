import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CatalogService } from '../../../services/catalog.service';
import { CatalogEvent, CatalogLogSource, CatalogOperationType } from '../../../models/catalog.model';

@Component({
  selector: 'app-report-generator',
  templateUrl: './report-generator.component.html',
  styleUrls: ['./report-generator.component.scss']
})
export class ReportGeneratorComponent {
  reportForm: FormGroup;
  
  selectedEvent: CatalogEvent | null = null;
  selectedLogSource: CatalogLogSource | null = null;
  selectedOperationType: CatalogOperationType | null = null;

  uploadedImages: { name: string, dataUrl: string }[] = [];
  generatedHtml = '';
  showPreview = false;

  constructor(
    private fb: FormBuilder,
    public catalogService: CatalogService,
    private snackBar: MatSnackBar
  ) {
    this.reportForm = this.fb.group({
      tipoOperacion: ['', Validators.required],
      codigoInterno: [''],
      nombreEvento: ['', Validators.required],
      motivoEvento: ['', Validators.required],
      fecha: [new Date(), Validators.required],
      criticidad: ['media', Validators.required],
      origenConexion: [''],
      logSource: ['', Validators.required],
      destino: [''],
      reputacionOrigen: ['Interna'],
      observaciones: ['', Validators.required],
      recomendacion: [''],
      informacionAdicional: ['']
    });
  }

  onEventSelected(event: any): void {
    this.selectedEvent = event as CatalogEvent;
    if (event) {
      this.reportForm.patchValue({
        nombreEvento: event.name,
        motivoEvento: event.motivoDefault || ''
      });
    }
  }

  onEventCleared(): void {
    this.selectedEvent = null;
    this.reportForm.patchValue({
      nombreEvento: '',
      motivoEvento: ''
    });
  }

  onLogSourceSelected(source: any): void {
    this.selectedLogSource = source as CatalogLogSource;
    if (source) {
      this.reportForm.patchValue({
        logSource: source.name
      });
    }
  }

  onLogSourceCleared(): void {
    this.selectedLogSource = null;
    this.reportForm.patchValue({ logSource: '' });
  }

  onOperationTypeSelected(type: any): void {
    this.selectedOperationType = type as CatalogOperationType;
    if (type) {
      this.reportForm.patchValue({
        tipoOperacion: type.name,
        informacionAdicional: type.infoAdicionalDefault || ''
      });
    }
  }

  onOperationTypeCleared(): void {
    this.selectedOperationType = null;
    this.reportForm.patchValue({
      tipoOperacion: '',
      informacionAdicional: ''
    });
  }

  onImageUpload(event: any): void {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedImages.push({
          name: file.name,
          dataUrl: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number): void {
    this.uploadedImages.splice(index, 1);
  }

  generateTable(): void {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      this.snackBar.open('Completa todos los campos obligatorios', 'Cerrar', { duration: 3000 });
      return;
    }

    const form = this.reportForm.value;
    const fechaFormateada = new Date(form.fecha).toLocaleDateString('es-CL');

    let html = `<table cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; border: 1px solid #2b2b2b;">
  <tr>
    <th colspan="2" style="background-color: #4CAF50; color: white; text-align: center; font-size: 18px; border: 1px solid #2b2b2b;">Reporte de Detección</th>
  </tr>
  <tr>
    <th style="background-color: #8BC34A; color: white; width: 30%; border: 1px solid #2b2b2b;">Campo</th>
    <th style="background-color: #8BC34A; color: white; border: 1px solid #2b2b2b;">Detalle</th>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold; border: 1px solid #2b2b2b;">Tipo de operación</td>
    <td style="border: 1px solid #2b2b2b;">${form.tipoOperacion}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold; border: 1px solid #2b2b2b;">Ofensa/Código interno</td>
    <td style="border: 1px solid #2b2b2b;">${form.codigoInterno || '-'}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold; border: 1px solid #2b2b2b;">Nombre de Ofensa/Evento</td>
    <td style="border: 1px solid #2b2b2b;">${form.nombreEvento}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold; border: 1px solid #2b2b2b;">Motivo de la Ofensa/Evento</td>
    <td style="border: 1px solid #2b2b2b;">${form.motivoEvento}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold; border: 1px solid #2b2b2b;">Fecha</td>
    <td style="border: 1px solid #2b2b2b;">${fechaFormateada}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold; border: 1px solid #2b2b2b;">MRSC (Criticidad)</td>
    <td style="border: 1px solid #2b2b2b;">${form.criticidad}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold; border: 1px solid #2b2b2b;">Origen de conexión</td>
    <td style="border: 1px solid #2b2b2b;">${form.origenConexion || '-'}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold; border: 1px solid #2b2b2b;">Fuente / Log Source</td>
    <td style="border: 1px solid #2b2b2b;">${form.logSource}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold; border: 1px solid #2b2b2b;">Destino</td>
    <td style="border: 1px solid #2b2b2b;">${form.destino || '-'}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold; border: 1px solid #2b2b2b;">Reputación de origen</td>
    <td style="border: 1px solid #2b2b2b;">${form.reputacionOrigen}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold; border: 1px solid #2b2b2b;">Observaciones</td>
    <td style="white-space: pre-wrap; border: 1px solid #2b2b2b;">${form.observaciones}</td>
  </tr>`;

    if (this.uploadedImages.length > 0) {
      html += `\n  <tr>\n    <td style="background-color: #8BC34A; font-weight: bold; border: 1px solid #2b2b2b;">Evidencia</td>\n    <td style="border: 1px solid #2b2b2b;">`;
      this.uploadedImages.forEach(img => {
        html += `<img src="${img.dataUrl}" style="max-width: 100%; width: 100%; height: auto; max-height: 420px; object-fit: contain; margin: 8px 0; border: 1px solid #ddd;"><br>`;
      });
      html += `</td>\n  </tr>`;
    } else {
      html += `\n  <tr>\n    <td style="background-color: #8BC34A; font-weight: bold; border: 1px solid #2b2b2b;">Evidencia</td>\n    <td style="border: 1px solid #2b2b2b;">Se adjunta en el correo</td>\n  </tr>`;
    }

    html += `
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold; border: 1px solid #2b2b2b;">Recomendación</td>
    <td style="white-space: pre-wrap; border: 1px solid #2b2b2b;">${form.recomendacion || '-'}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold; border: 1px solid #2b2b2b;">Información adicional</td>
    <td style="white-space: pre-wrap; border: 1px solid #2b2b2b;">${form.informacionAdicional || '-'}</td>
  </tr>
</table>`;

    this.generatedHtml = html;
    this.showPreview = true;
  }

  copyToClipboard(): void {
    if (!this.generatedHtml) {
      this.snackBar.open('Primero genera la tabla', 'Cerrar', { duration: 3000 });
      return;
    }

    const html = this.generatedHtml;
    const plainText = this.getPlainTextFromHtml(html);
    const clipboardItem = (window as any).ClipboardItem;

    if (navigator.clipboard && clipboardItem) {
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      const item = new clipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      });

      navigator.clipboard.write([item]).then(() => {
        this.snackBar.open('✅ Tabla copiada con formato', 'Cerrar', { duration: 2000 });
      }).catch(() => {
        this.snackBar.open('Error al copiar con formato. Prueba copiar HTML.', 'Cerrar', { duration: 3000 });
      });
      return;
    }

    navigator.clipboard.writeText(html).then(() => {
      this.snackBar.open('✅ HTML copiado al portapapeles', 'Cerrar', { duration: 2000 });
    }).catch(() => {
      this.snackBar.open('Error al copiar. Selecciona y copia manualmente.', 'Cerrar', { duration: 3000 });
    });
  }

  copyMarkdown(): void {
    if (!this.generatedHtml) {
      this.snackBar.open('Primero genera la tabla', 'Cerrar', { duration: 3000 });
      return;
    }

    const markdown = this.getMarkdownFromHtml(this.generatedHtml);
    navigator.clipboard.writeText(markdown).then(() => {
      this.snackBar.open('✅ Markdown copiado', 'Cerrar', { duration: 2000 });
    }).catch(() => {
      this.snackBar.open('Error al copiar Markdown.', 'Cerrar', { duration: 3000 });
    });
  }

  private getPlainTextFromHtml(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.textContent?.trim() || '';
  }

  private getMarkdownFromHtml(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const rows = Array.from(doc.querySelectorAll('tr'));
    const dataRows: Array<[string, string]> = [];

    rows.forEach((row, index) => {
      const cells = Array.from(row.querySelectorAll('th, td')).map(cell => {
        const text = cell.textContent?.replace(/\s+/g, ' ').trim() || '';
        return text.replace(/\|/g, '\\|');
      });
      if (index === 0 || cells.length < 2) return;
      if (cells.length >= 2) {
        dataRows.push([cells[0] || '-', cells[1] || '-']);
      }
    });

    const header = ['Campo', 'Detalle'];
    const sep = ['---', '---'];
    const lines = [
      `| ${header[0]} | ${header[1]} |`,
      `| ${sep[0]} | ${sep[1]} |`,
      ...dataRows.map(row => `| ${row[0]} | ${row[1]} |`)
    ];
    return lines.join('\n');
  }

  clearForm(): void {
    this.selectedEvent = null;
    this.selectedLogSource = null;
    this.selectedOperationType = null;
    this.reportForm.reset({
      fecha: new Date(),
      criticidad: 'media',
      reputacionOrigen: 'Interna'
    });
    this.uploadedImages = [];
    this.generatedHtml = '';
    this.showPreview = false;
  }
}
