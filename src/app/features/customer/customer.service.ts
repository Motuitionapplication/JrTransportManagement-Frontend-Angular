// src/app/services/customer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Address, Customer } from '../../models/customer.model';
import { EnvironmentService } from '../../core/services/environment.service';
import { CustomerCreateDto } from 'src/app/models/customer-create-dto';
import { Booking } from 'src/app/models/booking.model';

interface BookingApiResponse {
  id: string;
  bookingNumber: string;
  customerId: string;
  status: 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  pickupAddress: Address; // Matches API structure
  deliveryAddress: Address; // Matches API structure
  scheduledPickupDate: string; // Is a string in JSON
  createdAt: string; // Is a string in JSON
  // Add other raw fields if needed for transformation
}
export interface BookingRequestPayload {
  customerId: string;
  pickupLocation: { street: string; city: string; state: string; pincode: string; country: string; };
  dropOffLocation: { street: string; city: string; state: string; pincode: string; country: string; };
  pickupDate: string; // YYYY-MM-DD format
  pickupTime: string;
  truckRequirements: {
    vehicleType: 'TRUCK' | 'VAN' | 'TRAILER' | 'CONTAINER' | 'PICKUP';
    cargoWeightKg: number;
    cargoLengthMeters?: number;
    cargoWidthMeters?: number;
    cargoHeightMeters?: number;
  };
}

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
  getBookingHistory(customerId: string): Observable<Booking[]> {
    return this.http.get<BookingApiResponse[]>(`${this.apiUrl}/${customerId}/booking-history`).pipe(
      map(apiBookings => {
        return apiBookings.map(apiBooking => {
          const formattedBooking: Booking = {
            id: apiBooking.id,
            bookingNumber: apiBooking.bookingNumber,
            customerId: apiBooking.customerId,
            pickup: {
              address: apiBooking.pickupAddress,
              scheduledDate: new Date(apiBooking.scheduledPickupDate),
              contactPerson: { name: '', phoneNumber: '' },
              scheduledTime: '' 
            },
            delivery: {
              address: apiBooking.deliveryAddress,
              contactPerson: { name: '', phoneNumber: '' },
              scheduledDate: new Date() 
            },
            
            // Convert status from "PENDING" to "pending" to match your model's type
            status: apiBooking.status.toLowerCase() as 'pending' | 'confirmed' | 'delivered', // Type assertion
            
            createdAt: new Date(apiBooking.createdAt), // Convert string to Date
            updatedAt: new Date(), // Placeholder
            cargo: { description: '', type: 'general', weight: 0, photos: [] },
            route: { totalDistance: 0, estimatedDuration: 0 },
            pricing: { baseFare: 0, perKmRate: 0, gstAmount: 0, serviceCharge: 0, insuranceCharge: 0, totalAmount: 0, finalAmount: 0 },
            payment: { method: 'wallet', status: 'pending', paidAmount: 0 },
            tracking: { statusHistory: [] },
            communications: [],
            termsAccepted: { customer: true },
            insurance: { provider: '', policyNumber: '', coverageAmount: 0, premium: 0 }
          };
          return formattedBooking;
        });
      })
    );
  }
  public createBooking(customerId: string, payload: BookingRequestPayload): Observable<{ message: string }> {
  const url = `${this.apiUrl}/${customerId}/booking`;
  return this.http.post<{ message: string }>(url, payload);
}


}
