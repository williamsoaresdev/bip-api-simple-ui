import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationDialogData {
  readonly title: string;
  readonly message: string;
  readonly confirmText?: string;
  readonly cancelText?: string;
  readonly type?: 'warning' | 'danger' | 'info' | 'success';
  readonly icon?: string;
}

@Component({
  selector: 'bip-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmationDialogComponent>);
  readonly data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA);
  
  readonly isConfirming = signal(false);

  readonly defaultIcon = computed(() => {
    const icons = {
      warning: 'warning',
      danger: 'error',
      info: 'info',
      success: 'check_circle'
    };
    return icons[this.data.type || 'info'];
  });

  readonly iconContainerClasses = computed(() => {
    const base = 'icon-container flex items-center justify-center w-12 h-12 rounded-full';
    const type = this.data.type || 'info';
    return `${base} icon-container-${type}`;
  });

  readonly iconClasses = computed(() => {
    const base = 'icon-size';
    const type = this.data.type || 'info';
    return `${base} icon-${type}`;
  });

  readonly buttonColor = computed(() => {
    return this.data.type === 'danger' ? 'warn' : 'primary';
  });

  async onConfirm(): Promise<void> {
    this.isConfirming.set(true);
    
    // Simulate brief confirmation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}