import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { Vehicle, VehicleTracking, MaintenanceRecord } from '../models/vehicle.model';
import { EnvironmentService } from '../core/services/environment.service';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private vehiclesSubject = new BehaviorSubject<Vehicle[]>([]);
  public vehicles$ = this.vehiclesSubject.asObservable();
  private apiUrl = 'YOUR_API_URL_HERE'; // Set your API URL here

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {}

  // FIX: Remove duplicate /api from the endpoint
  private getApiEndpoint(): string {
    const baseUrl = this.envService.getApiUrl(); // This already includes /api
    return `${baseUrl}/vehicle-owners`; // Don't add /api again
  }

  // FIX: Ensure proper token handling
  private getHttpOptions(): { headers: HttpHeaders } {
    const token = localStorage.getItem('auth-token');
    console.log('Token being used:', token ? 'Token present' : 'No token');
    
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return {
      headers: new HttpHeaders(headers)
    };
  }

  // Get vehicles by owner ID with better error handling
  getVehiclesByOwner(ownerId: string): Observable<Vehicle[]> {
    console.log('Fetching vehicles for owner:', ownerId);
    const url = `${this.getApiEndpoint()}/${ownerId}/vehicles`;
    console.log('Making request to URL:', url);
    
    return this.http.get<Vehicle[]>(url, this.getHttpOptions())
      .pipe(
        tap(vehicles => {
          console.log(`✅ Retrieved ${vehicles.length} vehicles for owner ${ownerId}`);
          this.vehiclesSubject.next(vehicles);
        }),
        catchError(error => {
          console.error('❌ Error fetching vehicles for owner:', error);
          console.error('Request URL:', url);
          console.error('Status:', error.status);
          console.error('Error details:', error.error);
          
          if (error.status === 401) {
            console.error('🔐 Authentication failed - token may be invalid or expired');
            // You might want to redirect to login or refresh token here
          } else if (error.status === 404) {
            console.log('Vehicle owner not found');
            return of([]);
          }
          return throwError(() => error);
        })
      );
  }

  // Get owner ID by user ID with better error handling  
  getOwnerIdByUserId(userId: string): Observable<string> {
    console.log('Fetching owner ID for user:', userId);
    const url = `${this.getApiEndpoint()}/ownerid`;
    console.log('Making request to URL:', url, 'with userid param:', userId);
    
    return this.http.get<string>(url, {
      ...this.getHttpOptions(),
      params: { userid: userId },
      responseType: 'text' as 'json'
    }).pipe(
      tap(ownerId => console.log(`✅ Owner ID for user ${userId}: ${ownerId}`)),
      catchError(error => {
        console.error('❌ Error fetching owner ID:', error);
        console.error('Request URL:', url);
        console.error('Status:', error.status);
        
        if (error.status === 401) {
          console.error('🔐 Authentication failed - token may be invalid or expired');
        }
        return throwError(() => error);
      })
    );
  }

  // Combine both calls with better error handling
  getVehiclesForCurrentUser(userId: string): Observable<Vehicle[]> {
    console.log('Getting vehicles for current user:', userId);
    
    return this.getOwnerIdByUserId(userId).pipe(
      tap(ownerId => console.log('✅ Found owner ID:', ownerId)),
      switchMap(ownerId => this.getVehiclesByOwner(ownerId)),
      catchError(error => {
        console.error('❌ Error in getVehiclesForCurrentUser:', error);
        if (error.status === 401) {
          console.error('🔐 Authentication error - user may need to log in again');
        }
        return of([]);
      })
    );
  }

  // Rest of your methods...
  getAllVehicles(): Observable<Vehicle[]> {
    return this.vehicles$;
  }

  getVehicleById(vehicleId: string): Observable<Vehicle | null> {
    return this.vehicles$.pipe(
      map(vehicles => vehicles.find(v => v.id === vehicleId) || null)
    );
  }

  // Document management
  getExpiringDocuments(ownerId?: string, days: number = 30): Observable<{
    vehicleId: string;
    vehicleNumber: string;
    documentType: string;
    expiryDate: Date;
  }[]> {
    if (ownerId) {
      return this.getVehiclesByOwner(ownerId).pipe(
        map(vehicles => {
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

          return expiringDocs;
        })
      );
    } else {
      return of([]);
    }
  }

  // Add the addTruck method to support creating a new truck
  addTruck(truck: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, truck);
  }
}
