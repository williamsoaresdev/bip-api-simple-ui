import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'bip-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatCardModule, MatIconModule],
  template: `
    <div class="bip-loading-container" [class.bip-overlay]="overlay" [class.bip-inline]="inline">
      <!-- Card Loading State -->
      <mat-card *ngIf="showCard && !inline" class="bip-loading-card">
        <mat-card-content>
          <div class="bip-loading-content">
            <div class="bip-spinner-container">
              <mat-spinner 
                [diameter]="size" 
                color="primary"
                [strokeWidth]="strokeWidth">
              </mat-spinner>
              <mat-icon *ngIf="icon" class="bip-loading-icon">{{ icon }}</mat-icon>
            </div>
            
            <div *ngIf="message || subtitle" class="bip-loading-text">
              <h3 *ngIf="message" class="bip-loading-message">{{ message }}</h3>
              <p *ngIf="subtitle" class="bip-loading-subtitle">{{ subtitle }}</p>
            </div>
            
            <!-- Progress indicator for specific operations -->
            <div *ngIf="showProgress && progress !== undefined" class="bip-progress-container">
              <div class="bip-progress-bar">
                <div class="bip-progress-fill" [style.width.%]="progress"></div>
              </div>
              <span class="bip-progress-text">{{ progress }}%</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
      
      <!-- Inline Loading State -->
      <div *ngIf="inline" class="bip-loading-inline">
        <mat-spinner 
          [diameter]="size" 
          color="primary"
          [strokeWidth]="strokeWidth">
        </mat-spinner>
        <span *ngIf="message" class="bip-loading-message">{{ message }}</span>
      </div>
      
      <!-- Simple Spinner State -->
      <ng-container *ngIf="!showCard && !inline">
        <div class="bip-spinner-container">
          <mat-spinner 
            [diameter]="size" 
            color="primary"
            [strokeWidth]="strokeWidth">
          </mat-spinner>
          <mat-icon *ngIf="icon" class="bip-loading-icon">{{ icon }}</mat-icon>
        </div>
        
        <div *ngIf="message || subtitle" class="bip-loading-text">
          <h3 *ngIf="message" class="bip-loading-message">{{ message }}</h3>
          <p *ngIf="subtitle" class="bip-loading-subtitle">{{ subtitle }}</p>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .bip-loading-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: var(--bip-spacing-xl);
      min-height: 120px;
      position: relative;
    }
    
    .bip-loading-container.bip-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(2px);
      z-index: 9999;
      animation: fadeIn 0.2s ease-out;
    }
    
    .bip-loading-container.bip-inline {
      padding: var(--bip-spacing-md);
      min-height: auto;
    }
    
    .bip-loading-card {
      text-align: center;
      min-width: 280px;
      box-shadow: var(--bip-shadow-lg);
      border: 1px solid var(--bip-grey-200);
      background: white;
      animation: slideInUp 0.3s ease-out;
    }
    
    .bip-loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--bip-spacing-lg);
      padding: var(--bip-spacing-md);
    }
    
    .bip-spinner-container {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    .bip-loading-icon {
      position: absolute;
      color: var(--bip-primary-500);
      font-size: 1.5rem !important;
      width: 1.5rem !important;
      height: 1.5rem !important;
      animation: pulse 2s infinite;
    }
    
    .bip-loading-text {
      text-align: center;
      max-width: 300px;
    }
    
    .bip-loading-message {
      margin: 0 0 var(--bip-spacing-xs) 0;
      color: var(--bip-grey-800);
      font-size: 1rem;
      font-weight: var(--bip-font-weight-medium);
      line-height: 1.4;
    }
    
    .bip-loading-subtitle {
      margin: 0;
      color: var(--bip-grey-600);
      font-size: 0.875rem;
      line-height: 1.4;
    }
    
    .bip-loading-inline {
      display: flex;
      align-items: center;
      gap: var(--bip-spacing-md);
      
      .bip-loading-message {
        font-size: 0.875rem;
        color: var(--bip-grey-700);
      }
    }
    
    .bip-progress-container {
      width: 100%;
      max-width: 240px;
      display: flex;
      flex-direction: column;
      gap: var(--bip-spacing-xs);
      align-items: center;
    }
    
    .bip-progress-bar {
      width: 100%;
      height: 6px;
      background: var(--bip-grey-200);
      border-radius: var(--bip-border-radius-full);
      overflow: hidden;
      position: relative;
    }
    
    .bip-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--bip-primary-500), var(--bip-primary-400));
      border-radius: var(--bip-border-radius-full);
      transition: width 0.3s ease-out;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: shimmer 1.5s infinite;
      }
    }
    
    .bip-progress-text {
      font-size: 0.75rem;
      color: var(--bip-grey-600);
      font-weight: var(--bip-font-weight-medium);
    }
    
    /* Material Design Spinner Override */
    ::ng-deep .mat-mdc-progress-spinner {
      .mdc-circular-progress__determinate-circle,
      .mdc-circular-progress__indeterminate-circle-graphic {
        stroke: var(--bip-primary-500) !important;
      }
    }
    
    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.7;
        transform: scale(0.95);
      }
    }
    
    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .bip-loading-container {
        padding: var(--bip-spacing-lg);
      }
      
      .bip-loading-card {
        min-width: 240px;
        margin: var(--bip-spacing-md);
      }
      
      .bip-loading-content {
        padding: var(--bip-spacing-sm);
        gap: var(--bip-spacing-md);
      }
      
      .bip-loading-message {
        font-size: 0.875rem;
      }
    }
    
    @media (max-width: 480px) {
      .bip-loading-container {
        padding: var(--bip-spacing-md);
      }
      
      .bip-loading-card {
        min-width: 200px;
        margin: var(--bip-spacing-sm);
      }
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .bip-loading-container.bip-overlay {
        background: rgba(255, 255, 255, 0.98);
      }
      
      .bip-loading-card {
        border: 2px solid var(--bip-grey-800);
      }
      
      .bip-loading-message {
        color: var(--bip-grey-900);
        font-weight: var(--bip-font-weight-semibold);
      }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .bip-loading-container.bip-overlay,
      .bip-loading-card,
      .bip-loading-icon,
      .bip-progress-fill {
        animation: none;
      }
      
      .bip-progress-fill::after {
        display: none;
      }
    }
  `]
})
export class LoadingComponent {
  @Input() message: string = '';
  @Input() subtitle: string = '';
  @Input() size: number = 40;
  @Input() strokeWidth: number = 4;
  @Input() overlay: boolean = false;
  @Input() inline: boolean = false;
  @Input() showCard: boolean = true;
  @Input() icon: string = '';
  @Input() showProgress: boolean = false;
  @Input() progress: number | undefined;
}