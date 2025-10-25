import { 
  Component, 
  OnInit, 
  ChangeDetectionStrategy, 
  signal, 
  computed, 
  inject,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError, Observable, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { TransferenciaService } from '../../../core/services/transferencia.service';
import { BeneficioService } from '../../../core/services/beneficio.service';
import { 
  CreateTransferenciaRequest, 
  ValidarTransferenciaRequest,
  ValidarTransferenciaResponse 
} from '../../../core/models/transferencia.model';

@Component({
  selector: 'bip-transferencia-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './transferencia-form.component.html',
  styleUrl: './transferencia-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferenciaFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transferenciaService = inject(TransferenciaService);
  private readonly beneficioService = inject(BeneficioService);
  private readonly destroy$ = new Subject<void>();

  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly validating = signal(false);
  readonly error = signal<string | null>(null);
  readonly validationResult = signal<ValidarTransferenciaResponse | null>(null);

  readonly beneficios = this.beneficioService.beneficios;
  readonly beneficiosLoading = this.beneficioService.loading;

  readonly form = this.fb.group({
    beneficioOrigemId: ['', [Validators.required]],
    beneficioDestinoId: ['', [Validators.required]],
    valor: [0, [Validators.required, Validators.min(0.01)]],
    observacoes: ['']
  });

  readonly isValidForm = computed(() => {
    return this.form.valid && !this.hasValidationErrors();
  });

  readonly hasValidationErrors = computed(() => {
    const result = this.validationResult();
    return result && !result.valida;
  });

  readonly canSubmit = computed(() => {
    return this.isValidForm() && 
           !this.submitting() && 
           !this.validating() &&
           this.validationResult()?.valida === true;
  });

  ngOnInit(): void {
    this.loadBeneficios();
    this.setupValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBeneficios(): void {
    this.beneficioService.refresh();
  }

  private setupValidation(): void {
    // Validação automática quando os campos necessários mudarem
    this.form.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((formValue) => {
          if (formValue.beneficioOrigemId && 
              formValue.beneficioDestinoId && 
              formValue.valor && formValue.valor > 0) {
            return this.validateTransferencia();
          }
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private validateTransferencia(): Observable<ValidarTransferenciaResponse | null> {
    const formValue = this.form.value;
    
    if (!formValue.beneficioOrigemId || !formValue.beneficioDestinoId || !formValue.valor) {
      return of(null);
    }

    const request: ValidarTransferenciaRequest = {
      beneficioOrigemId: Number(formValue.beneficioOrigemId),
      beneficioDestinoId: Number(formValue.beneficioDestinoId),
      valor: formValue.valor,
      descricao: formValue.observacoes || 'Transferência'
    };

    this.validating.set(true);
    this.error.set(null);

    return this.transferenciaService.validarTransferencia(request)
      .pipe(
        tap(result => {
          this.validating.set(false);
          if (result) {
            this.validationResult.set(result);
            
            if (!result.valida && result.mensagem) {
              this.error.set(result.mensagem);
            }
          }
        }),
        catchError(error => {
          console.error('Erro na validação:', error);
          this.error.set('Erro ao validar transferência');
          this.validationResult.set(null);
          this.validating.set(false);
          return of(null);
        }),
        takeUntil(this.destroy$)
      );
  }

  onValidateNow(): void {
    if (this.form.valid) {
      this.validateTransferencia().subscribe();
    }
  }

  onSubmit(): void {
    if (!this.canSubmit()) {
      return;
    }

    const formValue = this.form.value;
    const request: CreateTransferenciaRequest = {
      beneficioOrigemId: Number(formValue.beneficioOrigemId!),
      beneficioDestinoId: Number(formValue.beneficioDestinoId!),
      valor: formValue.valor!,
      descricao: formValue.observacoes || 'Transferência'
    };

    this.submitting.set(true);
    this.error.set(null);

    this.transferenciaService.createTransferencia(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.submitting.set(false);
          this.snackBar.open('Transferência criada com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          // Navegar para a lista de transferências
          this.router.navigate(['/transferencias']);
        },
        error: (error) => {
          this.submitting.set(false);
          const errorMessage = error.error?.message || error.message || 'Erro ao criar transferência';
          this.error.set(errorMessage);
          this.snackBar.open(errorMessage, 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/transferencias']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  getBeneficioDisplay(beneficioId: string): string {
    const beneficios = this.beneficios();
    const beneficio = beneficios.find(b => b.id === beneficioId);
    return beneficio ? `${beneficio.nome} (ID: ${beneficio.id})` : beneficioId;
  }

  // Validação de campos específicos
  getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);
    if (field && field.touched && field.errors) {
      if (field.errors['required']) {
        return 'Este campo é obrigatório';
      }
      if (field.errors['min']) {
        return 'Valor deve ser maior que zero';
      }
    }
    return null;
  }
}