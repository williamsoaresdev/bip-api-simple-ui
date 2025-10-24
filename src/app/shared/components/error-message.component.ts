import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

export type ErrorType = 'error' | 'warning' | 'info';

@Component({
    selector: 'bip-error-message',
    imports: [CommonModule, MatIconModule, MatButtonModule, MatCardModule],
    template: `
    <div class="bip-error-container" [ngClass]="'bip-error-' + type" [class.bip-compact]="compact">
      <!-- Card Layout -->
      <mat-card *ngIf="showCard" class="bip-error-card">
        <mat-card-content>
          <div class="bip-error-content">
            <div class="bip-error-icon-container">
              <mat-icon class="bip-error-icon">{{ getIcon() }}</mat-icon>
            </div>
            
            <div class="bip-error-text">
              <h3 *ngIf="title" class="bip-error-title">{{ title }}</h3>
              <p class="bip-error-message">{{ message }}</p>
              <p *ngIf="details" class="bip-error-details">{{ details }}</p>
              
              <!-- Error Code -->
              <div *ngIf="errorCode" class="bip-error-code">
                <span>Código: {{ errorCode }}</span>
              </div>
              
              <!-- Suggestions -->
              <div *ngIf="suggestions && suggestions.length > 0" class="bip-error-suggestions">
                <h4>Sugestões:</h4>
                <ul>
                  <li *ngFor="let suggestion of suggestions">{{ suggestion }}</li>
                </ul>
              </div>
            </div>
            
            <div *ngIf="showRetry || showContact" class="bip-error-actions">
              <button 
                *ngIf="showRetry" 
                mat-raised-button 
                color="primary" 
                (click)="onRetry()"
                [disabled]="isRetrying"
                class="bip-retry-button">
                <mat-icon>{{ isRetrying ? 'hourglass_empty' : 'refresh' }}</mat-icon>
                {{ isRetrying ? 'Tentando...' : 'Tentar Novamente' }}
              </button>
              
              <button 
                *ngIf="showContact" 
                mat-stroked-button 
                (click)="onContact()"
                class="bip-contact-button">
                <mat-icon>support_agent</mat-icon>
                Contatar Suporte
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
      
      <!-- Inline Layout -->
      <div *ngIf="!showCard" class="bip-error-inline">
        <mat-icon class="bip-error-icon">{{ getIcon() }}</mat-icon>
        <div class="bip-error-text">
          <span *ngIf="title" class="bip-error-title">{{ title }}</span>
          <span class="bip-error-message">{{ message }}</span>
        </div>
        <button 
          *ngIf="showRetry" 
          mat-icon-button 
          (click)="onRetry()"
          [disabled]="isRetrying"
          [title]="isRetrying ? 'Tentando...' : 'Tentar Novamente'">
          <mat-icon>{{ isRetrying ? 'hourglass_empty' : 'refresh' }}</mat-icon>
        </button>
      </div>
    </div>
  `,
    styles: [`
    .bip-error-container {
      margin: var(--bip-spacing-md) 0;
      animation: slideInDown 0.3s ease-out;
    }
    
    .bip-error-container.bip-compact {
      margin: var(--bip-spacing-sm) 0;
    }
    
    .bip-error-card {
      border-left: 4px solid;
      border-radius: var(--bip-border-radius-md);
      box-shadow: var(--bip-shadow-md);
      overflow: hidden;
      transition: var(--bip-transition-normal);
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: var(--bip-shadow-lg);
      }
    }
    
    .bip-error-container.bip-error-error .bip-error-card {
      border-left-color: var(--bip-error-500);
      background: linear-gradient(135deg, var(--bip-error-50), var(--bip-error-25));
    }
    
    .bip-error-container.bip-error-warning .bip-error-card {
      border-left-color: var(--bip-warning-500);
      background: linear-gradient(135deg, var(--bip-warning-50), var(--bip-warning-25));
    }
    
    .bip-error-container.bip-error-info .bip-error-card {
      border-left-color: var(--bip-info-500);
      background: linear-gradient(135deg, var(--bip-info-50), var(--bip-info-25));
    }
    
    .bip-error-content {
      display: flex;
      align-items: flex-start;
      gap: var(--bip-spacing-lg);
      padding: var(--bip-spacing-sm);
    }
    
    .bip-error-icon-container {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: var(--bip-border-radius-full);
      background: white;
      box-shadow: var(--bip-shadow-sm);
    }
    
    .bip-error-container.bip-error-error .bip-error-icon {
      color: var(--bip-error-600);
      font-size: 1.5rem !important;
      width: 1.5rem !important;
      height: 1.5rem !important;
    }
    
    .bip-error-container.bip-error-warning .bip-error-icon {
      color: var(--bip-warning-600);
      font-size: 1.5rem !important;
      width: 1.5rem !important;
      height: 1.5rem !important;
    }
    
    .bip-error-container.bip-error-info .bip-error-icon {
      color: var(--bip-info-600);
      font-size: 1.5rem !important;
      width: 1.5rem !important;
      height: 1.5rem !important;
    }
    
    .bip-error-text {
      flex: 1;
      min-width: 0;
    }
    
    .bip-error-title {
      margin: 0 0 var(--bip-spacing-sm) 0;
      font-size: 1.125rem;
      font-weight: var(--bip-font-weight-semibold);
      color: var(--bip-grey-900);
      line-height: 1.3;
    }
    
    .bip-error-message {
      margin: 0 0 var(--bip-spacing-sm) 0;
      font-size: 1rem;
      color: var(--bip-grey-800);
      line-height: 1.5;
    }
    
    .bip-error-details {
      margin: 0 0 var(--bip-spacing-md) 0;
      font-size: 0.875rem;
      color: var(--bip-grey-600);
      line-height: 1.4;
      padding: var(--bip-spacing-sm);
      background: rgba(255, 255, 255, 0.7);
      border-radius: var(--bip-border-radius-sm);
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    .bip-error-code {
      margin: var(--bip-spacing-sm) 0;
      
      span {
        display: inline-block;
        padding: var(--bip-spacing-xs) var(--bip-spacing-sm);
        background: rgba(0, 0, 0, 0.1);
        border-radius: var(--bip-border-radius-sm);
        font-family: 'Courier New', monospace;
        font-size: 0.75rem;
        color: var(--bip-grey-700);
        font-weight: var(--bip-font-weight-medium);
      }
    }
    
    .bip-error-suggestions {
      margin: var(--bip-spacing-md) 0 0 0;
      padding: var(--bip-spacing-md);
      background: rgba(255, 255, 255, 0.8);
      border-radius: var(--bip-border-radius-sm);
      border: 1px solid rgba(0, 0, 0, 0.1);
      
      h4 {
        margin: 0 0 var(--bip-spacing-sm) 0;
        font-size: 0.875rem;
        font-weight: var(--bip-font-weight-semibold);
        color: var(--bip-grey-800);
      }
      
      ul {
        margin: 0;
        padding-left: var(--bip-spacing-lg);
        
        li {
          margin-bottom: var(--bip-spacing-xs);
          font-size: 0.875rem;
          color: var(--bip-grey-700);
          line-height: 1.4;
          
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
    
    .bip-error-actions {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: var(--bip-spacing-sm);
      align-items: stretch;
      min-width: 140px;
    }
    
    .bip-retry-button {
      font-weight: var(--bip-font-weight-medium);
      
      mat-icon {
        margin-right: var(--bip-spacing-xs);
      }
      
      &:disabled {
        opacity: 0.7;
        
        mat-icon {
          animation: spin 1s linear infinite;
        }
      }
    }
    
    .bip-contact-button {
      font-weight: var(--bip-font-weight-medium);
      
      mat-icon {
        margin-right: var(--bip-spacing-xs);
      }
    }
    
    /* Inline Layout */
    .bip-error-inline {
      display: flex;
      align-items: center;
      gap: var(--bip-spacing-md);
      padding: var(--bip-spacing-md);
      border-radius: var(--bip-border-radius-md);
      border: 1px solid;
      background: rgba(255, 255, 255, 0.9);
    }
    
    .bip-error-container.bip-error-error .bip-error-inline {
      border-color: var(--bip-error-300);
      background: var(--bip-error-50);
    }
    
    .bip-error-container.bip-error-warning .bip-error-inline {
      border-color: var(--bip-warning-300);
      background: var(--bip-warning-50);
    }
    
    .bip-error-container.bip-error-info .bip-error-inline {
      border-color: var(--bip-info-300);
      background: var(--bip-info-50);
    }
    
    .bip-error-inline .bip-error-icon {
      flex-shrink: 0;
    }
    
    .bip-error-inline .bip-error-text {
      flex: 1;
      min-width: 0;
      
      .bip-error-title {
        margin: 0 var(--bip-spacing-xs) 0 0;
        font-size: 0.875rem;
        font-weight: var(--bip-font-weight-semibold);
        display: inline;
      }
      
      .bip-error-message {
        margin: 0;
        font-size: 0.875rem;
        display: inline;
      }
    }
    
    /* Animations */
    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .bip-error-content {
        flex-direction: column;
        gap: var(--bip-spacing-md);
      }
      
      .bip-error-icon-container {
        width: 40px;
        height: 40px;
        align-self: flex-start;
      }
      
      .bip-error-actions {
        flex-direction: row;
        min-width: auto;
        width: 100%;
        
        button {
          flex: 1;
        }
      }
      
      .bip-error-inline {
        flex-wrap: wrap;
        
        .bip-error-text {
          flex-basis: 100%;
          order: 2;
        }
        
        button {
          order: 3;
        }
      }
    }
    
    @media (max-width: 480px) {
      .bip-error-content {
        padding: var(--bip-spacing-xs);
      }
      
      .bip-error-actions {
        flex-direction: column;
      }
      
      .bip-error-title {
        font-size: 1rem;
      }
      
      .bip-error-message {
        font-size: 0.875rem;
      }
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .bip-error-card {
        border-width: 2px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }
      
      .bip-error-title,
      .bip-error-message {
        color: var(--bip-grey-900);
        font-weight: var(--bip-font-weight-semibold);
      }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .bip-error-container,
      .bip-error-card,
      .bip-retry-button mat-icon {
        animation: none;
      }
    }
  `]
})
export class ErrorMessageComponent {
  @Input() message: string = '';
  @Input() title?: string;
  @Input() details?: string;
  @Input() type: ErrorType = 'error';
  @Input() showRetry: boolean = false;
  @Input() showContact: boolean = false;
  @Input() showCard: boolean = true;
  @Input() compact: boolean = false;
  @Input() errorCode?: string;
  @Input() suggestions: string[] = [];
  @Input() retryCallback?: () => void;
  @Input() contactCallback?: () => void;
  @Input() isRetrying: boolean = false;

  getIcon(): string {
    switch (this.type) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'error';
    }
  }

  onRetry(): void {
    if (this.retryCallback) {
      this.retryCallback();
    }
  }

  onContact(): void {
    if (this.contactCallback) {
      this.contactCallback();
    }
  }
}