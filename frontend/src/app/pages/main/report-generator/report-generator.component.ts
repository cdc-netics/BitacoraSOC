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

  onLogSourceSelected(source: any): void {
    this.selectedLogSource = source as CatalogLogSource;
    if (source) {
      this.reportForm.patchValue({
        logSource: source.name
      });
    }
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
      this.snackBar.open('Completa todos los campos obligatorios', 'Cerrar', { duration: 3000 });
      return;
    }

    const form = this.reportForm.value;
    const fechaFormateada = new Date(form.fecha).toLocaleDateString('es-CL');

    let html = `<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
  <tr>
    <th colspan="2" style="background-color: #4CAF50; color: white; text-align: center; font-size: 18px;">Reporte de Detección</th>
  </tr>
  <tr>
    <th style="background-color: #8BC34A; color: white; width: 30%;">Campo</th>
    <th style="background-color: #8BC34A; color: white;">Detalle</th>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold;">Tipo de operación</td>
    <td>${form.tipoOperacion}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold;">Ofensa/Código interno</td>
    <td>${form.codigoInterno || '-'}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold;">Nombre de Ofensa/Evento</td>
    <td>${form.nombreEvento}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold;">Motivo de la Ofensa/Evento</td>
    <td>${form.motivoEvento}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold;">Fecha</td>
    <td>${fechaFormateada}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold;">MRSC (Criticidad)</td>
    <td>${form.criticidad}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold;">Origen de conexión</td>
    <td>${form.origenConexion || '-'}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold;">Fuente / Log Source</td>
    <td>${form.logSource}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold;">Destino</td>
    <td>${form.destino || '-'}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold;">Reputación de origen</td>
    <td>${form.reputacionOrigen}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold;">Observaciones</td>
    <td style="white-space: pre-wrap;">${form.observaciones}</td>
  </tr>`;

    if (this.uploadedImages.length > 0) {
      html += `\n  <tr>\n    <td style="background-color: #8BC34A; font-weight: bold;">Evidencia</td>\n    <td>`;
      this.uploadedImages.forEach(img => {
        html += `<img src="${img.dataUrl}" style="max-width: 100%; margin: 5px 0; border: 1px solid #ddd;"><br>`;
      });
      html += `</td>\n  </tr>`;
    } else {
      html += `\n  <tr>\n    <td style="background-color: #8BC34A; font-weight: bold;">Evidencia</td>\n    <td>Se adjunta en el correo</td>\n  </tr>`;
    }

    html += `
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold;">Recomendación</td>
    <td style="white-space: pre-wrap;">${form.recomendacion || '-'}</td>
  </tr>
  <tr>
    <td style="background-color: #8BC34A; font-weight: bold;">Información adicional</td>
    <td style="white-space: pre-wrap;">${form.informacionAdicional || '-'}</td>
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

    navigator.clipboard.writeText(this.generatedHtml).then(() => {
      this.snackBar.open('✅ HTML copiado al portapapeles', 'Cerrar', { duration: 2000 });
    }).catch(() => {
      this.snackBar.open('Error al copiar. Selecciona y copia manualmente.', 'Cerrar', { duration: 3000 });
    });
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
