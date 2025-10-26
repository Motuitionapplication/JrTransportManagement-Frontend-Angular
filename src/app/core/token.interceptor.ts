import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * TokenInterceptor
 * - Reads token from both legacy ('token') and current ('auth-token') keys
 * - Attaches Authorization header when a token is present
 */
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  // COPILOT-FIX: standardize token key and keep backward compatibility
  private static readonly TOKEN_KEY_CANDIDATES = [
    'auth-token',
    'auth-token-v1',
    'token',
  ];

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let token: string | null = null;
    let sourceKey = '';

    for (const key of TokenInterceptor.TOKEN_KEY_CANDIDATES) {
      const value = localStorage.getItem(key);
      if (value) {
        token = value;
        sourceKey = key;
        break;
      }
    }

    if (token) {
      if (typeof console !== 'undefined') {
        // Debug only; remove or guard by environment if too verbose
        console.debug(
          `[TokenInterceptor] attaching Authorization from key="${sourceKey}" ->`,
          req.url
        );
      }
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    } else if (typeof console !== 'undefined') {
      console.debug(
        '[TokenInterceptor] no auth token found in localStorage for request',
        req.url
      );
    }

    return next.handle(req);
  }
}
