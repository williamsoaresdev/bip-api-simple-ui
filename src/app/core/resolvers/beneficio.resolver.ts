import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { BeneficioService } from '@core/services';
import { Beneficio } from '@core/models';

export const beneficioResolver: ResolveFn<Beneficio | null> = (route, state): Observable<Beneficio | null> => {
  const beneficioService = inject(BeneficioService);
  const router = inject(Router);
  
  const id = route.paramMap.get('id');
  
  if (!id || isNaN(+id)) {
    router.navigate(['/beneficios']);
    return of(null);
  }
  
  return beneficioService.buscarPorId(+id).pipe(
    catchError((error) => {
      console.error('Erro ao resolver benefício:', error);
      router.navigate(['/beneficios']);
      return of(null);
    })
  );
};