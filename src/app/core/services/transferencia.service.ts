import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Transferencia, 
  TransferenciaStatus,
  TransferenciaListResponse,
  TransferenciaBackendItem,
  CreateTransferenciaRequest,
  CreateTransferenciaResponse,
  ValidarTransferenciaRequest,
  ValidarTransferenciaResponse
} from '@core/models/transferencia.model';
import { ApiResponse, LoadingState } from '@core/models/common.model';

@Injectable({
  providedIn: 'root'
})
export class TransferenciaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/transferencias`;

  private readonly _transferencias = signal<Transferencia[]>([]);
  private readonly _loading = signal<LoadingState>('idle');
  private readonly _error = signal<string | null>(null);
  private readonly _selectedTransferencia = signal<Transferencia | null>(null);

  readonly transferencias = this._transferencias.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedTransferencia = this._selectedTransferencia.asReadonly();

  readonly transferenciasPendentes = computed(() => {
    const transferencias = this._transferencias() || [];
    return transferencias.filter(t => t.status === TransferenciaStatus.PENDENTE);
  });

  readonly transferenciasConcluidas = computed(() => {
    const transferencias = this._transferencias() || [];
    return transferencias.filter(t => t.status === TransferenciaStatus.CONCLUIDA);
  });

  readonly totalTransferencias = computed(() => {
    const transferencias = this._transferencias() || [];
    return transferencias.length;
  });

  readonly valorTotalTransferido = computed(() => {
    const transferencias = this._transferencias() || [];
    return transferencias
      .filter(t => t.status === TransferenciaStatus.CONCLUIDA)
      .reduce((total, t) => total + t.valor, 0);
  });

  readonly isLoading = computed(() => 
    this._loading() === 'loading'
  );

  readonly hasError = computed(() => 
    this._error() !== null
  );

  private mapBackendItemToFrontend(backendItem: TransferenciaBackendItem): Transferencia {
    return {
      id: backendItem.id.toString(),
      beneficioOrigemId: backendItem.beneficioOrigemId,
      beneficioOrigemNome: backendItem.beneficioOrigemNome,
      beneficioDestinoId: backendItem.beneficioDestinoId,
      beneficioDestinoNome: backendItem.beneficioDestinoNome,
      valor: backendItem.valor,
      taxa: backendItem.taxa,
      descricao: backendItem.descricao,
      dataExecucao: backendItem.dataExecucao,
      status: this.mapStringToStatus(backendItem.status),
      createdAt: new Date(backendItem.dataExecucao),
      updatedAt: new Date(backendItem.dataExecucao)
    };
  }

  private mapStringToStatus(status: string): TransferenciaStatus {
    switch (status.toUpperCase()) {
      case 'PENDENTE':
        return TransferenciaStatus.PENDENTE;
      case 'CONCLUIDA':
        return TransferenciaStatus.CONCLUIDA;
      case 'CANCELADA':
        return TransferenciaStatus.CANCELADA;
      case 'ERRO':
        return TransferenciaStatus.ERRO;
      default:
        return TransferenciaStatus.PENDENTE;
    }
  }

  loadTransferencias(): Observable<ApiResponse<Transferencia[]>> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.get<TransferenciaListResponse>(this.baseUrl).pipe(
      map(response => {
        const transferencias = response.transferencias.map(item => 
          this.mapBackendItemToFrontend(item)
        );
        
        return {
          data: transferencias,
          success: true,
          message: 'Transferências carregadas com sucesso'
        } as ApiResponse<Transferencia[]>;
      }),
      tap(response => {
        this._transferencias.set(response.data);
        this._loading.set('success');
      }),
      catchError(error => {
        console.error('Erro ao carregar transferências:', error);
        this._error.set('Erro ao carregar transferências');
        this._loading.set('error');
        
        this._transferencias.set([]);
        
        return of({
          data: [],
          success: false,
          message: 'Erro ao carregar transferências'
        } as ApiResponse<Transferencia[]>);
      })
    );
  }

  getTransferenciaById(id: string): Observable<ApiResponse<Transferencia | null>> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.get<TransferenciaBackendItem>(`${this.baseUrl}/${id}`).pipe(
      map(backendItem => ({
        data: this.mapBackendItemToFrontend(backendItem),
        success: true,
        message: 'Transferência encontrada'
      } as ApiResponse<Transferencia>)),
      tap(response => {
        this._selectedTransferencia.set(response.data);
        this._loading.set('success');
      }),
      catchError(error => {
        console.error('Erro ao buscar transferência:', error);
        this._error.set('Transferência não encontrada');
        this._loading.set('error');
        
        return of({
          data: null,
          success: false,
          message: 'Transferência não encontrada'
        } as ApiResponse<Transferencia | null>);
      })
    );
  }

  validarTransferencia(request: ValidarTransferenciaRequest): Observable<ValidarTransferenciaResponse> {
    return this.http.post<ValidarTransferenciaResponse>(`${this.baseUrl}/validar`, request).pipe(
      catchError(error => {
        console.error('Erro ao validar transferência:', error);
        return of({
          valida: false,
          origem: request.beneficioOrigemId,
          valor: request.valor,
          destino: request.beneficioDestinoId,
          mensagem: 'Erro ao validar transferência'
        } as ValidarTransferenciaResponse);
      })
    );
  }

  createTransferencia(request: CreateTransferenciaRequest): Observable<CreateTransferenciaResponse> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.post<CreateTransferenciaResponse>(this.baseUrl, request).pipe(
      tap(response => {
        if (response.sucesso) {
          // Força o reload da lista com cache-busting
          this.loadTransferencias().subscribe();
        }
        this._loading.set('success');
      }),
      catchError(error => {
        console.error('Erro ao criar transferência:', error);
        this._error.set('Erro ao criar transferência');
        this._loading.set('error');
        
        return of({
          mensagem: 'Erro ao criar transferência',
          origem: request.beneficioOrigemId,
          valor: request.valor,
          destino: request.beneficioDestinoId,
          sucesso: false,
          descricao: request.descricao,
          timestamp: new Date().toISOString()
        } as CreateTransferenciaResponse);
      })
    );
  }

  clearError(): void {
    this._error.set(null);
  }

  refresh(): void {
    this.loadTransferencias().subscribe();
  }

  setSelectedTransferencia(transferencia: Transferencia | null): void {
    this._selectedTransferencia.set(transferencia);
  }
}