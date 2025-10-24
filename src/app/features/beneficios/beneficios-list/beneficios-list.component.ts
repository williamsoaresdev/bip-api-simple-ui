import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BeneficioService } from '../../../core/services/beneficio.service';
import { Beneficio } from '../../../shared/models/beneficio.model';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-beneficios-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CurrencyPipe,
    DateFormatPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Benefícios</h1>
              <p class="text-gray-600 mt-1">Gerencie os benefícios disponíveis</p>
            </div>
            <button
              type="button"
              (click)="navigateToCreate()"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Novo Benefício
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div 
          *ngIf="beneficioService.isLoading()"
          class="bg-white rounded-lg shadow-sm p-8"
        >
          <div class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="ml-3 text-gray-600">Carregando benefícios...</span>
          </div>
        </div>

        <!-- Error State -->
        <div 
          *ngIf="beneficioService.hasError()"
          class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <div class="flex">
            <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Erro ao carregar benefícios</h3>
              <p class="text-sm text-red-700 mt-1">{{ beneficioService.error() }}</p>
            </div>
          </div>
        </div>

        <!-- Benefícios Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total de Benefícios</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ beneficioService.totalBeneficios() }}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Benefícios Ativos</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ beneficioService.beneficiosAtivos().length }}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Valor Total</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ valorTotalBeneficios() | currency }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Benefícios Table -->
        <div 
          *ngIf="!beneficioService.isLoading() && !beneficioService.hasError()"
          class="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Lista de Benefícios</h2>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Atualização
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr 
                  *ngFor="let beneficio of beneficioService.beneficios(); trackBy: trackByBeneficio"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ beneficio.nome }}</div>
                        <div class="text-sm text-gray-500">{{ beneficio.descricao }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ beneficio.categoria }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ beneficio.valor | currency }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [ngClass]="{
                        'bg-green-100 text-green-800': beneficio.ativo,
                        'bg-red-100 text-red-800': !beneficio.ativo
                      }"
                    >
                      {{ beneficio.ativo ? 'Ativo' : 'Inativo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ beneficio.updatedAt | dateFormat }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center space-x-2">
                      <button
                        type="button"
                        (click)="editBeneficio(beneficio.id)"
                        class="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        (click)="viewBeneficio(beneficio.id)"
                        class="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Ver
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div 
            *ngIf="beneficioService.beneficios().length === 0"
            class="text-center py-12"
          >
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhum benefício encontrado</h3>
            <p class="mt-1 text-sm text-gray-500">Comece criando um novo benefício.</p>
            <div class="mt-6">
              <button
                type="button"
                (click)="navigateToCreate()"
                class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Novo Benefício
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BeneficiosListComponent {
  protected readonly beneficioService = inject(BeneficioService);
  private readonly router = inject(Router);

  readonly valorTotalBeneficios = computed(() => 
    this.beneficioService.beneficios().reduce((total, b) => total + b.valor, 0)
  );

  trackByBeneficio(index: number, beneficio: Beneficio): string {
    return beneficio.id;
  }

  navigateToCreate(): void {
    this.router.navigate(['/beneficios/novo']);
  }

  editBeneficio(id: string): void {
    this.router.navigate(['/beneficios', id, 'editar']);
  }

  viewBeneficio(id: string): void {
    this.router.navigate(['/beneficios', id]);
  }
}