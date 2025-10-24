import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { BeneficioService } from '@core/services';
import { Beneficio } from '@core/models';
import { LoadingComponent, ErrorMessageComponent, ConfirmationDialogComponent } from '@shared/components';

@Component({
  selector: 'bip-beneficios-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    LoadingComponent,
    ErrorMessageComponent
  ],
  template: `
    <div class="bip-page-container">
      <!-- Page Header -->
      <div class="bip-page-header">
        <h1 class="bip-page-title">
          <mat-icon class="bip-page-icon">card_giftcard</mat-icon>
          Benefícios
        </h1>
        <p class="bip-page-subtitle">Gerencie os benefícios disponíveis no sistema</p>
        
        <div class="bip-page-actions">
          <button 
            mat-raised-button 
            color="primary" 
            routerLink="/beneficios/novo"
            class="bip-btn-primary">
            <mat-icon>add</mat-icon>
            Novo Benefício
          </button>
          
          <button 
            mat-icon-button 
            (click)="carregarBeneficios()"
            [disabled]="(beneficioService.loading$ | async)?.loading"
            class="bip-btn-icon"
            matTooltip="Atualizar lista">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="bip-stats-grid" *ngIf="beneficios.length > 0">
        <div class="bip-stat-card success">
          <div class="bip-stat-icon">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <div class="bip-stat-content">
            <h3>{{ beneficios.length }}</h3>
            <p>Total de Benefícios</p>
          </div>
        </div>
        
        <div class="bip-stat-card info">
          <div class="bip-stat-icon">
            <mat-icon>payments</mat-icon>
          </div>
          <div class="bip-stat-content">
            <h3>{{ getTotalBeneficios() | currency:'BRL':'symbol':'1.0-0' }}</h3>
            <p>Valor Total</p>
          </div>
        </div>
        
        <div class="bip-stat-card warning">
          <div class="bip-stat-icon">
            <mat-icon>trending_up</mat-icon>
          </div>
          <div class="bip-stat-content">
            <h3>{{ getValorMedio() | currency:'BRL':'symbol':'1.0-0' }}</h3>
            <p>Valor Médio</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="(beneficioService.loading$ | async)?.loading && beneficios.length === 0" 
           class="bip-loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Carregando benefícios...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="(beneficioService.loading$ | async)?.error" 
           class="bip-message-container error">
        <mat-icon>error_outline</mat-icon>
        <div>
          <h3>Erro ao carregar benefícios</h3>
          <p>{{ (beneficioService.loading$ | async)?.error }}</p>
          <button mat-stroked-button color="primary" (click)="carregarBeneficios()">
            <mat-icon>refresh</mat-icon>
            Tentar novamente
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="beneficios.length === 0 && !(beneficioService.loading$ | async)?.loading && !(beneficioService.loading$ | async)?.error" 
           class="bip-empty-state">
        <mat-icon>card_giftcard</mat-icon>
        <h2>Nenhum benefício cadastrado</h2>
        <p>Comece criando seu primeiro benefício para gerenciar valores e transferências no sistema.</p>
        <button mat-raised-button color="primary" routerLink="/beneficios/novo">
          <mat-icon>add</mat-icon>
          Criar Primeiro Benefício
        </button>
      </div>

      <!-- Benefícios Grid -->
      <div class="bip-content-grid" *ngIf="beneficios.length > 0">
        <div class="bip-grid-header">
          <h2>Benefícios Disponíveis</h2>
        </div>

        <div class="bip-cards-grid">
          <div *ngFor="let beneficio of beneficios; trackBy: trackByBeneficio" 
               class="bip-beneficio-card">
            <mat-card class="bip-card-elevated">
              <!-- Card Header -->
              <mat-card-header>
                <div mat-card-avatar class="bip-beneficio-avatar">
                  <mat-icon>card_giftcard</mat-icon>
                </div>
                <mat-card-title>{{ beneficio.nome }}</mat-card-title>
                <mat-card-subtitle>ID: {{ beneficio.id }}</mat-card-subtitle>
                
                <!-- Card Actions Menu -->
                <div class="bip-card-menu">
                  <button mat-icon-button [matMenuTriggerFor]="cardMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #cardMenu="matMenu">
                    <button mat-menu-item [routerLink]="['/beneficios/detalhes', beneficio.id]">
                      <mat-icon>visibility</mat-icon>
                      <span>Ver Detalhes</span>
                    </button>
                    <button mat-menu-item [routerLink]="['/beneficios/editar', beneficio.id]">
                      <mat-icon>edit</mat-icon>
                      <span>Editar</span>
                    </button>
                    <button mat-menu-item [routerLink]="['/transferencias/novo']" [queryParams]="{beneficioOrigemId: beneficio.id}">
                      <mat-icon>swap_horiz</mat-icon>
                      <span>Transferir</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="confirmarRemocao(beneficio)" class="bip-menu-item-danger">
                      <mat-icon>delete</mat-icon>
                      <span>Remover</span>
                    </button>
                  </mat-menu>
                </div>
              </mat-card-header>

              <!-- Card Content -->
              <mat-card-content>
                <div class="bip-beneficio-details">
                  <div class="bip-detail-item">
                    <mat-icon class="bip-detail-icon">account_balance_wallet</mat-icon>
                    <div class="bip-detail-text">
                      <label>Saldo Disponível</label>
                      <p class="bip-valor-destaque">{{ beneficio.saldo | currency:'BRL':'symbol':'1.2-2' }}</p>
                    </div>
                  </div>

                  <div class="bip-detail-item" *ngIf="beneficio.descricao">
                    <mat-icon class="bip-detail-icon">description</mat-icon>
                    <div class="bip-detail-text">
                      <label>Descrição</label>
                      <p>{{ beneficio.descricao }}</p>
                    </div>
                  </div>
                </div>
              </mat-card-content>

              <!-- Card Actions -->
              <mat-card-actions class="bip-card-actions">
                <button mat-button color="primary" [routerLink]="['/beneficios/detalhes', beneficio.id]">
                  <mat-icon>visibility</mat-icon>
                  Detalhes
                </button>
                <button mat-raised-button color="primary" [routerLink]="['/beneficios/editar', beneficio.id]">
                  <mat-icon>edit</mat-icon>
                  Editar
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>
      </div>

      <!-- Floating Action Button (Mobile) -->
      <button mat-fab 
              class="bip-fab bip-fab-primary hide-md"
              routerLink="/beneficios/novo"
              matTooltip="Novo Benefício">
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

      &.warning .bip-stat-icon {
        background: var(--bip-warning-100);
        color: var(--bip-warning-600);
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

    .bip-beneficio-card {
      .bip-card-elevated {
        height: 100%;
        transition: var(--bip-transition-normal);

        &:hover {
          box-shadow: var(--bip-shadow-lg);
          transform: translateY(-4px);
        }
      }

      .mat-mdc-card-header {
        padding-bottom: var(--bip-spacing-sm);
      }

      .bip-beneficio-avatar {
        background: var(--bip-primary-100);
        color: var(--bip-primary-600);
        width: 40px;
        height: 40px;
        border-radius: var(--bip-border-radius-md);
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          font-size: 20px !important;
          width: 20px !important;
          height: 20px !important;
        }
      }

      .bip-card-menu {
        margin-left: auto;
      }

      .mat-mdc-card-title {
        font-weight: var(--bip-font-weight-semibold);
        color: var(--bip-grey-800);
      }

      .mat-mdc-card-subtitle {
        color: var(--bip-grey-600);
      }
    }

    .bip-beneficio-details {
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
        }
      }
    }

    .bip-card-actions {
      border-top: 1px solid var(--bip-grey-200);
      padding-top: var(--bip-spacing-md);
      display: flex;
      gap: var(--bip-spacing-sm);
      justify-content: flex-end;
    }

    .bip-menu-item-danger {
      color: var(--bip-error-600) !important;

      mat-icon {
        color: var(--bip-error-600) !important;
      }
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
export class BeneficiosListComponent implements OnInit, OnDestroy {
  beneficios: Beneficio[] = [];
  displayedColumns: string[] = ['id', 'nome', 'valor', 'acoes'];
  
  private destroy$ = new Subject<void>();
  
  retryCallback = () => {
    this.carregarBeneficios();
  };

  constructor(
    public beneficioService: BeneficioService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.carregarBeneficios();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarBeneficios(): void {
    console.log('Carregando lista de benefícios...');
    this.beneficioService.listarTodos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (beneficios) => {
          console.log('Benefícios carregados:', beneficios.length, 'itens');
          this.beneficios = beneficios;
        },
        error: (error) => {
          console.error('Erro ao carregar benefícios:', error);
        }
      });
  }

  getTotalBeneficios(): number {
    return this.beneficios.reduce((total, beneficio) => {
      return total + (beneficio.saldo || 0);
    }, 0);
  }

  getValorMedio(): number {
    if (this.beneficios.length === 0) return 0;
    return this.getTotalBeneficios() / this.beneficios.length;
  }

  trackByBeneficio(index: number, beneficio: Beneficio): number {
    return beneficio.id || index;
  }

  confirmarRemocao(beneficio: Beneficio): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirmar Remoção',
        message: `Tem certeza que deseja remover o benefício "${beneficio.nome}"?`,
        confirmText: 'Remover',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.removerBeneficio(beneficio.id);
      }
    });
  }

  private removerBeneficio(id: number): void {
    console.log('Removendo benefício ID:', id);
    this.beneficioService.remover(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Benefício removido com sucesso, atualizando lista...');
          
          // Remove o item da lista local para atualização imediata
          this.beneficios = this.beneficios.filter(beneficio => beneficio.id !== id);
          
          this.snackBar.open('Benefício removido com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          // Opcional: Recarregar a lista completa do servidor
          // this.carregarBeneficios();
        },
        error: (error) => {
          console.error('Erro ao remover benefício:', error);
          this.snackBar.open(error || 'Erro ao remover benefício', 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }
}