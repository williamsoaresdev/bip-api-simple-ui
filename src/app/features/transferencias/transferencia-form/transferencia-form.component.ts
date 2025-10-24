import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Material Design Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Models and Services
import { Transferencia, CreateTransferenciaRequest } from '@core/models/transferencia.model';
import { Beneficio } from '@core/models/beneficio.model';
import { TransferenciaService } from '@core/services/transferencia.service';
import { BeneficioService } from '@core/services/beneficio.service';
import { NotificationService } from '@core/services/notification.service';

interface FormErrors {
  beneficioId?: string;
  destinatario?: string;
  valor?: string;
  observacoes?: string;
}

@Component({
  selector: 'bip-transferencia-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './transferencia-form.component.html',
  styleUrls: ['./transferencia-form.component.scss']
})
export class TransferenciaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly transferenciaService = inject(TransferenciaService);
  private readonly beneficioService = inject(BeneficioService);
  private readonly notificationService = inject(NotificationService);

  // Form signals
  readonly transferencia = signal<Transferencia | null>(null);
  readonly transferencias = signal<Transferencia[]>([]);
  readonly beneficios = signal<Beneficio[]>([]);
  readonly loading = signal(false);
  readonly loadingBeneficios = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly formErrors = signal<FormErrors>({});

  // Form group
  transferForm: FormGroup;

  // Computed properties
  readonly canSubmit = computed(() => 
    this.transferForm?.valid && !this.submitting() && !this.loading()
  );

  readonly hasErrors = computed(() => 
    Object.keys(this.formErrors()).length > 0
  );

  readonly totalValue = computed(() => {
    const valor = this.transferForm?.get('valor')?.value;
    return valor ? parseFloat(valor) : 0;
  });

  readonly selectedBeneficio = computed(() => {
    const beneficioId = this.transferForm?.get('beneficioId')?.value;
    return this.beneficios().find(b => b.id === beneficioId) || null;
  });

  readonly formattedTotalValue = computed(() => {
    const total = this.totalValue();
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(total);
  });

  readonly todayDate = computed(() => {
    return new Date().toISOString().split('T')[0];
  });

  constructor() {
    this.transferForm = this.createForm();
    this.setupFormValidation();
  }

  ngOnInit(): void {
    this.loadBeneficios();
    this.setupFormEffects();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      beneficioId: ['', [
        Validators.required
      ]],
      destinatario: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      valor: ['', [
        Validators.required,
        Validators.min(0.01),
        Validators.max(999999.99)
      ]],
      observacoes: ['', [
        Validators.maxLength(500)
      ]]
    });
  }

  private setupFormValidation(): void {
    effect(() => {
      if (this.transferForm) {
        this.validateForm();
      }
    });
  }

  private setupFormEffects(): void {
    // Form value changes effect
    effect(() => {
      if (this.transferForm) {
        this.transferForm.valueChanges.subscribe(() => {
          this.validateForm();
        });
      }
    });

    // Error handling effect
    effect(() => {
      const error = this.error();
      if (error) {
        this.notificationService.showError(error);
      }
    });
  }

  private validateForm(): void {
    const errors: FormErrors = {};

    // Validate beneficioId
    const beneficioIdControl = this.transferForm.get('beneficioId');
    if (beneficioIdControl?.invalid && beneficioIdControl?.touched) {
      if (beneficioIdControl.errors?.['required']) {
        errors.beneficioId = 'Benefício é obrigatório';
      }
    }

    // Validate destinatario
    const destinatarioControl = this.transferForm.get('destinatario');
    if (destinatarioControl?.invalid && destinatarioControl?.touched) {
      if (destinatarioControl.errors?.['required']) {
        errors.destinatario = 'Destinatário é obrigatório';
      } else if (destinatarioControl.errors?.['minlength']) {
        errors.destinatario = 'Destinatário deve ter pelo menos 2 caracteres';
      } else if (destinatarioControl.errors?.['maxlength']) {
        errors.destinatario = 'Destinatário não pode exceder 100 caracteres';
      }
    }

    // Validate valor
    const valorControl = this.transferForm.get('valor');
    if (valorControl?.invalid && valorControl?.touched) {
      if (valorControl.errors?.['required']) {
        errors.valor = 'Valor é obrigatório';
      } else if (valorControl.errors?.['min']) {
        errors.valor = 'Valor deve ser maior que R$ 0,00';
      } else if (valorControl.errors?.['max']) {
        errors.valor = 'Valor não pode exceder R$ 999.999,99';
      }
    }

    // Validate observacoes
    const observacoesControl = this.transferForm.get('observacoes');
    if (observacoesControl?.invalid && observacoesControl?.touched) {
      if (observacoesControl.errors?.['maxlength']) {
        errors.observacoes = 'Observações não podem exceder 500 caracteres';
      }
    }

    this.formErrors.set(errors);
  }

  private async loadBeneficios(): Promise<void> {
    try {
      this.loadingBeneficios.set(true);
      this.error.set(null);

      // Usando o método que existe no serviço
      this.beneficioService.loadBeneficios().subscribe({
        next: (response) => {
          this.beneficios.set(response.data);
        },
        error: (error) => {
          console.error('Erro ao carregar benefícios:', error);
          this.error.set('Erro ao carregar lista de benefícios');
        }
      });

    } catch (error) {
      console.error('Erro ao carregar benefícios:', error);
      this.error.set('Erro ao carregar lista de benefícios');
    } finally {
      this.loadingBeneficios.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.transferForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    try {
      this.submitting.set(true);
      this.error.set(null);

      const formValue = this.transferForm.value;
      const createRequest: CreateTransferenciaRequest = {
        beneficioId: formValue.beneficioId,
        destinatario: formValue.destinatario,
        valor: parseFloat(formValue.valor),
        observacoes: formValue.observacoes || undefined
      };

      this.transferenciaService.createTransferencia(createRequest).subscribe({
        next: (response) => {
          this.notificationService.showSuccess('Transferência criada com sucesso!');
          this.router.navigate(['/transferencias']);
        },
        error: (error) => {
          console.error('Erro ao criar transferência:', error);
          this.error.set('Erro ao criar transferência. Tente novamente.');
        }
      });

    } catch (error) {
      console.error('Erro ao criar transferência:', error);
      this.error.set('Erro ao criar transferência. Tente novamente.');
    } finally {
      this.submitting.set(false);
    }
  }

  onCancel(): void {
    this.router.navigate(['/transferencias']);
  }

  onRefreshBeneficios(): void {
    this.loadBeneficios();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.transferForm.controls).forEach(key => {
      this.transferForm.get(key)?.markAsTouched();
    });
    this.validateForm();
  }

  // Helper methods for template
  getFieldError(fieldName: string): string | null {
    const errors = this.formErrors();
    return errors[fieldName as keyof FormErrors] || null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.transferForm.get(fieldName);
    return !!(control?.invalid && control?.touched);
  }

  isFieldValid(fieldName: string): boolean {
    const control = this.transferForm.get(fieldName);
    return !!(control?.valid && control?.touched);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }

  getBeneficiarioInitials(nome: string): string {
    return nome
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getBeneficioInitials(nome: string): string {
    return this.getBeneficiarioInitials(nome);
  }
}