// src/app/services/customer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, switchMap } from 'rxjs';
import { Customer } from '../../models/customer.model';
import { EnvironmentService } from '../../core/services/environment.service';
import { CustomerCreateDto } from 'src/app/models/customer-create-dto';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {
    this.apiUrl = `${this.envService.getApiUrl()}/customers`;
  }

  // Get all customers
  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl);
  }

  // Get customer by ID
  getCustomerById(customerId: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${customerId}`);
  }

  // Get customer by user ID
  getCustomerByUserId(userId: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/by-user/${userId}`);
  }

  // Delete customer
  deleteCustomer(customerId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${customerId}`);
  }

  // ✅ Update customer
  updateCustomer(customerId: string, updatedCustomer: Customer): Observable<any> {
    return this.http.put(`${this.apiUrl}/${customerId}`, updatedCustomer);
  }

  // ✅ Add new customer
  addCustomer(dto: CustomerCreateDto): Observable<Customer> {
    return this.http.put<Customer>(this.apiUrl, dto);
  }
  getCustomerIdByUserId(userId: string): Observable<string> {
  return this.http.get(`${this.apiUrl}/custid`, {
    params: { userid: userId },
    responseType: 'text' // because backend returns ResponseEntity<String>
  });
}

updateCustomerByUserId(userId: string, updatedCustomer: Customer): Observable<any> {
  return this.getCustomerIdByUserId(userId).pipe(
    switchMap((customerId: string) =>
      this.http.put(`${this.apiUrl}/${customerId}`, updatedCustomer)
    )
  );
}
private customerUpdated = new Subject<void>();
customerUpdated$ = this.customerUpdated.asObservable();

refreshProfile(userId: string): void {
  this.getCustomerByUserId(userId).subscribe(customer => {
    // Save in localStorage if needed
    localStorage.setItem('customerName', customer.profile.firstName + ' ' + customer.profile.lastName);
    // Notify others
    this.customerUpdated.next();
  });
}
 updateCustomerPassword(customerId: string, payload: { oldPassword: string; newPassword: string }): Observable<string> {
    return this.http.put(`${this.apiUrl}/${customerId}/password`, payload, {
      responseType: 'text' // backend returns a plain string
    });
  }
   createBooking(customerId: string, bookingRequest: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${customerId}/booking`, bookingRequest);
  }


}
