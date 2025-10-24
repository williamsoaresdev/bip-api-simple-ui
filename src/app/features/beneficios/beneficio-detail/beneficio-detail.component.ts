import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { BeneficioService } from '@core/services';
import { Beneficio } from '@core/models';
import { LoadingComponent, ErrorMessageComponent, ConfirmationDialogComponent } from '@shared/components';

@Component({
  selector: 'bip-beneficio-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    LoadingComponent,
    ErrorMessageComponent
  ],
  template: `
    <div class="detail-container">
      <!-- Loading State -->
      <bip-loading 
        *ngIf="(beneficioService.loading$ | async)?.loading"
        message="Carregando benefício..."
        [showCard]="true">
      </bip-loading>

      <!-- Error State -->
      <bip-error-message
        *ngIf="(beneficioService.loading$ | async)?.error"
        [message]="(beneficioService.loading$ | async)?.error || ''"
        title="Erro ao carregar benefício"
        type="error"
        [showRetry]="true"
        (retry)="loadBeneficio()">
      </bip-error-message>

      <!-- Success State -->
      <div *ngIf="beneficio && !(beneficioService.loading$ | async)?.loading && !(beneficioService.loading$ | async)?.error">
        
        <!-- Header Actions -->
        <div class="header-actions">
          <button mat-stroked-button routerLink="/beneficios">
            <mat-icon>arrow_back</mat-icon>
            Voltar
          </button>

          <div class="action-buttons">
            <button 
              mat-raised-button 
              color="primary" 
              [routerLink]="['/beneficios', beneficio.id, 'editar']">
              <mat-icon>edit</mat-icon>
              Editar
            </button>

            <button 
              mat-stroked-button 
              color="warn" 
              (click)="confirmarExclusao()">
              <mat-icon>delete</mat-icon>
              Excluir
            </button>
          </div>
        </div>

        <!-- Main Info Card -->
        <mat-card class="bip-card info-card">
          <div class="bip-card-header">
            <div class="title-section">
              <h1>{{ beneficio.nome }}</h1>
            </div>
          </div>

          <div class="bip-card-content">
            <div class="info-grid">
              
              <!-- ID -->
              <div class="info-item">
                <div class="info-label">
                  <mat-icon>tag</mat-icon>
                  ID
                </div>
                <div class="info-value">#{{ beneficio.id }}</div>
              </div>

              <!-- Valor -->
              <div class="info-item valor-item">
                <div class="info-label">
                  <mat-icon>payments</mat-icon>
                  Saldo Atual
                </div>
                <div class="info-value valor-destaque">
                  {{ beneficio.saldo | currency:'BRL':'symbol':'1.2-2' }}
                </div>
              </div>

              <!-- Data Criação -->
              <div class="info-item">
                <div class="info-label">
                  <mat-icon>today</mat-icon>
                  Data de Criação
                </div>
                <div class="info-value">
                  {{ beneficio.criadoEm | date:'dd/MM/yyyy HH:mm' }}
                  <small class="data-relativa">({{ getRelativeDate(beneficio.criadoEm) }})</small>
                </div>
              </div>

              <!-- Data Atualização -->
              <div class="info-item" *ngIf="beneficio.atualizadoEm && beneficio.atualizadoEm !== beneficio.criadoEm">
                <div class="info-label">
                  <mat-icon>update</mat-icon>
                  Última Atualização
                </div>
                <div class="info-value">
                  {{ beneficio.atualizadoEm | date:'dd/MM/yyyy HH:mm' }}
                  <small class="data-relativa">({{ getRelativeDate(beneficio.atualizadoEm) }})</small>
                </div>
              </div>

              <!-- Não existe versão na API real -->
            </div>

            <!-- Descrição -->
            <div class="description-section" *ngIf="beneficio.descricao">
              <h3>
                <mat-icon>description</mat-icon>
                Descrição
              </h3>
              <div class="description-content">
                {{ beneficio.descricao }}
              </div>
            </div>
          </div>
        </mat-card>

        <!-- Statistics Card -->
        <mat-card class="bip-card stats-card">
          <div class="bip-card-header">
            <h2>
              <mat-icon>analytics</mat-icon>
              Estatísticas de Uso
            </h2>
          </div>
          <div class="bip-card-content">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">0</div>
                <div class="stat-label">Transferências Realizadas</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ beneficio.saldo | currency:'BRL':'symbol':'1.2-2' }}</div>
                <div class="stat-label">Saldo Disponível</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ getDaysActive() }}</div>
                <div class="stat-label">Dias Ativo</div>
              </div>
            </div>
          </div>
        </mat-card>

        <!-- Quick Actions Card -->
        <mat-card class="bip-card actions-card">
          <div class="bip-card-header">
            <h2>
              <mat-icon>speed</mat-icon>
              Ações Rápidas
            </h2>
          </div>
          <div class="bip-card-content">
            <div class="quick-actions">
              <button 
                mat-raised-button 
                color="primary" 
                [routerLink]="['/transferencias/nova']"
                [queryParams]="{beneficioId: beneficio.id}">
                <mat-icon>send</mat-icon>
                Nova Transferência
              </button>

              <button 
                mat-stroked-button 
                [routerLink]="['/beneficios', beneficio.id, 'editar']">
                <mat-icon>edit</mat-icon>
                Editar Benefício
              </button>
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .detail-container {
      padding: 16px;
      max-width: 1000px;
      margin: 0 auto;
      display: grid;
      gap: 24px;
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
    }

    .title-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }

    .title-section h1 {
      margin: 0;
      flex: 1;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .info-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: #666;
      font-size: 14px;
    }

    .info-value {
      font-size: 16px;
      color: #333;
    }

    .valor-item .info-value {
      font-size: 24px;
      font-weight: 600;
      color: #2e7d32;
    }

    .valor-destaque {
      background: linear-gradient(135deg, #4caf50, #45a049);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .description-section {
      border-top: 1px solid #e0e0e0;
      padding-top: 24px;
    }

    .description-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      color: #333;
    }

    .description-content {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      line-height: 1.6;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }

    .stat-item {
      text-align: center;
      padding: 16px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 8px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #2e7d32;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
    }

    .quick-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .data-relativa {
      display: block;
      font-size: 12px;
      color: #888;
      font-weight: normal;
      margin-top: 4px;
    }

    @media (max-width: 768px) {
      .header-actions {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .action-buttons {
        justify-content: center;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions {
        flex-direction: column;
      }

      .quick-actions button {
        width: 100%;
      }
    }
  `]
})
export class BeneficioDetailComponent implements OnInit, OnDestroy {
  beneficio?: Beneficio;
  beneficioId?: number;
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public beneficioService: BeneficioService
  ) {}

  ngOnInit(): void {
    this.beneficioId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (!this.beneficioId || isNaN(this.beneficioId)) {
      this.snackBar.open('ID do benefício inválido', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/beneficios']);
      return;
    }

    this.loadBeneficio();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBeneficio(): void {
    if (!this.beneficioId) return;

    this.beneficioService.buscarPorId(this.beneficioId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (beneficio: Beneficio) => {
          this.beneficio = beneficio;
        },
        error: (error) => {
          this.snackBar.open(error || 'Erro ao carregar benefício', 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  confirmarExclusao(): void {
    if (!this.beneficio) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Exclusão',
        message: `Tem certeza que deseja excluir o benefício "${this.beneficio.nome}"?`,
        details: 'Esta ação não pode ser desfeita.',
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.excluirBeneficio();
      }
    });
  }

  private excluirBeneficio(): void {
    if (!this.beneficio) return;

    this.beneficioService.remover(this.beneficio.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Benefício excluído com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/beneficios']);
        },
        error: (error: string) => {
          this.snackBar.open(error || 'Erro ao excluir benefício', 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  getDaysActive(): number {
    if (!this.beneficio?.criadoEm) return 0;
    
    const created = new Date(this.beneficio.criadoEm);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'ontem';
    } else if (diffDays < 7) {
      return `há ${diffDays} dias`;
    } else if (diffDays < 30) {
      const weeks = Math.ceil(diffDays / 7);
      return `há ${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.ceil(diffDays / 30);
      return `há ${months} mês${months > 1 ? 'es' : ''}`;
    } else {
      const years = Math.ceil(diffDays / 365);
      return `há ${years} ano${years > 1 ? 's' : ''}`;
    }
  }
}