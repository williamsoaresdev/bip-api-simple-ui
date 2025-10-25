import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit, ViewEncapsulation } from '@angular/core';
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
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';

// Core Services and Models
import { BeneficioService } from '../../../core/services/beneficio.service';
import { Beneficio, BeneficioCategoria } from '../../../core/models/beneficio.model';
import { BrlCurrencyPipe } from '../../../core/pipes/currency.pipe';
import { BipDateFormatPipe } from '../../../core/pipes/date-format.pipe';
import { CategoriaLabelPipe } from '../../../core/pipes/categoria-label.pipe';

// Shared Components
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

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
    MatDividerModule,
    BrlCurrencyPipe,
    BipDateFormatPipe,
    CategoriaLabelPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './beneficios-list.component.html',
  styleUrl: './beneficios-list.component.scss'
})
export class BeneficiosListComponent implements OnInit {
  protected readonly beneficioService = inject(BeneficioService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    // Carregar benefícios ao inicializar o componente
    this.beneficioService.loadBeneficios().subscribe({
      next: (data) => {
        console.log('Benefícios carregados:', data);
      },
      error: (error) => {
        console.error('Erro ao carregar benefícios:', error);
      }
    });
  }

  // Filtros e busca
  readonly searchTerm = signal<string>('');
  readonly selectedCategory = signal<BeneficioCategoria | 'TODOS'>('TODOS');
  readonly statusFilter = signal<'TODOS' | 'ATIVO' | 'INATIVO'>('TODOS');

  readonly displayedColumns: string[] = ['nome', 'categoria', 'valor', 'status', 'data', 'actions'];

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

  /**
   * Limpa o cache e recarrega os dados
   */
  clearCache(): void {
    console.log('🧹 Component: Limpando cache...');
    this.beneficioService.clearCacheAndReload().subscribe({
      next: (response) => {
        console.log('✅ Cache limpo e dados recarregados:', response);
      },
      error: (error) => {
        console.error('❌ Erro ao limpar cache:', error);
      }
    });
  }

  navigateToCreate(): void {
    console.log('🎯 Navegando para criar benefício');
    this.router.navigate(['/beneficios/novo']);
  }

  editBeneficio(id: string): void {
    console.log('🎯 Navegando para editar benefício:', id);
    this.router.navigate(['/beneficios/editar', id]);
  }

  viewBeneficio(id: string): void {
    console.log('🎯 Navegando para visualizar benefício:', id);
    this.router.navigate(['/beneficios/visualizar', id]);
  }

  deleteBeneficio(id: string): void {
    console.log('🗑️ Iniciando delete do benefício ID:', id, 'tipo:', typeof id);
    
    // Buscar o benefício considerando possíveis tipos diferentes
    const beneficio = this.beneficioService.beneficios().find(b => 
      b.id === id || b.id === id.toString() || b.id.toString() === id
    );
    
    console.log('🔍 Benefício encontrado:', beneficio);
    console.log('📋 Todos os benefícios disponíveis:', this.beneficioService.beneficios().map(b => ({ id: b.id, nome: b.nome, tipo: typeof b.id })));
    
    if (!beneficio) {
      console.error('❌ Benefício não encontrado para ID:', id);
      return;
    }

    const dialogData: ConfirmationDialogData = {
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o benefício "${beneficio.nome}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger',
      icon: 'delete_forever'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: true,
      panelClass: ['modern-dialog'],
      backdropClass: 'modern-backdrop',
      hasBackdrop: true
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      console.log('🔔 Modal fechada, confirmado:', confirmed);
      if (confirmed) {
        console.log('✅ Usuário confirmou, deletando benefício ID:', id);
        this.beneficioService.deleteBeneficio(id).subscribe({
          next: (result) => {
            console.log('📝 Resultado da API:', result);
            if (result.success) {
              console.log('✅ Benefício excluído com sucesso');
              // O service já remove o item da lista localmente
              // Não precisamos fazer reload extra aqui
            }
          },
          error: (error) => {
            console.error('❌ Erro ao excluir benefício:', error);
            // Em caso de erro, recarregar para manter consistência
            this.beneficioService.loadBeneficios().subscribe();
          }
        });
      } else {
        console.log('🚫 Usuário cancelou a exclusão');
      }
    });
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