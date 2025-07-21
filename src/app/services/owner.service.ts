import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { VehicleOwner, WalletTransaction, OwnerEarnings } from '../models/owner.model';

@Injectable({
  providedIn: 'root'
})
export class OwnerService {
  private ownersSubject = new BehaviorSubject<VehicleOwner[]>([]);
  public owners$ = this.ownersSubject.asObservable();

  constructor() {}

  // Owner profile management
  getOwnerById(ownerId: string): Observable<VehicleOwner | null> {
    const owner = this.ownersSubject.value.find(o => o.id === ownerId);
    return of(owner || null);
  }

  updateOwnerProfile(ownerId: string, updates: Partial<VehicleOwner>): Observable<VehicleOwner | null> {
    const currentOwners = this.ownersSubject.value;
    const ownerIndex = currentOwners.findIndex(o => o.id === ownerId);
    
    if (ownerIndex === -1) {
      return of(null);
    }
    
    const updatedOwner = {
      ...currentOwners[ownerIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    currentOwners[ownerIndex] = updatedOwner;
    this.ownersSubject.next([...currentOwners]);
    
    return of(updatedOwner);
  }

  // Authentication and password management
  resetPassword(userId: string, newPassword: string): Observable<boolean> {
    // TODO: Implement secure password reset with email/SMS verification
    const owner = this.ownersSubject.value.find(o => o.userId === userId);
    if (!owner) return of(false);

    return this.updateOwnerProfile(owner.id, { 
      password: this.hashPassword(newPassword) 
    }).pipe(
      map(result => result !== null)
    );
  }

  changePassword(ownerId: string, currentPassword: string, newPassword: string): Observable<boolean> {
    // TODO: Verify current password before changing
    return this.updateOwnerProfile(ownerId, { 
      password: this.hashPassword(newPassword) 
    }).pipe(
      map(result => result !== null)
    );
  }

  // Vehicle management for owners
  addVehicleToOwner(ownerId: string, vehicleId: string): Observable<boolean> {
    return this.getOwnerById(ownerId).pipe(
      map(owner => {
        if (!owner) return false;
        
        const updatedVehicles = [...owner.vehicles, vehicleId];
        this.updateOwnerProfile(ownerId, { vehicles: updatedVehicles });
        return true;
      })
    );
  }

  removeVehicleFromOwner(ownerId: string, vehicleId: string): Observable<boolean> {
    return this.getOwnerById(ownerId).pipe(
      map(owner => {
        if (!owner) return false;
        
        const updatedVehicles = owner.vehicles.filter(v => v !== vehicleId);
        this.updateOwnerProfile(ownerId, { vehicles: updatedVehicles });
        return true;
      })
    );
  }

  // Wallet management
  getWalletBalance(ownerId: string): Observable<number> {
    return this.getOwnerById(ownerId).pipe(
      map(owner => owner?.wallet.balance || 0)
    );
  }

  addFundsToWallet(ownerId: string, amount: number, description: string): Observable<boolean> {
    const transaction: WalletTransaction = {
      id: this.generateId(),
      type: 'credit',
      amount,
      description,
      timestamp: new Date(),
      status: 'completed'
    };

    return this.getOwnerById(ownerId).pipe(
      map(owner => {
        if (!owner) return false;
        
        const updatedWallet = {
          ...owner.wallet,
          balance: owner.wallet.balance + amount,
          transactions: [...owner.wallet.transactions, transaction]
        };
        
        this.updateOwnerProfile(ownerId, { wallet: updatedWallet });
        return true;
      })
    );
  }

  reserveFunds(ownerId: string, amount: number, referenceId: string): Observable<boolean> {
    const transaction: WalletTransaction = {
      id: this.generateId(),
      type: 'reserved',
      amount,
      description: `Funds reserved for booking ${referenceId}`,
      referenceId,
      timestamp: new Date(),
      status: 'completed'
    };

    return this.getOwnerById(ownerId).pipe(
      map(owner => {
        if (!owner || owner.wallet.balance < amount) return false;
        
        const updatedWallet = {
          ...owner.wallet,
          balance: owner.wallet.balance - amount,
          reservedAmount: owner.wallet.reservedAmount + amount,
          transactions: [...owner.wallet.transactions, transaction]
        };
        
        this.updateOwnerProfile(ownerId, { wallet: updatedWallet });
        return true;
      })
    );
  }

  releaseFunds(ownerId: string, amount: number, referenceId: string): Observable<boolean> {
    const transaction: WalletTransaction = {
      id: this.generateId(),
      type: 'released',
      amount,
      description: `Funds released for booking ${referenceId}`,
      referenceId,
      timestamp: new Date(),
      status: 'completed'
    };

    return this.getOwnerById(ownerId).pipe(
      map(owner => {
        if (!owner || owner.wallet.reservedAmount < amount) return false;
        
        const updatedWallet = {
          ...owner.wallet,
          balance: owner.wallet.balance + amount,
          reservedAmount: owner.wallet.reservedAmount - amount,
          transactions: [...owner.wallet.transactions, transaction]
        };
        
        this.updateOwnerProfile(ownerId, { wallet: updatedWallet });
        return true;
      })
    );
  }

  getTransactionHistory(ownerId: string, limit?: number): Observable<WalletTransaction[]> {
    return this.getOwnerById(ownerId).pipe(
      map(owner => {
        if (!owner) return [];
        
        const transactions = owner.wallet.transactions
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        return limit ? transactions.slice(0, limit) : transactions;
      })
    );
  }

  // Payment and earnings
  getEarnings(ownerId: string): Observable<OwnerEarnings | null> {
    // TODO: Calculate from completed bookings
    return of(null);
  }

  getPaymentHistory(ownerId: string): Observable<any[]> {
    // TODO: Fetch payment history from bookings and transactions
    return of([]);
  }

  // Vendor services tracking
  getVendorServices(location?: { latitude: number; longitude: number }): Observable<{
    traffic: any[];
    fuel: any[];
    hotels: any[];
    warehouses: any[];
    emergencyServices: any[];
  }> {
    // TODO: Integrate with external APIs for vendor services
    return of({
      traffic: this.getMockTrafficInfo(),
      fuel: this.getMockFuelStations(),
      hotels: this.getMockHotels(),
      warehouses: this.getMockWarehouses(),
      emergencyServices: this.getMockEmergencyServices()
    });
  }

  // Document verification and alerts
  getDocumentExpiryAlerts(ownerId: string): Observable<{
    vehicleId: string;
    documentType: string;
    expiryDate: Date;
    daysToExpiry: number;
  }[]> {
    // TODO: Check all vehicle documents for expiry
    return of([]);
  }

  // Terms and conditions
  getTermsAndConditions(): Observable<{
    fare: string;
    transportation: string;
    driver: string;
    riskFactors: string;
  }> {
    return of({
      fare: 'Fare terms and conditions...',
      transportation: 'Transportation terms and conditions...',
      driver: 'Driver terms and conditions...',
      riskFactors: 'Risk factors and liability terms...'
    });
  }

  // Customer details (after payment confirmation)
  getCustomerDetails(bookingId: string): Observable<any> {
    // TODO: Return customer details only after payment confirmation and admin approval
    return of(null);
  }

  // Transport history and analytics
  getTransportHistory(ownerId: string): Observable<any[]> {
    // TODO: Fetch completed bookings with detailed history
    return of([]);
  }

  downloadTransportHistory(ownerId: string, format: 'pdf' | 'excel'): Observable<Blob> {
    // TODO: Generate downloadable report
    return of(new Blob());
  }

  downloadPaymentHistory(ownerId: string, format: 'pdf' | 'excel'): Observable<Blob> {
    // TODO: Generate downloadable payment report
    return of(new Blob());
  }

  // Fare management
  updateFareRates(ownerId: string, vehicleId: string, fareDetails: {
    perKmRate: number;
    wholeFare: number;
    sharingFare: number;
    gstIncluded: boolean;
    movingInsurance: number;
  }): Observable<boolean> {
    // TODO: Update fare rates for specific vehicle
    return of(true);
  }

  // Private helper methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private hashPassword(password: string): string {
    // TODO: Implement proper password hashing
    return btoa(password); // This is just for demo - use proper hashing in production
  }

  // Mock data methods
  private getMockTrafficInfo(): any[] {
    return [
      { location: 'Highway NH-1', status: 'Heavy Traffic', eta: '2 hours delay' },
      { location: 'City Center', status: 'Moderate Traffic', eta: '30 min delay' }
    ];
  }

  private getMockFuelStations(): any[] {
    return [
      { name: 'Indian Oil Petrol Pump', distance: '2.5 km', price: '₹105.20/L' },
      { name: 'Bharat Petroleum', distance: '3.1 km', price: '₹104.95/L' }
    ];
  }

  private getMockHotels(): any[] {
    return [
      { name: 'Highway Rest Inn', distance: '1.2 km', rating: 4.2, contact: '+91-9876543210' },
      { name: 'Truck Drivers Lodge', distance: '2.8 km', rating: 3.8, contact: '+91-9876543211' }
    ];
  }

  private getMockWarehouses(): any[] {
    return [
      { name: 'Central Warehouse', distance: '5.2 km', type: 'Cold Storage', contact: '+91-9876543212' },
      { name: 'Logistics Hub', distance: '8.1 km', type: 'General Storage', contact: '+91-9876543213' }
    ];
  }

  private getMockEmergencyServices(): any[] {
    return [
      { type: 'Police Station', name: 'Traffic Police', distance: '1.8 km', contact: '100' },
      { type: 'Hospital', name: 'City Hospital', distance: '3.2 km', contact: '108' },
      { type: 'Fire Station', name: 'Fire Department', distance: '2.1 km', contact: '101' },
      { type: 'Roadside Assistance', name: '24x7 Recovery', distance: '0.5 km', contact: '+91-9876543214' }
    ];
  }
}
