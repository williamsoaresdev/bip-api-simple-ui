import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Erro inesperado. Tente novamente.';
        
        // Handle different error status codes
        switch (error.status) {
          case 0:
            errorMessage = 'Não foi possível conectar ao servidor.';
            break;
          case 400:
            errorMessage = error.error?.erro || 'Dados inválidos.';
            break;
          case 401:
            errorMessage = 'Sessão expirada. Faça login novamente.';
            this.router.navigate(['/login']);
            break;
          case 403:
            errorMessage = 'Acesso negado.';
            break;
          case 404:
            errorMessage = 'Recurso não encontrado.';
            break;
          case 422:
            errorMessage = error.error?.erro || 'Dados de entrada inválidos.';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor.';
            break;
          case 503:
            errorMessage = 'Serviço temporariamente indisponível.';
            break;
          default:
            if (error.error?.erro) {
              errorMessage = error.error.erro;
            }
        }

        // Show error message to user
        this.snackBar.open(errorMessage, 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });

        // Log error for debugging
        console.error('HTTP Error:', {
          status: error.status,
          message: errorMessage,
          url: error.url,
          error: error.error
        });

        return throwError(() => errorMessage);
      })
    );
  }
}