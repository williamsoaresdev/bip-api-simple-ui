import { Pipe, PipeTransform } from '@angular/core';

/**
 * 💰 Pipe especializado para formatação monetária brasileira
 */
@Pipe({
  name: 'moedaBrasil',
  standalone: true,
  pure: true
})
export class MoedaBrasilPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    options: {
      showSymbol?: boolean;
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
      showZeroAsEmpty?: boolean;
    } = {}
  ): string {
    
    const {
      showSymbol = true,
      minimumFractionDigits = 2,
      maximumFractionDigits = 2,
      showZeroAsEmpty = false
    } = options;

    if (value === null || value === undefined) {
      return showZeroAsEmpty ? '' : (showSymbol ? 'R$ 0,00' : '0,00');
    }

    const numericValue = typeof value === 'string' 
      ? parseFloat(value.replace(',', '.'))
      : value;

    if (isNaN(numericValue)) {
      return showSymbol ? 'R$ 0,00' : '0,00';
    }

    if (showZeroAsEmpty && numericValue === 0) {
      return '';
    }

    const formatted = numericValue.toLocaleString('pt-BR', {
      minimumFractionDigits,
      maximumFractionDigits
    });

    return showSymbol ? `R$ ${formatted}` : formatted;
  }
}

/**
 * 📅 Pipe para formatação de tempo relativo
 */
@Pipe({
  name: 'tempoRelativo',
  standalone: true,
  pure: true
})
export class TempoRelativoPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return 'Data não informada';

    const date = typeof value === 'string' ? new Date(value) : value;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes === 1) return 'Há 1 minuto';
    if (diffMinutes < 60) return `Há ${diffMinutes} minutos`;
    
    if (diffHours === 1) return 'Há 1 hora';
    if (diffHours < 24) return `Há ${diffHours} horas`;
    
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    
    if (diffWeeks === 1) return 'Há 1 semana';
    if (diffWeeks < 4) return `Há ${diffWeeks} semanas`;
    
    if (diffMonths === 1) return 'Há 1 mês';
    if (diffMonths < 12) return `Há ${diffMonths} meses`;
    
    const diffYears = Math.floor(diffMonths / 12);
    if (diffYears === 1) return 'Há 1 ano';
    return `Há ${diffYears} anos`;
  }
}

/**
 * 🎨 Pipe para destacar texto de busca
 */
@Pipe({
  name: 'destacarTexto',
  standalone: true,
  pure: true
})
export class DestacarTextoPipe implements PipeTransform {
  transform(
    text: string | null | undefined,
    searchTerm: string | null | undefined,
    highlightClass: string = 'highlight'
  ): string {
    
    if (!text || !searchTerm) {
      return text || '';
    }

    const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');
    return text.replace(regex, `<span class="${highlightClass}">$1</span>`);
  }

  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

/**
 * 🏷️ Pipe para formatação de tags/categorias
 */
@Pipe({
  name: 'formatarTag',
  standalone: true,
  pure: true
})
export class FormatarTagPipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    formato: 'badge' | 'chip' | 'text' = 'text'
  ): string {
    
    if (!value) return '';

    const formatted = value.trim().toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    switch (formato) {
      case 'badge':
        return `<span class="badge">${formatted}</span>`;
      case 'chip':
        return `<mat-chip>${formatted}</mat-chip>`;
      default:
        return formatted;
    }
  }
}