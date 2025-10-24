import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BeneficioService, TransferenciaService, LoadingService } from '../../core/services';
import { DashboardMetrics } from '../../shared/models';
import { CurrencyPipe, DateFormatPipe } from '../../shared/pipes';

@Component({
  selector: 'app-dashboard-modern',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyPipe,
    DateFormatPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <!-- Loading State -->
      <div *ngIf="loadingService.isLoading()" class="flex flex-col items-center justify-center min-h-96">
        <div class="loading-spinner"></div>
        <p class="text-gray-600 mt-4">Carregando dados...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="hasError()" class="card bg-red-50 border-red-200 mb-6">
        <div class="flex items-center space-x-3">
          <div class="text-red-500 text-2xl">⚠️</div>
          <div>
            <h3 class="text-red-800 font-medium">Erro ao carregar dados</h3>
            <p class="text-red-600 text-sm mt-1">{{ errorMessage() }}</p>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!loadingService.isLoading() && !hasError()" class="space-y-8">
        <!-- Header -->
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p class="text-gray-600 mt-2">Visão geral do sistema de benefícios</p>
          </div>
          <div class="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
            📅 Última atualização: {{ now() | dateFormat:'time' }}
          </div>
        </div>

        <!-- Metrics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Benefícios -->
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-100 text-sm font-medium uppercase tracking-wide">Total de Benefícios</p>
                <p class="text-3xl font-bold mt-2">{{ metrics().totalBeneficios }}</p>
                <p class="text-blue-200 text-xs mt-1">Cadastrados no sistema</p>
              </div>
              <div class="text-blue-200 text-4xl opacity-80">💰</div>
            </div>
          </div>

          <!-- Benefícios Ativos -->
          <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm font-medium uppercase tracking-wide">Benefícios Ativos</p>
                <p class="text-3xl font-bold mt-2">{{ metrics().beneficiosAtivos }}</p>
                <p class="text-green-200 text-xs mt-1">Disponíveis para uso</p>
              </div>
              <div class="text-green-200 text-4xl opacity-80">✅</div>
            </div>
          </div>

          <!-- Total Transferências -->
          <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-100 text-sm font-medium uppercase tracking-wide">Transferências</p>
                <p class="text-3xl font-bold mt-2">{{ metrics().totalTransferencias }}</p>
                <p class="text-purple-200 text-xs mt-1">{{ metrics().transferenciasPendentes }} pendentes</p>
              </div>
              <div class="text-purple-200 text-4xl opacity-80">🔄</div>
            </div>
          </div>

          <!-- Valor Total -->
          <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-orange-100 text-sm font-medium uppercase tracking-wide">Valor Transferido</p>
                <p class="text-2xl font-bold mt-2">{{ metrics().valorTotalTransferido | currency }}</p>
                <p class="text-orange-200 text-xs mt-1">Total processado</p>
              </div>
              <div class="text-orange-200 text-4xl opacity-80">💸</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <span class="mr-2">⚡</span>
            Ações Rápidas
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a routerLink="/beneficios/novo" 
               class="group flex items-center space-x-4 p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-blue-50 hover:bg-blue-100">
              <div class="text-3xl group-hover:scale-110 transition-transform">➕</div>
              <div>
                <h3 class="font-semibold text-gray-900 group-hover:text-blue-800">Novo Benefício</h3>
                <p class="text-sm text-gray-600">Criar um novo benefício no sistema</p>
              </div>
            </a>

            <a routerLink="/transferencias/nova" 
               class="group flex items-center space-x-4 p-6 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all duration-200 bg-green-50 hover:bg-green-100">
              <div class="text-3xl group-hover:scale-110 transition-transform">💸</div>
              <div>
                <h3 class="font-semibold text-gray-900 group-hover:text-green-800">Nova Transferência</h3>
                <p class="text-sm text-gray-600">Realizar transferência entre benefícios</p>
              </div>
            </a>

            <a routerLink="/beneficios" 
               class="group flex items-center space-x-4 p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-200 bg-purple-50 hover:bg-purple-100">
              <div class="text-3xl group-hover:scale-110 transition-transform">📊</div>
              <div>
                <h3 class="font-semibold text-gray-900 group-hover:text-purple-800">Ver Relatórios</h3>
                <p class="text-sm text-gray-600">Visualizar relatórios e análises</p>
              </div>
            </a>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <!-- Recent Benefícios -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold text-gray-900 flex items-center">
                <span class="mr-2">🎁</span>
                Benefícios Recentes
              </h2>
              <a routerLink="/beneficios" 
                 class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors">
                Ver todos
                <span class="ml-1">→</span>
              </a>
            </div>
            <div class="space-y-4">
              <div *ngFor="let beneficio of recentBeneficios(); trackBy: trackById" 
                   class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-blue-600 font-semibold text-sm">{{ beneficio.nome.charAt(0) }}</span>
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-900">{{ beneficio.nome }}</h3>
                    <p class="text-sm text-gray-600">{{ beneficio.valor | currency }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xs text-gray-500">
                    {{ beneficio.updatedAt | dateFormat:'relative' }}
                  </div>
                  <div class="text-xs text-green-600 mt-1">
                    {{ beneficio.ativo ? 'Ativo' : 'Inativo' }}
                  </div>
                </div>
              </div>
              <div *ngIf="recentBeneficios().length === 0" 
                   class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-2">📝</div>
                <p>Nenhum benefício encontrado</p>
              </div>
            </div>
          </div>

          <!-- Recent Transferências -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold text-gray-900 flex items-center">
                <span class="mr-2">💳</span>
                Transferências Recentes
              </h2>
              <a routerLink="/transferencias" 
                 class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors">
                Ver todas
                <span class="ml-1">→</span>
              </a>
            </div>
            <div class="space-y-4">
              <div *ngFor="let transferencia of recentTransferencias(); trackBy: trackById" 
                   class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span class="text-purple-600 font-semibold text-sm">{{ transferencia.destinatario.charAt(0) }}</span>
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-900">{{ transferencia.destinatario }}</h3>
                    <p class="text-sm text-gray-600">{{ transferencia.valor | currency }}</p>
                  </div>
                </div>
                <div class="flex flex-col items-end space-y-1">
                  <span class="px-3 py-1 text-xs font-medium rounded-full" 
                        [class]="getStatusClasses(transferencia.status)">
                    {{ getStatusLabel(transferencia.status) }}
                  </span>
                  <div class="text-xs text-gray-500">
                    {{ transferencia.updatedAt | dateFormat:'relative' }}
                  </div>
                </div>
              </div>
              <div *ngIf="recentTransferencias().length === 0" 
                   class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-2">📋</div>
                <p>Nenhuma transferência encontrada</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardModernComponent implements OnInit {
  private readonly beneficioService = inject(BeneficioService);
  private readonly transferenciaService = inject(TransferenciaService);
  readonly loadingService = inject(LoadingService);

  private readonly _errorMessage = signal<string | null>(null);
  private readonly _now = signal(new Date());

  readonly errorMessage = this._errorMessage.asReadonly();
  readonly now = this._now.asReadonly();

  readonly hasError = computed(() => 
    this.beneficioService.hasError() || 
    this.transferenciaService.hasError() || 
    this._errorMessage() !== null
  );

  readonly metrics = computed((): DashboardMetrics => ({
    totalBeneficios: this.beneficioService.totalBeneficios(),
    beneficiosAtivos: this.beneficioService.beneficiosAtivos().length,
    totalTransferencias: this.transferenciaService.totalTransferencias(),
    valorTotalTransferido: this.transferenciaService.valorTotalTransferido(),
    transferenciasPendentes: this.transferenciaService.transferenciasPendentes().length
  }));

  readonly recentBeneficios = computed(() => 
    this.beneficioService.beneficios()
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  );

  readonly recentTransferencias = computed(() => 
    this.transferenciaService.transferencias()
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  );

  constructor() {
    setInterval(() => {
      this._now.set(new Date());
    }, 60000);
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.beneficioService.loadBeneficios()
      .pipe(takeUntilDestroyed())
      .subscribe({
        error: (error) => {
          this._errorMessage.set('Erro ao carregar benefícios: ' + error.message);
        }
      });

    this.transferenciaService.loadTransferencias()
      .pipe(takeUntilDestroyed())
      .subscribe({
        error: (error) => {
          this._errorMessage.set('Erro ao carregar transferências: ' + error.message);
        }
      });
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  getStatusClasses(status: string): string {
    const classes: Record<string, string> = {
      'PENDENTE': 'bg-yellow-100 text-yellow-800',
      'PROCESSANDO': 'bg-blue-100 text-blue-800',
      'CONCLUIDA': 'bg-green-100 text-green-800',
      'CANCELADA': 'bg-gray-100 text-gray-800',
      'FALHOU': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDENTE': 'Pendente',
      'PROCESSANDO': 'Processando',
      'CONCLUIDA': 'Concluída',
      'CANCELADA': 'Cancelada',
      'FALHOU': 'Falhou'
    };
    return labels[status] || status;
  }
}