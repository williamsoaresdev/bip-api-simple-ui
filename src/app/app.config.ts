import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { cacheBustingInterceptor } from './core/interceptors/cache-busting.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        cacheBustingInterceptor,
        authInterceptor,
        loadingInterceptor,
        errorInterceptor
      ])
    ),
    provideAnimations()
  ]
};