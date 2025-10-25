import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Transferencia, 
  TransferenciaStatus,
  TransferenciaBackendResponse,
  TransferenciaBackendItem,
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

  readonly transferenciasPendentes = computed(() => {
    const transferencias = this._transferencias() || [];
    return transferencias.filter(t => t.status === TransferenciaStatus.PENDENTE);
  });

  readonly transferenciasProcessando = computed(() => {
    const transferencias = this._transferencias() || [];
    return transferencias.filter(t => t.status === TransferenciaStatus.PROCESSANDO);
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

  constructor() {
    // Inicia carregando dados da API ao invés de dados mockados
    this.loadTransferencias().subscribe();
  }

  private mapBackendItemToFrontend(backendItem: TransferenciaBackendItem): Transferencia {
    // Mapeia os campos do backend para o formato esperado pelo frontend
    return {
      id: backendItem.id.toString(),
      beneficioId: backendItem.beneficioOrigemId.toString(),
      beneficioNome: backendItem.beneficioOrigemNome,
      valor: backendItem.valor,
      destinatario: backendItem.beneficioDestinoNome, // Usando o nome do benefício destino como destinatário
      status: this.mapStringToStatus(backendItem.status),
      dataExecucao: new Date(backendItem.dataExecucao),
      observacoes: backendItem.descricao,
      createdAt: new Date(backendItem.dataExecucao), // Usando dataExecucao como createdAt
      updatedAt: new Date(backendItem.dataExecucao)  // Usando dataExecucao como updatedAt
    };
  }

  private mapStringToStatus(status: string): TransferenciaStatus {
    // Mapeia o status string do backend para o enum do frontend
    switch (status.toUpperCase()) {
      case 'PENDENTE':
        return TransferenciaStatus.PENDENTE;
      case 'PROCESSANDO':
        return TransferenciaStatus.PROCESSANDO;
      case 'CONCLUIDA':
        return TransferenciaStatus.CONCLUIDA;
      case 'CANCELADA':
        return TransferenciaStatus.CANCELADA;
      case 'REJEITADA':
        return TransferenciaStatus.REJEITADA;
      default:
        return TransferenciaStatus.PENDENTE;
    }
  }

  loadTransferencias(): Observable<PaginatedResponse<Transferencia>> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.get<TransferenciaBackendResponse>(this.baseUrl).pipe(
      map(backendResponse => {
        // Mapeia a resposta do backend para o formato esperado pelo frontend
        const transferencias = backendResponse.transferencias.map(item => 
          this.mapBackendItemToFrontend(item)
        );
        
        return {
          data: transferencias,
          success: true,
          message: 'Transferências carregadas com sucesso',
          pagination: {
            page: 1,
            limit: transferencias.length,
            total: backendResponse.total,
            totalPages: 1
          }
        } as PaginatedResponse<Transferencia>;
      }),
      tap(response => {
        this._transferencias.set(response.data);
        this._loading.set('success');
        console.log('Transferências carregadas:', response.data);
      }),
      catchError(error => {
        console.error('Erro ao carregar transferências da API:', error);
        this._error.set('Não foi possível conectar com o servidor. Verifique se a API está rodando.');
        this._loading.set('error');
        
        // Retorna array vazio em caso de erro
        this._transferencias.set([]);
        
        return of({
          data: [],
          success: false,
          message: 'Erro ao carregar dados da API',
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
          }
        } as PaginatedResponse<Transferencia>);
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

  createTransferencia(request: CreateTransferenciaRequest): Observable<ApiResponse<Transferencia | null>> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.post<TransferenciaBackendItem>(this.baseUrl, request).pipe(
      map(backendItem => ({
        data: this.mapBackendItemToFrontend(backendItem),
        success: true,
        message: 'Transferência criada com sucesso'
      } as ApiResponse<Transferencia>)),
      tap(response => {
        const currentTransferencias = this._transferencias();
        this._transferencias.set([...currentTransferencias, response.data]);
        this._loading.set('success');
      }),
      catchError(error => {
        console.error('Erro ao criar transferência:', error);
        this._error.set('Erro ao criar transferência');
        this._loading.set('error');
        
        return of({
          data: null,
          success: false,
          message: 'Erro ao criar transferência'
        } as ApiResponse<Transferencia | null>);
      })
    );
  }

  updateTransferencia(id: string, request: UpdateTransferenciaRequest): Observable<ApiResponse<Transferencia | null>> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.put<TransferenciaBackendItem>(`${this.baseUrl}/${id}`, request).pipe(
      map(backendItem => ({
        data: this.mapBackendItemToFrontend(backendItem),
        success: true,
        message: 'Transferência atualizada com sucesso'
      } as ApiResponse<Transferencia>)),
      tap(response => {
        const currentTransferencias = this._transferencias();
        const updatedTransferencias = currentTransferencias.map(t =>
          t.id === id ? response.data : t
        );
        this._transferencias.set(updatedTransferencias);
        this._selectedTransferencia.set(response.data);
        this._loading.set('success');
      }),
      catchError(error => {
        console.error('Erro ao atualizar transferência:', error);
        this._error.set('Erro ao atualizar transferência');
        this._loading.set('error');
        
        return of({
          data: null,
          success: false,
          message: 'Erro ao atualizar transferência'
        } as ApiResponse<Transferencia | null>);
      })
    );
  }

  deleteTransferencia(id: string): Observable<ApiResponse<boolean>> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      map(() => ({
        data: true,
        success: true,
        message: 'Transferência excluída com sucesso'
      } as ApiResponse<boolean>)),
      tap(() => {
        const currentTransferencias = this._transferencias();
        const filteredTransferencias = currentTransferencias.filter(t => t.id !== id);
        this._transferencias.set(filteredTransferencias);
        
        if (this._selectedTransferencia()?.id === id) {
          this._selectedTransferencia.set(null);
        }
        
        this._loading.set('success');
      }),
      catchError(error => {
        console.error('Erro ao excluir transferência:', error);
        this._error.set('Erro ao excluir transferência');
        this._loading.set('error');
        
        return of({
          data: false,
          success: false,
          message: 'Erro ao excluir transferência'
        } as ApiResponse<boolean>);
      })
    );
  }

  // Método para limpar erros
  clearError(): void {
    this._error.set(null);
  }

  // Método para recarregar dados
  refresh(): void {
    this.loadTransferencias().subscribe();
  }

  // Método para definir transferência selecionada
  setSelectedTransferencia(transferencia: Transferencia | null): void {
    this._selectedTransferencia.set(transferencia);
  }
}