import { BaseEntity } from './common.model';

export interface Beneficio extends BaseEntity {
  readonly nome: string;
  readonly descricao: string;
  readonly valor: number;
  readonly ativo: boolean;
  readonly categoria: BeneficioCategoria;
}

// Interface para mapear a resposta da API backend
export interface BeneficioBackendResponse {
  readonly id: number;
  readonly nome: string;
  readonly descricao: string;
  readonly saldo: number;
  readonly ativo: boolean;
  readonly criadoEm: string;
  readonly atualizadoEm: string;
}

export enum BeneficioCategoria {
  ALIMENTACAO = 'ALIMENTACAO',
  TRANSPORTE = 'TRANSPORTE',
  SAUDE = 'SAUDE',
  EDUCACAO = 'EDUCACAO',
  OUTROS = 'OUTROS'
}

export const BENEFICIO_CATEGORIA_LABELS: Record<BeneficioCategoria, string> = {
  [BeneficioCategoria.ALIMENTACAO]: 'Alimentação',
  [BeneficioCategoria.TRANSPORTE]: 'Transporte',
  [BeneficioCategoria.SAUDE]: 'Saúde',
  [BeneficioCategoria.EDUCACAO]: 'Educação',
  [BeneficioCategoria.OUTROS]: 'Outros'
};

export interface CreateBeneficioRequest {
  readonly nome: string;
  readonly descricao?: string;
  readonly valor: number;
  readonly categoria: BeneficioCategoria;
}

export interface UpdateBeneficioRequest {
  readonly nome?: string;
  readonly descricao?: string;
  readonly valor?: number;
  readonly categoria?: BeneficioCategoria;
  readonly ativo?: boolean;
}