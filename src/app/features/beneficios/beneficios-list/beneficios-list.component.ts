import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
import { BeneficioService } from '../../../core/services/beneficio.service';
import { Beneficio, BeneficioCategoria } from '../../../core/models/beneficio.model';
import { BrlCurrencyPipe } from '../../../core/pipes/currency.pipe';
import { BipDateFormatPipe } from '../../../core/pipes/date-format.pipe';
import { CategoriaLabelPipe } from '../../../core/pipes/categoria-label.pipe';

@Component({
  selector: 'bip-beneficios-list',
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
    MatProgressSpinnerModule,
    BrlCurrencyPipe,
    BipDateFormatPipe,
    CategoriaLabelPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './beneficios-list.component.html',
  styleUrl: './beneficios-list.component.scss'
})
export class BeneficiosListComponent {
  protected readonly beneficioService = inject(BeneficioService);
  private readonly router = inject(Router);

  // Filtros e busca
  readonly searchTerm = signal<string>('');
  readonly selectedCategory = signal<BeneficioCategoria | 'TODOS'>('TODOS');
  readonly statusFilter = signal<'TODOS' | 'ATIVO' | 'INATIVO'>('TODOS');

  readonly displayedColumns: string[] = ['nome', 'categoria', 'valor', 'status', 'updatedAt', 'actions'];

  readonly categorias = [
    'TODOS',
    BeneficioCategoria.ALIMENTACAO,
    BeneficioCategoria.TRANSPORTE,
    BeneficioCategoria.SAUDE,
    BeneficioCategoria.EDUCACAO,
    BeneficioCategoria.OUTROS
  ];

  // Computed properties com filtros
  readonly filteredBeneficios = computed(() => {
    const beneficios = this.beneficioService.beneficios() || [];
    const searchTerm = this.searchTerm().toLowerCase();
    const category = this.selectedCategory();
    const status = this.statusFilter();

    return beneficios.filter(beneficio => {
      const matchesSearch = !searchTerm || 
        beneficio.nome.toLowerCase().includes(searchTerm) ||
        beneficio.descricao?.toLowerCase().includes(searchTerm);
      
      const matchesCategory = category === 'TODOS' || beneficio.categoria === category;
      
      const matchesStatus = status === 'TODOS' || 
        (status === 'ATIVO' && beneficio.ativo) ||
        (status === 'INATIVO' && !beneficio.ativo);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  });

  readonly valorTotalBeneficios = computed(() => 
    this.filteredBeneficios().reduce((total, b) => total + b.valor, 0)
  );

  readonly beneficiosAtivosCount = computed(() =>
    this.filteredBeneficios().filter(b => b.ativo).length
  );

  readonly beneficiosInativosCount = computed(() =>
    this.filteredBeneficios().filter(b => !b.ativo).length
  );

  readonly hasFilters = computed(() => 
    this.searchTerm() !== '' || 
    this.selectedCategory() !== 'TODOS' || 
    this.statusFilter() !== 'TODOS'
  );

  trackByBeneficio(index: number, beneficio: Beneficio): string {
    return beneficio.id;
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set('TODOS');
    this.statusFilter.set('TODOS');
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

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      'TODOS': 'Todas as categorias',
      'ALIMENTACAO': 'Alimentação',
      'TRANSPORTE': 'Transporte',
      'SAUDE': 'Saúde',
      'EDUCACAO': 'Educação',
      'OUTROS': 'Outros'
    };
    return labels[category] || category;
  }

  getCategoryColor(category: BeneficioCategoria): string {
    const colors: Record<BeneficioCategoria, string> = {
      [BeneficioCategoria.ALIMENTACAO]: 'primary',
      [BeneficioCategoria.TRANSPORTE]: 'accent',
      [BeneficioCategoria.SAUDE]: 'warn',
      [BeneficioCategoria.EDUCACAO]: 'primary',
      [BeneficioCategoria.OUTROS]: ''
    };
    return colors[category] || '';
  }
}