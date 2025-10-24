import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { TransferenciaService } from '@core/services';
import { Transferencia } from '@core/models';

export const transferenciaResolver: ResolveFn<Transferencia | null> = (route, state): Observable<Transferencia | null> => {
  const transferenciaService = inject(TransferenciaService);
  const router = inject(Router);
  
  const id = route.paramMap.get('id');
  
  if (!id || isNaN(+id)) {
    router.navigate(['/transferencias']);
    return of(null);
  }
  
  return transferenciaService.buscarPorId(+id).pipe(
    catchError((error) => {
      console.error('Erro ao resolver transferência:', error);
      router.navigate(['/transferencias']);
      return of(null);
    })
  );
};