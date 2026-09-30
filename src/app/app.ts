import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService, OperationOption } from './services/reports';
import { ReportsComponent } from './components/reports/reports';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReportsComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  isSidebarOpen: boolean = true;
  operationsList: OperationOption[] = [];

  selectedOperationId: any = null;
  operationIdToPass: number | null = null;

  showReport: boolean = false;
  isLoadingOperations: boolean = false;

  currentView: string | null = null;

  openProcesses: boolean = false;
  openReports: boolean = false;
  openMasterData: boolean = false;

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadOperations();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleProcesses(): void {
    this.openProcesses = !this.openProcesses;
  }

  toggleReports(): void {
    this.openReports = !this.openReports;
  }

  toggleMasterData(): void {
    this.openMasterData = !this.openMasterData;
  }

  selectView(viewName: string): void {
    this.currentView = viewName;
    this.showReport = false;
    this.selectedOperationId = null;
    this.operationIdToPass = null;

    if (viewName === 'operation-analysis' && this.operationsList.length === 0) {
      this.loadOperations();
    }
  }

  loadOperations(): void {
    this.isLoadingOperations = true;
    this.reportsService.getOperations('C').subscribe({
      next: (data) => {
        this.operationsList = data;
        this.isLoadingOperations = false;
      },
      error: (err) => {
        console.error('Error cargando la lista de operaciones desde la API:', err);
        this.isLoadingOperations = false;
      }
    });
  }

  generateReport(): void {
    if (this.selectedOperationId === null || this.selectedOperationId === undefined) return;

    const numericId = Number(this.selectedOperationId);
    //if (isNaN(numericId)) return;
    if (Number.isNaN(numericId)) return;

    // Reiniciamos showReport para forzar la recreación del componente
    //this.showReport = false;
    this.operationIdToPass = numericId;
    this.showReport = true;

    //setTimeout(() => {
    //  this.showReport = true;
    //}, 0);
  }

  clearSelection(): void {
    this.selectedOperationId = null;
    this.operationIdToPass = null;
    this.showReport = false;
  }
}