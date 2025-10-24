import { Component, input, output, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export type ErrorType = 'error' | 'warning' | 'info' | 'success';
export type ErrorVariant = 'filled' | 'outlined' | 'minimal';

@Component({
  selector: 'bip-error-message',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.scss'
})
export class ErrorMessageComponent {
  // Inputs como signals
  readonly message = input.required<string>();
  readonly title = input<string>('');
  readonly details = input<string>('');
  readonly type = input<ErrorType>('error');
  readonly variant = input<ErrorVariant>('filled');
  readonly showRetry = input<boolean>(false);
  readonly retrying = input<boolean>(false);
  readonly dismissible = input<boolean>(false);
  
  // Outputs
  readonly retry = output<void>();
  readonly dismiss = output<void>();
  
  // Computed properties
  readonly icon = computed(() => {
    const icons = {
      error: 'error',
      warning: 'warning', 
      info: 'info',
      success: 'check_circle'
    };
    return icons[this.type()];
  });
  
  readonly containerClasses = computed(() => {
    const base = 'error-container flex items-start gap-3 p-4 rounded-lg';
    const variant = this.variant();
    const type = this.type();
    
    return `${base} error-${variant} error-${type}`;
  });
  
  readonly iconClasses = computed(() => {
    return `icon flex-shrink-0 mt-0.5 icon-${this.type()}`;
  });
  
  readonly titleClasses = computed(() => {
    return `title font-semibold text-sm mb-1 title-${this.type()}`;
  });
  
  readonly messageClasses = computed(() => {
    return `message text-sm message-${this.type()}`;
  });
  
  readonly detailsClasses = computed(() => {
    return `details text-xs mt-1 opacity-75 details-${this.type()}`;
  });
  
  onRetry(): void {
    this.retry.emit();
  }
  
  onDismiss(): void {
    this.dismiss.emit();
  }
}