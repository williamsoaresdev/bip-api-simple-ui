import { 
  Component, 
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy, 
  signal, 
  computed, 
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, filter, takeUntil } from 'rxjs';

import { TransferenciaService } from '../../../core/services/transferencia.service';
import { Transferencia, TRANSFERENCIA_STATUS_LABELS } from '../../../core/models/transferencia.model';

@Component({
  selector: 'bip-transferencia-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './transferencia-list.component.html',
  styleUrl: './transferencia-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferenciaListComponent implements OnInit, OnDestroy {
  private readonly transferenciaService = inject(TransferenciaService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  readonly transferencias = this.transferenciaService.transferencias;
  readonly loading = this.transferenciaService.loading;
  readonly error = this.transferenciaService.error;
  readonly isLoading = this.transferenciaService.isLoading;
  readonly hasError = this.transferenciaService.hasError;

  readonly statusLabels = TRANSFERENCIA_STATUS_LABELS;
  readonly displayedColumns = signal<string[]>([
    'id',
    'origem',
    'destino', 
    'valor',
    'taxa',
    'status',
    'dataExecucao',
    'actions'
  ]);

  readonly isEmpty = computed(() => {
    const transferencias = this.transferencias();
    return !this.isLoading() && !this.hasError() && transferencias.length === 0;
  });

  readonly totalTransferencias = computed(() => {
    return this.transferencias().length;
  });

  readonly valorTotal = computed(() => {
    return this.transferencias().reduce((total, t) => total + t.valor, 0);
  });

  readonly pendentesCount = computed(() =>
    this.transferencias().filter((transferencia) => transferencia.status === 'PENDENTE').length
  );

  readonly concluidasCount = computed(() =>
    this.transferencias().filter((transferencia) => transferencia.status === 'CONCLUIDA').length
  );

  ngOnInit(): void {
    this.loadTransferencias();
    
    // Recarrega a lista sempre que navegar de volta para esta rota
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        filter((event: NavigationEnd) => event.url.includes('/transferencias') && !event.url.includes('/nova') && !event.url.includes('/visualizar')),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadTransferencias();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTransferencias(): void {
    this.transferenciaService.refresh();
  }

  viewTransferencia(transferencia: Transferencia): void {
    this.transferenciaService.setSelectedTransferencia(transferencia);
    this.router.navigate(['/transferencias/visualizar', transferencia.id]);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CONCLUIDA':
        return 'transferencias__chip--success';
      case 'PENDENTE':
        return 'transferencias__chip--pending';
      case 'CANCELADA':
        return 'transferencias__chip--cancelled';
      case 'ERRO':
        return 'transferencias__chip--error';
      default:
        return 'transferencias__chip--default';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status as keyof typeof this.statusLabels] || status;
  }

  onRetry(): void {
    this.loadTransferencias();
  }
}