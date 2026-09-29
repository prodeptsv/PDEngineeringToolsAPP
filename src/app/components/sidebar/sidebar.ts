import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent {
  // Control de estado colapsable
  openProcesses: boolean = false;
  openReports: boolean = true; // Abierto por defecto para mostrar Operation Analysis Report
  openMasterData: boolean = false;

  toggleProcesses(): void {
    this.openProcesses = !this.openProcesses;
  }

  toggleReports(): void {
    this.openReports = !this.openReports;
  }

  toggleMasterData(): void {
    this.openMasterData = !this.openMasterData;
  }
}