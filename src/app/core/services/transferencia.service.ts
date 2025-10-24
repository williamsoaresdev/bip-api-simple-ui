import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';

import { environment } from '@environments/environment';
import {
  CreateTransferenciaRequest,
  TransferenciaResponse,
  ValidacaoTransferenciaResponse,
  TaxaTransferenciaResponse,
  ApiError,
  LoadingState
} from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class TransferenciaService {
  private readonly baseUrl = `${environment.apiUrl}/transferencias`;
  
  // Loading state management
  private loadingSubject = new BehaviorSubject<LoadingState>({ loading: false });
  public loading$ = this.loadingSubject.asObservable();

  // Histórico de transferências
  private transferenciasSubject = new BehaviorSubject<TransferenciaResponse[]>([]);
  public transferencias$ = this.transferenciasSubject.asObservable();

  constructor(private http: HttpClient) {
    // Adicionar dados de exemplo para demonstração
    this.initializeExampleData();
  }

  /**
   * Inicializa dados de exemplo para demonstração
   */
  private initializeExampleData(): void {
    const exemploTransferencias: TransferenciaResponse[] = [
      {
        origem: 1,
        destino: 2,
        valor: 500.00,
        sucesso: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
        mensagem: 'Transferência realizada com sucesso',
        descricao: 'Transferência para pagamento de benefícios'
      },
      {
        origem: 3,
        destino: 1,
        valor: 250.75,
        sucesso: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 horas atrás
        mensagem: 'Transferência concluída',
        descricao: 'Redistribuição de valores'
      },
      {
        origem: 2,
        destino: 4,
        valor: 1000.00,
        sucesso: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 horas atrás
        mensagem: 'Saldo insuficiente',
        descricao: 'Tentativa de transferência de grande valor'
      },
      {
        origem: 1,
        destino: 3,
        valor: 150.30,
        sucesso: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
        mensagem: 'Transferência processada',
        descricao: 'Ajuste mensal de benefícios'
      },
      {
        origem: 4,
        destino: 2,
        valor: 750.00,
        sucesso: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 dias atrás
        mensagem: 'Operação concluída com sucesso',
        descricao: 'Transferência programada'
      },
      {
        origem: 2,
        destino: 3,
        valor: 300.00,
        sucesso: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 dias atrás
        mensagem: 'Benefício de destino inativo',
        descricao: 'Transferência para conta bloqueada'
      }
    ];

    this.transferenciasSubject.next(exemploTransferencias);
  }

  /**
   * Cria nova transferência
   * POST /transferencias
   */
  criar(request: CreateTransferenciaRequest): Observable<TransferenciaResponse> {
    this.setLoading(true);
    
    return this.http.post<TransferenciaResponse>(this.baseUrl, request).pipe(
      tap((transferencia) => {
        console.log('Transferência criada:', transferencia.sucesso ? 'Sucesso' : 'Falha');
        this.adicionarTransferenciaAoHistorico(transferencia);
      }),
      catchError(this.handleError),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Valida uma transferência sem executá-la
   * POST /transferencias/validar
   */
  validar(request: CreateTransferenciaRequest): Observable<ValidacaoTransferenciaResponse> {
    this.setLoading(true);
    
    return this.http.post<ValidacaoTransferenciaResponse>(`${this.baseUrl}/validar`, request).pipe(
      tap((validacao) => {
        console.log('Transferência validada:', validacao.valida ? 'VÁLIDA' : 'INVÁLIDA');
        if (!validacao.valida && validacao.motivo) {
          console.warn('Motivo da invalidação:', validacao.motivo);
        }
      }),
      catchError(this.handleError),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Calcula a taxa para um valor específico
   * GET /transferencias/taxa?valor={valor}
   */
  calcularTaxa(valor: number): Observable<TaxaTransferenciaResponse> {
    this.setLoading(true);
    
    const params = { valor: valor.toString() };
    
    return this.http.get<TaxaTransferenciaResponse>(`${this.baseUrl}/taxa`, { params }).pipe(
      tap((taxa) => {
        console.log('Taxa calculada:', `R$ ${taxa.taxa} para valor original R$ ${taxa.valorOriginal}`);
      }),
      catchError(this.handleError),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Obtém histórico de transferências (local)
   */
  obterHistorico(): Observable<TransferenciaResponse[]> {
    return this.transferencias$;
  }

  /**
   * Limpa o histórico de transferências
   */
  limparHistorico(): void {
    this.transferenciasSubject.next([]);
  }

  /**
   * Adiciona transferência ao histórico local
   */
  private adicionarTransferenciaAoHistorico(transferencia: TransferenciaResponse): void {
    const historicoAtual = this.transferenciasSubject.value;
    const novoHistorico = [transferencia, ...historicoAtual].slice(0, 50); // Máximo 50 itens
    this.transferenciasSubject.next(novoHistorico);
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
    console.error('Erro no TransferenciaService:', error);
    
    let errorMessage = 'Erro inesperado. Tente novamente.';
    
    if (error.error && error.error.erro) {
      // Erro estruturado da API
      const apiError = error.error as ApiError;
      errorMessage = apiError.erro;
      
      // Mensagens específicas para transferências
      switch (apiError.codigo) {
        case 'SALDO_INSUFICIENTE':
          errorMessage = 'Saldo insuficiente para esta transferência.';
          break;
        case 'BENEFICIO_NAO_ENCONTRADO':
          errorMessage = 'Um dos benefícios selecionados não foi encontrado.';
          break;
        case 'TRANSFERENCIA_INVALIDA':
          errorMessage = 'Os dados da transferência são inválidos.';
          break;
        case 'VALOR_INVALIDO':
          errorMessage = 'O valor da transferência deve ser maior que zero.';
          break;
      }
    } else if (error.status === 0) {
      errorMessage = 'Não foi possível conectar ao servidor.';
    } else if (error.status >= 500) {
      errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
    } else if (error.status === 400) {
      errorMessage = 'Dados da transferência inválidos.';
    }
    
    this.setLoading(false, errorMessage);
    return throwError(() => errorMessage);
  };
}