import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(role: string, credentials: any): Observable<any> {
    return this.http.post(`/api/auth/login/${role}`, credentials);
  }

  register(role: string, data: any): Observable<any> {
    return this.http.post(`/api/auth/register/${role}`, data);
  }

  resetPassword(role: string, data: any): Observable<any> {
    return this.http.post(`/api/auth/reset-password/${role}`, data);
  }
}
