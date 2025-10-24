/**
 * Interface genérica para resposta de erro da API
 */
export interface ApiError {
  erro: string;
  codigo: string;
  timestamp: string;
  path: string;
}

/**
 * Interface para resposta de status da API
 */
export interface ApiStatus {
  status: string;
  timestamp: string;
  ambiente: string;
}

/**
 * Interface genérica para paginação (futura implementação)
 */
export interface PagedResponse<T> {
  content: T[];
  pageable: {
    page: number;
    size: number;
    sort: string;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/**
 * Enum para códigos de erro personalizados da API
 */
export enum ApiErrorCode {
  BENEFICIO_NAO_ENCONTRADO = 'BENEFICIO_NAO_ENCONTRADO',
  NOME_JA_EXISTE = 'NOME_JA_EXISTE',
  SALDO_INSUFICIENTE = 'SALDO_INSUFICIENTE',
  VALOR_INVALIDO = 'VALOR_INVALIDO',
  TRANSFERENCIA_INVALIDA = 'TRANSFERENCIA_INVALIDA'
}

/**
 * Interface para loading state
 */
export interface LoadingState {
  loading: boolean;
  error?: string;
}

/**
 * Type para operações CRUD
 */
export type CrudOperation = 'create' | 'read' | 'update' | 'delete';