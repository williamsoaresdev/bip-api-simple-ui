import { Pipe, PipeTransform } from '@angular/core';
import { TransferenciaStatus, TRANSFERENCIA_STATUS_LABELS } from '@core/models/transferencia.model';

@Pipe({
  name: 'statusLabel',
  standalone: true,
  pure: true
})
export class StatusLabelPipe implements PipeTransform {
  transform(status: TransferenciaStatus): string {
    return TRANSFERENCIA_STATUS_LABELS[status] || status;
  }
}