import { Pipe, PipeTransform } from '@angular/core';
import { TransferenciaStatus, TRANSFERENCIA_STATUS_COLORS } from '@core/models/transferencia.model';

@Pipe({
  name: 'statusColor',
  standalone: true,
  pure: true
})
export class StatusColorPipe implements PipeTransform {
  transform(status: TransferenciaStatus): string {
    return TRANSFERENCIA_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  }
}