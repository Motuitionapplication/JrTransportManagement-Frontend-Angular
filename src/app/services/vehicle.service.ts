import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vehicle, VehicleTracking, MaintenanceRecord } from '../models/vehicle.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private vehiclesSubject = new BehaviorSubject<Vehicle[]>([]);
  public vehicles$ = this.vehiclesSubject.asObservable();
  private apiUrl = 'YOUR_API_URL_HERE'; // Set your API URL here

  constructor(private http: HttpClient) {}

  // Vehicle CRUD operations
  getAllVehicles(): Observable<Vehicle[]> {
    // TODO: Replace with actual API call
    return this.vehicles$;
  }

  getVehiclesByOwner(ownerId: string): Observable<Vehicle[]> {
    // TODO: Replace with actual API call
    const vehicles = this.vehiclesSubject.value.filter(v => v.ownerId === ownerId);
    return of(vehicles);
  }

  getVehicleById(vehicleId: string): Observable<Vehicle | null> {
    // TODO: Replace with actual API call
    const vehicle = this.vehiclesSubject.value.find(v => v.id === vehicleId);
    return of(vehicle || null);
  }

  createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Observable<Vehicle> {
    // TODO: Replace with actual API call
    const newVehicle: Vehicle = {
      ...vehicle,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const currentVehicles = this.vehiclesSubject.value;
    this.vehiclesSubject.next([...currentVehicles, newVehicle]);
    
    return of(newVehicle);
  }

  updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Observable<Vehicle | null> {
    // TODO: Replace with actual API call
    const currentVehicles = this.vehiclesSubject.value;
    const vehicleIndex = currentVehicles.findIndex(v => v.id === vehicleId);
    
    if (vehicleIndex === -1) {
      return of(null);
    }
    
    const updatedVehicle = {
      ...currentVehicles[vehicleIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    currentVehicles[vehicleIndex] = updatedVehicle;
    this.vehiclesSubject.next([...currentVehicles]);
    
    return of(updatedVehicle);
  }

  deleteVehicle(vehicleId: string): Observable<boolean> {
    // TODO: Replace with actual API call
    const currentVehicles = this.vehiclesSubject.value;
    const filteredVehicles = currentVehicles.filter(v => v.id !== vehicleId);
    
    if (filteredVehicles.length === currentVehicles.length) {
      return of(false); // Vehicle not found
    }
    
    this.vehiclesSubject.next(filteredVehicles);
    return of(true);
  }

  // Vehicle tracking
  getVehicleTracking(vehicleId: string): Observable<VehicleTracking | null> {
    // TODO: Replace with actual API call - integrate with GPS tracking service
    return of(null);
  }

  updateVehicleLocation(vehicleId: string, location: {
    latitude: number;
    longitude: number;
    address: string;
  }): Observable<boolean> {
    // TODO: Replace with actual API call
    return this.updateVehicle(vehicleId, {
      currentLocation: {
        ...location,
        timestamp: new Date()
      }
    }).pipe(
      map(vehicle => vehicle !== null)
    );
  }

  // Vehicle status management
  updateVehicleStatus(vehicleId: string, status: Vehicle['status']): Observable<boolean> {
    return this.updateVehicle(vehicleId, { status }).pipe(
      map(vehicle => vehicle !== null)
    );
  }

  // Document management
  updateVehicleDocuments(vehicleId: string, documentsUpdate: any): Observable<boolean> {
    return this.getVehicleById(vehicleId).pipe(
      map(vehicle => {
        if (!vehicle) return false;
        
        const updatedDocuments = {
          ...vehicle.documents,
          ...documentsUpdate
        };
        
        return this.updateVehicle(vehicleId, { documents: updatedDocuments });
      }),
      map(result => result !== null)
    );
  }

  getExpiringDocuments(ownerId?: string, days: number = 30): Observable<{
    vehicleId: string;
    vehicleNumber: string;
    documentType: string;
    expiryDate: Date;
  }[]> {
    // TODO: Replace with actual API call
    const vehicles = ownerId ? 
      this.vehiclesSubject.value.filter(v => v.ownerId === ownerId) : 
      this.vehiclesSubject.value;
    
    const expiringDocs: any[] = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    vehicles.forEach(vehicle => {
      Object.entries(vehicle.documents).forEach(([docType, doc]) => {
        if (doc.expiryDate && new Date(doc.expiryDate) <= cutoffDate) {
          expiringDocs.push({
            vehicleId: vehicle.id,
            vehicleNumber: vehicle.vehicleNumber,
            documentType: docType,
            expiryDate: doc.expiryDate
          });
        }
      });
    });

    return of(expiringDocs);
  }

  // Maintenance management
  addMaintenanceRecord(vehicleId: string, maintenance: Omit<MaintenanceRecord, 'id' | 'vehicleId'>): Observable<boolean> {
    const maintenanceRecord: MaintenanceRecord = {
      ...maintenance,
      id: this.generateId(),
      vehicleId
    };

    return this.updateVehicle(vehicleId, {
      maintenanceHistory: [...(this.getVehicleById(vehicleId) as any)?.maintenanceHistory || [], maintenanceRecord]
    }).pipe(
      map(vehicle => vehicle !== null)
    );
  }

  getMaintenanceHistory(vehicleId: string): Observable<MaintenanceRecord[]> {
    return this.getVehicleById(vehicleId).pipe(
      map(vehicle => vehicle?.maintenanceHistory || [])
    );
  }

  // Fare management
  updateFareDetails(vehicleId: string, fareDetails: Vehicle['fareDetails']): Observable<boolean> {
    return this.updateVehicle(vehicleId, { fareDetails }).pipe(
      map(vehicle => vehicle !== null)
    );
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Vendor services integration (for tracking)
  getVendorServices(): Observable<{
    traffic: any[];
    fuel: any[];
    hotels: any[];
    warehouses: any[];
    emergencyServices: any[];
  }> {
    // TODO: Integrate with external APIs for vendor services
    return of({
      traffic: [],
      fuel: [],
      hotels: [],
      warehouses: [],
      emergencyServices: []
    });
  }

  // Add the addTruck method to support creating a new truck
  addTruck(truck: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, truck);
  }
}