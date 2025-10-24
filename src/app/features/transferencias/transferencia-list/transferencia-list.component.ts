import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TransferenciaService } from '@core/services';
import { TransferenciaResponse } from '@core/models';

@Component({
  selector: 'bip-transferencia-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="bip-page-container">
      <!-- Page Header -->
      <div class="bip-page-header">
        <h1 class="bip-page-title">
          <mat-icon class="bip-page-icon">swap_horiz</mat-icon>
          Transferências
        </h1>
        <p class="bip-page-subtitle">Histórico de transferências realizadas entre benefícios</p>
        
        <div class="bip-page-actions">
          <button 
            mat-raised-button 
            color="primary"
            (click)="novaTransferencia()"
            class="bip-btn-primary">
            <mat-icon>add</mat-icon>
            Nova Transferência
          </button>

          <button 
            mat-icon-button 
            (click)="carregarHistorico()"
            [disabled]="(transferenciaService.loading$ | async)?.loading"
            class="bip-btn-icon"
            matTooltip="Atualizar lista">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="bip-stats-grid" *ngIf="historicoTransferencias.length > 0">
        <div class="bip-stat-card info">
          <div class="bip-stat-icon">
            <mat-icon>analytics</mat-icon>
          </div>
          <div class="bip-stat-content">
            <h3>{{ historicoTransferencias.length }}</h3>
            <p>Total de Transferências</p>
          </div>
        </div>
        
        <div class="bip-stat-card success">
          <div class="bip-stat-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="bip-stat-content">
            <h3>{{ transferenciasComSucesso }}</h3>
            <p>Bem-sucedidas</p>
          </div>
        </div>
        
        <div class="bip-stat-card error">
          <div class="bip-stat-icon">
            <mat-icon>error</mat-icon>
          </div>
          <div class="bip-stat-content">
            <h3>{{ transferenciasComFalha }}</h3>
            <p>Com Falha</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="(transferenciaService.loading$ | async)?.loading" class="bip-loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Carregando transferências...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="(transferenciaService.loading$ | async)?.error" class="bip-message-container error">
        <mat-icon>error_outline</mat-icon>
        <div>
          <h3>Erro ao carregar transferências</h3>
          <p>{{ (transferenciaService.loading$ | async)?.error }}</p>
          <button mat-stroked-button color="primary" (click)="carregarHistorico()">
            <mat-icon>refresh</mat-icon>
            Tentar novamente
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!historicoTransferencias.length && !(transferenciaService.loading$ | async)?.loading && !(transferenciaService.loading$ | async)?.error" 
           class="bip-empty-state">
        <mat-icon>swap_horiz</mat-icon>
        <h2>Nenhuma transferência encontrada</h2>
        <p>Ainda não há transferências realizadas entre benefícios.</p>
        <button mat-raised-button color="primary" (click)="novaTransferencia()">
          <mat-icon>add</mat-icon>
          Realizar Primeira Transferência
        </button>
      </div>

      <!-- Transferências Grid -->
      <div class="bip-content-grid" *ngIf="historicoTransferencias.length > 0">
        <div class="bip-grid-header">
          <h2>Histórico de Transferências</h2>
        </div>

        <!-- Transferências Cards for Mobile -->
        <div class="bip-cards-grid hide-lg">
          <div *ngFor="let transferencia of historicoTransferencias; trackBy: trackByTransferencia" 
               class="bip-transferencia-card">
            <mat-card class="bip-card-elevated" 
                      [class.bip-card-success]="transferencia.sucesso"
                      [class.bip-card-error]="!transferencia.sucesso">
              
              <!-- Card Header -->
              <mat-card-header>
                <div mat-card-avatar class="bip-transferencia-avatar" 
                     [class.success]="transferencia.sucesso"
                     [class.error]="!transferencia.sucesso">
                  <mat-icon>{{ transferencia.sucesso ? 'check_circle' : 'error' }}</mat-icon>
                </div>
                <mat-card-title>Transferência {{ transferencia.sucesso ? 'Realizada' : 'Falhada' }}</mat-card-title>
                <mat-card-subtitle>{{ transferencia.timestamp | date:'dd/MM/yyyy HH:mm' }}</mat-card-subtitle>
              </mat-card-header>

              <!-- Card Content -->
              <mat-card-content>
                <div class="bip-transferencia-details">
                  <div class="bip-detail-item">
                    <mat-icon class="bip-detail-icon">account_balance_wallet</mat-icon>
                    <div class="bip-detail-text">
                      <label>Origem</label>
                      <p>Benefício ID: {{ transferencia.origem }}</p>
                    </div>
                  </div>

                  <div class="bip-detail-item">
                    <mat-icon class="bip-detail-icon">card_giftcard</mat-icon>
                    <div class="bip-detail-text">
                      <label>Destino</label>
                      <p>Benefício ID: {{ transferencia.destino }}</p>
                    </div>
                  </div>

                  <div class="bip-detail-item">
                    <mat-icon class="bip-detail-icon">payments</mat-icon>
                    <div class="bip-detail-text">
                      <label>Valor</label>
                      <p class="bip-valor-destaque">{{ transferencia.valor | currency:'BRL':'symbol':'1.2-2' }}</p>
                    </div>
                  </div>

                  <div class="bip-detail-item" *ngIf="transferencia.descricao">
                    <mat-icon class="bip-detail-icon">description</mat-icon>
                    <div class="bip-detail-text">
                      <label>Descrição</label>
                      <p>{{ transferencia.descricao }}</p>
                    </div>
                  </div>

                  <div class="bip-detail-item" *ngIf="transferencia.mensagem">
                    <mat-icon class="bip-detail-icon">{{ transferencia.sucesso ? 'info' : 'warning' }}</mat-icon>
                    <div class="bip-detail-text">
                      <label>{{ transferencia.sucesso ? 'Confirmação' : 'Erro' }}</label>
                      <p [class]="transferencia.sucesso ? 'bip-text-success' : 'bip-text-error'">{{ transferencia.mensagem }}</p>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <!-- Table for Desktop -->
        <div class="bip-table-container hide-md">
          <table mat-table [dataSource]="historicoTransferencias" class="bip-table-modern">
            
            <!-- Timestamp Column -->
            <ng-container matColumnDef="timestamp">
              <th mat-header-cell *matHeaderCellDef>Data/Hora</th>
              <td mat-cell *matCellDef="let transferencia">
                <div class="bip-table-cell">
                  <mat-icon class="bip-table-icon">schedule</mat-icon>
                  <span>{{ transferencia.timestamp | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Origem Column -->
            <ng-container matColumnDef="origem">
              <th mat-header-cell *matHeaderCellDef>Origem</th>
              <td mat-cell *matCellDef="let transferencia">
                <div class="bip-table-cell">
                  <mat-icon class="bip-table-icon primary">account_balance_wallet</mat-icon>
                  <span>ID: {{ transferencia.origem }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Destino Column -->
            <ng-container matColumnDef="destino">
              <th mat-header-cell *matHeaderCellDef>Destino</th>
              <td mat-cell *matCellDef="let transferencia">
                <div class="bip-table-cell">
                  <mat-icon class="bip-table-icon accent">card_giftcard</mat-icon>
                  <span>ID: {{ transferencia.destino }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Valor Column -->
            <ng-container matColumnDef="valor">
              <th mat-header-cell *matHeaderCellDef>Valor</th>
              <td mat-cell *matCellDef="let transferencia">
                <div class="bip-table-cell">
                  <mat-icon class="bip-table-icon success">payments</mat-icon>
                  <span class="bip-valor-table">{{ transferencia.valor | currency:'BRL':'symbol':'1.2-2' }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let transferencia">
                <mat-chip 
                  [class]="transferencia.sucesso ? 'bip-chip-success' : 'bip-chip-error'"
                  [matTooltip]="transferencia.mensagem">
                  <mat-icon matChipAvatar>{{ transferencia.sucesso ? 'check_circle' : 'error' }}</mat-icon>
                  {{ transferencia.sucesso ? 'Sucesso' : 'Falha' }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Descrição Column -->
            <ng-container matColumnDef="descricao">
              <th mat-header-cell *matHeaderCellDef>Descrição</th>
              <td mat-cell *matCellDef="let transferencia">
                <div class="bip-table-cell" *ngIf="transferencia.descricao; else semDescricao">
                  <mat-icon class="bip-table-icon">description</mat-icon>
                  <span [matTooltip]="transferencia.descricao">
                    {{ transferencia.descricao.length > 30 ? (transferencia.descricao | slice:0:30) + '...' : transferencia.descricao }}
                  </span>
                </div>
                <ng-template #semDescricao>
                  <span class="bip-text-muted">-</span>
                </ng-template>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                [class.bip-row-success]="row.sucesso"
                [class.bip-row-error]="!row.sucesso"></tr>
          </table>
        </div>
      </div>

      <!-- Floating Action Button (Mobile) -->
      <button mat-fab 
              class="bip-fab bip-fab-primary hide-md"
              (click)="novaTransferencia()"
              matTooltip="Nova Transferência">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .bip-page-container {
      padding: var(--bip-spacing-lg);
      max-width: 1200px;
      margin: 0 auto;
    }

    .bip-page-header {
      margin-bottom: var(--bip-spacing-xl);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: var(--bip-spacing-md);
    }

    .bip-page-title {
      display: flex;
      align-items: center;
      gap: var(--bip-spacing-sm);
      margin: 0;
      font-size: 2rem;
      font-weight: var(--bip-font-weight-bold);
      color: var(--bip-grey-800);
    }

    .bip-page-icon {
      font-size: 2rem !important;
      width: 2rem !important;
      height: 2rem !important;
      color: var(--bip-primary-500);
    }

    .bip-page-subtitle {
      margin: var(--bip-spacing-xs) 0 0 0;
      color: var(--bip-grey-600);
      font-size: 1rem;
    }

    .bip-page-actions {
      display: flex;
      gap: var(--bip-spacing-sm);
      align-items: center;
    }

    .bip-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--bip-spacing-md);
      margin-bottom: var(--bip-spacing-xl);
    }

    .bip-stat-card {
      padding: var(--bip-spacing-lg);
      border-radius: var(--bip-border-radius-lg);
      background: white;
      border: 1px solid var(--bip-grey-200);
      box-shadow: var(--bip-shadow-sm);
      display: flex;
      align-items: center;
      gap: var(--bip-spacing-md);
      transition: var(--bip-transition-normal);

      &:hover {
        box-shadow: var(--bip-shadow-md);
        transform: translateY(-2px);
      }

      &.success .bip-stat-icon {
        background: var(--bip-success-100);
        color: var(--bip-success-600);
      }

      &.info .bip-stat-icon {
        background: var(--bip-primary-100);
        color: var(--bip-primary-600);
      }

      &.error .bip-stat-icon {
        background: var(--bip-error-100);
        color: var(--bip-error-600);
      }
    }

    .bip-stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--bip-border-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon {
        font-size: 24px !important;
        width: 24px !important;
        height: 24px !important;
      }
    }

    .bip-stat-content {
      h3 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: var(--bip-font-weight-bold);
        color: var(--bip-grey-800);
      }

      p {
        margin: var(--bip-spacing-xs) 0 0 0;
        color: var(--bip-grey-600);
        font-size: 0.875rem;
      }
    }

    .bip-content-grid {
      margin-bottom: var(--bip-spacing-xl);
    }

    .bip-grid-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--bip-spacing-lg);

      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: var(--bip-font-weight-semibold);
        color: var(--bip-grey-800);
      }
    }

    .bip-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: var(--bip-spacing-lg);
    }

    .bip-transferencia-card {
      .bip-card-elevated {
        height: 100%;
        transition: var(--bip-transition-normal);
        border-left: 4px solid transparent;

        &:hover {
          box-shadow: var(--bip-shadow-lg);
          transform: translateY(-4px);
        }

        &.bip-card-success {
          border-left-color: var(--bip-success-500);
        }

        &.bip-card-error {
          border-left-color: var(--bip-error-500);
        }
      }

      .mat-mdc-card-header {
        padding-bottom: var(--bip-spacing-sm);
      }

      .bip-transferencia-avatar {
        width: 40px;
        height: 40px;
        border-radius: var(--bip-border-radius-md);
        display: flex;
        align-items: center;
        justify-content: center;

        &.success {
          background: var(--bip-success-100);
          color: var(--bip-success-600);
        }

        &.error {
          background: var(--bip-error-100);
          color: var(--bip-error-600);
        }

        mat-icon {
          font-size: 20px !important;
          width: 20px !important;
          height: 20px !important;
        }
      }

      .mat-mdc-card-title {
        font-weight: var(--bip-font-weight-semibold);
        color: var(--bip-grey-800);
      }

      .mat-mdc-card-subtitle {
        color: var(--bip-grey-600);
      }
    }

    .bip-transferencia-details {
      display: flex;
      flex-direction: column;
      gap: var(--bip-spacing-md);
    }

    .bip-detail-item {
      display: flex;
      align-items: flex-start;
      gap: var(--bip-spacing-sm);

      .bip-detail-icon {
        color: var(--bip-grey-500);
        margin-top: 2px;
      }

      .bip-detail-text {
        flex: 1;

        label {
          font-size: 0.75rem;
          color: var(--bip-grey-600);
          text-transform: uppercase;
          font-weight: var(--bip-font-weight-medium);
          letter-spacing: 0.5px;
          margin-bottom: var(--bip-spacing-xs);
          display: block;
        }

        p {
          margin: 0;
          color: var(--bip-grey-800);
          line-height: 1.4;

          &.bip-valor-destaque {
            font-size: 1.25rem;
            font-weight: var(--bip-font-weight-bold);
            color: var(--bip-success-600);
          }

          &.bip-text-success {
            color: var(--bip-success-600);
            font-weight: var(--bip-font-weight-medium);
          }

          &.bip-text-error {
            color: var(--bip-error-600);
            font-weight: var(--bip-font-weight-medium);
          }
        }
      }
    }

    .bip-table-container {
      background: white;
      border-radius: var(--bip-border-radius-lg);
      overflow: hidden;
      box-shadow: var(--bip-shadow-md);
      border: 1px solid var(--bip-grey-200);
    }

    .bip-table-modern {
      width: 100%;

      .mat-mdc-header-row {
        background: var(--bip-gradient-background);
      }

      .mat-mdc-header-cell {
        font-weight: var(--bip-font-weight-semibold);
        color: var(--bip-grey-700);
        border-bottom: 2px solid var(--bip-grey-300);
        padding: var(--bip-spacing-md);
      }

      .mat-mdc-row {
        transition: var(--bip-transition-fast);
        border-left: 4px solid transparent;

        &:hover {
          background: var(--bip-grey-50);
        }

        &.bip-row-success {
          border-left-color: var(--bip-success-500);
        }

        &.bip-row-error {
          border-left-color: var(--bip-error-500);
        }
      }

      .mat-mdc-cell {
        border-bottom: 1px solid var(--bip-grey-200);
        padding: var(--bip-spacing-md);
      }
    }

    .bip-table-cell {
      display: flex;
      align-items: center;
      gap: var(--bip-spacing-xs);

      .bip-table-icon {
        font-size: 18px !important;
        width: 18px !important;
        height: 18px !important;
        color: var(--bip-grey-500);

        &.primary { color: var(--bip-primary-500); }
        &.accent { color: var(--bip-accent-500); }
        &.success { color: var(--bip-success-500); }
      }
    }

    .bip-valor-table {
      font-weight: var(--bip-font-weight-semibold);
      color: var(--bip-success-600);
    }

    .bip-chip-success {
      background: var(--bip-success-100) !important;
      color: var(--bip-success-700) !important;
      border: 1px solid var(--bip-success-300);
    }

    .bip-chip-error {
      background: var(--bip-error-100) !important;
      color: var(--bip-error-700) !important;
      border: 1px solid var(--bip-error-300);
    }

    .bip-loading-container,
    .bip-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--bip-spacing-xxl);
      text-align: center;

      mat-icon {
        font-size: 4rem !important;
        width: 4rem !important;
        height: 4rem !important;
        color: var(--bip-grey-400);
        margin-bottom: var(--bip-spacing-lg);
      }

      h2 {
        margin: 0 0 var(--bip-spacing-sm) 0;
        color: var(--bip-grey-700);
        font-weight: var(--bip-font-weight-medium);
      }

      p {
        margin: 0 0 var(--bip-spacing-lg) 0;
        color: var(--bip-grey-600);
        max-width: 400px;
      }
    }

    .bip-message-container {
      display: flex;
      align-items: center;
      gap: var(--bip-spacing-md);
      padding: var(--bip-spacing-lg);
      border-radius: var(--bip-border-radius-md);
      margin: var(--bip-spacing-lg) 0;

      &.error {
        background: var(--bip-error-50);
        border: 1px solid var(--bip-error-200);
        color: var(--bip-error-800);

        mat-icon {
          color: var(--bip-error-600);
        }
      }

      h3 {
        margin: 0 0 var(--bip-spacing-xs) 0;
        font-size: 1rem;
        font-weight: var(--bip-font-weight-medium);
      }

      p {
        margin: 0 0 var(--bip-spacing-sm) 0;
        font-size: 0.875rem;
      }
    }

    .bip-text-muted {
      color: var(--bip-grey-500) !important;
      font-style: italic;
    }

    .bip-fab {
      position: fixed;
      bottom: var(--bip-spacing-xl);
      right: var(--bip-spacing-xl);
      z-index: 100;
    }

    @media (max-width: 768px) {
      .bip-page-container {
        padding: var(--bip-spacing-md);
      }

      .bip-page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .bip-page-actions {
        justify-content: center;
      }

      .bip-cards-grid {
        grid-template-columns: 1fr;
      }

      .bip-stats-grid {
        grid-template-columns: 1fr;
      }

      .bip-fab {
        bottom: var(--bip-spacing-lg);
        right: var(--bip-spacing-lg);
      }
    }

    @media (max-width: 480px) {
      .bip-page-container {
        padding: var(--bip-spacing-sm);
      }

      .bip-cards-grid {
        grid-template-columns: 1fr;
        gap: var(--bip-spacing-md);
      }
    }
  `]
})
export class TransferenciaListComponent implements OnInit, OnDestroy {
  historicoTransferencias: TransferenciaResponse[] = [];
  displayedColumns: string[] = ['timestamp', 'origem', 'destino', 'valor', 'status', 'descricao'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    public transferenciaService: TransferenciaService
  ) {}

  ngOnInit(): void {
    this.carregarHistorico();
    this.observarHistorico();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private observarHistorico(): void {
    this.transferenciaService.obterHistorico()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (transferencias) => {
          this.historicoTransferencias = transferencias.slice().reverse(); // Mais recentes primeiro
        }
      });
  }

  carregarHistorico(): void {
    // Como a API não tem endpoint de listagem, mostramos apenas o histórico local
    const historicoLocal = this.transferenciaService.obterHistorico();
    historicoLocal.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (transferencias) => {
          this.historicoTransferencias = transferencias.slice().reverse();
          
          if (transferencias.length === 0) {
            this.snackBar.open('Nenhuma transferência no histórico local', 'Fechar', {
              duration: 3000,
              panelClass: ['info-snackbar']
            });
          }
        }
      });
  }

  novaTransferencia(): void {
    this.router.navigate(['/transferencias/novo']);
  }

  get transferenciasComSucesso(): number {
    return this.historicoTransferencias.filter(t => t.sucesso).length;
  }

  get transferenciasComFalha(): number {
    return this.historicoTransferencias.filter(t => !t.sucesso).length;
  }

  trackByTransferencia(index: number, transferencia: TransferenciaResponse): string {
    return transferencia.timestamp + '-' + transferencia.origem + '-' + transferencia.destino;
  }
}