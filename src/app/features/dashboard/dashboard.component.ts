import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Material Design Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';

// Core Services
import { BeneficioService } from '../../core/services/beneficio.service';
import { TransferenciaService } from '../../core/services/transferencia.service';
import { LoadingService } from '../../core/services/loading.service';
import { Beneficio } from '../../core/models/beneficio.model';
import { Transferencia } from '../../core/models/transferencia.model';
import { PaginatedResponse } from '../../core/models/common.model';
import { BrlCurrencyPipe } from '../../core/pipes/currency.pipe';

export interface DashboardMetrics {
  readonly totalBeneficios: number;
  readonly beneficiosAtivos: number;
  readonly totalTransferencias: number;
  readonly valorTotalTransferido: number;
  readonly transferenciasPendentes: number;
}

@Component({
  selector: 'bip-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    BrlCurrencyPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly beneficioService = inject(BeneficioService);
  private readonly transferenciaService = inject(TransferenciaService);
  readonly loadingService = inject(LoadingService);

  private readonly destroy$ = new Subject<void>();
  private readonly _errorMessage = signal<string | null>(null);
  private readonly _now = signal(new Date());

  readonly errorMessage = this._errorMessage.asReadonly();
  readonly now = this._now.asReadonly();

  readonly hasError = computed(() => 
    this._errorMessage() !== null
  );

  readonly isLoading = computed(() => 
    this.loadingService.isLoading()
  );

  readonly metrics = computed((): DashboardMetrics => {
    const beneficios = this.beneficioService.beneficios() || [];
    const transferencias = this.transferenciaService.transferencias() || [];
    const beneficiosAtivos = this.beneficioService.beneficiosAtivos() || [];
    const transferenciasPendentes = this.transferenciaService.transferenciasPendentes() || [];
    
    console.log('📊 Dashboard Metrics:', {
      beneficios: beneficios.length,
      transferencias: transferencias.length,
      beneficiosAtivos: beneficiosAtivos.length,
      transferenciasPendentes: transferenciasPendentes.length,
      beneficiosData: beneficios,
      transferenciasData: transferencias
    });
    
    return {
      totalBeneficios: beneficios.length,
      beneficiosAtivos: beneficiosAtivos.length,
      totalTransferencias: transferencias.length,
      valorTotalTransferido: this.transferenciaService.valorTotalTransferido() || 0,
      transferenciasPendentes: transferenciasPendentes.length
    };
  });

  readonly recentBeneficios = computed(() => {
    const beneficios = this.beneficioService.beneficios() || [];
    return beneficios
      .slice()
      .sort((a: Beneficio, b: Beneficio) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  });

  readonly recentTransferencias = computed(() => {
    const transferencias = this.transferenciaService.transferencias() || [];
    return transferencias
      .slice()
      .sort((a: Transferencia, b: Transferencia) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  });

  constructor() {
    setInterval(() => {
      this._now.set(new Date());
    }, 60000);
  }

  ngOnInit(): void {
    console.log('🚀 Dashboard: Componente inicializado');
    console.log('📊 Estados dos serviços:', {
      beneficioService: {
        beneficios: this.beneficioService.beneficios(),
        loading: this.beneficioService.loading(),
        error: this.beneficioService.error()
      },
      transferenciaService: {
        transferencias: this.transferenciaService.transferencias(),
        loading: this.transferenciaService.loading(),
        error: this.transferenciaService.error()
      }
    });
    
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    console.log('🔄 Dashboard: Iniciando carregamento de dados...');
    
    this.beneficioService.loadBeneficios()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Beneficio>) => {
          console.log('✅ Dashboard: Benefícios carregados com sucesso:', response);
        },
        error: (error: any) => {
          console.error('❌ Dashboard: Erro ao carregar benefícios:', error);
          this._errorMessage.set('Erro ao carregar benefícios: ' + (error.message || 'Erro desconhecido'));
        }
      });

    this.transferenciaService.loadTransferencias()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Transferencia>) => {
          console.log('✅ Dashboard: Transferências carregadas com sucesso:', response);
        },
        error: (error: any) => {
          console.error('❌ Dashboard: Erro ao carregar transferências:', error);
          this._errorMessage.set('Erro ao carregar transferências: ' + (error.message || 'Erro desconhecido'));
        }
      });
  }

  checkApiStatus(): void {
    window.open('http://localhost:8080/actuator/health', '_blank');
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  getStatusClasses(status: string): string {
    const classes: Record<string, string> = {
      'PENDENTE': 'status-pending',
      'PROCESSANDO': 'status-processing',
      'CONCLUIDA': 'status-completed',
      'CANCELADA': 'status-cancelled',
      'REJEITADA': 'status-failed', // Corrigido de FALHOU para REJEITADA
      'FALHOU': 'status-failed'
    };
    return classes[status] || 'status-default';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDENTE': 'Pendente',
      'PROCESSANDO': 'Processando',
      'CONCLUIDA': 'Concluída',
      'CANCELADA': 'Cancelada',
      'REJEITADA': 'Rejeitada', // Corrigido de Falhou para Rejeitada
      'FALHOU': 'Falhou'
    };
    return labels[status] || status;
  }
}