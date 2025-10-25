import { 
  Component, 
  OnInit, 
  ChangeDetectionStrategy, 
  signal, 
  computed, 
  inject 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

// Material Design Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Core Services and Models
import { BeneficioService } from '../../../core/services/beneficio.service';
import { Beneficio, BENEFICIO_CATEGORIA_LABELS } from '../../../core/models/beneficio.model';
import { BrlCurrencyPipe } from '../../../core/pipes/currency.pipe';
import { BipDateFormatPipe } from '../../../core/pipes/date-format.pipe';
import { CategoriaLabelPipe } from '../../../core/pipes/categoria-label.pipe';

@Component({
  selector: 'bip-beneficio-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    BrlCurrencyPipe,
    BipDateFormatPipe
  ],
  templateUrl: './beneficio-detail.component.html',
  styleUrl: './beneficio-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BeneficioDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly beneficioService = inject(BeneficioService);

  readonly beneficio = signal<Beneficio | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly beneficioId = signal<string | null>(null);

  readonly pageTitle = computed(() => {
    const beneficio = this.beneficio();
    return beneficio ? `Benefício: ${beneficio.nome}` : 'Detalhes do Benefício';
  });

  readonly statusColor = computed(() => {
    const beneficio = this.beneficio();
    return beneficio?.ativo ? 'success' : 'inactive';
  });

  readonly statusLabel = computed(() => {
    const beneficio = this.beneficio();
    return beneficio?.ativo ? 'Ativo' : 'Inativo';
  });

  readonly createdDate = computed(() => {
    const beneficio = this.beneficio();
    return beneficio?.createdAt ? new Date(beneficio.createdAt) : null;
  });

  readonly updatedDate = computed(() => {
    const beneficio = this.beneficio();
    return beneficio?.updatedAt ? new Date(beneficio.updatedAt) : null;
  });

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.route.params
      .pipe(takeUntilDestroyed())
      .subscribe(params => {
        const id = params['id'];
        if (id) {
          this.beneficioId.set(id);
          this.loadBeneficio(id);
        } else {
          this.error.set('ID do benefício não fornecido');
        }
      });
  }

  private loadBeneficio(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.beneficioService.getBeneficioById(id)
      .pipe(
        catchError(error => {
          this.error.set('Erro ao carregar benefício: ' + error.message);
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed()
      )
      .subscribe(response => {
        if (response?.data) {
          this.beneficio.set(response.data);
        }
      });
  }

  onEdit(): void {
    const id = this.beneficioId();
    if (id) {
      this.router.navigate(['/beneficios', id, 'editar']);
    }
  }

  onDelete(): void {
    const beneficio = this.beneficio();
    if (!beneficio) return;

    // Here would open a confirmation dialog
    // For now, just navigate back
    if (confirm(`Tem certeza que deseja excluir o benefício "${beneficio.nome}"?`)) {
      this.deleteBeneficio();
    }
  }

  private deleteBeneficio(): void {
    const id = this.beneficioId();
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);

    this.beneficioService.deleteBeneficio(id)
      .pipe(
        catchError(error => {
          this.error.set('Erro ao excluir benefício: ' + error.message);
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed()
      )
      .subscribe(result => {
        if (result) {
          this.router.navigate(['/beneficios']);
        }
      });
  }

  onBack(): void {
    this.router.navigate(['/beneficios']);
  }

  onToggleStatus(): void {
    const beneficio = this.beneficio();
    if (!beneficio) return;

    const newStatus = !beneficio.ativo;
    const action = newStatus ? 'ativar' : 'desativar';

    if (confirm(`Tem certeza que deseja ${action} este benefício?`)) {
      this.updateBeneficioStatus(newStatus);
    }
  }

  private updateBeneficioStatus(ativo: boolean): void {
    const id = this.beneficioId();
    const beneficio = this.beneficio();
    if (!id || !beneficio) return;

    this.loading.set(true);
    this.error.set(null);

    const updateData = {
      ...beneficio,
      ativo
    };

    this.beneficioService.updateBeneficio(id, updateData as any)
      .pipe(
        catchError(error => {
          this.error.set('Erro ao atualizar status: ' + error.message);
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed()
      )
      .subscribe(response => {
        if (response?.data) {
          this.beneficio.set(response.data);
        }
      });
  }

  onCopy(): void {
    const beneficio = this.beneficio();
    if (!beneficio) return;

    // Navigate to form with current beneficio data for copying
    this.router.navigate(['/beneficios/novo'], {
      state: { copyFrom: beneficio }
    });
  }
}