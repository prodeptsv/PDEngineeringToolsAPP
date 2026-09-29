import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OperationOption {
  OperationId?: number;
  id?: number | string; // Se agrega la propiedad explícita 'id'
  OperationName?: string;
  Description?: string;
  text?: string; // Add explicit property 'text'
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  // Ajusta la URL según la IP y puerto donde está corriendo tu API FastAPI
  private apiUrl = 'http://192.168.0.25:8010';

    constructor(private http: HttpClient) {}

    /**
     * Obtiene la lista de operaciones para llenar el Dropdown List
     * @param tipo 'C' para Combobox por defecto
     */
    getOperations(pTipo: string = 'C', pOperationId?: number): Observable<OperationOption[]> {
        let params = new HttpParams().set('p_tipo', pTipo);
        
        if (pOperationId) {
        params = params.set('p_OperationId', pOperationId.toString());
        }

        // Ruta completa invocada: http://127.0.0.1:8000/reports/operations?p_tipo=C
        return this.http.get<OperationOption[]>(`${this.apiUrl}/reports/operations`, { params });
    }

    getOperationAnalysisReport(pOperationId: number): Observable<any[]> {
    const numericId = Number(pOperationId);

    if (isNaN(numericId)) {
        console.error('El ID de operación ingresado no es válido:', pOperationId);
    }

    const params = new HttpParams().set('p_intOperationId', numericId.toString());
    return this.http.get<any[]>(`${this.apiUrl}/reports/operation-analysis`, { params });
    }
}