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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

// Material Design Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

// Core Services and Models
import { TransferenciaService } from '@core/services/transferencia.service';
import { Transferencia } from '@core/models/transferencia.model';

@Component({
  selector: 'bip-transferencia-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule
  ],
  templateUrl: './transferencia-list.component.html',
  styleUrl: './transferencia-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferenciaListComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly transferenciaService = inject(TransferenciaService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly displayedColumns: string[] = ['destinatario', 'valor', 'status', 'data', 'observacoes', 'actions'];

  readonly totalTransferencias = computed(() => 
    this.transferenciaService.transferencias().length
  );

  readonly transferenciasComSucesso = computed(() => 
    this.transferenciaService.transferencias()
      .filter(t => t.status === 'CONCLUIDA').length
  );

  readonly transferenciasPendentes = computed(() => 
    this.transferenciaService.transferencias()
      .filter(t => t.status === 'PENDENTE').length
  );

  readonly valorTotalTransferido = computed(() => 
    this.transferenciaService.transferencias()
      .filter(t => t.status === 'CONCLUIDA')
      .reduce((total, t) => total + t.valor, 0)
  );

  readonly recentTransferencias = computed(() => 
    this.transferenciaService.transferencias()
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

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'PENDENTE': 'warning',
      'PROCESSANDO': 'info',
      'CONCLUIDA': 'success',
      'CANCELADA': 'secondary',
      'FALHOU': 'danger'
    };
    return colors[status] || 'secondary';
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