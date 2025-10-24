import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * 🎯 Custom Validators para Angular Especialista
 */
export class BeneficioValidators {
  
  /**
   * Validator para valores monetários brasileiros
   */
  static valorMonetario(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (!value && value !== 0) {
        return null; // Let required validator handle empty values
      }

      // Aceita números e strings com formato brasileiro
      const numericValue = typeof value === 'string' 
        ? parseFloat(value.replace(',', '.'))
        : value;

      if (isNaN(numericValue)) {
        return { valorInvalido: { value, reason: 'Formato inválido' } };
      }

      if (numericValue < 0) {
        return { valorNegativo: { value: numericValue } };
      }

      if (numericValue > 99999999.99) {
        return { valorExcessivo: { value: numericValue, max: 99999999.99 } };
      }

      // Validar máximo 2 casas decimais
      const decimalPlaces = (numericValue.toString().split('.')[1] || '').length;
      if (decimalPlaces > 2) {
        return { casasDecimaisExcessivas: { value: numericValue, decimais: decimalPlaces } };
      }

      return null;
    };
  }

  /**
   * Validator para nome de benefício único (assíncrono seria ideal)
   */
  static nomeUnico(existingNames: string[] = []): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim().toLowerCase();
      
      if (!value) return null;
      
      const isDuplicate = existingNames.some(name => 
        name.toLowerCase() === value
      );
      
      return isDuplicate 
        ? { nomeJaExiste: { value: control.value } }
        : null;
    };
  }

  /**
   * Validator para descrição com palavras proibidas
   */
  static descricaoValida(): ValidatorFn {
    const palavrasProibidas = ['teste', 'debug', 'temporario', 'temp'];
    
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.toLowerCase();
      
      if (!value) return null;
      
      const palavraEncontrada = palavrasProibidas.find(palavra => 
        value.includes(palavra)
      );
      
      return palavraEncontrada 
        ? { palavraProibida: { palavra: palavraEncontrada } }
        : null;
    };
  }

  /**
   * Cross-field validator para validar regras de negócio complexas
   */
  static validarRegrasNegocio(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const nome = control.get('nome')?.value;
      const valor = control.get('valorInicial')?.value;
      const descricao = control.get('descricao')?.value;

      const errors: ValidationErrors = {};

      // Regra: Benefícios com valor alto devem ter descrição detalhada
      if (valor > 1000 && (!descricao || descricao.length < 50)) {
        errors['descricaoInsuficiente'] = {
          valor,
          descricaoMinima: 50,
          atual: descricao?.length || 0
        };
      }

      // Regra: Certas palavras no nome requerem valores específicos
      if (nome?.toLowerCase().includes('alimentação') && valor < 100) {
        errors['valorAuxilioAlimentacao'] = {
          minimo: 100,
          atual: valor
        };
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }
}