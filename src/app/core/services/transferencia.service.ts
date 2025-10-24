import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Transferencia, 
  TransferenciaStatus,
  CreateTransferenciaRequest, 
  UpdateTransferenciaRequest
} from '@core/models/transferencia.model';
import { ApiResponse, PaginatedResponse, LoadingState } from '@core/models/common.model';

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

  readonly transferenciasPendentes = computed(() => 
    this._transferencias().filter(t => t.status === TransferenciaStatus.PENDENTE)
  );

  readonly transferenciasProcessando = computed(() => 
    this._transferencias().filter(t => t.status === TransferenciaStatus.PROCESSANDO)
  );

  readonly transferenciasConcluidas = computed(() => 
    this._transferencias().filter(t => t.status === TransferenciaStatus.CONCLUIDA)
  );

  readonly totalTransferencias = computed(() => 
    this._transferencias().length
  );

  readonly valorTotalTransferido = computed(() => 
    this._transferencias()
      .filter(t => t.status === TransferenciaStatus.CONCLUIDA)
      .reduce((total, t) => total + t.valor, 0)
  );

  readonly isLoading = computed(() => 
    this._loading() === 'loading'
  );

  readonly hasError = computed(() => 
    this._error() !== null
  );

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const mockData: Transferencia[] = [
      {
        id: '1',
        beneficioId: '1',
        beneficioNome: 'Auxílio Alimentação',
        valor: 500.00,
        destinatario: 'João Silva',
        status: TransferenciaStatus.CONCLUIDA,
        dataExecucao: new Date('2024-10-20T14:30:00Z'),
        observacoes: 'Transferência mensal',
        createdAt: new Date('2024-10-20T10:00:00Z'),
        updatedAt: new Date('2024-10-20T14:30:00Z')
      },
      {
        id: '2',
        beneficioId: '2',
        beneficioNome: 'Vale Transporte',
        valor: 220.50,
        destinatario: 'Maria Santos',
        status: TransferenciaStatus.PENDENTE,
        observacoes: 'Aguardando processamento',
        createdAt: new Date('2024-10-22T09:15:00Z'),
        updatedAt: new Date('2024-10-22T09:15:00Z')
      },
      {
        id: '3',
        beneficioId: '3',
        beneficioNome: 'Plano de Saúde',
        valor: 450.00,
        destinatario: 'Pedro Costa',
        status: TransferenciaStatus.PROCESSANDO,
        observacoes: 'Em processamento',
        createdAt: new Date('2024-10-22T11:00:00Z'),
        updatedAt: new Date('2024-10-22T11:30:00Z')
      }
    ];

    setTimeout(() => {
      this._transferencias.set(mockData);
      this._loading.set('success');
    }, 100);
  }

  loadTransferencias(): Observable<PaginatedResponse<Transferencia>> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.get<PaginatedResponse<Transferencia>>(this.baseUrl).pipe(
      tap(response => {
        this._transferencias.set(response.data);
        this._loading.set('success');
      }),
      catchError(error => {
        this._error.set(error.message || 'Erro ao carregar transferências');
        this._loading.set('error');
        return of({
          data: this._transferencias(),
          success: false,
          message: 'Usando dados em cache'
        } as PaginatedResponse<Transferencia>);
      })
    );
  }

  getTransferenciaById(id: string): Observable<ApiResponse<Transferencia>> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.get<ApiResponse<Transferencia>>(`${this.baseUrl}/${id}`).pipe(
      tap(response => {
        this._selectedTransferencia.set(response.data);
        this._loading.set('success');
      }),
      catchError(error => {
        this._error.set(error.message || 'Erro ao carregar transferência');
        this._loading.set('error');
        const cached = this._transferencias().find(t => t.id === id);
        if (cached) {
          this._selectedTransferencia.set(cached);
          return of({ data: cached, success: true } as ApiResponse<Transferencia>);
        }
        throw error;
      })
    );
  }

  createTransferencia(transferencia: CreateTransferenciaRequest): Observable<ApiResponse<Transferencia>> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.post<ApiResponse<Transferencia>>(this.baseUrl, transferencia).pipe(
      tap(response => {
        const current = this._transferencias();
        this._transferencias.set([response.data, ...current]);
        this._loading.set('success');
      }),
      catchError(error => {
        this._error.set(error.message || 'Erro ao criar transferência');
        this._loading.set('error');
        throw error;
      })
    );
  }

  updateTransferencia(id: string, update: UpdateTransferenciaRequest): Observable<ApiResponse<Transferencia>> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.put<ApiResponse<Transferencia>>(`${this.baseUrl}/${id}`, update).pipe(
      tap(response => {
        const current = this._transferencias();
        const index = current.findIndex(t => t.id === id);
        if (index !== -1) {
          const updated = [...current];
          updated[index] = response.data;
          this._transferencias.set(updated);
        }
        this._selectedTransferencia.set(response.data);
        this._loading.set('success');
      }),
      catchError(error => {
        this._error.set(error.message || 'Erro ao atualizar transferência');
        this._loading.set('error');
        throw error;
      })
    );
  }

  cancelTransferencia(id: string): Observable<ApiResponse<Transferencia>> {
    return this.updateTransferencia(id, { status: TransferenciaStatus.CANCELADA });
  }

  clearError(): void {
    this._error.set(null);
  }

  clearSelection(): void {
    this._selectedTransferencia.set(null);
  }
}