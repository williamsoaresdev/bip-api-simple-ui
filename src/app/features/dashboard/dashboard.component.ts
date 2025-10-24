import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

import { BeneficioService } from '@core/services';
import { BeneficioEstatisticas } from '@core/models';
import { LoadingComponent, ErrorMessageComponent } from '@shared/components';

@Component({
  selector: 'bip-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    LoadingComponent,
    ErrorMessageComponent
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <mat-card class="bip-card">
        <div class="bip-card-header">
          <h1>📊 Dashboard</h1>
          <p>Visão geral do sistema de benefícios</p>
        </div>
      </mat-card>

      <!-- Loading State -->
      <bip-loading 
        *ngIf="(beneficioService.loading$ | async)?.loading && !estatisticas"
        message="Carregando estatísticas..."
        [showCard]="true">
      </bip-loading>

      <!-- Error State -->
      <bip-error-message
        *ngIf="(beneficioService.loading$ | async)?.error"
        [message]="(beneficioService.loading$ | async)?.error || ''"
        title="Erro ao carregar dashboard"
        type="error"
        [showRetry]="true"
        [retryCallback]="retryCallback">
      </bip-error-message>

      <!-- Estatísticas -->
      <div class="stats-grid" *ngIf="estatisticas">
        <!-- Total de Benefícios -->
        <mat-card class="stat-card total">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>card_giftcard</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ estatisticas.totalBeneficios }}</h3>
                <p>Total de Benefícios</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Ações Rápidas -->
      <mat-card class="bip-card" *ngIf="estatisticas">
        <div class="bip-card-content">
          <h2>⚡ Ações Rápidas</h2>
          <div class="quick-actions">
            <button 
              mat-raised-button 
              color="primary" 
              routerLink="/beneficios/novo"
              class="action-button">
              <mat-icon>add</mat-icon>
              Novo Benefício
            </button>
            
            <button 
              mat-raised-button 
              color="accent" 
              routerLink="/transferencias"
              class="action-button">
              <mat-icon>swap_horiz</mat-icon>
              Nova Transferência
            </button>
            
            <button 
              mat-stroked-button 
              routerLink="/beneficios"
              class="action-button">
              <mat-icon>list</mat-icon>
              Ver Benefícios
            </button>
          </div>
        </div>
      </mat-card>

      <!-- Status do Sistema -->
      <mat-card class="bip-card" *ngIf="estatisticas">
        <div class="bip-card-content">
          <h2>🔧 Status do Sistema</h2>
          <div class="system-info">
            <div class="info-item">
              <strong>Última Atualização:</strong>
              <span>{{ estatisticas.ultimaAtualizacao | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="info-item">
              <strong>Sistema:</strong>
              <span class="status-badge online">🟢 Online</span>
            </div>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin: 24px 0;
    }

    .stat-card {
      transition: transform 0.2s ease-in-out;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-card.total {
      border-left: 4px solid #2196f3;
    }

    .stat-card.active {
      border-left: 4px solid #4caf50;
    }

    .stat-card.inactive {
      border-left: 4px solid #ff9800;
    }

    .stat-card.value {
      border-left: 4px solid #9c27b0;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.05);
    }

    .stat-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .stat-info p {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #666;
    }

    .quick-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .action-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .system-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.online {
      background: #e8f5e8;
      color: #2e7d32;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 8px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .quick-actions {
        flex-direction: column;
      }

      .action-button {
        width: 100%;
        justify-content: center;
      }

      .info-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  estatisticas: BeneficioEstatisticas | null = null;
  
  private destroy$ = new Subject<void>();
  
  retryCallback = () => {
    this.carregarEstatisticas();
  };

  constructor(
    public beneficioService: BeneficioService
  ) {}

  ngOnInit(): void {
    this.carregarEstatisticas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarEstatisticas(): void {
    this.beneficioService.obterEstatisticas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (estatisticas) => {
          this.estatisticas = estatisticas;
        },
        error: (error) => {
          console.error('Erro ao carregar estatísticas:', error);
        }
      });
  }
}