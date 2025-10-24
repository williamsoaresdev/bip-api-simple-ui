import { Injectable, signal } from '@angular/core';

export interface NotificationMessage {
  readonly id: string;
  readonly type: 'success' | 'error' | 'warning' | 'info';
  readonly title: string;
  readonly message?: string;
  readonly duration?: number;
  readonly timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly _notifications = signal<NotificationMessage[]>([]);
  private idCounter = 0;

  readonly notifications = this._notifications.asReadonly();

  showSuccess(title: string, message?: string, duration = 5000): void {
    this.addNotification('success', title, message, duration);
  }

  showError(title: string, message?: string, duration = 7000): void {
    this.addNotification('error', title, message, duration);
  }

  showWarning(title: string, message?: string, duration = 6000): void {
    this.addNotification('warning', title, message, duration);
  }

  showInfo(title: string, message?: string, duration = 5000): void {
    this.addNotification('info', title, message, duration);
  }

  private addNotification(
    type: NotificationMessage['type'], 
    title: string, 
    message?: string, 
    duration?: number
  ): void {
    const notification: NotificationMessage = {
      id: `notification-${++this.idCounter}`,
      type,
      title,
      message,
      duration,
      timestamp: new Date()
    };

    const current = this._notifications();
    this._notifications.set([...current, notification]);

    if (duration && duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, duration);
    }

    // Log for console feedback
    const logMessage = message ? `${title}: ${message}` : title;
    switch (type) {
      case 'success':
        console.log('✅', logMessage);
        break;
      case 'error':
        console.error('❌', logMessage);
        break;
      case 'warning':
        console.warn('⚠️', logMessage);
        break;
      case 'info':
        console.info('ℹ️', logMessage);
        break;
    }
  }

  removeNotification(id: string): void {
    const current = this._notifications();
    this._notifications.set(current.filter(n => n.id !== id));
  }

  clearAll(): void {
    this._notifications.set([]);
  }
}