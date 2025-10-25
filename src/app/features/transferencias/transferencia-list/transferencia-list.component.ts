import { 
  Component, 
  OnInit, 
  ChangeDetectionStrategy, 
  signal, 
  computed, 
  inject 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

// Material Design Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Core Services and Models
import { TransferenciaService } from '@core/services/transferencia.service';
import { Transferencia, TransferenciaStatus } from '@core/models/transferencia.model';

@Component({
  selector: 'bip-transferencia-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './transferencia-list.component.html',
  styleUrl: './transferencia-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferenciaListComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly transferenciaService = inject(TransferenciaService);

  // Filtros e busca
  readonly searchTerm = signal<string>('');
  readonly selectedStatus = signal<TransferenciaStatus | 'TODOS'>('TODOS');
  readonly dateFilter = signal<'TODOS' | 'HOJE' | 'SEMANA' | 'MES'>('TODOS');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly displayedColumns: string[] = ['destinatario', 'valor', 'status', 'data', 'observacoes', 'actions'];

  readonly statusOptions = [
    'TODOS',
    TransferenciaStatus.PENDENTE,
    TransferenciaStatus.PROCESSANDO,
    TransferenciaStatus.CONCLUIDA,
    TransferenciaStatus.CANCELADA,
    TransferenciaStatus.REJEITADA
  ];

  // Computed properties com filtros
  readonly filteredTransferencias = computed(() => {
    const transferencias = this.transferenciaService.transferencias() || [];
    const searchTerm = this.searchTerm().toLowerCase();
    const status = this.selectedStatus();
    const dateFilter = this.dateFilter();

    return transferencias.filter(transferencia => {
      const matchesSearch = !searchTerm || 
        transferencia.destinatario.toLowerCase().includes(searchTerm) ||
        transferencia.observacoes?.toLowerCase().includes(searchTerm);
      
      const matchesStatus = status === 'TODOS' || transferencia.status === status;
      
      const matchesDate = this.matchesDateFilter(transferencia, dateFilter);

      return matchesSearch && matchesStatus && matchesDate;
    });
  });

  readonly totalTransferencias = computed(() => 
    this.filteredTransferencias().length
  );

  readonly transferenciasComSucesso = computed(() => 
    this.filteredTransferencias()
      .filter(t => t.status === TransferenciaStatus.CONCLUIDA).length
  );

  readonly transferenciasPendentes = computed(() => 
    this.filteredTransferencias()
      .filter(t => t.status === TransferenciaStatus.PENDENTE).length
  );

  readonly transferenciasFalhas = computed(() => 
    this.filteredTransferencias()
      .filter(t => t.status === TransferenciaStatus.REJEITADA).length
  );

  readonly valorTotalTransferido = computed(() => 
    this.filteredTransferencias()
      .filter(t => t.status === TransferenciaStatus.CONCLUIDA)
      .reduce((total, t) => total + t.valor, 0)
  );

  readonly hasFilters = computed(() => 
    this.searchTerm() !== '' || 
    this.selectedStatus() !== 'TODOS' || 
    this.dateFilter() !== 'TODOS'
  );

  readonly recentTransferencias = computed(() => 
    this.filteredTransferencias()
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
  );

  ngOnInit(): void {
    this.loadTransferencias();
  }

  private loadTransferencias(): void {
    this.loading.set(true);
    this.error.set(null);

    this.transferenciaService.loadTransferencias()
      .pipe(
        catchError(error => {
          this.error.set('Erro ao carregar transferências: ' + error.message);
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  private matchesDateFilter(transferencia: Transferencia, filter: string): boolean {
    if (filter === 'TODOS') return true;
    
    const now = new Date();
    const transferenciaDate = new Date(transferencia.createdAt);
    
    switch (filter) {
      case 'HOJE':
        return transferenciaDate.toDateString() === now.toDateString();
      case 'SEMANA':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return transferenciaDate >= weekAgo;
      case 'MES':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return transferenciaDate >= monthAgo;
      default:
        return true;
    }
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('TODOS');
    this.dateFilter.set('TODOS');
  }

  onRefresh(): void {
    this.loadTransferencias();
  }

  navigateToCreate(): void {
    this.router.navigate(['/transferencias/nova']);
  }

  viewTransferencia(id: string): void {
    this.router.navigate(['/transferencias', id]);
  }

  trackByTransferencia(index: number, transferencia: Transferencia): string {
    return transferencia.id;
  }

  getStatusColor(status: TransferenciaStatus): string {
    const colors: Record<TransferenciaStatus, string> = {
      [TransferenciaStatus.PENDENTE]: 'warn',
      [TransferenciaStatus.PROCESSANDO]: 'primary',
      [TransferenciaStatus.CONCLUIDA]: 'accent',
      [TransferenciaStatus.CANCELADA]: '',
      [TransferenciaStatus.REJEITADA]: 'warn'
    };
    return colors[status] || '';
  }

  getStatusLabel(status: TransferenciaStatus): string {
    const labels: Record<TransferenciaStatus, string> = {
      [TransferenciaStatus.PENDENTE]: 'Pendente',
      [TransferenciaStatus.PROCESSANDO]: 'Processando',
      [TransferenciaStatus.CONCLUIDA]: 'Concluída',
      [TransferenciaStatus.CANCELADA]: 'Cancelada',
      [TransferenciaStatus.REJEITADA]: 'Rejeitada'
    };
    return labels[status] || status;
  }

  getStatusIcon(status: TransferenciaStatus): string {
    const icons: Record<TransferenciaStatus, string> = {
      [TransferenciaStatus.PENDENTE]: 'schedule',
      [TransferenciaStatus.PROCESSANDO]: 'sync',
      [TransferenciaStatus.CONCLUIDA]: 'check_circle',
      [TransferenciaStatus.CANCELADA]: 'cancel',
      [TransferenciaStatus.REJEITADA]: 'error'
    };
    return icons[status] || 'help';
  }

  getDateFilterLabel(filter: string): string {
    const labels: Record<string, string> = {
      'TODOS': 'Todos os períodos',
      'HOJE': 'Hoje',
      'SEMANA': 'Última semana',
      'MES': 'Último mês'
    };
    return labels[filter] || filter;
  }
}