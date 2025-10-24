import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './beneficio-detail.component.html',
    styleUrl: './beneficio-detail.component.scss',
    imports: [
        CommonModule,
        RouterLink,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        LoadingComponent,
        ErrorMessageComponent
    ]
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