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
      ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50' 
      : '';
    const direction = this.message() ? 'flex-col gap-3' : '';
    
    return `${base} ${centering} ${overlayClass} ${direction}`.trim();
  });
  
  readonly spinnerSize = computed(() => {
    const sizes = { sm: 24, md: 32, lg: 40, xl: 48 };
    return sizes[this.size()];
  });
  
  readonly strokeWidth = computed(() => {
    const widths = { sm: 3, md: 4, lg: 4, xl: 5 };
    return widths[this.size()];
  });
  
  readonly dotClasses = computed(() => {
    const baseClasses = 'dot bg-blue-600 rounded-full';
    const sizeClasses = {
      sm: 'w-2 h-2',
      md: 'w-3 h-3', 
      lg: 'w-4 h-4',
      xl: 'w-5 h-5'
    };
    
    return `${baseClasses} ${sizeClasses[this.size()]}`;
  });
  
  readonly pulseClasses = computed(() => {
    const baseClasses = 'pulse-ring bg-blue-600 rounded-full';
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16', 
      xl: 'w-20 h-20'
    };
    
    return `${baseClasses} ${sizeClasses[this.size()]}`;
  });
  
  readonly messageClasses = computed(() => {
    const baseClasses = 'text-gray-600 font-medium';
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl'
    };
    
    return `${baseClasses} ${sizeClasses[this.size()]}`;
  });
}