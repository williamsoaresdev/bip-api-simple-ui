export interface BaseEntity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ApiResponse<T> {
  readonly data: T;
  readonly message?: string;
  readonly success: boolean;
  readonly errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

export interface ApiError {
  readonly message: string;
  readonly code: string;
  readonly details?: Record<string, unknown>;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface UIState {
  readonly loading: LoadingState;
  readonly error: string | null;
}

export interface DashboardMetrics {
  readonly totalBeneficios: number;
  readonly totalTransferencias: number;
  readonly valorTotalTransferido: number;
  readonly beneficiosAtivos: number;
  readonly transferenciasPendentes: number;
}