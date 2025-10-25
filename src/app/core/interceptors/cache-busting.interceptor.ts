import { HttpInterceptorFn } from '@angular/common/http';

export const cacheBustingInterceptor: HttpInterceptorFn = (req, next) => {
  // Aplicar cache-busting apenas para requisições GET da nossa API
  if (req.method === 'GET' && req.url.includes('/api/')) {
    console.log('🚫 Cache-busting interceptor: Aplicando headers anti-cache para:', req.url);
    
    // Adicionar timestamp único à URL
    const timestamp = new Date().getTime();
    const separator = req.url.includes('?') ? '&' : '?';
    const urlWithTimestamp = `${req.url}${separator}_t=${timestamp}&_cache=${Math.random()}`;
    
    // Criar nova requisição com headers anti-cache
    const cacheBustedReq = req.clone({
      url: urlWithTimestamp,
      setHeaders: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'If-Modified-Since': '0',
        'If-None-Match': 'no-match'
      }
    });
    
    console.log('🚫 Cache-busting interceptor: URL modificada:', urlWithTimestamp);
    return next(cacheBustedReq);
  }

  return next(req);
};