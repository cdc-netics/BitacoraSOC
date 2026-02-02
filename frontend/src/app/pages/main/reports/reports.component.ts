/**
 * Componente de Reportes y Dashboard SOC
 * 
 * Funcionalidad:
 *   - Vista general de KPIs operacionales (últimos 30 días default)
 *   - Selección de período (7, 15, 30, 60, 90 días)
 *   - Exportación de entradas a CSV
 * 
 * Métricas mostradas:
 *   - Entradas por tipo (operativa/incidente) - pie chart
 *   - Incidentes por analista (top 10) - bar chart
 *   - Tags más usados (top 15) - tag cloud
 *   - Servicios con rojos (frecuencia) - bar chart
 *   - Tendencia temporal de entradas - line chart
 *   - Total usuarios activos - card
 *   - Total checks de turno - card
 * 
 * Uso SOC:
 *   - Admin monitorea operación
 *   - Identificar analistas más activos, problemas recurrentes
 *   - Exportar para auditorías externas
 * 
 * Protección:
 *   - Solo admin (AdminGuard)
 *   - Guests NO acceden (NotGuestGuard)
 */
import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../../services/report.service';
import { ReportOverview } from '../../../models/report.model';
import { NgIf } from '@angular/common';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss'],
    standalone: true,
    imports: [NgIf, MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatButton, MatIcon]
})
export class ReportsComponent implements OnInit {
  overview: ReportOverview | null = null;
  selectedDays = 30;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadOverview();
  }

  loadOverview(): void {
    this.reportService.getOverview(this.selectedDays).subscribe({
      next: (data) => this.overview = data,
      error: (err) => console.error('Error cargando reporte:', err)
    });
  }

  exportEntries(): void {
    this.reportService.exportEntries().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `entradas_${new Date().toISOString()}.csv`;
        a.click();
      },
      error: (err) => console.error('Error exportando:', err)
    });
  }
}
