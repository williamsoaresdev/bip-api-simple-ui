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
    console.log('🔄 Service: Carregando benefícios da API...');
    this._loading.set('loading');
    this._error.set(null);

    // O cache-busting agora é feito pelo interceptor
    return this.http.get<BeneficioBackendResponse[]>(this.baseUrl).pipe(
      map(backendResponse => {
        console.log('🔄 Service: Resposta da API recebida:', backendResponse.length, 'benefícios');
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
    console.log('🔍 Service: Buscando benefício por ID:', id);
    this._loading.set('loading');
    this._error.set(null);

    return this.http.get<BeneficioBackendResponse>(`${this.baseUrl}/${id}`).pipe(
      map(backendResponse => {
        const beneficio = this.mapBackendResponseToFrontend(backendResponse);
        return {
          data: beneficio,
          success: true,
          message: 'Benefício encontrado'
        } as ApiResponse<Beneficio>;
      }),
      tap(response => {
        this._selectedBeneficio.set(response.data);
        this._loading.set('success');
        console.log('Benefício encontrado:', response.data);
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

  createBeneficio(beneficio: CreateBeneficioRequest): Observable<ApiResponse<Beneficio>> {
    console.log('✨ Service: Criando novo benefício:', beneficio);
    this._loading.set('loading');
    this._error.set(null);

    const backendRequest: CreateBeneficioBackendRequest = {
      nome: beneficio.nome || '',
      descricao: beneficio.descricao || '',
      valorInicial: beneficio.valor || 0
    };

    return this.http.post<BeneficioBackendResponse>(this.baseUrl, backendRequest).pipe(
      map(backendResponse => {
        const novoBeneficio = this.mapBackendResponseToFrontend(backendResponse);
        return {
          data: novoBeneficio,
          success: true,
          message: 'Benefício criado com sucesso'
        } as ApiResponse<Beneficio>;
      }),
      tap(response => {
        // Adicionar o novo benefício à lista local
        const currentBeneficios = this._beneficios();
        this._beneficios.set([...currentBeneficios, response.data]);
        this._loading.set('success');
        console.log('Benefício criado:', response.data);
      }),
      catchError(error => {
        console.error('Erro ao criar benefício:', error);
        this._error.set('Erro ao criar benefício');
        this._loading.set('error');
        
        return of({
          data: {} as Beneficio,
          success: false,
          message: 'Erro ao criar benefício'
        } as ApiResponse<Beneficio>);
      })
    );
  }

  updateBeneficio(id: string, beneficio: UpdateBeneficioRequest): Observable<ApiResponse<Beneficio>> {
    console.log('🔧 Service: Atualizando benefício ID:', id, 'Dados:', beneficio);
    this._loading.set('loading');
    this._error.set(null);

    const backendRequest: UpdateBeneficioBackendRequest = {
      nome: beneficio.nome || '',
      descricao: beneficio.descricao || '',
      valorInicial: beneficio.valor || 0
    };

    return this.http.put<BeneficioBackendResponse>(`${this.baseUrl}/${id}`, backendRequest).pipe(
      map(backendResponse => {
        const beneficioAtualizado = this.mapBackendResponseToFrontend(backendResponse);
        return {
          data: beneficioAtualizado,
          success: true,
          message: 'Benefício atualizado com sucesso'
        } as ApiResponse<Beneficio>;
      }),
      tap(response => {
        // Atualizar o benefício na lista local
        const currentBeneficios = this._beneficios();
        const updatedBeneficios = currentBeneficios.map(b => 
          b.id === id ? response.data : b
        );
        this._beneficios.set(updatedBeneficios);
        
        // Atualizar benefício selecionado se for o mesmo
        if (this._selectedBeneficio()?.id === id) {
          this._selectedBeneficio.set(response.data);
        }
        
        this._loading.set('success');
        console.log('Benefício atualizado:', response.data);
      }),
      catchError(error => {
        console.error('Erro ao atualizar benefício:', error);
        this._error.set('Erro ao atualizar benefício');
        this._loading.set('error');
        
        return of({
          data: {} as Beneficio,
          success: false,
          message: 'Erro ao atualizar benefício'
        } as ApiResponse<Beneficio>);
      })
    );
  }

  deleteBeneficio(id: string): Observable<ApiResponse<boolean>> {
    console.log('🔧 Service: Deletando benefício ID:', id);
    console.log('🔧 Service: URL completa:', `${this.baseUrl}/${id}`);
    this._loading.set('loading');
    this._error.set(null);

    return this.http.delete<DeleteBeneficioResponse>(`${this.baseUrl}/${id}`).pipe(
      map(response => {
        console.log('🔧 Service: Resposta da API:', response);
        return {
          data: true,
          success: true,
          message: response.mensagem
        } as ApiResponse<boolean>;
      }),
      tap(() => {
        console.log('🗑️ Service: Delete realizado com sucesso');
        
        // Remover localmente primeiro para feedback imediato
        const currentBeneficios = this._beneficios();
        const updatedBeneficios = currentBeneficios.filter(b => b.id !== id);
        this._beneficios.set(updatedBeneficios);
        
        // Limpar benefício selecionado se for o deletado
        if (this._selectedBeneficio()?.id === id) {
          this._selectedBeneficio.set(null);
        }
        
        this._loading.set('success');
        console.log('✅ Service: Benefício removido da lista local');
      }),
      catchError(error => {
        console.error('🔧 Service: Erro ao deletar benefício:', error);
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

  /**
   * Limpa o cache local e recarrega da API
   */
  clearCacheAndReload(): Observable<PaginatedResponse<Beneficio>> {
    console.log('🧹 Service: Limpando cache e recarregando...');
    
    // Limpar cache local
    this._beneficios.set([]);
    this._selectedBeneficio.set(null);
    this._error.set(null);
    
    // Limpar cache do browser (se suportado)
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('api') || name.includes('beneficios')) {
            caches.delete(name);
            console.log('🧹 Cache do browser limpo:', name);
          }
        });
      });
    }
    
    return this.loadBeneficios();
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

  clearError(): void {
    this._error.set(null);
  }

  refresh(): void {
    this.loadBeneficios().subscribe();
  }

  setSelectedBeneficio(beneficio: Beneficio | null): void {
    this._selectedBeneficio.set(beneficio);
  }
}