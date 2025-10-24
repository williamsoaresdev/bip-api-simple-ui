import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const router = inject(Router);
  
  // Simulate authentication check
  // In real app, check if user is authenticated
  const isAuthenticated = true; // Replace with actual auth logic
  
  if (!isAuthenticated) {
    router.navigate(['/login']);
    return of(false);
  }
  
  return of(true);
};