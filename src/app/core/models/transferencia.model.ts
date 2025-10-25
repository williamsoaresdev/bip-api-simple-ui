import { BaseEntity } from './common.model';

export interface Transferencia extends BaseEntity {
  readonly beneficioOrigemId: number;
  readonly beneficioOrigemNome: string;
  readonly beneficioDestinoId: number;
  readonly beneficioDestinoNome: string;
  readonly valor: number;
  readonly taxa: number;
  readonly descricao: string;
  readonly dataExecucao: string;
  readonly status: TransferenciaStatus;
}

export interface TransferenciaListResponse {
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

export interface CreateTransferenciaRequest {
  readonly beneficioOrigemId: number;
  readonly beneficioDestinoId: number;
  readonly valor: number;
  readonly descricao: string;
}

export interface CreateTransferenciaResponse {
  readonly mensagem: string;
  readonly origem: number;
  readonly valor: number;
  readonly destino: number;
  readonly sucesso: boolean;
  readonly descricao: string;
  readonly timestamp: string;
}

export interface ValidarTransferenciaRequest {
  readonly beneficioOrigemId: number;
  readonly beneficioDestinoId: number;
  readonly valor: number;
  readonly descricao: string;
}

export interface ValidarTransferenciaResponse {
  readonly valida: boolean;
  readonly origem: number;
  readonly valor: number;
  readonly destino: number;
  readonly mensagem?: string;
}

export enum TransferenciaStatus {
  PENDENTE = 'PENDENTE',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
  ERRO = 'ERRO'
}

export const TRANSFERENCIA_STATUS_LABELS: Record<TransferenciaStatus, string> = {
  [TransferenciaStatus.PENDENTE]: 'Pendente',
  [TransferenciaStatus.CONCLUIDA]: 'Concluída',
  [TransferenciaStatus.CANCELADA]: 'Cancelada',
  [TransferenciaStatus.ERRO]: 'Erro'
};

export const TRANSFERENCIA_STATUS_COLORS: Record<TransferenciaStatus, string> = {
  [TransferenciaStatus.PENDENTE]: 'bg-yellow-100 text-yellow-800',
  [TransferenciaStatus.CONCLUIDA]: 'bg-green-100 text-green-800',
  [TransferenciaStatus.CANCELADA]: 'bg-gray-100 text-gray-800',
  [TransferenciaStatus.ERRO]: 'bg-red-100 text-red-800'
};