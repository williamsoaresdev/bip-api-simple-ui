import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, finalize, shareReplay } from 'rxjs/operators';

import { environment } from '@environments/environment';
import {
  Beneficio,
  CreateBeneficioRequest,
  UpdateBeneficioRequest,
  BeneficioEstatisticas,
  ApiError,
  LoadingState
} from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class BeneficioService {
  private readonly baseUrl = `${environment.apiUrl}/beneficios`;
  
  // Loading state management
  private loadingSubject = new BehaviorSubject<LoadingState>({ loading: false });
  public loading$ = this.loadingSubject.asObservable();

  // Cache para benefícios ativos
  private beneficiosAtivosSubject = new BehaviorSubject<Beneficio[]>([]);
  public beneficiosAtivos$ = this.beneficiosAtivosSubject.asObservable().pipe(
    shareReplay(1)
  );

  constructor(private http: HttpClient) {
    // Adicionar dados de exemplo para demonstração
    this.initializeExampleData();
  }

  /**
   * Inicializa dados de exemplo para demonstração
   */
  private initializeExampleData(): void {
    const exemploBeneficios: Beneficio[] = [
      {
        id: 1,
        nome: 'Auxílio Alimentação',
        saldo: 800.00,
        descricao: 'Benefício para alimentação dos funcionários',
        criadoEm: '2024-01-15T10:00:00Z',
        atualizadoEm: '2024-10-20T14:30:00Z'
      },
      {
        id: 2,
        nome: 'Vale Transporte',
        saldo: 220.50,
        descricao: 'Auxílio para transporte público',
        criadoEm: '2024-01-15T10:00:00Z',
        atualizadoEm: '2024-10-18T09:15:00Z'
      },
      {
        id: 3,
        nome: 'Plano de Saúde',
        saldo: 450.00,
        descricao: 'Cobertura médica e odontológica',
        criadoEm: '2024-02-01T08:30:00Z',
        atualizadoEm: '2024-10-22T16:45:00Z'
      },
      {
        id: 4,
        nome: 'Auxílio Creche',
        saldo: 350.00,
        descricao: 'Apoio para cuidados infantis',
        criadoEm: '2024-03-01T11:20:00Z',
        atualizadoEm: '2024-10-21T13:00:00Z'
      },
      {
        id: 5,
        nome: 'Seguro de Vida',
        saldo: 75.00,
        descricao: 'Proteção para funcionários e familiares',
        criadoEm: '2024-01-20T09:45:00Z',
        atualizadoEm: '2024-09-15T10:30:00Z'
      }
    ];

    // Simula carregamento dos benefícios
    setTimeout(() => {
      this.beneficiosAtivosSubject.next(exemploBeneficios);
      this.setLoading(false);
    }, 100);
  }

  /**
   * Lista todos os benefícios
   */
  listarTodos(): Observable<Beneficio[]> {
    this.setLoading(true);
    
    return this.http.get<Beneficio[]>(this.baseUrl).pipe(
      tap((beneficios) => {
        console.log('Benefícios carregados:', beneficios.length);
      }),
      catchError(this.handleError),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Busca benefício por ID
   */
  buscarPorId(id: number): Observable<Beneficio> {
    this.setLoading(true);
    
    return this.http.get<Beneficio>(`${this.baseUrl}/${id}`).pipe(
      tap((beneficio) => {
        console.log('Benefício encontrado:', beneficio.nome);
      }),
      catchError(this.handleError),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Cria novo benefício
   */
  criar(beneficio: CreateBeneficioRequest): Observable<Beneficio> {
    this.setLoading(true);
    
    return this.http.post<Beneficio>(this.baseUrl, beneficio).pipe(
      tap((novoBeneficio) => {
        console.log('Benefício criado:', novoBeneficio.nome);
        this.refreshBeneficiosAtivos();
      }),
      catchError(this.handleError),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Atualiza benefício existente
   */
  atualizar(id: number, beneficio: UpdateBeneficioRequest): Observable<Beneficio> {
    this.setLoading(true);
    
    return this.http.put<Beneficio>(`${this.baseUrl}/${id}`, beneficio).pipe(
      tap((beneficioAtualizado) => {
        console.log('Benefício atualizado:', beneficioAtualizado.nome);
        this.refreshBeneficiosAtivos();
      }),
      catchError(this.handleError),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Remove benefício
   */
  remover(id: number): Observable<void> {
    this.setLoading(true);
    
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        console.log('Benefício removido:', id);
        this.refreshBeneficiosAtivos();
      }),
      catchError(this.handleError),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Exclui benefício (alias para remover)
   */
  excluir(id: number): Observable<void> {
    return this.remover(id);
  }

  /**
   * Obtém estatísticas dos benefícios
   */
  obterEstatisticas(): Observable<BeneficioEstatisticas> {
    this.setLoading(true);
    
    return this.http.get<BeneficioEstatisticas>(`${this.baseUrl}/estatisticas`).pipe(
      tap((estatisticas) => {
        console.log('Estatísticas carregadas:', estatisticas);
      }),
      catchError(this.handleError),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Verifica status da API
   */
  verificarStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/status`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Atualiza cache de benefícios
   */
  private refreshBeneficiosAtivos(): void {
    this.listarTodos().subscribe();
  }

  /**
   * Gerencia estado de loading
   */
  private setLoading(loading: boolean, error?: string): void {
    this.loadingSubject.next({ loading, error });
  }

  /**
   * Tratamento centralizado de erros
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('Erro no BeneficioService:', error);
    
    let errorMessage = 'Erro inesperado. Tente novamente.';
    
    if (error.error && error.error.erro) {
      // Erro estruturado da API
      const apiError = error.error as ApiError;
      errorMessage = apiError.erro;
    } else if (error.status === 0) {
      errorMessage = 'Não foi possível conectar ao servidor.';
    } else if (error.status >= 500) {
      errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
    } else if (error.status === 404) {
      errorMessage = 'Recurso não encontrado.';
    } else if (error.status === 400) {
      errorMessage = 'Dados inválidos enviados.';
    }
    
    this.setLoading(false, errorMessage);
    return throwError(() => errorMessage);
  };
}