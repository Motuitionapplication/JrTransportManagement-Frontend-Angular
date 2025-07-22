import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VendorServicesService {
  constructor(private http: HttpClient) {}
  getVendors(): Observable<any> { return this.http.get('/api/vendor-services'); }
  // Add more methods as needed
}
