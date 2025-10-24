import { FormControl, FormGroup } from '@angular/forms';

/**
 * 🎯 Types especializados para formulários type-safe
 */

export interface BeneficioFormValue {
  nome: string;
  descricao: string;
  valorInicial: number;
}

export interface BeneficioFormControls {
  nome: FormControl<string>;
  descricao: FormControl<string>;
  valorInicial: FormControl<number>;
}

export type BeneficioFormGroup = FormGroup<BeneficioFormControls>;

/**
 * Estados de validação customizados
 */
export interface ValidationState {
  isValid: boolean;
  errors: ValidationErrors;
  warnings: ValidationWarnings;
  suggestions: ValidationSuggestions;
}

export interface ValidationErrors {
  [key: string]: {
    message: string;
    severity: 'error' | 'warning';
    field?: string;
  };
}

export interface ValidationWarnings {
  [key: string]: {
    message: string;
    suggestion?: string;
  };
}

export interface ValidationSuggestions {
  [key: string]: {
    message: string;
    action?: string;
  };
}

/**
 * Estados do formulário
 */
export type FormMode = 'create' | 'edit' | 'view' | 'copy';

export interface FormState {
  mode: FormMode;
  isSubmitting: boolean;
  isDirty: boolean;
  hasUnsavedChanges: boolean;
  validationState: ValidationState;
}

/**
 * Configurações avançadas do formulário
 */
export interface FormConfig {
  autoSave: boolean;
  validateOnBlur: boolean;
  validateOnChange: boolean;
  showRealTimePreview: boolean;
  enableAdvancedValidation: boolean;
  customValidationRules: string[];
}