import { 
  Component, 
  OnInit, 
  ChangeDetectionStrategy, 
  signal, 
  computed, 
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ReactiveFormsModule, 
  NonNullableFormBuilder, 
  Validators
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { switchMap, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

// Material Design Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

// Core Services and Models
import { BeneficioService } from '../../../core/services/beneficio.service';
import { Beneficio, BeneficioCategoria, BENEFICIO_CATEGORIA_LABELS } from '../../../core/models/beneficio.model';

export interface BeneficioFormData {
  nome: string;
  descricao: string;
  valor: number;
  categoria: BeneficioCategoria;
  ativo: boolean;
}

type FormMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'bip-beneficio-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './beneficio-form.component.html',
  styleUrl: './beneficio-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BeneficioFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly beneficioService = inject(BeneficioService);

  readonly mode = signal<FormMode>('create');
  readonly beneficioId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly originalBeneficio = signal<Beneficio | null>(null);
  readonly formValid = signal(false); // 👈 Novo signal para rastrear validade

  readonly categorias = Object.values(BeneficioCategoria);
  readonly categoriasLabels = BENEFICIO_CATEGORIA_LABELS;

  readonly beneficioForm = this.fb.group({
    nome: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100)
    ]],
    descricao: [''],
    valor: [null as number | null, [
      Validators.required,
      Validators.min(0.01)
    ]],
    categoria: [BeneficioCategoria.OUTROS, [
      Validators.required
    ]],
    ativo: [true]
  });

  readonly isEditMode = computed(() => this.mode() === 'edit');
  readonly isCreateMode = computed(() => this.mode() === 'create');
  readonly isViewMode = computed(() => this.mode() === 'view');

  readonly formTitle = computed(() => {
    switch (this.mode()) {
      case 'create': return 'Criar Novo Benefício';
      case 'edit': return 'Editar Benefício';
      case 'view': return 'Visualizar Benefício';
      default: return 'Benefício';
    }
  });

  readonly formSubtitle = computed(() => {
    switch (this.mode()) {
      case 'create': return 'Preencha as informações para criar um novo benefício';
      case 'edit': return 'Atualize as informações do benefício';
      case 'view': return 'Informações detalhadas do benefício';
      default: return '';
    }
  });

  readonly submitButtonText = computed(() => {
    if (this.submitting()) {
      return this.isEditMode() ? 'Atualizando...' : 'Criando...';
    }
    return this.isEditMode() ? 'Atualizar Benefício' : 'Criar Benefício';
  });

  readonly canSubmit = computed(() => {
    const isValid = this.formValid(); // 👈 Usa o signal em vez de beneficioForm.valid
    const notSubmitting = !this.submitting();
    const notLoading = !this.loading();
    
    console.log('=== VALIDAÇÃO DO FORMULÁRIO ===');
    console.log('Form Valid:', isValid);
    console.log('Not Submitting:', notSubmitting);
    console.log('Not Loading:', notLoading);
    console.log('Form Value:', this.beneficioForm.value);
    console.log('Form Errors:', this.getFormErrors());
    console.log('Can Submit:', isValid && notSubmitting && notLoading);
    console.log('================================');
    
    return isValid && notSubmitting && notLoading;
  });

  readonly hasChanges = computed(() => {
    if (this.isCreateMode()) return true;
    const original = this.originalBeneficio();
    if (!original) return false;
    
    const current = this.beneficioForm.value;
    return (
      current.nome !== original.nome ||
      current.descricao !== original.descricao ||
      current.valor !== original.valor ||
      current.categoria !== original.categoria ||
      current.ativo !== original.ativo
    );
  });

  readonly currentCategoriaLabel = computed(() => {
    const categoria = this.beneficioForm.get('categoria')?.value;
    if (!categoria || categoria === BeneficioCategoria.OUTROS) {
      return 'Outros';
    }
    return this.categoriasLabels[categoria];
  });

  constructor() {
    this.setupFormValidation();
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.beneficioId.set(id);
        this.mode.set('edit');
        this.loadBeneficio(id);
      } else {
        this.mode.set('create');
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
        finalize(() => this.loading.set(false))
      )
      .subscribe(response => {
        if (response?.data) {
          const beneficio = response.data;
          this.originalBeneficio.set(beneficio);
          
          this.beneficioForm.patchValue({
            nome: beneficio.nome,
            descricao: beneficio.descricao,
            valor: beneficio.valor,
            categoria: beneficio.categoria,
            ativo: beneficio.ativo
          });
        }
      });
  }

  private setupFormValidation(): void {
    this.beneficioForm.valueChanges.subscribe(() => {
      this.error.set(null);
      // 👇 Atualiza o signal de validação sempre que o form muda
      this.formValid.set(this.beneficioForm.valid);
    });

    // 👇 Atualiza validação inicial
    this.formValid.set(this.beneficioForm.valid);

    // Debug específico para categoria
    this.beneficioForm.get('categoria')?.valueChanges.subscribe(value => {
      console.log('🔵 Categoria changed:', value);
      console.log('🔵 Categoria type:', typeof value);
      console.log('🔵 Form valid after categoria change:', this.beneficioForm.valid);
      console.log('🔵 All form values:', this.beneficioForm.value);
    });
  }

  onSubmit(): void {
    // Marca todos os campos como touched para mostrar erros
    Object.keys(this.beneficioForm.controls).forEach(key => {
      this.beneficioForm.get(key)?.markAsTouched();
    });

    console.log('=== TENTATIVA DE SUBMIT ===');
    console.log('Can Submit:', this.canSubmit());
    console.log('Form Valid:', this.beneficioForm.valid);
    console.log('Form Value:', this.beneficioForm.value);
    console.log('Form Errors:', this.getFormErrors());
    console.log('==========================');

    if (!this.canSubmit()) {
      console.warn('Formulário inválido, submit bloqueado');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const formData = this.beneficioForm.value;
    
    const operation = this.isEditMode() 
      ? this.beneficioService.updateBeneficio(this.beneficioId()!, formData as any)
      : this.beneficioService.createBeneficio(formData as any);

    operation
      .pipe(
        catchError(error => {
          this.error.set('Erro ao salvar benefício: ' + error.message);
          return of(null);
        }),
        finalize(() => this.submitting.set(false))
      )
      .subscribe(result => {
        if (result) {
          this.router.navigate(['/beneficios']);
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/beneficios']);
  }

  onReset(): void {
    if (this.isEditMode() && this.originalBeneficio()) {
      const original = this.originalBeneficio()!;
      this.beneficioForm.patchValue({
        nome: original.nome,
        descricao: original.descricao,
        valor: original.valor,
        categoria: original.categoria,
        ativo: original.ativo
      });
    } else {
      this.beneficioForm.reset({
        nome: '',
        descricao: '',
        valor: 0,
        categoria: BeneficioCategoria.OUTROS,
        ativo: true
      });
    }
    this.error.set(null);
  }

  getFieldError(fieldName: string): string | null {
    const field = this.beneficioForm.get(fieldName);
    if (!field || !field.touched || !field.errors) return null;

    const errors = field.errors;
    if (errors['required']) return `${fieldName} é obrigatório`;
    if (errors['minlength']) return `${fieldName} deve ter pelo menos ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `${fieldName} deve ter no máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) return `Valor deve ser maior que ${errors['min'].min}`;
    
    return 'Campo inválido';
  }

  getFormErrors(): any {
    const formErrors: any = {};
    Object.keys(this.beneficioForm.controls).forEach(key => {
      const controlErrors = this.beneficioForm.get(key)?.errors;
      if (controlErrors) {
        formErrors[key] = controlErrors;
      }
    });
    return formErrors;
  }

  compareCategorias(c1: BeneficioCategoria, c2: BeneficioCategoria): boolean {
    return c1 === c2;
  }
}