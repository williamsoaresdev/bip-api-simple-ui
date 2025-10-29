import { Component, input, computed } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';
export type LoadingVariant = 'spinner' | 'dots' | 'pulse';

@Component({
  selector: 'bip-loading',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  // Inputs como signals
  readonly message = input<string>('');
  readonly size = input<LoadingSize>('md');
  readonly variant = input<LoadingVariant>('spinner');
  readonly overlay = input<boolean>(false);
  readonly center = input<boolean>(true);
  
  // Computed properties
  readonly containerClasses = computed(() => {
    const base = 'flex items-center';
    const centering = this.center() ? 'justify-center' : '';
    const overlayClass = this.overlay() 
      ? 'loading-overlay fixed inset-0 z-50' 
      : '';
    const direction = this.message() ? 'flex-col gap-3' : '';
    
    return `${base} ${centering} ${overlayClass} ${direction}`.trim();
  });
  
  readonly spinnerSize = computed(() => {
    const sizes = { sm: 24, md: 36, lg: 48, xl: 64 };
    return sizes[this.size()];
  });
  
  readonly strokeWidth = computed(() => {
    const widths = { sm: 3, md: 4, lg: 5, xl: 6 };
    return widths[this.size()];
  });
  
  readonly dotClasses = computed(() => {
    const baseClasses = 'dot rounded-full';
    const sizeClasses = {
      sm: 'w-2 h-2',
      md: 'w-3 h-3', 
      lg: 'w-4 h-4',
      xl: 'w-6 h-6'
    };
    
    return `${baseClasses} ${sizeClasses[this.size()]}`;
  });
  
  readonly pulseClasses = computed(() => {
    const baseClasses = 'pulse-ring rounded-full';
    const sizeClasses = {
      sm: 'w-10 h-10',
      md: 'w-16 h-16',
      lg: 'w-20 h-20', 
      xl: 'w-28 h-28'
    };
    
    return `${baseClasses} ${sizeClasses[this.size()]}`;
  });
  
  readonly messageClasses = computed(() => {
    const baseClasses = 'loading-message';
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl'
    };
    
    return `${baseClasses} ${sizeClasses[this.size()]}`;
  });
}