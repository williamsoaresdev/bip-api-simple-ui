import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

@Pipe({
  name: 'bipDateFormat',
  standalone: true,
  pure: true
})
export class BipDateFormatPipe implements PipeTransform {
  transform(
    value: string | Date | null | undefined,
    formatType: 'short' | 'medium' | 'long' | 'relative' | 'time' = 'medium'
  ): string {
    if (!value) return '';

    const date = typeof value === 'string' ? parseISO(value) : value;
    
    if (isNaN(date.getTime())) return '';

    switch (formatType) {
      case 'short':
        return format(date, 'dd/MM/yyyy', { locale: ptBR });
      case 'medium':
        return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
      case 'long':
        return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
      case 'time':
        return format(date, 'HH:mm', { locale: ptBR });
      case 'relative':
        return formatDistanceToNow(date, { 
          addSuffix: true, 
          locale: ptBR 
        });
      default:
        return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    }
  }
}