import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  constructor(private http: HttpClient) {}
  getBookings(): Observable<any> { return this.http.get('/api/customer/bookings'); }
  getPayments(): Observable<any> { return this.http.get('/api/customer/payments'); }
  getWallet(): Observable<any> { return this.http.get('/api/customer/wallet'); }
  // Add more methods as needed
}
