import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VehicleOwnerService {
  constructor(private http: HttpClient) {}
  getVehicles(): Observable<any> { return this.http.get('/api/owner/vehicles'); }
  getDrivers(): Observable<any> { return this.http.get('/api/owner/drivers'); }
  getPayments(): Observable<any> { return this.http.get('/api/owner/payments'); }
  getWallet(): Observable<any> { return this.http.get('/api/owner/wallet'); }
  // Add more methods as needed
}
