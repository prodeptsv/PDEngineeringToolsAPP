import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReportsService } from '../../services/reports';
import * as Workbook from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class ReportsComponent implements OnInit, OnChanges {
  @Input() operationId: number | null = null;

  reportData: any[] = [];
  operationHeader: any = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private reportsService: ReportsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.isValidId(this.operationId)) {
      this.loadReport();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Evitamos ejecutarlo en la primera carga porque ya lo maneja ngOnInit
    if (changes['operationId'] && !changes['operationId'].isFirstChange() && this.isValidId(this.operationId)) {
      this.loadReport();
    }
  }

  private isValidId(id: any): boolean {
    return id !== null && id !== undefined && !isNaN(Number(id)) && Number(id) > 0;
  }

  loadReport(): void {
    if (!this.isValidId(this.operationId)) return;

    const cleanId = Number(this.operationId);

    this.isLoading = true;
    this.errorMessage = null;

    this.reportsService.getOperationAnalysisReport(cleanId).subscribe({
      next: (data) => {
        this.reportData = data || [];

        if (this.reportData.length > 0) {
          this.operationHeader = {
            Name: this.reportData[0].OperationName || this.reportData[0].Name || this.reportData[0].Description || 'N/A',
            Title: this.reportData[0].Title || 'Crew (REV)'
          };
        } else {
          this.errorMessage = 'No se encontraron registros para la operación seleccionada.';
        }

        this.isLoading = false;
        // Forzamos la actualización de la interfaz de usuario
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener el reporte:', err);
        this.errorMessage = 'No se pudo obtener la información del reporte.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  exportToExcel(): void {
    if (!this.reportData || this.reportData.length === 0) return;

    const workbook = new Workbook.Workbook();
    const worksheet = workbook.addWorksheet('Operation Analysis');

    worksheet.mergeCells('A1:G1');
    const title1 = worksheet.getCell('A1');
    title1.value = 'PRODEPT EL SALVADOR';
    title1.font = { name: 'Arial', size: 12, bold: true };
    title1.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:G2');
    const title2 = worksheet.getCell('A2');
    title2.value = 'Operation Analysis Report';
    title2.font = { name: 'Arial', size: 12, bold: true };
    title2.alignment = { horizontal: 'center' };

    worksheet.getCell('A4').value = `Name: ${this.operationHeader?.Name || ''}`;
    worksheet.getCell('A4').font = { name: 'Arial', size: 10, bold: true };

    worksheet.getCell('A5').value = `Title: ${this.operationHeader?.Title || ''}`;
    worksheet.getCell('A5').font = { name: 'Arial', size: 10, bold: true };

    const headerRow = worksheet.getRow(6);
    headerRow.values = ['#', 'Code', 'Description', 'Freq', 'T.M.U', 'Machine Time', 'Manual Time'];
    headerRow.font = { name: 'Arial', size: 10, bold: true };
    
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '9BC2E6' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    this.reportData.forEach((row, index) => {
      const dataRow = worksheet.addRow([
        row.Ordinal || index + 1,
        row.ItemId || row.Code || row.ElementCode || '',
        row.Description || row.ElementDescription || '',
        Number(row.Freq ?? row.Frequency ?? 1.0).toFixed(1),
        Number(row.TMU ?? row.tmu ?? 0).toFixed(4),
        Number(row.MachineTime ?? row.machine_time ?? 0).toFixed(4),
        Number(row.ManualTime ?? row.manual_time ?? 0).toFixed(4)
      ]);

      dataRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Arial', size: 9 };
        cell.border = {
          top: { style: 'thin', color: { argb: 'D3D3D3' } },
          left: { style: 'thin', color: { argb: 'D3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
          right: { style: 'thin', color: { argb: 'D3D3D3' } }
        };
        if (colNumber >= 4) {
          cell.alignment = { horizontal: 'right' };
        } else if (colNumber === 1 || colNumber === 2) {
          cell.alignment = { horizontal: 'center' };
        }
      });
    });

    worksheet.columns = [
      { width: 5 },
      { width: 14 },
      { width: 50 },
      { width: 8 },
      { width: 12 },
      { width: 14 },
      { width: 14 }
    ];

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Operation_Analysis_Report_${this.operationId}.xlsx`);
    });
  }
}