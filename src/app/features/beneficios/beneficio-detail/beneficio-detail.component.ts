import { 
  Component, 
  OnInit, 
  ChangeDetectionStrategy, 
  signal, 
  computed, 
  inject 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

// Material Design Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Core Services and Models
import { BeneficioService } from '../../../core/services/beneficio.service';
import { Beneficio } from '../../../core/models/beneficio.model';
import { BrlCurrencyPipe } from '../../../core/pipes/currency.pipe';
import { BipDateFormatPipe } from '../../../core/pipes/date-format.pipe';

@Component({
  selector: 'bip-beneficio-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
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
  readonly loading = signal(true);
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
    console.log('🚀 Iniciando BeneficioDetailComponent');
    
    // Pegar o ID da rota
    const id = this.route.snapshot.params['id'];
    console.log('📋 ID capturado:', id);
    
    if (!id) {
      this.error.set('ID do benefício não fornecido');
      this.loading.set(false);
      return;
    }

    this.beneficioId.set(id);
    this.loadBeneficioById(id);
  }

  private loadBeneficioById(id: string): void {
    console.log('🔍 Carregando benefício ID:', id);
    this.loading.set(true);
    this.error.set(null);

    // Chamar o método getBeneficioById do serviço
    this.beneficioService.getBeneficioById(id).subscribe({
      next: (response) => {
        console.log('✅ Resposta recebida:', response);
        
        if (response.success && response.data) {
          console.log('✅ Benefício carregado:', response.data);
          this.beneficio.set(response.data);
          this.error.set(null);
        } else {
          console.warn('⚠️ Erro na resposta:', response.message);
          this.error.set(response.message || 'Benefício não encontrado');
        }
        
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Erro na requisição:', error);
        this.error.set(`Erro ao carregar benefício: ${error.message || 'Erro desconhecido'}`);
        this.loading.set(false);
      }
    });
  }

  onEdit(): void {
    const id = this.beneficioId();
    if (id) {
      console.log('✏️ Navegando para editar benefício:', id);
      this.router.navigate(['/beneficios/editar', id]);
    }
  }

  onBack(): void {
    console.log('⬅️ Voltando para lista de benefícios');
    this.router.navigate(['/beneficios']);
  }

  getCategoryLabel(categoria: string): string {
    const labels: Record<string, string> = {
      'ALIMENTACAO': 'Alimentação',
      'TRANSPORTE': 'Transporte', 
      'SAUDE': 'Saúde',
      'EDUCACAO': 'Educação',
      'OUTROS': 'Outros'
    };
    return labels[categoria] || categoria;
  }

  retryLoad(): void {
    console.log('🔄 Tentando recarregar benefício...');
    const id = this.beneficioId();
    if (id) {
      this.loadBeneficioById(id);
    } else {
      this.error.set('ID do benefício não disponível para recarregar');
    }
  }
}