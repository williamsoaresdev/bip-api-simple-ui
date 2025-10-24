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
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TransferenciaService, BeneficioService } from '@core/services';
import { CreateTransferenciaRequest, TransferenciaResponse, ValidacaoTransferenciaResponse, TaxaTransferenciaResponse, Beneficio } from '@core/models';
import { LoadingComponent, ErrorMessageComponent } from '@shared/components';

@Component({
  selector: 'bip-transferencia-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="bip-page-container">
      <!-- Page Header -->
      <div class="bip-page-header">
        <div class="bip-header-content">
          <h1 class="bip-page-title">
            <mat-icon class="bip-page-icon">swap_horiz</mat-icon>
            Nova Transferência
          </h1>
          <p class="bip-page-subtitle">Realize uma transferência segura entre benefícios</p>
        </div>
        
        <div class="bip-page-actions">
          <button mat-stroked-button (click)="onCancel()" class="bip-btn-secondary">
            <mat-icon>arrow_back</mat-icon>
            Voltar
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="(transferenciaService.loading$ | async)?.loading" class="bip-loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Processando transferência...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="(transferenciaService.loading$ | async)?.error" class="bip-message-container error">
        <mat-icon>error_outline</mat-icon>
        <div>
          <h3>Erro na transferência</h3>
          <p>{{ (transferenciaService.loading$ | async)?.error }}</p>
        </div>
      </div>

      <!-- Form Content -->
      <div class="bip-form-layout" *ngIf="!(transferenciaService.loading$ | async)?.loading">
        <!-- Main Form -->
        <div class="bip-form-container">
          <mat-card class="bip-card-form">
            <mat-card-header>
              <mat-card-title>Dados da Transferência</mat-card-title>
              <mat-card-subtitle>Preencha as informações para realizar a transferência</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <form [formGroup]="transferenciaForm" (ngSubmit)="onSubmit()" novalidate>
                
                <!-- Benefício de Origem -->
                <div class="bip-form-group">
                  <mat-form-field class="bip-form-field" appearance="outline">
                    <mat-label>Benefício de Origem *</mat-label>
                    <mat-select formControlName="beneficioOrigemId" (selectionChange)="onBeneficioOrigemChange($event.value)">
                      <mat-option *ngFor="let beneficio of beneficiosAtivos" [value]="beneficio.id">
                        <div class="bip-option-content">
                          <span class="bip-option-name">{{ beneficio.nome }}</span>
                          <span class="bip-option-saldo">{{ beneficio.saldo | currency:'BRL':'symbol':'1.2-2' }}</span>
                        </div>
                      </mat-option>
                    </mat-select>
                    <mat-icon matSuffix>account_balance_wallet</mat-icon>
                    <mat-hint>Benefício que será debitado</mat-hint>
                    <mat-error *ngIf="transferenciaForm.get('beneficioOrigemId')?.hasError('required')">
                      Selecione o benefício de origem
                    </mat-error>
                  </mat-form-field>
                </div>

                <!-- Benefício de Destino -->
                <div class="bip-form-group">
                  <mat-form-field class="bip-form-field" appearance="outline">
                    <mat-label>Benefício de Destino *</mat-label>
                    <mat-select formControlName="beneficioDestinoId" (selectionChange)="onBeneficioDestinoChange($event.value)">
                      <mat-option *ngFor="let beneficio of beneficiosDestino" [value]="beneficio.id">
                        <div class="bip-option-content">
                          <span class="bip-option-name">{{ beneficio.nome }}</span>
                          <span class="bip-option-saldo">{{ beneficio.saldo | currency:'BRL':'symbol':'1.2-2' }}</span>
                        </div>
                      </mat-option>
                    </mat-select>
                    <mat-icon matSuffix>card_giftcard</mat-icon>
                    <mat-hint>Benefício que receberá o valor</mat-hint>
                    <mat-error *ngIf="transferenciaForm.get('beneficioDestinoId')?.hasError('required')">
                      Selecione o benefício de destino
                    </mat-error>
                  </mat-form-field>
                </div>

                <!-- Valor da Transferência -->
                <div class="bip-form-group">
                  <mat-form-field class="bip-form-field" appearance="outline">
                    <mat-label>Valor da Transferência *</mat-label>
                    <input 
                      matInput 
                      type="number"
                      formControlName="valor"
                      placeholder="0,00"
                      step="0.01"
                      min="0"
                      [max]="valorMaximo">
                    <span matTextPrefix>R$ </span>
                    <mat-icon matSuffix>payments</mat-icon>
                    <mat-hint>Valor máximo: {{ valorMaximo | currency:'BRL':'symbol':'1.2-2' }}</mat-hint>
                    <mat-error *ngIf="transferenciaForm.get('valor')?.hasError('required')">
                      Valor é obrigatório
                    </mat-error>
                    <mat-error *ngIf="transferenciaForm.get('valor')?.hasError('min')">
                      Valor deve ser maior que zero
                    </mat-error>
                    <mat-error *ngIf="transferenciaForm.get('valor')?.hasError('max')">
                      Valor não pode exceder o saldo do benefício de origem
                    </mat-error>
                  </mat-form-field>
                </div>

                <!-- Descrição (opcional) -->
                <div class="bip-form-group">
                  <mat-form-field class="bip-form-field" appearance="outline">
                    <mat-label>Descrição (Opcional)</mat-label>
                    <textarea 
                      matInput 
                      formControlName="descricao"
                      placeholder="Descreva o motivo ou finalidade da transferência..."
                      rows="3"
                      maxlength="200"
                      #descricaoInput>
                    </textarea>
                    <mat-icon matSuffix>description</mat-icon>
                    <mat-hint align="end">{{ descricaoInput.value.length || 0 }}/200</mat-hint>
                  </mat-form-field>
                </div>

                <!-- Botão Calcular Taxa -->
                <div class="bip-action-row" *ngIf="transferenciaForm.get('valor')?.value > 0">
                  <button 
                    type="button" 
                    mat-stroked-button 
                    color="accent"
                    (click)="calcularTaxa()"
                    [disabled]="(transferenciaService.loading$ | async)?.loading"
                    class="bip-btn-accent">
                    <mat-icon>calculate</mat-icon>
                    Calcular Taxa
                  </button>
                </div>

              </form>
            </mat-card-content>

            <!-- Form Actions -->
            <mat-card-actions class="bip-form-actions">
              <button 
                type="button" 
                mat-stroked-button 
                (click)="onCancel()"
                [disabled]="(transferenciaService.loading$ | async)?.loading"
                class="bip-btn-secondary">
                <mat-icon>cancel</mat-icon>
                Cancelar
              </button>

              <button 
                type="button" 
                mat-raised-button 
                color="accent"
                (click)="validarTransferencia()"
                [disabled]="transferenciaForm.invalid || (transferenciaService.loading$ | async)?.loading"
                class="bip-btn-accent">
                <mat-icon>check_circle</mat-icon>
                Validar
              </button>

              <button 
                type="submit" 
                mat-raised-button 
                color="primary"
                (click)="onSubmit()"
                [disabled]="transferenciaForm.invalid || !validacaoInfo?.valida || (transferenciaService.loading$ | async)?.loading"
                class="bip-btn-primary">
                <mat-icon>send</mat-icon>
                Realizar Transferência
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- Info Sidebar -->
        <div class="bip-info-container">
          <!-- Informações da Taxa -->
          <mat-card class="bip-info-card" *ngIf="taxaInfo && transferenciaForm.get('valor')?.value > 0">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>calculate</mat-icon>
                Informações da Taxa
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="bip-taxa-details">
                <div class="bip-taxa-item">
                  <label>Valor Original</label>
                  <span class="bip-taxa-valor">{{ taxaInfo.valorOriginal | currency:'BRL':'symbol':'1.2-2' }}</span>
                </div>
                <div class="bip-taxa-item">
                  <label>Taxa Aplicada</label>
                  <span class="bip-taxa-valor warning">{{ taxaInfo.taxa | currency:'BRL':'symbol':'1.2-2' }}</span>
                </div>
                <div class="bip-taxa-item total">
                  <label>Valor Final</label>
                  <span class="bip-taxa-valor-final">{{ taxaInfo.valorComTaxa | currency:'BRL':'symbol':'1.2-2' }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Validação -->
          <mat-card class="bip-info-card" *ngIf="validacaoInfo">
            <mat-card-content>
              <div class="bip-validacao-status" [class]="validacaoInfo.valida ? 'success' : 'error'">
                <mat-icon>{{ validacaoInfo.valida ? 'check_circle' : 'error' }}</mat-icon>
                <div class="bip-validacao-text">
                  <h4>{{ validacaoInfo.valida ? 'Transferência Válida' : 'Transferência Inválida' }}</h4>
                  <p *ngIf="validacaoInfo.valida">Pode prosseguir com segurança</p>
                  <p *ngIf="!validacaoInfo.valida">{{ validacaoInfo.motivo || 'Verifique os dados informados' }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Resumo da Transferência -->
          <mat-card class="bip-info-card bip-resumo-card" *ngIf="transferenciaForm.valid && beneficioOrigemSelecionado && beneficioDestinoSelecionado">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>preview</mat-icon>
                Resumo da Transferência
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="bip-resumo-content">
                <div class="bip-resumo-flow">
                  <div class="bip-resumo-beneficio origem">
                    <mat-icon>account_balance_wallet</mat-icon>
                    <div class="bip-resumo-info">
                      <label>De</label>
                      <h4>{{ beneficioOrigemSelecionado.nome }}</h4>
                      <span>{{ beneficioOrigemSelecionado.saldo | currency:'BRL':'symbol':'1.2-2' }}</span>
                    </div>
                  </div>

                  <div class="bip-resumo-arrow">
                    <mat-icon>arrow_forward</mat-icon>
                    <div class="bip-resumo-valor">
                      {{ transferenciaForm.value.valor | currency:'BRL':'symbol':'1.2-2' }}
                    </div>
                  </div>

                  <div class="bip-resumo-beneficio destino">
                    <mat-icon>card_giftcard</mat-icon>
                    <div class="bip-resumo-info">
                      <label>Para</label>
                      <h4>{{ beneficioDestinoSelecionado.nome }}</h4>
                      <span>{{ beneficioDestinoSelecionado.saldo | currency:'BRL':'symbol':'1.2-2' }}</span>
                    </div>
                  </div>
                </div>

                <div class="bip-resumo-details" *ngIf="transferenciaForm.value.descricao">
                  <mat-icon>description</mat-icon>
                  <div>
                    <label>Descrição</label>
                    <p>{{ transferenciaForm.value.descricao }}</p>
                  </div>
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
      display: flex;
      align-items: center;
      gap: var(--bip-spacing-sm);
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

    .bip-option-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .bip-option-name {
        flex: 1;
        font-weight: var(--bip-font-weight-medium);
      }

      .bip-option-saldo {
        color: var(--bip-success-600);
        font-weight: var(--bip-font-weight-semibold);
        font-size: 0.875rem;
      }
    }

    .bip-action-row {
      display: flex;
      justify-content: center;
      margin: var(--bip-spacing-lg) 0;
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

    .bip-info-container {
      position: sticky;
      top: var(--bip-spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--bip-spacing-lg);
    }

    .bip-info-card {
      box-shadow: var(--bip-shadow-md);
      border: 1px solid var(--bip-grey-200);
    }

    .bip-taxa-details {
      display: flex;
      flex-direction: column;
      gap: var(--bip-spacing-md);
    }

    .bip-taxa-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--bip-spacing-sm);
      border-radius: var(--bip-border-radius-md);
      background: var(--bip-grey-50);

      &.total {
        background: var(--bip-gradient-background);
        border: 2px solid var(--bip-primary-200);
        font-weight: var(--bip-font-weight-semibold);
      }

      label {
        font-size: 0.875rem;
        color: var(--bip-grey-600);
        font-weight: var(--bip-font-weight-medium);
      }

      .bip-taxa-valor {
        color: var(--bip-grey-800);
        font-weight: var(--bip-font-weight-semibold);

        &.warning {
          color: var(--bip-warning-600);
        }
      }

      .bip-taxa-valor-final {
        font-size: 1.125rem;
        font-weight: var(--bip-font-weight-bold);
        color: var(--bip-primary-600);
      }
    }

    .bip-validacao-status {
      display: flex;
      align-items: center;
      gap: var(--bip-spacing-md);
      padding: var(--bip-spacing-lg);
      border-radius: var(--bip-border-radius-md);

      &.success {
        background: var(--bip-success-50);
        border: 2px solid var(--bip-success-200);
        color: var(--bip-success-800);

        mat-icon {
          color: var(--bip-success-600);
        }
      }

      &.error {
        background: var(--bip-error-50);
        border: 2px solid var(--bip-error-200);
        color: var(--bip-error-800);

        mat-icon {
          color: var(--bip-error-600);
        }
      }

      .bip-validacao-text {
        flex: 1;

        h4 {
          margin: 0 0 var(--bip-spacing-xs) 0;
          font-size: 1rem;
          font-weight: var(--bip-font-weight-semibold);
        }

        p {
          margin: 0;
          font-size: 0.875rem;
          opacity: 0.9;
        }
      }
    }

    .bip-resumo-card {
      background: var(--bip-gradient-background);
      border: 2px solid var(--bip-primary-200);
    }

    .bip-resumo-content {
      display: flex;
      flex-direction: column;
      gap: var(--bip-spacing-lg);
    }

    .bip-resumo-flow {
      display: flex;
      flex-direction: column;
      gap: var(--bip-spacing-md);
      align-items: center;
    }

    .bip-resumo-beneficio {
      display: flex;
      align-items: center;
      gap: var(--bip-spacing-sm);
      padding: var(--bip-spacing-md);
      background: white;
      border-radius: var(--bip-border-radius-md);
      box-shadow: var(--bip-shadow-sm);
      width: 100%;

      &.origem {
        border-left: 4px solid var(--bip-primary-500);
      }

      &.destino {
        border-left: 4px solid var(--bip-accent-500);
      }

      mat-icon {
        color: var(--bip-grey-600);
      }

      .bip-resumo-info {
        flex: 1;

        label {
          font-size: 0.75rem;
          color: var(--bip-grey-600);
          text-transform: uppercase;
          font-weight: var(--bip-font-weight-medium);
          letter-spacing: 0.5px;
          margin-bottom: var(--bip-spacing-xs);
          display: block;
        }

        h4 {
          margin: 0;
          font-size: 0.875rem;
          font-weight: var(--bip-font-weight-semibold);
          color: var(--bip-grey-800);
        }

        span {
          font-size: 0.75rem;
          color: var(--bip-success-600);
          font-weight: var(--bip-font-weight-medium);
        }
      }
    }

    .bip-resumo-arrow {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--bip-spacing-xs);

      mat-icon {
        color: var(--bip-primary-500);
        font-size: 2rem !important;
        width: 2rem !important;
        height: 2rem !important;
      }

      .bip-resumo-valor {
        font-size: 1.125rem;
        font-weight: var(--bip-font-weight-bold);
        color: var(--bip-primary-600);
        background: white;
        padding: var(--bip-spacing-xs) var(--bip-spacing-sm);
        border-radius: var(--bip-border-radius-full);
        border: 2px solid var(--bip-primary-200);
      }
    }

    .bip-resumo-details {
      display: flex;
      align-items: flex-start;
      gap: var(--bip-spacing-sm);
      padding: var(--bip-spacing-md);
      background: white;
      border-radius: var(--bip-border-radius-md);
      box-shadow: var(--bip-shadow-sm);

      mat-icon {
        color: var(--bip-grey-500);
        margin-top: 2px;
      }

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
        font-size: 0.875rem;
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

    /* Mobile Responsive */
    @media (max-width: 1024px) {
      .bip-form-layout {
        grid-template-columns: 1fr;
        gap: var(--bip-spacing-lg);
      }

      .bip-info-container {
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

      .bip-resumo-flow {
        gap: var(--bip-spacing-sm);
      }

      .bip-resumo-arrow mat-icon {
        font-size: 1.5rem !important;
        width: 1.5rem !important;
        height: 1.5rem !important;
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
    .bip-info-card {
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

    .bip-resumo-beneficio {
      transition: var(--bip-transition-normal);

      &:hover {
        transform: translateX(2px);
        box-shadow: var(--bip-shadow-md);
      }
    }
  `]
})
export class TransferenciaFormComponent implements OnInit, OnDestroy {
  transferenciaForm: FormGroup;
  
  beneficiosAtivos: Beneficio[] = [];
  beneficiosDestino: Beneficio[] = [];
  beneficioOrigemSelecionado?: Beneficio;
  beneficioDestinoSelecionado?: Beneficio;
  valorMaximo = 0;
  
  taxaInfo?: TaxaTransferenciaResponse;
  validacaoInfo?: ValidacaoTransferenciaResponse;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    public transferenciaService: TransferenciaService,
    private beneficioService: BeneficioService
  ) {
    this.transferenciaForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadBeneficiosAtivos();
    
    // Verifica query params para benefício pré-selecionado
    const beneficioOrigemId = this.route.snapshot.queryParamMap.get('beneficioOrigemId');
    if (beneficioOrigemId) {
      this.transferenciaForm.patchValue({ beneficioOrigemId: Number(beneficioOrigemId) });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      beneficioOrigemId: ['', [Validators.required]],
      beneficioDestinoId: ['', [Validators.required]],
      valor: [0, [
        Validators.required,
        Validators.min(0.01)
      ]],
      descricao: ['', [Validators.maxLength(200)]]
    });
  }

  private loadBeneficiosAtivos(): void {
    this.beneficioService.listarTodos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (beneficios: Beneficio[]) => {
          this.beneficiosAtivos = beneficios;
          this.atualizarBeneficiosDestino();
        },
        error: (error: string) => {
          this.snackBar.open(error || 'Erro ao carregar benefícios', 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  onBeneficioOrigemChange(beneficioId: number): void {
    this.beneficioOrigemSelecionado = this.beneficiosAtivos.find(b => b.id === beneficioId);
    if (this.beneficioOrigemSelecionado) {
      this.valorMaximo = this.beneficioOrigemSelecionado.saldo;
      this.transferenciaForm.get('valor')?.setValidators([
        Validators.required,
        Validators.min(0.01),
        Validators.max(this.valorMaximo)
      ]);
      this.transferenciaForm.get('valor')?.updateValueAndValidity();
      
      // Reset do destino para não permitir o mesmo benefício
      this.transferenciaForm.get('beneficioDestinoId')?.setValue('');
      this.atualizarBeneficiosDestino();
    }
  }

  onBeneficioDestinoChange(beneficioId: number): void {
    this.beneficioDestinoSelecionado = this.beneficiosAtivos.find(b => b.id === beneficioId);
  }

  private atualizarBeneficiosDestino(): void {
    const origemId = this.transferenciaForm.get('beneficioOrigemId')?.value;
    this.beneficiosDestino = this.beneficiosAtivos.filter(b => b.id !== origemId);
  }

  calcularTaxa(): void {
    const valor = this.transferenciaForm.get('valor')?.value;
    if (valor && valor > 0) {
      this.transferenciaService.calcularTaxa(valor)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (taxa) => {
            this.taxaInfo = taxa;
          },
          error: (error: string) => {
            console.error('Erro ao calcular taxa:', error);
          }
        });
    }
  }

  validarTransferencia(): void {
    if (this.transferenciaForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.transferenciaForm.value;
    const request: CreateTransferenciaRequest = {
      beneficioOrigemId: formValue.beneficioOrigemId,
      beneficioDestinoId: formValue.beneficioDestinoId,
      valor: Number(formValue.valor),
      descricao: formValue.descricao || undefined
    };

    this.transferenciaService.validar(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (validacao) => {
          this.validacaoInfo = validacao;
          const message = validacao.valida 
            ? 'Transferência válida! Pode prosseguir.' 
            : `Transferência inválida: ${validacao.motivo}`;
          
          this.snackBar.open(message, 'Fechar', {
            duration: 3000,
            panelClass: [validacao.valida ? 'success-snackbar' : 'error-snackbar']
          });
        },
        error: (error: string) => {
          this.snackBar.open(error || 'Erro ao validar transferência', 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  onSubmit(): void {
    if (this.transferenciaForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.transferenciaForm.value;
    this.createTransferencia(formValue);
  }

  private createTransferencia(formValue: { 
    beneficioOrigemId: number; 
    beneficioDestinoId: number; 
    valor: number; 
    descricao?: string 
  }): void {
    const request: CreateTransferenciaRequest = {
      beneficioOrigemId: formValue.beneficioOrigemId,
      beneficioDestinoId: formValue.beneficioDestinoId,
      valor: Number(formValue.valor),
      descricao: formValue.descricao || undefined
    };

    this.transferenciaService.criar(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (transferencia: TransferenciaResponse) => {
          const message = transferencia.sucesso 
            ? 'Transferência realizada com sucesso!' 
            : `Transferência falhou: ${transferencia.mensagem}`;
            
          this.snackBar.open(message, 'Fechar', {
            duration: 3000,
            panelClass: [transferencia.sucesso ? 'success-snackbar' : 'error-snackbar']
          });
          
          if (transferencia.sucesso) {
            this.router.navigate(['/transferencias']);
          }
        },
        error: (error: string) => {
          this.snackBar.open(error || 'Erro ao realizar transferência', 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/transferencias']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.transferenciaForm.controls).forEach(key => {
      const control = this.transferenciaForm.get(key);
      control?.markAsTouched();
    });
  }
}