import { 
  Component, 
  OnInit, 
  ChangeDetectionStrategy, 
  signal, 
  computed, 
  inject,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { TransferenciaService } from '../../../core/services/transferencia.service';
import { BeneficioService } from '../../../core/services/beneficio.service';
import { Transferencia, TRANSFERENCIA_STATUS_LABELS } from '../../../core/models/transferencia.model';

@Component({
  selector: 'bip-transferencia-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './transferencia-detail.component.html',
  styleUrl: './transferencia-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferenciaDetailComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly transferenciaService = inject(TransferenciaService);
  private readonly beneficioService = inject(BeneficioService);
  private readonly destroy$ = new Subject<void>();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly transferencia = signal<Transferencia | null>(null);
  readonly statusLabels = TRANSFERENCIA_STATUS_LABELS;

  readonly beneficios = this.beneficioService.beneficios;

  readonly beneficioOrigem = computed(() => {
    const transferencia = this.transferencia();
    const beneficios = this.beneficios();
    
    if (!transferencia || !beneficios.length) return null;
    
    return beneficios.find(b => b.id.toString() === transferencia.beneficioOrigemId.toString()) || null;
  });

  readonly beneficioDestino = computed(() => {
    const transferencia = this.transferencia();
    const beneficios = this.beneficios();
    
    if (!transferencia || !beneficios.length) return null;
    
    return beneficios.find(b => b.id.toString() === transferencia.beneficioDestinoId.toString()) || null;
  });

  readonly hasError = computed(() => this.error() !== null);
  readonly isLoading = computed(() => this.loading());
  readonly hasData = computed(() => this.transferencia() !== null && !this.loading() && !this.hasError());

  readonly timelineEntries = computed(() => {
    const item = this.transferencia();
    if (!item) {
      return [] as Array<{ key: string; title: string; description: string; variant: string }>;
    }

    const entries: Array<{ key: string; title: string; description: string; variant: string }> = [
      {
        key: 'created',
        title: 'Transferência criada',
        description: this.formatDate(item.createdAt),
        variant: 'created'
      }
    ];

    if (item.dataExecucao) {
      entries.push({
        key: 'executed',
        title: 'Transferência executada',
        description: this.formatDate(item.dataExecucao),
        variant: 'executed'
      });
    }

    entries.push({
      key: 'status',
      title: 'Status atual',
      description: this.statusLabels[item.status as keyof typeof this.statusLabels] || item.status,
      variant: `status-${item.status.toLowerCase()}`
    });

    return entries;
  });

  ngOnInit(): void {
    this.loadBeneficios();
    this.loadTransferencia();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBeneficios(): void {
    this.beneficioService.refresh();
  }

  private loadTransferencia(): void {
    this.route.params
      .pipe(
        switchMap(params => {
          const id = params['id'];
          if (!id) {
            this.error.set('ID da transferência não fornecido');
            return [];
          }

          this.loading.set(true);
          this.error.set(null);

          return this.transferenciaService.getTransferenciaById(id);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          if (response && response.data) {
            this.transferencia.set(response.data);
          } else {
            this.error.set('Transferência não encontrada');
          }
        },
        error: (error) => {
          this.loading.set(false);
          console.error('Erro ao carregar transferência:', error);
          this.error.set('Erro ao carregar transferência');
        }
      });
  }

  onBack(): void {
    this.router.navigate(['/transferencias']);
  }

  onRefresh(): void {
    this.loadTransferencia();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CONCLUIDA':
        return 'transferencia-detail__chip--success';
      case 'PENDENTE':
        return 'transferencia-detail__chip--pending';
      case 'CANCELADA':
        return 'transferencia-detail__chip--cancelled';
      case 'ERRO':
        return 'transferencia-detail__chip--error';
      default:
        return 'transferencia-detail__chip--default';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'CONCLUIDA':
        return 'check_circle';
      case 'PENDENTE':
        return 'schedule';
      case 'CANCELADA':
        return 'cancel';
      case 'ERRO':
        return 'priority_high';
      default:
        return 'info';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }
}
