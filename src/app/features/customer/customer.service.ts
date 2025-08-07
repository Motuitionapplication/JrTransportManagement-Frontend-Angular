import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../../models/customer.model';
import { EnvironmentService } from '../../core/services/environment.service';

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

  // ✅ Update customer using ID and payload
  updateCustomer(customerId: string, updatedCustomer: Customer): Observable<any> {
    return this.http.put(`${this.apiUrl}/${customerId}`, updatedCustomer);
  }
}
