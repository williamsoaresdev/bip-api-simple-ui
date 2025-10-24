import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Increment active requests counter
    this.activeRequests++;
    this.updateLoadingState();

    return next.handle(request).pipe(
      finalize(() => {
        // Decrement active requests counter
        this.activeRequests--;
        this.updateLoadingState();
      })
    );
  }

  private updateLoadingState(): void {
    // You can emit to a global loading service here
    // For now, we'll use a simple console log
    if (this.activeRequests > 0) {
      document.body.classList.add('loading');
    } else {
      document.body.classList.remove('loading');
    }
  }
}