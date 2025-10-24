/**
 * DTO para criação de transferência baseado na API real
 */
export interface CreateTransferenciaRequest {
  beneficioOrigemId: number;
  beneficioDestinoId: number;
  valor: number;
  descricao?: string;
}

/**
 * Response de transferência criada baseado na API real
 */
export interface TransferenciaResponse {
  mensagem: string;
  origem: number;
  valor: number;
  destino: number;
  sucesso: boolean;
  descricao?: string;
  timestamp: string;
}

/**
 * DTO para validação de transferência baseado na API real
 */
export interface ValidarTransferenciaRequest {
  beneficioOrigemId: number;
  beneficioDestinoId: number;
  valor: number;
  descricao?: string;
}

/**
 * Response de validação de transferência baseado na API real
 */
export interface ValidacaoTransferenciaResponse {
  valida: boolean;
  motivo?: string;
  origem: number;
  valor: number;
  destino: number;
}

/**
 * Response de cálculo de taxa baseado na API real
 */
export interface TaxaTransferenciaResponse {
  taxa: number;
  valorComTaxa: number;
  valorOriginal: number;
}