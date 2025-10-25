import { BaseEntity } from './common.model';

export interface Transferencia extends BaseEntity {
  readonly beneficioId: string;
  readonly beneficioNome: string;
  readonly valor: number;
  readonly destinatario: string;
  readonly status: TransferenciaStatus;
  readonly dataExecucao?: Date;
  readonly observacoes?: string;
}

// Interface para mapear a resposta da API backend
export interface TransferenciaBackendResponse {
  readonly total: number;
  readonly transferencias: TransferenciaBackendItem[];
  readonly timestamp: string;
}

export interface TransferenciaBackendItem {
  readonly id: number;
  readonly beneficioOrigemId: number;
  readonly beneficioOrigemNome: string;
  readonly beneficioDestinoId: number;
  readonly beneficioDestinoNome: string;
  readonly valor: number;
  readonly taxa: number;
  readonly descricao: string;
  readonly dataExecucao: string;
  readonly status: string;
}

export enum TransferenciaStatus {
  PENDENTE = 'PENDENTE',
  PROCESSANDO = 'PROCESSANDO',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
  REJEITADA = 'REJEITADA'
}

export const TRANSFERENCIA_STATUS_LABELS: Record<TransferenciaStatus, string> = {
  [TransferenciaStatus.PENDENTE]: 'Pendente',
  [TransferenciaStatus.PROCESSANDO]: 'Processando',
  [TransferenciaStatus.CONCLUIDA]: 'Concluída',
  [TransferenciaStatus.CANCELADA]: 'Cancelada',
  [TransferenciaStatus.REJEITADA]: 'Rejeitada'
};

export const TRANSFERENCIA_STATUS_COLORS: Record<TransferenciaStatus, string> = {
  [TransferenciaStatus.PENDENTE]: 'bg-yellow-100 text-yellow-800',
  [TransferenciaStatus.PROCESSANDO]: 'bg-blue-100 text-blue-800',
  [TransferenciaStatus.CONCLUIDA]: 'bg-green-100 text-green-800',
  [TransferenciaStatus.CANCELADA]: 'bg-gray-100 text-gray-800',
  [TransferenciaStatus.REJEITADA]: 'bg-red-100 text-red-800'
};

export interface CreateTransferenciaRequest {
  readonly beneficioId: string;
  readonly destinatario: string;
  readonly valor: number;
  readonly observacoes?: string;
}

export interface UpdateTransferenciaRequest {
  readonly status?: TransferenciaStatus;
  readonly observacoes?: string;
}