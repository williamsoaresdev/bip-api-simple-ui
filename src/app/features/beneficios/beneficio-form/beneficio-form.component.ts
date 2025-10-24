import { 
  Component, 
  OnInit, 
  ChangeDetectionStrategy, 
  signal, 
  computed, 
  inject,
  effect,
  DestroyRef
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { 
  ReactiveFormsModule, 
  NonNullableFormBuilder, 
  Validators,
  AbstractControl 
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { 
  map, 
  filter, 
  debounceTime, 
  distinctUntilChanged,
  switchMap,
  startWith,
  catchError,
  finalize
} from 'rxjs/operators';
import { of, combineLatest, EMPTY } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BeneficioService } from '@core/services';
import { Beneficio, CreateBeneficioRequest, UpdateBeneficioRequest } from '@core/models';
import { BeneficioValidators } from '@core/validators/beneficio.validators';
import { MoedaBrasilPipe, TempoRelativoPipe } from '@core/pipes/beneficio.pipes';
import { 
  BeneficioFormGroup, 
  BeneficioFormValue, 
  FormState, 
  ValidationState,
  FormMode 
} from '@core/types/form.types';

@Component({
  selector: 'app-beneficio-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    RouterModule,
    DatePipe
  ],
  templateUrl: './beneficio-form.component.html',
  styleUrl: './beneficio-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BeneficioFormComponent implements OnInit {
  // 🚀 Modern Angular 20 - Dependency Injection
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  public readonly beneficioService = inject(BeneficioService);

  // 🎯 Advanced Signals para estado reativo
  readonly mode = signal<FormMode>('create');
  readonly beneficioId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly originalBeneficio = signal<Beneficio | null>(null);
  readonly existingNames = signal<string[]>([]);

  // 📋 Type-safe Reactive Form com validators avançados
  readonly beneficioForm: BeneficioFormGroup = this.fb.group({
    nome: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ],
      asyncValidators: [],
      updateOn: 'blur'
    }),
    descricao: this.fb.control('', {
      validators: [
        Validators.maxLength(500),
        BeneficioValidators.descricaoValida()
      ],
      updateOn: 'blur'
    }),
    valorInicial: this.fb.control(0, {
      validators: [
        Validators.required,
        BeneficioValidators.valorMonetario()
      ],
      updateOn: 'blur'
    })
  }, {
    validators: [BeneficioValidators.validarRegrasNegocio()],
    updateOn: 'change'
  });

  // 💡 Advanced Computed signals
  readonly isEditMode = computed(() => this.mode() === 'edit');
  readonly isCreateMode = computed(() => this.mode() === 'create');
  readonly isViewMode = computed(() => this.mode() === 'view');

  readonly formTitle = computed(() => {
    switch (this.mode()) {
      case 'create': return 'Criar Novo Benefício';
      case 'edit': return 'Editar Benefício';
      case 'view': return 'Visualizar Benefício';
      case 'copy': return 'Copiar Benefício';
      default: return 'Benefício';
    }
  });

  readonly formSubtitle = computed(() => {
    switch (this.mode()) {
      case 'create': return 'Preencha as informações para criar um novo benefício';
      case 'edit': return 'Atualize as informações do benefício';
      case 'view': return 'Informações detalhadas do benefício';
      case 'copy': return 'Crie um novo benefício baseado no existente';
      default: return '';
    }
  });

  readonly submitButtonText = computed(() => {
    if (this.submitting()) {
      return this.isEditMode() ? 'Atualizando...' : 'Criando...';
    }
    return this.isEditMode() ? 'Atualizar Benefício' : 'Criar Benefício';
  });

  readonly valorFormatado = computed(() => {
    const valor = this.beneficioForm.controls.valorInicial.value;
    return this.moedaBrasilPipe.transform(valor);
  });

  readonly formState = computed((): FormState => ({
    mode: this.mode(),
    isSubmitting: this.submitting(),
    isDirty: this.beneficioForm.dirty,
    hasUnsavedChanges: this.hasUnsavedChanges(),
    validationState: this.getValidationState()
  }));

  readonly isFormValid = computed(() => 
    this.beneficioForm.valid && !this.submitting()
  );

  readonly hasUnsavedChanges = computed(() => {
    if (!this.originalBeneficio() || this.mode() === 'create') {
      return this.beneficioForm.dirty;
    }
    
    const original = this.originalBeneficio()!;
    const current = this.beneficioForm.getRawValue();
    
    return (
      original.nome !== current.nome ||
      original.descricao !== (current.descricao || '') ||
      original.saldo !== current.valorInicial
    );
  });

  // 🎨 Pipes injetados para uso programático
  private readonly moedaBrasilPipe = new MoedaBrasilPipe();
  private readonly tempoRelativoPipe = new TempoRelativoPipe();

  constructor() {
    this.setupFormEffects();
    this.setupRouteHandling();
    this.setupFormValidation();
    this.loadExistingNames();
  }

  ngOnInit(): void {
    // Lifecycle hook para setup adicional se necessário
  }

  // 🔄 Advanced form effects
  private setupFormEffects(): void {
    // Effect para auto-save (se necessário)
    effect(() => {
      if (this.hasUnsavedChanges() && this.isEditMode()) {
        // Implementar auto-save se necessário
        console.log('Formulário modificado - considerando auto-save');
      }
    });

    // Effect para validação em tempo real
    effect(() => {
      const formValue = this.beneficioForm.value;
      this.validateFormRealTime(formValue);
    });
  }

  // 🛣️ Advanced route handling
  private setupRouteHandling(): void {
    combineLatest([
      this.route.params,
      this.route.queryParams
    ]).pipe(
      map(([params, queryParams]) => ({
        id: params['id'] ? Number(params['id']) : null,
        mode: queryParams['mode'] as FormMode || 'create'
      })),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ id, mode }) => {
      this.mode.set(mode);
      
      if (id) {
        this.beneficioId.set(id);
        this.loadBeneficio(id);
      }
    });
  }

  // ✅ Advanced form validation setup
  private setupFormValidation(): void {
    // Validação assíncrona para nome único
    this.beneficioForm.controls.nome.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter((value): value is string => !!value && value.length >= 3),
      switchMap(nome => this.validateNomeUnico(nome)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();

    // Formatação automática de valor
    this.beneficioForm.controls.valorInicial.valueChanges.pipe(
      debounceTime(300),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(valor => {
      this.formatarValorAutomatico(valor);
    });
  }

  // 📥 Advanced data loading
  private loadBeneficio(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.beneficioService.buscarPorId(id).pipe(
      catchError(error => {
        this.error.set('Erro ao carregar benefício: ' + error);
        return EMPTY;
      }),
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(beneficio => {
      this.originalBeneficio.set(beneficio);
      this.populateForm(beneficio);
    });
  }

  // 📝 Advanced form population
  private populateForm(beneficio: Beneficio): void {
    this.beneficioForm.patchValue({
      nome: beneficio.nome,
      descricao: beneficio.descricao || '',
      valorInicial: beneficio.saldo
    }, { emitEvent: true });

    // Marcar como pristine após carregar dados
    this.beneficioForm.markAsPristine();
  }

  // 🔍 Advanced validation methods
  private validateNomeUnico(nome: string) {
    const existing = this.existingNames();
    const currentId = this.beneficioId();
    
    // Se estamos editando, remover o nome atual da validação
    const namesToCheck = this.isEditMode() && this.originalBeneficio()
      ? existing.filter(n => n !== this.originalBeneficio()!.nome)
      : existing;

    const isDuplicate = namesToCheck.some(n => 
      n.toLowerCase() === nome.toLowerCase()
    );

    if (isDuplicate) {
      this.beneficioForm.controls.nome.setErrors({ 
        nomeJaExiste: { value: nome } 
      });
    }

    return of(null);
  }

  private getValidationState(): ValidationState {
    const errors = this.beneficioForm.errors || {};
    const controlErrors = Object.keys(this.beneficioForm.controls).reduce((acc, key) => {
      const control = this.beneficioForm.get(key);
      if (control?.errors) {
        acc[key] = control.errors;
      }
      return acc;
    }, {} as any);

    return {
      isValid: this.beneficioForm.valid,
      errors: { ...errors, ...controlErrors },
      warnings: this.getValidationWarnings(),
      suggestions: this.getValidationSuggestions()
    };
  }

  private getValidationWarnings() {
    const warnings: any = {};
    const valor = this.beneficioForm.controls.valorInicial.value;
    
    if (valor > 5000) {
      warnings.valorAlto = {
        message: 'Valor alto detectado',
        suggestion: 'Verifique se o valor está correto'
      };
    }

    return warnings;
  }

  private getValidationSuggestions() {
    const suggestions: any = {};
    const nome = this.beneficioForm.controls.nome.value;
    
    if (nome && nome.length < 10) {
      suggestions.nomeDetalhe = {
        message: 'Nome poderia ser mais descritivo',
        action: 'Considere adicionar mais detalhes'
      };
    }

    return suggestions;
  }

  // 💰 Advanced value formatting
  formatarValorAutomatico(valor: number): void {
    if (typeof valor === 'number' && !isNaN(valor)) {
      // Trigger any additional formatting logic here
      console.log('Valor formatado automaticamente:', valor);
    }
  }

  private loadExistingNames(): void {
    this.beneficioService.listarTodos().pipe(
      map(beneficios => beneficios.map(b => b.nome)),
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(names => {
      this.existingNames.set(names);
    });
  }

  private validateFormRealTime(formValue: any): void {
    // Implementar validação em tempo real avançada
    // console.log('Validação em tempo real:', formValue);
  }

  // 📤 Advanced form submission
  onSubmit(): void {
    if (!this.isFormValid()) {
      this.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const formValue = this.beneficioForm.getRawValue();
    const request$ = this.isEditMode() && this.beneficioId()
      ? this.updateBeneficio(this.beneficioId()!, formValue)
      : this.createBeneficio(formValue);

    request$.pipe(
      catchError(error => {
        const action = this.isEditMode() ? 'atualizar' : 'criar';
        this.error.set(`Erro ao ${action} benefício: ${error}`);
        return EMPTY;
      }),
      finalize(() => this.submitting.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      const message = this.isEditMode() 
        ? 'Benefício atualizado com sucesso!' 
        : 'Benefício criado com sucesso!';
      
      this.snackBar.open(message, 'Fechar', { 
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      
      this.router.navigate(['/beneficios']);
    });
  }

  private updateBeneficio(id: number, formValue: BeneficioFormValue) {
    const updateRequest: UpdateBeneficioRequest = {
      nome: formValue.nome.trim(),
      descricao: formValue.descricao?.trim(),
      valorInicial: formValue.valorInicial
    };

    return this.beneficioService.atualizar(id, updateRequest);
  }

  private createBeneficio(formValue: BeneficioFormValue) {
    const createRequest: CreateBeneficioRequest = {
      nome: formValue.nome.trim(),
      descricao: formValue.descricao?.trim(),
      valorInicial: formValue.valorInicial
    };

    return this.beneficioService.criar(createRequest);
  }

  // 🚫 Enhanced navigation
  onCancel(): void {
    if (this.hasUnsavedChanges()) {
      const confirmMessage = 'Você tem alterações não salvas. Tem certeza que deseja sair?';
      if (confirm(confirmMessage)) {
        this.router.navigate(['/beneficios']);
      }
    } else {
      this.router.navigate(['/beneficios']);
    }
  }

  // 🎛️ Advanced form control methods
  formatarValor(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = this.formatBrazilianCurrency(input.value);
    input.value = formatted;
    
    const numericValue = this.parseToNumber(formatted);
    if (numericValue !== null) {
      this.beneficioForm.controls.valorInicial.setValue(numericValue, { 
        emitEvent: false 
      });
    }
  }

  private formatBrazilianCurrency(value: string): string {
    // Remove tudo exceto números e vírgula
    let cleaned = value.replace(/[^\d,]/g, '');
    
    // Permite apenas uma vírgula
    const parts = cleaned.split(',');
    if (parts.length > 2) {
      cleaned = parts[0] + ',' + parts[1];
    }
    
    // Limita a 2 casas decimais após a vírgula
    if (parts[1] && parts[1].length > 2) {
      cleaned = parts[0] + ',' + parts[1].substring(0, 2);
    }
    
    return cleaned;
  }

  private parseToNumber(value: string): number | null {
    if (!value || value.trim() === '') return null;
    
    const cleanValue = value.replace(/\s/g, '').replace(',', '.');
    const numericValue = parseFloat(cleanValue);
    
    return isNaN(numericValue) ? null : numericValue;
  }

  private markAllAsTouched(): void {
    Object.values(this.beneficioForm.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof AbstractControl) {
        control.updateValueAndValidity();
      }
    });
  }

  // 🎯 Getters para template
  get nomeControl() { return this.beneficioForm.controls.nome; }
  get descricaoControl() { return this.beneficioForm.controls.descricao; }
  get valorControl() { return this.beneficioForm.controls.valorInicial; }
}