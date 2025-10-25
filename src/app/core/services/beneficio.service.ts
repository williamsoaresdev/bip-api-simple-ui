import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Beneficio, 
  BeneficioCategoria,
  BeneficioBackendResponse,
  CreateBeneficioRequest, 
  UpdateBeneficioRequest
} from '@core/models/beneficio.model';
import { ApiResponse, PaginatedResponse, LoadingState } from '@core/models/common.model';

// Interface para criar benefício no backend
export interface CreateBeneficioBackendRequest {
  nome: string;
  descricao: string;
  valorInicial: number;
}

// Interface para atualizar benefício no backend
export interface UpdateBeneficioBackendRequest {
  nome: string;
  descricao: string;
  valorInicial: number;
}

// Interface para estatísticas
export interface BeneficioEstatisticas {
  somaTotalValores: number;
  totalBeneficiosAtivos: number;
  timestamp: string;
}

// Interface para resposta de exclusão
export interface DeleteBeneficioResponse {
  mensagem: string;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class BeneficioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/beneficios`;

  private readonly _beneficios = signal<Beneficio[]>([]);
  private readonly _loading = signal<LoadingState>('idle');
  private readonly _error = signal<string | null>(null);
  private readonly _selectedBeneficio = signal<Beneficio | null>(null);

  readonly beneficios = this._beneficios.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedBeneficio = this._selectedBeneficio.asReadonly();

  readonly beneficiosAtivos = computed(() => {
    const beneficios = this._beneficios() || [];
    return beneficios.filter(b => b.ativo);
  });

  readonly totalBeneficios = computed(() => {
    const beneficios = this._beneficios() || [];
    return beneficios.length;
  });

  readonly valorTotalBeneficios = computed(() => {
    const beneficios = this._beneficios() || [];
    return beneficios.reduce((total, b) => total + b.valor, 0);
  });

  readonly isLoading = computed(() => 
    this._loading() === 'loading'
  );

  readonly hasError = computed(() => 
    this._error() !== null
  );

  constructor() {
    // Inicia carregando dados da API
    this.loadBeneficios().subscribe();
  }

  private mapBackendResponseToFrontend(backendResponse: BeneficioBackendResponse): Beneficio {
    // Mapeia os campos do backend para o formato esperado pelo frontend
    return {
      id: backendResponse.id.toString(),
      nome: backendResponse.nome,
      descricao: backendResponse.descricao,
      valor: backendResponse.saldo, // Backend usa 'saldo', frontend espera 'valor'
      ativo: backendResponse.ativo,
      categoria: this.mapNomeToCategoria(backendResponse.nome), // Inferir categoria baseada no nome
      createdAt: new Date(backendResponse.criadoEm),
      updatedAt: new Date(backendResponse.atualizadoEm)
    };
  }

  private mapNomeToCategoria(nome: string): BeneficioCategoria {
    const nomeLower = nome.toLowerCase();
    if (nomeLower.includes('alimenta') || nomeLower.includes('comida') || nomeLower.includes('refeição')) {
      return BeneficioCategoria.ALIMENTACAO;
    }
    if (nomeLower.includes('transporte') || nomeLower.includes('vale')) {
      return BeneficioCategoria.TRANSPORTE;
    }
    if (nomeLower.includes('saude') || nomeLower.includes('saúde') || nomeLower.includes('plano')) {
      return BeneficioCategoria.SAUDE;
    }
    if (nomeLower.includes('educação') || nomeLower.includes('educacao') || nomeLower.includes('curso')) {
      return BeneficioCategoria.EDUCACAO;
    }
    return BeneficioCategoria.OUTROS;
  }

  loadBeneficios(): Observable<PaginatedResponse<Beneficio>> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.get<BeneficioBackendResponse[]>(this.baseUrl).pipe(
      map(backendResponse => {
        // Mapeia a resposta do backend para o formato esperado pelo frontend
        const beneficios = backendResponse.map(item => this.mapBackendResponseToFrontend(item));
        
        return {
          data: beneficios,
          success: true,
          message: 'Benefícios carregados com sucesso',
          pagination: {
            page: 1,
            limit: beneficios.length,
            total: beneficios.length,
            totalPages: 1
          }
        } as PaginatedResponse<Beneficio>;
      }),
      tap(response => {
        this._beneficios.set(response.data);
        this._loading.set('success');
        console.log('Benefícios carregados:', response.data);
      }),
      catchError(error => {
        console.error('Erro ao carregar benefícios da API:', error);
        this._error.set('Não foi possível conectar com o servidor. Verifique se a API está rodando.');
        this._loading.set('error');
        
        // Retorna array vazio em caso de erro
        this._beneficios.set([]);
        
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
        } as PaginatedResponse<Beneficio>);
      })
    );
  }

  loadBeneficiosAtivos(): Observable<PaginatedResponse<Beneficio>> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.get<BeneficioBackendResponse[]>(`${this.baseUrl}/ativos`).pipe(
      map(backendResponse => {
        const beneficios = backendResponse.map(item => this.mapBackendResponseToFrontend(item));
        
        return {
          data: beneficios,
          success: true,
          message: 'Benefícios ativos carregados com sucesso',
          pagination: {
            page: 1,
            limit: beneficios.length,
            total: beneficios.length,
            totalPages: 1
          }
        } as PaginatedResponse<Beneficio>;
      }),
      tap(response => {
        this._loading.set('success');
        console.log('Benefícios ativos carregados:', response.data);
      }),
      catchError(error => {
        console.error('Erro ao carregar benefícios ativos:', error);
        this._error.set('Erro ao carregar benefícios ativos');
        this._loading.set('error');
        
        return of({
          data: [],
          success: false,
          message: 'Erro ao carregar benefícios ativos',
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
          }
        } as PaginatedResponse<Beneficio>);
      })
    );
  }

  getBeneficioById(id: string): Observable<ApiResponse<Beneficio | null>> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.get<BeneficioBackendResponse>(`${this.baseUrl}/${id}`).pipe(
      map(backendResponse => ({
        data: this.mapBackendResponseToFrontend(backendResponse),
        success: true,
        message: 'Benefício encontrado'
      } as ApiResponse<Beneficio>)),
      tap(response => {
        this._selectedBeneficio.set(response.data);
        this._loading.set('success');
      }),
      catchError(error => {
        console.error('Erro ao buscar benefício:', error);
        this._error.set('Benefício não encontrado');
        this._loading.set('error');
        
        return of({
          data: null,
          success: false,
          message: 'Benefício não encontrado'
        } as ApiResponse<Beneficio | null>);
      })
    );
  }

  createBeneficio(request: CreateBeneficioRequest): Observable<ApiResponse<Beneficio | null>> {
    this._loading.set('loading');
    this._error.set(null);

    // Mapear request do frontend para o formato do backend
    const backendRequest: CreateBeneficioBackendRequest = {
      nome: request.nome,
      descricao: request.descricao || '',
      valorInicial: request.valor
    };

    return this.http.post<BeneficioBackendResponse>(this.baseUrl, backendRequest).pipe(
      map(backendResponse => ({
        data: this.mapBackendResponseToFrontend(backendResponse),
        success: true,
        message: 'Benefício criado com sucesso'
      } as ApiResponse<Beneficio>)),
      tap(response => {
        if (response.data) {
          const currentBeneficios = this._beneficios();
          this._beneficios.set([...currentBeneficios, response.data]);
        }
        this._loading.set('success');
      }),
      catchError(error => {
        console.error('Erro ao criar benefício:', error);
        this._error.set('Erro ao criar benefício');
        this._loading.set('error');
        
        return of({
          data: null,
          success: false,
          message: 'Erro ao criar benefício'
        } as ApiResponse<Beneficio | null>);
      })
    );
  }

  updateBeneficio(id: string, request: UpdateBeneficioRequest): Observable<ApiResponse<Beneficio | null>> {
    this._loading.set('loading');
    this._error.set(null);

    // Mapear request do frontend para o formato do backend
    const backendRequest: UpdateBeneficioBackendRequest = {
      nome: request.nome || '',
      descricao: request.descricao || '',
      valorInicial: request.valor || 0
    };

    return this.http.put<BeneficioBackendResponse>(`${this.baseUrl}/${id}`, backendRequest).pipe(
      map(backendResponse => ({
        data: this.mapBackendResponseToFrontend(backendResponse),
        success: true,
        message: 'Benefício atualizado com sucesso'
      } as ApiResponse<Beneficio>)),
      tap(response => {
        if (response.data) {
          const currentBeneficios = this._beneficios();
          const updatedBeneficios = currentBeneficios.map(b =>
            b.id === id ? response.data! : b
          );
          this._beneficios.set(updatedBeneficios);
          this._selectedBeneficio.set(response.data);
        }
        this._loading.set('success');
      }),
      catchError(error => {
        console.error('Erro ao atualizar benefício:', error);
        this._error.set('Erro ao atualizar benefício');
        this._loading.set('error');
        
        return of({
          data: null,
          success: false,
          message: 'Erro ao atualizar benefício'
        } as ApiResponse<Beneficio | null>);
      })
    );
  }

  deleteBeneficio(id: string): Observable<ApiResponse<boolean>> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.delete<DeleteBeneficioResponse>(`${this.baseUrl}/${id}`).pipe(
      map(response => ({
        data: true,
        success: true,
        message: response.mensagem
      } as ApiResponse<boolean>)),
      tap(() => {
        const currentBeneficios = this._beneficios();
        const filteredBeneficios = currentBeneficios.filter(b => b.id !== id);
        this._beneficios.set(filteredBeneficios);
        
        if (this._selectedBeneficio()?.id === id) {
          this._selectedBeneficio.set(null);
        }
        
        this._loading.set('success');
      }),
      catchError(error => {
        console.error('Erro ao excluir benefício:', error);
        this._error.set('Erro ao excluir benefício');
        this._loading.set('error');
        
        return of({
          data: false,
          success: false,
          message: 'Erro ao excluir benefício'
        } as ApiResponse<boolean>);
      })
    );
  }

  getEstatisticas(): Observable<ApiResponse<BeneficioEstatisticas | null>> {
    return this.http.get<BeneficioEstatisticas>(`${this.baseUrl}/estatisticas`).pipe(
      map(response => ({
        data: response,
        success: true,
        message: 'Estatísticas carregadas com sucesso'
      } as ApiResponse<BeneficioEstatisticas>)),
      catchError(error => {
        console.error('Erro ao carregar estatísticas:', error);
        
        return of({
          data: null,
          success: false,
          message: 'Erro ao carregar estatísticas'
        } as ApiResponse<BeneficioEstatisticas | null>);
      })
    );
  }

  // Método para limpar erros
  clearError(): void {
    this._error.set(null);
  }

  // Método para recarregar dados
  refresh(): void {
    this.loadBeneficios().subscribe();
  }

  // Método para definir benefício selecionado
  setSelectedBeneficio(beneficio: Beneficio | null): void {
    this._selectedBeneficio.set(beneficio);
  }
}