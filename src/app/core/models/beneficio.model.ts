/**
 * Interface para o modelo Benefício baseado na API BIP
 */
export interface Beneficio {
  id: number;
  nome: string;
  descricao?: string;
  saldo: number; // API retorna "saldo"
  criadoEm: string;
  atualizadoEm: string;
}

/**
 * DTO para criação de benefício
 */
export interface CreateBeneficioRequest {
  nome: string;
  descricao?: string;
  valorInicial: number; // API espera "valorInicial"
}

/**
 * DTO para atualização de benefício
 */
export interface UpdateBeneficioRequest {
  nome: string;
  descricao?: string;
  valorInicial: number; // API espera "valorInicial"
}

/**
 * Response de estatísticas dos benefícios
 */
export interface BeneficioEstatisticas {
  totalBeneficios: number;
  ultimaAtualizacao: string;
}