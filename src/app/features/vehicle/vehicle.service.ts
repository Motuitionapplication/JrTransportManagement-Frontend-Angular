import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { EnvironmentService } from 'src/app/core/services/environment.service';
import { AuthService } from 'src/app/services/auth.service';

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  manufacturer: string;
  model: string;
  vehicleType: string;
  capacity: number;
  status: string; // Assuming VehicleStatus enum is serialized as a string
  insuranceExpiryDate: string; // Assuming LocalDate is serialized as an ISO string
  driverId: string;
  year?: number;
  owner?: any;
  documents?: any;
  fareDetails?: any;
  location?: any;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private baseUrl = '';
  private apiUrl: string;
  private ownersCache: any[] | null = null;
  private driversCache = new Map();

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService,
    private authservice: AuthService
  ) {
    this.apiUrl = `${this.envService.getApiUrl()}/vehicles`;
  }

  // Save Vehicle (Create/Update)
  saveVehicle(vehicle: Vehicle): Observable<any> {
    console.log('Saving vehicle:', vehicle);
    return this.http.post(this.apiUrl, vehicle).pipe(
      tap(data => console.log('Vehicle saved successfully:', data)),
      catchError(error => {
        console.error('Error saving vehicle:', error);
        return throwError(() => error);
      })
    );
  }

  // Delete Vehicle
  deleteVehicle(vehicleId: string): Observable<any> {
    console.log('Deleting vehicle with ID:', vehicleId);
    return this.http.delete(`${this.apiUrl}/${vehicleId}`).pipe(
      tap(data => console.log('Vehicle deleted successfully:', data)),
      catchError(error => {
        console.error('Error deleting vehicle:', error);
        return throwError(() => error);
      })
    );
  }

  // Update Vehicle
  updateVehicle(vehicleId: string, vehicle: Vehicle): Observable<any> {
    console.log('Updating vehicle:', vehicleId, vehicle);
    return this.http.put(`${this.apiUrl}/${vehicleId}`, vehicle).pipe(
      tap(data => console.log('Vehicle updated successfully:', data)),
      catchError(error => {
        console.error('Error updating vehicle:', error);
        return throwError(() => error);
      })
    );
  }

  // Get Vehicles by Owner
  getvehiclesbyOwner(ownerId: string): Observable<any[]> {
    console.log('Fetching vehicles for owner:', ownerId);
    return this.http.get<any[]>(`${this.apiUrl}/owner/${ownerId}`).pipe(
      tap(data => console.log('Vehicle service response:', data)),
      catchError(error => {
        console.error('Vehicle service error:', error);
        return throwError(() => error);
      })
    );
  }

  // Get Vehicle by ID
  getVehicleById(vehicleId: string): Observable<Vehicle> {
    console.log('Fetching vehicle with ID:', vehicleId);
    return this.http.get<Vehicle>(`${this.apiUrl}/${vehicleId}`).pipe(
      tap(data => console.log('Vehicle fetched successfully:', data)),
      catchError(error => {
        console.error('Error fetching vehicle:', error);
        return throwError(() => error);
      })
    );
  }

  // Get All Vehicles
  getAllVehicles(): Observable<Vehicle[]> {
    console.log('Fetching all vehicles');
    return this.http.get<Vehicle[]>(this.apiUrl).pipe(
      tap(data => console.log('All vehicles fetched:', data)),
      catchError(error => {
        console.error('Error fetching all vehicles:', error);
        return throwError(() => error);
      })
    );
  }

  // Get Owner ID from current user
  getOwnerId(): Observable<string> {
    const user = this.authservice.getCurrentUser();
    if (!user || !user.id) {
      return throwError(
        () => new Error('User ID not found. Please log in again.')
      );
    }

    const url = `${this.envService.getApiUrl()}/vehicle-owners/ownerid?userid=${user.id}`;
    console.log('Fetching owner ID for user:', user.id);
    
    return this.http.get(url, { responseType: 'text' }).pipe(
      map((response) => {
        console.log('✅ Owner ID fetched successfully:', response);
        return response;
      }),
      catchError((error) => {
        console.error('❌ Error fetching owner ID:', error);
        return throwError(() => error);
      })
    );
  }

  // Assign Driver to Vehicle
  assignDriver(vehicleId: string, driverId: string): Observable<any> {
    const payload = { driverId };
    return this.http.put(`${this.apiUrl}/${vehicleId}/assign-driver`, payload).pipe(
      tap(data => console.log('Driver assigned successfully:', data)),
      catchError(error => {
        console.error('Error assigning driver:', error);
        return throwError(() => error);
      })
    );
  }

  // Update Vehicle Status
  updateVehicleStatus(vehicleId: string, status: string): Observable<any> {
    const payload = { status };
    return this.http.patch(`${this.apiUrl}/${vehicleId}/status`, payload).pipe(
      tap(data => console.log('Vehicle status updated:', data)),
      catchError(error => {
        console.error('Error updating vehicle status:', error);
        return throwError(() => error);
      })
    );
  }

  // Search Vehicles
  searchVehicles(searchTerm: string): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/search?q=${encodeURIComponent(searchTerm)}`).pipe(
      tap(data => console.log('Search results:', data)),
      catchError(error => {
        console.error('Error searching vehicles:', error);
        return throwError(() => error);
      })
    );
  }

  // Get Vehicle Statistics
  getVehicleStats(ownerId?: string): Observable<any> {
    const url = ownerId ? `${this.apiUrl}/stats?ownerId=${ownerId}` : `${this.apiUrl}/stats`;
    return this.http.get(url).pipe(
      tap(data => console.log('Vehicle stats:', data)),
      catchError(error => {
        console.error('Error fetching vehicle stats:', error);
        return throwError(() => error);
      })
    );
  }

  // Cache Management Methods
  clearOwnersCache(): void {
    this.ownersCache = null;
  }

  clearDriversCache(): void {
    this.driversCache.clear();
  }

  // Utility method to get current user
  getCurrentUser(): any {
    return this.authservice.getCurrentUser();
  }

  // Validate Vehicle Data
  validateVehicle(vehicle: Vehicle): string[] {
    const errors: string[] = [];
    
    if (!vehicle.vehicleNumber || vehicle.vehicleNumber.trim() === '') {
      errors.push('Vehicle number is required');
    }
    
    if (!vehicle.vehicleType || vehicle.vehicleType.trim() === '') {
      errors.push('Vehicle type is required');
    }
    
    if (!vehicle.manufacturer || vehicle.manufacturer.trim() === '') {
      errors.push('Manufacturer is required');
    }
    
    if (!vehicle.model || vehicle.model.trim() === '') {
      errors.push('Model is required');
    }
    
    if (!vehicle.capacity || vehicle.capacity <= 0) {
      errors.push('Valid capacity is required');
    }
    
    return errors;
  }
}
