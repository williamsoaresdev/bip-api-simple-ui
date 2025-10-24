import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Material Design Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';

// Core Services
import { BeneficioService } from '@core/services/beneficio.service';
import { TransferenciaService } from '@core/services/transferencia.service';
import { LoadingService } from '@core/services/loading.service';

export interface DashboardMetrics {
  readonly totalBeneficios: number;
  readonly beneficiosAtivos: number;
  readonly totalTransferencias: number;
  readonly valorTotalTransferido: number;
  readonly transferenciasPendentes: number;
}

@Component({
  selector: 'bip-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly beneficioService = inject(BeneficioService);
  private readonly transferenciaService = inject(TransferenciaService);
  readonly loadingService = inject(LoadingService);

  private readonly _errorMessage = signal<string | null>(null);
  private readonly _now = signal(new Date());

  readonly errorMessage = this._errorMessage.asReadonly();
  readonly now = this._now.asReadonly();

  readonly hasError = computed(() => 
    this.beneficioService.hasError() || 
    this.transferenciaService.hasError() || 
    this._errorMessage() !== null
  );

  readonly metrics = computed((): DashboardMetrics => ({
    totalBeneficios: this.beneficioService.totalBeneficios(),
    beneficiosAtivos: this.beneficioService.beneficiosAtivos().length,
    totalTransferencias: this.transferenciaService.totalTransferencias(),
    valorTotalTransferido: this.transferenciaService.valorTotalTransferido(),
    transferenciasPendentes: this.transferenciaService.transferenciasPendentes().length
  }));

  readonly recentBeneficios = computed(() => 
    this.beneficioService.beneficios()
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  );

  readonly recentTransferencias = computed(() => 
    this.transferenciaService.transferencias()
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  );

  constructor() {
    setInterval(() => {
      this._now.set(new Date());
    }, 60000);
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.beneficioService.loadBeneficios()
      .pipe(takeUntilDestroyed())
      .subscribe({
        error: (error) => {
          this._errorMessage.set('Erro ao carregar benefícios: ' + error.message);
        }
      });

    this.transferenciaService.loadTransferencias()
      .pipe(takeUntilDestroyed())
      .subscribe({
        error: (error) => {
          this._errorMessage.set('Erro ao carregar transferências: ' + error.message);
        }
      });
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  getStatusClasses(status: string): string {
    const classes: Record<string, string> = {
      'PENDENTE': 'bg-yellow-100 text-yellow-800',
      'PROCESSANDO': 'bg-blue-100 text-blue-800',
      'CONCLUIDA': 'bg-green-100 text-green-800',
      'CANCELADA': 'bg-gray-100 text-gray-800',
      'FALHOU': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
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