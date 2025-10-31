import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EnvironmentService } from 'src/app/core/services/environment.service';
import { Booking, BookingDemand, VehicleAvailability, StatusUpdate } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private bookingsSubject = new BehaviorSubject<Booking[]>([]);
  public bookings$ = this.bookingsSubject.asObservable();

  private demandsSubject = new BehaviorSubject<BookingDemand[]>([]);
  public demands$ = this.demandsSubject.asObservable();

  private availabilitySubject = new BehaviorSubject<VehicleAvailability[]>([]);
  public availability$ = this.availabilitySubject.asObservable();

  constructor() {}

  // Optional HTTP API base - used when backend is available
  private apiUrl?: string;

  // allow injecting HttpClient + EnvironmentService without breaking existing usage
  // (Angular will inject when available)
  setHttp(http: HttpClient | null, env?: EnvironmentService | null) {
    if (http && env) {
      this.apiUrl = `${env.getApiUrl()}/transport/bookings`;
      // store the http client for remote calls
      (this as any)._http = http;
    }
  }

  private get http(): HttpClient | null {
    return (this as any)._http || null;
  }

  // Booking CRUD operations
  createBooking(bookingData: Omit<Booking, 'id' | 'bookingNumber' | 'createdAt' | 'updatedAt'>): Observable<Booking> {
    const newBooking: Booking = {
      ...bookingData,
      id: this.generateId(),
      bookingNumber: this.generateBookingNumber(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const currentBookings = this.bookingsSubject.value;
    this.bookingsSubject.next([...currentBookings, newBooking]);
    
    return of(newBooking);
  }

  getBookingById(bookingId: string): Observable<Booking | null> {
    const booking = this.bookingsSubject.value.find(b => b.id === bookingId);
    return of(booking || null);
  }

  /**
   * Try to fetch bookings from backend with simple pagination and filters.
   * Falls back to local in-memory store if HTTP is unavailable.
   */
  fetchBookings(options?: { page?: number; size?: number; status?: string; q?: string; startDate?: Date | null; endDate?: Date | null; }): Observable<{ items: Booking[]; total: number }> {
    if (!this.http || !this.apiUrl) {
      const items = this.bookingsSubject.value;
      return of({ items, total: items.length });
    }

    let params = new HttpParams();
    if (options?.page != null) params = params.set('page', String(options.page));
    if (options?.size != null) params = params.set('size', String(options.size));
    if (options?.status) params = params.set('status', options.status);
    if (options?.q) params = params.set('q', options.q);
    if (options?.startDate) params = params.set('startDate', new Date(options.startDate).toISOString());
    if (options?.endDate) params = params.set('endDate', new Date(options.endDate).toISOString());

    return this.http.get<{ items: Booking[]; total: number }>(this.apiUrl, { params }).pipe(
      catchError(() => of({ items: this.bookingsSubject.value, total: this.bookingsSubject.value.length }))
    );
  }

  getBookingByIdRemote(bookingId: string): Observable<Booking | null> {
    if (!this.http || !this.apiUrl) return this.getBookingById(bookingId);
    return this.http.get<Booking>(`${this.apiUrl}/${bookingId}`).pipe(catchError(() => of(null)));
  }

  getBookingsByCustomer(customerId: string): Observable<Booking[]> {
    const bookings = this.bookingsSubject.value.filter(b => b.customerId === customerId);
    return of(bookings);
  }

  getBookingsByOwner(ownerId: string): Observable<Booking[]> {
    const bookings = this.bookingsSubject.value.filter(b => b.ownerId === ownerId);
    return of(bookings);
  }

  getBookingsByDriver(driverId: string): Observable<Booking[]> {
    const bookings = this.bookingsSubject.value.filter(b => b.driverId === driverId);
    return of(bookings);
  }

  updateBookingStatus(bookingId: string, status: Booking['status'], note?: string, location?: any): Observable<boolean> {
    const booking = this.bookingsSubject.value.find(b => b.id === bookingId);
    if (!booking) return of(false);

    const statusUpdate: StatusUpdate = {
      status,
      timestamp: new Date(),
      location,
      note,
      updatedBy: 'system' // This should be the actual user ID
    };

    const updatedBooking = {
      ...booking,
      status,
      tracking: {
        ...booking.tracking,
        statusHistory: [...booking.tracking.statusHistory, statusUpdate]
      },
      updatedAt: new Date()
    };

    const currentBookings = this.bookingsSubject.value;
    const bookingIndex = currentBookings.findIndex(b => b.id === bookingId);
    currentBookings[bookingIndex] = updatedBooking;
    this.bookingsSubject.next([...currentBookings]);

    return of(true);
  }

  // Vehicle assignment
  assignVehicleToBooking(bookingId: string, vehicleId: string, ownerId: string, driverId?: string): Observable<boolean> {
    const booking = this.bookingsSubject.value.find(b => b.id === bookingId);
    if (!booking) return of(false);

    const updatedBooking = {
      ...booking,
      vehicleId,
      ownerId,
      driverId,
      status: 'confirmed' as Booking['status'],
      updatedAt: new Date()
    };

    const currentBookings = this.bookingsSubject.value;
    const bookingIndex = currentBookings.findIndex(b => b.id === bookingId);
    currentBookings[bookingIndex] = updatedBooking;
    this.bookingsSubject.next([...currentBookings]);

    return of(true);
  }

  assignVehicleToBookingRemote(bookingId: string, vehicleId: string, ownerId: string, driverId?: string): Observable<boolean> {
    if (!this.http || !this.apiUrl) return this.assignVehicleToBooking(bookingId, vehicleId, ownerId, driverId);
    const body = { vehicleId, ownerId, driverId };
    return this.http.patch<any>(`${this.apiUrl}/${bookingId}/assign`, body).pipe(
      tap((updated: any) => {
        // update local cache if returned
        if (updated && updated.id) {
          const current = this.bookingsSubject.value;
          const idx = current.findIndex(b => b.id === updated.id);
          if (idx > -1) { current[idx] = { ...current[idx], ...updated }; this.bookingsSubject.next([...current]); }
        }
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  // Payment processing
  processPayment(bookingId: string, paymentData: {
    method: string;
    transactionId: string;
    amount: number;
  }): Observable<boolean> {
    const booking = this.bookingsSubject.value.find(b => b.id === bookingId);
    if (!booking) return of(false);

    const updatedBooking = {
      ...booking,
      payment: {
        ...booking.payment,
        status: 'paid' as any,
        paidAmount: paymentData.amount,
        transactionId: paymentData.transactionId,
        paymentDate: new Date()
      },
      updatedAt: new Date()
    };

    const currentBookings = this.bookingsSubject.value;
    const bookingIndex = currentBookings.findIndex(b => b.id === bookingId);
    currentBookings[bookingIndex] = updatedBooking;
    this.bookingsSubject.next([...currentBookings]);

    return of(true);
  }

  // Booking tracking
  updateBookingLocation(bookingId: string, location: {
    latitude: number;
    longitude: number;
    address: string;
  }): Observable<boolean> {
    const booking = this.bookingsSubject.value.find(b => b.id === bookingId);
    if (!booking) return of(false);

    const updatedBooking = {
      ...booking,
      tracking: {
        ...booking.tracking,
        currentLocation: {
          ...location,
          timestamp: new Date()
        }
      },
      updatedAt: new Date()
    };

    const currentBookings = this.bookingsSubject.value;
    const bookingIndex = currentBookings.findIndex(b => b.id === bookingId);
    currentBookings[bookingIndex] = updatedBooking;
    this.bookingsSubject.next([...currentBookings]);

    return of(true);
  }

  // Cancellation
  cancelBooking(bookingId: string, reason: string, cancelledBy: string): Observable<boolean> {
    // Keep existing local behavior, but prefer remote API when available
    if (!this.http || !this.apiUrl) {
      const booking = this.bookingsSubject.value.find(b => b.id === bookingId);
      if (!booking) return of(false);

      // Calculate cancellation fee and refund amount
      const cancellationFee = this.calculateCancellationFee(booking);
      const refundAmount = booking.payment.paidAmount - cancellationFee;

      const updatedBooking = {
        ...booking,
        status: 'cancelled' as Booking['status'],
        cancellation: {
          reason,
          cancelledBy: cancelledBy as any,
          cancellationFee,
          refundAmount,
          cancelledAt: new Date()
        },
        updatedAt: new Date()
      };

      const currentBookings = this.bookingsSubject.value;
      const bookingIndex = currentBookings.findIndex(b => b.id === bookingId);
      currentBookings[bookingIndex] = updatedBooking;
      this.bookingsSubject.next([...currentBookings]);

      return of(true);
    }

    // Remote cancel
    return this.http.patch<any>(`${this.apiUrl}/${bookingId}/cancel`, { reason, cancelledBy }).pipe(
      tap((updated) => {
        if (updated && updated.id) {
          const current = this.bookingsSubject.value;
          const idx = current.findIndex(b => b.id === updated.id);
          if (idx > -1) { current[idx] = { ...current[idx], ...updated }; this.bookingsSubject.next([...current]); }
        }
      }),
      map(() => true),
      catchError((_) => of(false))
    );
  }

  // Demand and availability matching
  createBookingDemand(demand: Omit<BookingDemand, 'id' | 'createdAt' | 'expiresAt'>): Observable<BookingDemand> {
    const newDemand: BookingDemand = {
      ...demand,
      id: this.generateId(),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    };

    const currentDemands = this.demandsSubject.value;
    this.demandsSubject.next([...currentDemands, newDemand]);

    return of(newDemand);
  }

  createVehicleAvailability(availability: Omit<VehicleAvailability, 'id' | 'createdAt' | 'expiresAt'>): Observable<VehicleAvailability> {
    const newAvailability: VehicleAvailability = {
      ...availability,
      id: this.generateId(),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    };

    const currentAvailability = this.availabilitySubject.value;
    this.availabilitySubject.next([...currentAvailability, newAvailability]);

    return of(newAvailability);
  }

  matchDemandWithAvailability(demandId: string): Observable<VehicleAvailability[]> {
    const demand = this.demandsSubject.value.find(d => d.id === demandId);
    if (!demand) return of([]);

    const matchingAvailability = this.availabilitySubject.value.filter(a => 
      a.route.fromCity.toLowerCase() === demand.route.fromCity.toLowerCase() &&
      a.route.toCity.toLowerCase() === demand.route.toCity.toLowerCase() &&
      a.status === 'available' &&
      a.fareRate >= demand.budgetRange.min &&
      a.fareRate <= demand.budgetRange.max
    );

    return of(matchingAvailability);
  }

  // Admin approval
  approveBooking(bookingId: string, approvedBy: string): Observable<boolean> {
    const booking = this.bookingsSubject.value.find(b => b.id === bookingId);
    if (!booking) return of(false);

    const updatedBooking = {
      ...booking,
      adminApproval: {
        isApproved: true,
        approvedBy,
        approvedAt: new Date()
      },
      updatedAt: new Date()
    };

    const currentBookings = this.bookingsSubject.value;
    const bookingIndex = currentBookings.findIndex(b => b.id === bookingId);
    currentBookings[bookingIndex] = updatedBooking;
    this.bookingsSubject.next([...currentBookings]);

    return of(true);
  }

  // Calculate fare based on distance and vehicle type
  calculateFare(distance: number, vehicleType: string, fareRate: number): {
    baseFare: number;
    gstAmount: number;
    serviceCharge: number;
    insuranceCharge: number;
    totalAmount: number;
  } {
    const baseFare = distance * fareRate;
    const gstAmount = baseFare * 0.18; // 18% GST
    const serviceCharge = baseFare * 0.05; // 5% service charge
    const insuranceCharge = baseFare * 0.02; // 2% insurance charge
    const totalAmount = baseFare + gstAmount + serviceCharge + insuranceCharge;

    return {
      baseFare,
      gstAmount,
      serviceCharge,
      insuranceCharge,
      totalAmount
    };
  }

  // Private helper methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateBookingNumber(): string {
    const prefix = 'JRT';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  private calculateCancellationFee(booking: Booking): number {
    // Simple cancellation fee logic - can be made more sophisticated
    const timeToPickup = new Date(booking.pickup.scheduledDate).getTime() - Date.now();
    const hoursToPickup = timeToPickup / (1000 * 60 * 60);

    if (hoursToPickup > 24) {
      return booking.pricing.finalAmount * 0.1; // 10% if cancelled 24+ hours before
    } else if (hoursToPickup > 12) {
      return booking.pricing.finalAmount * 0.25; // 25% if cancelled 12-24 hours before
    } else {
      return booking.pricing.finalAmount * 0.5; // 50% if cancelled within 12 hours
    }
  }
}
