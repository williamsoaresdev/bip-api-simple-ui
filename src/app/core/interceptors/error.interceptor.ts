import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorMessage = getErrorMessage(error);
      
      if (error.status === 401) {
        router.navigate(['/login']);
      }

      console.error('HTTP Error:', {
        status: error.status,
        message: errorMessage,
        url: error.url
      });

      return throwError(() => ({ ...error, message: errorMessage }));
    })
  );
};

function getErrorMessage(error: HttpErrorResponse): string {
  const statusMessages: Record<number, string> = {
    401: 'Acesso não autorizado. Faça login novamente.',
    403: 'Acesso negado. Você não tem permissão para esta ação.',
    404: 'Recurso não encontrado.',
    422: 'Dados inválidos enviados.',
    500: 'Erro interno do servidor. Tente novamente mais tarde.',
    0: 'Não foi possível conectar ao servidor. Verifique sua conexão.'
  };

  return statusMessages[error.status] || 
         error.error?.message || 
         'Erro inesperado. Tente novamente.';
}