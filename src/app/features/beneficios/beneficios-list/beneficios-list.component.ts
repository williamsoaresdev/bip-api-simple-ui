import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Material Design Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

// Core Services and Models
import { BeneficioService } from '@core/services/beneficio.service';
import { Beneficio } from '@core/models/beneficio.model';

@Component({
  selector: 'bip-beneficios-list',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './beneficios-list.component.html',
  styleUrl: './beneficios-list.component.scss'
})
export class BeneficiosListComponent {
  protected readonly beneficioService = inject(BeneficioService);
  private readonly router = inject(Router);

  readonly displayedColumns: string[] = ['nome', 'categoria', 'valor', 'status', 'updatedAt', 'actions'];

  readonly valorTotalBeneficios = computed(() => 
    this.beneficioService.beneficios().reduce((total, b) => total + b.valor, 0)
  );

  trackByBeneficio(index: number, beneficio: Beneficio): string {
    return beneficio.id;
  }

  navigateToCreate(): void {
    this.router.navigate(['/beneficios/novo']);
  }

  editBeneficio(id: string): void {
    this.router.navigate(['/beneficios', id, 'editar']);
  }

  viewBeneficio(id: string): void {
    this.router.navigate(['/beneficios', id]);
  }
}