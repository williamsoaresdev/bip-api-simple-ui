import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Beneficio, 
  BeneficioCategoria,
  CreateBeneficioRequest, 
  UpdateBeneficioRequest
} from '@core/models/beneficio.model';
import { ApiResponse, PaginatedResponse, LoadingState } from '@core/models/common.model';

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

  readonly beneficiosAtivos = computed(() => 
    this._beneficios().filter(b => b.ativo)
  );

  readonly totalBeneficios = computed(() => 
    this._beneficios().length
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
    const mockData: Beneficio[] = [
      {
        id: '1',
        nome: 'Auxílio Alimentação',
        descricao: 'Benefício para alimentação dos funcionários',
        valor: 800.00,
        ativo: true,
        categoria: BeneficioCategoria.ALIMENTACAO,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-10-20T14:30:00Z')
      },
      {
        id: '2',
        nome: 'Vale Transporte',
        descricao: 'Auxílio para transporte público',
        valor: 220.50,
        ativo: true,
        categoria: BeneficioCategoria.TRANSPORTE,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-10-18T09:15:00Z')
      },
      {
        id: '3',
        nome: 'Plano de Saúde',
        descricao: 'Cobertura médica e odontológica',
        valor: 450.00,
        ativo: true,
        categoria: BeneficioCategoria.SAUDE,
        createdAt: new Date('2024-02-01T08:30:00Z'),
        updatedAt: new Date('2024-10-22T16:45:00Z')
      }
    ];

    setTimeout(() => {
      this._beneficios.set(mockData);
      this._loading.set('success');
    }, 100);
  }

  loadBeneficios(): Observable<PaginatedResponse<Beneficio>> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.get<PaginatedResponse<Beneficio>>(this.baseUrl).pipe(
      tap(response => {
        this._beneficios.set(response.data);
        this._loading.set('success');
      }),
      catchError(error => {
        this._error.set(error.message || 'Erro ao carregar benefícios');
        this._loading.set('error');
        return of({
          data: this._beneficios(),
          success: false,
          message: 'Usando dados em cache'
        } as PaginatedResponse<Beneficio>);
      })
    );
  }

  getBeneficioById(id: string): Observable<ApiResponse<Beneficio>> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.get<ApiResponse<Beneficio>>(`${this.baseUrl}/${id}`).pipe(
      tap(response => {
        this._selectedBeneficio.set(response.data);
        this._loading.set('success');
      }),
      catchError(error => {
        this._error.set(error.message || 'Erro ao carregar benefício');
        this._loading.set('error');
        const cached = this._beneficios().find(b => b.id === id);
        if (cached) {
          this._selectedBeneficio.set(cached);
          return of({ data: cached, success: true } as ApiResponse<Beneficio>);
        }
        throw error;
      })
    );
  }

  createBeneficio(beneficio: CreateBeneficioRequest): Observable<ApiResponse<Beneficio>> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.post<ApiResponse<Beneficio>>(this.baseUrl, beneficio).pipe(
      tap(response => {
        const current = this._beneficios();
        this._beneficios.set([...current, response.data]);
        this._loading.set('success');
      }),
      catchError(error => {
        this._error.set(error.message || 'Erro ao criar benefício');
        this._loading.set('error');
        throw error;
      })
    );
  }

  updateBeneficio(id: string, beneficio: UpdateBeneficioRequest): Observable<ApiResponse<Beneficio>> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.put<ApiResponse<Beneficio>>(`${this.baseUrl}/${id}`, beneficio).pipe(
      tap(response => {
        const current = this._beneficios();
        const index = current.findIndex(b => b.id === id);
        if (index !== -1) {
          const updated = [...current];
          updated[index] = response.data;
          this._beneficios.set(updated);
        }
        this._selectedBeneficio.set(response.data);
        this._loading.set('success');
      }),
      catchError(error => {
        this._error.set(error.message || 'Erro ao atualizar benefício');
        this._loading.set('error');
        throw error;
      })
    );
  }

  deleteBeneficio(id: string): Observable<ApiResponse<void>> {
    this._loading.set('loading');
    this._error.set(null);

    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        const current = this._beneficios();
        this._beneficios.set(current.filter(b => b.id !== id));
        if (this._selectedBeneficio()?.id === id) {
          this._selectedBeneficio.set(null);
        }
        this._loading.set('success');
      }),
      catchError(error => {
        this._error.set(error.message || 'Erro ao excluir benefício');
        this._loading.set('error');
        throw error;
      })
    );
  }

  clearError(): void {
    this._error.set(null);
  }

  clearSelection(): void {
    this._selectedBeneficio.set(null);
  }
}