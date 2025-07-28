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

  // Get customer profile by ID
  getCustomerById(customerId: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${customerId}`);
  }

  // Get customer profile by user ID (FK)
  getCustomerByUserId(userId: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/by-user/${userId}`);
  }

  deleteCustomer(customerId: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${customerId}`);
}
  // Update customer profile
  updateCustomer(customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${customer.id}`, customer);
  }

  // Create new customer profile
  createCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer);
  }
}
