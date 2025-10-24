import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BeneficioService } from '@core/services';
import { Beneficio, CreateBeneficioRequest, UpdateBeneficioRequest } from '@core/models';
import { LoadingComponent, ErrorMessageComponent } from '@shared/components';

@Component({
  selector: 'bip-beneficio-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="bip-page-container">
      <!-- Page Header -->
      <div class="bip-page-header">
        <div class="bip-header-content">
          <h1 class="bip-page-title">
            <mat-icon class="bip-page-icon">{{ isEditMode ? 'edit' : 'add' }}</mat-icon>
            {{ isEditMode ? 'Editar Benefício' : 'Novo Benefício' }}
          </h1>
          <p class="bip-page-subtitle">
            {{ isEditMode ? 'Atualize as informações do benefício' : 'Preencha as informações para criar um novo benefício' }}
          </p>
        </div>
        
        <div class="bip-page-actions">
          <button mat-stroked-button (click)="onCancel()" class="bip-btn-secondary">
            <mat-icon>arrow_back</mat-icon>
            Voltar
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="(beneficioService.loading$ | async)?.loading" class="bip-loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>{{ isEditMode ? 'Carregando benefício...' : 'Processando...' }}</p>
      </div>

      <!-- Error State -->
      <div *ngIf="(beneficioService.loading$ | async)?.error" class="bip-message-container error">
        <mat-icon>error_outline</mat-icon>
        <div>
          <h3>Erro no formulário</h3>
          <p>{{ (beneficioService.loading$ | async)?.error }}</p>
        </div>
      </div>

      <!-- Form Content -->
      <div class="bip-form-layout" *ngIf="!(beneficioService.loading$ | async)?.loading">
        <!-- Main Form -->
        <div class="bip-form-container">
          <mat-card class="bip-card-form">
            <mat-card-header>
              <mat-card-title>Informações do Benefício</mat-card-title>
              <mat-card-subtitle>Preencha todos os campos obrigatórios</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <form [formGroup]="beneficioForm" (ngSubmit)="onSubmit()" novalidate>
                
                <!-- Nome -->
                <div class="bip-form-group">
                  <mat-form-field class="bip-form-field" appearance="outline">
                    <mat-label>Nome do Benefício *</mat-label>
                    <input 
                      matInput 
                      formControlName="nome"
                      placeholder="Ex: Vale Alimentação, Auxílio Transporte"
                      maxlength="100"
                      #nomeInput>
                    <mat-icon matSuffix>card_giftcard</mat-icon>
                    <mat-hint align="end">{{ nomeInput.value.length || 0 }}/100</mat-hint>
                    <mat-error *ngIf="beneficioForm.get('nome')?.hasError('required')">
                      Nome é obrigatório
                    </mat-error>
                    <mat-error *ngIf="beneficioForm.get('nome')?.hasError('minlength')">
                      Nome deve ter pelo menos 3 caracteres
                    </mat-error>
                    <mat-error *ngIf="beneficioForm.get('nome')?.hasError('maxlength')">
                      Nome não pode ter mais que 100 caracteres
                    </mat-error>
                  </mat-form-field>
                </div>

                <!-- Valor Inicial -->
                <div class="bip-form-group">
                  <mat-form-field class="bip-form-field" appearance="outline">
                    <mat-label>Valor Inicial *</mat-label>
                    <input 
                      matInput 
                      type="number"
                      formControlName="valorInicial"
                      placeholder="0,00"
                      step="0.01"
                      min="0">
                    <span matTextPrefix>R$ </span>
                    <mat-icon matSuffix>attach_money</mat-icon>
                    <mat-hint>Valor deve ser maior ou igual a zero</mat-hint>
                    <mat-error *ngIf="beneficioForm.get('valorInicial')?.hasError('required')">
                      Valor é obrigatório
                    </mat-error>
                    <mat-error *ngIf="beneficioForm.get('valorInicial')?.hasError('min')">
                      Valor deve ser maior ou igual a zero
                    </mat-error>
                  </mat-form-field>
                </div>

                <!-- Descrição -->
                <div class="bip-form-group">
                  <mat-form-field class="bip-form-field" appearance="outline">
                    <mat-label>Descrição (Opcional)</mat-label>
                    <textarea 
                      matInput 
                      formControlName="descricao"
                      placeholder="Descreva o benefício, suas características ou condições de uso..."
                      rows="4"
                      maxlength="500"
                      #descricaoInput>
                    </textarea>
                    <mat-icon matSuffix>description</mat-icon>
                    <mat-hint align="end">{{ descricaoInput.value.length || 0 }}/500</mat-hint>
                    <mat-error *ngIf="beneficioForm.get('descricao')?.hasError('maxlength')">
                      Descrição não pode ter mais que 500 caracteres
                    </mat-error>
                  </mat-form-field>
                </div>

              </form>
            </mat-card-content>

            <!-- Form Actions -->
            <mat-card-actions class="bip-form-actions">
              <button 
                type="button" 
                mat-stroked-button 
                (click)="onCancel()"
                [disabled]="(beneficioService.loading$ | async)?.loading"
                class="bip-btn-secondary">
                <mat-icon>cancel</mat-icon>
                Cancelar
              </button>

              <button 
                type="submit" 
                mat-raised-button 
                color="primary"
                (click)="onSubmit()"
                [disabled]="beneficioForm.invalid || (beneficioService.loading$ | async)?.loading"
                class="bip-btn-primary">
                <mat-icon>{{ isEditMode ? 'save' : 'add' }}</mat-icon>
                {{ isEditMode ? 'Atualizar' : 'Criar' }} Benefício
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- Preview Sidebar -->
        <div class="bip-preview-container" *ngIf="beneficioForm.value.nome">
          <mat-card class="bip-preview-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>preview</mat-icon>
                Prévia do Benefício
              </mat-card-title>
              <mat-card-subtitle>Como ficará após salvar</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <div class="bip-preview-content">
                <!-- Preview Header -->
                <div class="bip-preview-header">
                  <div class="bip-preview-avatar">
                    <mat-icon>card_giftcard</mat-icon>
                  </div>
                  <div class="bip-preview-title">
                    <h3>{{ beneficioForm.value.nome || 'Nome do benefício' }}</h3>
                    <span class="bip-preview-id">{{ isEditMode ? '#' + beneficioId : 'Novo benefício' }}</span>
                  </div>
                </div>

                <!-- Preview Details -->
                <div class="bip-preview-details">
                  <div class="bip-preview-item">
                    <mat-icon class="bip-preview-icon">account_balance_wallet</mat-icon>
                    <div class="bip-preview-text">
                      <label>Saldo Inicial</label>
                      <p class="bip-preview-valor">{{ beneficioForm.value.valorInicial | currency:'BRL':'symbol':'1.2-2' }}</p>
                    </div>
                  </div>

                  <div class="bip-preview-item" *ngIf="beneficioForm.value.descricao">
                    <mat-icon class="bip-preview-icon">description</mat-icon>
                    <div class="bip-preview-text">
                      <label>Descrição</label>
                      <p>{{ beneficioForm.value.descricao }}</p>
                    </div>
                  </div>

                  <div class="bip-preview-item" *ngIf="!beneficioForm.value.descricao">
                    <mat-icon class="bip-preview-icon">info</mat-icon>
                    <div class="bip-preview-text">
                      <label>Descrição</label>
                      <p class="bip-text-muted">Nenhuma descrição fornecida</p>
                    </div>
                  </div>
                </div>

                <!-- Preview Actions -->
                <div class="bip-preview-actions">
                  <small class="bip-text-muted">
                    {{ isEditMode ? 'As alterações serão aplicadas após salvar' : 'O benefício será criado com essas informações' }}
                  </small>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bip-page-container {
      padding: var(--bip-spacing-lg);
      max-width: 1400px;
      margin: 0 auto;
    }

    .bip-page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--bip-spacing-xl);
      flex-wrap: wrap;
      gap: var(--bip-spacing-md);
    }

    .bip-header-content {
      flex: 1;
    }

    .bip-page-title {
      display: flex;
      align-items: center;
      gap: var(--bip-spacing-sm);
      margin: 0;
      font-size: 2rem;
      font-weight: var(--bip-font-weight-bold);
      color: var(--bip-grey-800);
    }

    .bip-page-icon {
      font-size: 2rem !important;
      width: 2rem !important;
      height: 2rem !important;
      color: var(--bip-primary-500);
    }

    .bip-page-subtitle {
      margin: var(--bip-spacing-xs) 0 0 0;
      color: var(--bip-grey-600);
      font-size: 1rem;
    }

    .bip-page-actions {
      display: flex;
      gap: var(--bip-spacing-sm);
      align-items: center;
    }

    .bip-form-layout {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: var(--bip-spacing-xl);
      align-items: start;
    }

    .bip-form-container {
      min-width: 0;
    }

    .bip-card-form {
      box-shadow: var(--bip-shadow-md);
      border: 1px solid var(--bip-grey-200);
    }

    .mat-mdc-card-header {
      background: var(--bip-gradient-background);
      border-radius: var(--bip-border-radius-lg) var(--bip-border-radius-lg) 0 0;
      margin: calc(-1 * var(--bip-spacing-lg));
      margin-bottom: var(--bip-spacing-lg);
      padding: var(--bip-spacing-lg);
    }

    .mat-mdc-card-title {
      font-weight: var(--bip-font-weight-semibold);
      color: var(--bip-grey-800);
      margin: 0;
    }

    .mat-mdc-card-subtitle {
      color: var(--bip-grey-600);
      margin: var(--bip-spacing-xs) 0 0 0;
    }

    .bip-form-group {
      margin-bottom: var(--bip-spacing-lg);
    }

    .bip-form-field {
      width: 100%;
    }

    .bip-form-actions {
      display: flex;
      gap: var(--bip-spacing-md);
      justify-content: flex-end;
      align-items: center;
      border-top: 1px solid var(--bip-grey-200);
      margin-top: var(--bip-spacing-lg);
      padding-top: var(--bip-spacing-lg);
    }

    .bip-preview-container {
      position: sticky;
      top: var(--bip-spacing-lg);
    }

    .bip-preview-card {
      box-shadow: var(--bip-shadow-md);
      border: 1px solid var(--bip-grey-200);
    }

    .bip-preview-content {
      display: flex;
      flex-direction: column;
      gap: var(--bip-spacing-lg);
    }

    .bip-preview-header {
      display: flex;
      align-items: center;
      gap: var(--bip-spacing-md);
      padding: var(--bip-spacing-md);
      background: var(--bip-gradient-background);
      border-radius: var(--bip-border-radius-md);
    }

    .bip-preview-avatar {
      width: 48px;
      height: 48px;
      border-radius: var(--bip-border-radius-md);
      background: var(--bip-primary-100);
      color: var(--bip-primary-600);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon {
        font-size: 24px !important;
        width: 24px !important;
        height: 24px !important;
      }
    }

    .bip-preview-title {
      flex: 1;
      min-width: 0;

      h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: var(--bip-font-weight-semibold);
        color: var(--bip-grey-800);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .bip-preview-id {
        font-size: 0.875rem;
        color: var(--bip-grey-600);
      }
    }

    .bip-preview-details {
      display: flex;
      flex-direction: column;
      gap: var(--bip-spacing-md);
    }

    .bip-preview-item {
      display: flex;
      align-items: flex-start;
      gap: var(--bip-spacing-sm);
      padding: var(--bip-spacing-sm);
      border-radius: var(--bip-border-radius-md);
      background: var(--bip-grey-50);
    }

    .bip-preview-icon {
      color: var(--bip-grey-500);
      margin-top: 2px;
      flex-shrink: 0;
    }

    .bip-preview-text {
      flex: 1;
      min-width: 0;

      label {
        font-size: 0.75rem;
        color: var(--bip-grey-600);
        text-transform: uppercase;
        font-weight: var(--bip-font-weight-medium);
        letter-spacing: 0.5px;
        margin-bottom: var(--bip-spacing-xs);
        display: block;
      }

      p {
        margin: 0;
        color: var(--bip-grey-800);
        line-height: 1.4;
        word-wrap: break-word;

        &.bip-preview-valor {
          font-size: 1.25rem;
          font-weight: var(--bip-font-weight-bold);
          color: var(--bip-success-600);
        }
      }
    }

    .bip-preview-actions {
      padding: var(--bip-spacing-md);
      background: var(--bip-grey-50);
      border-radius: var(--bip-border-radius-md);
      border: 1px dashed var(--bip-grey-300);
      text-align: center;

      small {
        font-size: 0.75rem;
        line-height: 1.4;
      }
    }

    .bip-loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--bip-spacing-xxl);
      text-align: center;

      p {
        margin: var(--bip-spacing-md) 0 0 0;
        color: var(--bip-grey-600);
      }
    }

    .bip-message-container {
      display: flex;
      align-items: center;
      gap: var(--bip-spacing-md);
      padding: var(--bip-spacing-lg);
      border-radius: var(--bip-border-radius-md);
      margin: var(--bip-spacing-lg) 0;

      &.error {
        background: var(--bip-error-50);
        border: 1px solid var(--bip-error-200);
        color: var(--bip-error-800);

        mat-icon {
          color: var(--bip-error-600);
        }
      }

      h3 {
        margin: 0 0 var(--bip-spacing-xs) 0;
        font-size: 1rem;
        font-weight: var(--bip-font-weight-medium);
      }

      p {
        margin: 0;
        font-size: 0.875rem;
      }
    }

    .bip-text-muted {
      color: var(--bip-grey-500) !important;
      font-style: italic;
    }

    /* Mobile Responsive */
    @media (max-width: 1024px) {
      .bip-form-layout {
        grid-template-columns: 1fr;
        gap: var(--bip-spacing-lg);
      }

      .bip-preview-container {
        position: static;
        order: -1;
      }
    }

    @media (max-width: 768px) {
      .bip-page-container {
        padding: var(--bip-spacing-md);
      }

      .bip-page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .bip-page-actions {
        justify-content: center;
      }

      .bip-form-actions {
        flex-direction: column;
        gap: var(--bip-spacing-sm);

        button {
          width: 100%;
        }
      }

      .bip-preview-header {
        flex-direction: column;
        text-align: center;
        gap: var(--bip-spacing-sm);
      }

      .bip-preview-title h3 {
        white-space: normal;
      }
    }

    @media (max-width: 480px) {
      .bip-page-container {
        padding: var(--bip-spacing-sm);
      }

      .mat-mdc-card-header {
        margin: calc(-1 * var(--bip-spacing-md));
        margin-bottom: var(--bip-spacing-md);
        padding: var(--bip-spacing-md);
      }
    }

    /* Form field enhancements */
    .mat-mdc-form-field {
      .mat-mdc-form-field-outline {
        transition: var(--bip-transition-normal);
      }

      &.mat-focused .mat-mdc-form-field-outline-thick {
        border-color: var(--bip-primary-500);
        border-width: 2px;
      }

      &.mat-form-field-invalid .mat-mdc-form-field-outline-thick {
        border-color: var(--bip-error-500);
      }

      .mat-mdc-form-field-hint,
      .mat-mdc-form-field-error {
        font-size: 0.75rem;
      }

      .mat-mdc-form-field-hint {
        color: var(--bip-grey-600);
      }

      .mat-mdc-form-field-error {
        color: var(--bip-error-600);
      }
    }

    /* Animation enhancements */
    .bip-preview-card {
      animation: slideInRight 0.3s ease-out;
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .bip-preview-item {
      transition: var(--bip-transition-normal);

      &:hover {
        background: var(--bip-grey-100);
        transform: translateX(2px);
      }
    }
  `]
})
export class BeneficioFormComponent implements OnInit, OnDestroy {
  beneficioForm: FormGroup;
  isEditMode = false;
  beneficioId?: number;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    public beneficioService: BeneficioService
  ) {
    this.beneficioForm = this.createForm();
  }

  ngOnInit(): void {
    // Verifica se é modo de edição
    this.beneficioId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.beneficioId && !isNaN(this.beneficioId);

    if (this.isEditMode) {
      this.loadBeneficio();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nome: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      descricao: ['', [Validators.maxLength(500)]],
      valorInicial: [0, [
        Validators.required,
        Validators.min(0)
      ]]
    });
  }

  private loadBeneficio(): void {
    if (!this.beneficioId) return;

    this.beneficioService.buscarPorId(this.beneficioId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (beneficio: Beneficio) => {
          this.beneficioForm.patchValue({
            nome: beneficio.nome,
            descricao: beneficio.descricao || '',
            valorInicial: beneficio.saldo
          });
        },
        error: (error) => {
          this.snackBar.open(error || 'Erro ao carregar benefício', 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.router.navigate(['/beneficios']);
        }
      });
  }

  onSubmit(): void {
    if (this.beneficioForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.beneficioForm.value;

    if (this.isEditMode) {
      this.updateBeneficio(formValue);
    } else {
      this.createBeneficio(formValue);
    }
  }

  private createBeneficio(formValue: any): void {
    const request: CreateBeneficioRequest = {
      nome: formValue.nome.trim(),
      descricao: formValue.descricao?.trim() || undefined,
      valorInicial: Number(formValue.valorInicial)
    };

    this.beneficioService.criar(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (beneficio: Beneficio) => {
          this.snackBar.open('Benefício criado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/beneficios']);
        },
        error: (error) => {
          this.snackBar.open(error || 'Erro ao criar benefício', 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  private updateBeneficio(formValue: any): void {
    if (!this.beneficioId) return;

    const request: UpdateBeneficioRequest = {
      nome: formValue.nome.trim(),
      descricao: formValue.descricao?.trim() || undefined,
      valorInicial: Number(formValue.valorInicial)
    };

    this.beneficioService.atualizar(this.beneficioId, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (beneficio: Beneficio) => {
          this.snackBar.open('Benefício atualizado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/beneficios']);
        },
        error: (error) => {
          this.snackBar.open(error || 'Erro ao atualizar benefício', 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/beneficios']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.beneficioForm.controls).forEach(key => {
      const control = this.beneficioForm.get(key);
      control?.markAsTouched();
    });
  }
}