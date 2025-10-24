import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _token = signal<string | null>(
    localStorage.getItem('auth_token')
  );
  
  readonly isAuthenticated = computed(() => !!this._token());
  readonly token = this._token.asReadonly();

  setToken(token: string): void {
    this._token.set(token);
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    this._token.set(null);
    localStorage.removeItem('auth_token');
  }
}