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
}

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private baseUrl = '';
  private apiUrl: string;
  private ownersCache: any[] | null = null;

  private driversCache = new Map<string, any[]>();

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService,
    private authservice: AuthService
  ) {
    this.apiUrl = `${this.envService.getApiUrl()}/vehicles`;
  }

  // getvehiclesbyOwner(id: string) {
  //   return this.http.get<any[]>(`${this.apiUrl}/owner/${id}`);
  // }
  saveVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, vehicle);
  }
  
  // vehicle.service.ts
deleteVehicle(vehicleId: string): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${vehicleId}`);
}
// In your VehicleService
getvehiclesbyOwner(ownerId: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/owner/${ownerId}`).pipe(
    tap(data => console.log('Vehicle service response:', data)), // Debug log
    catchError(error => {
      console.error('Vehicle service error:', error);
      return throwError(error);
    })
  );
}


  getOwnerId(): Observable<string> {
    const user = this.authservice.getCurrentUser();
    if (!user || !user.id) {
      return throwError(
        () => new Error('User ID not found. Please log in again.')
      );
    }

    const url = `${this.envService.getApiUrl()}/vehicle-owners/ownerid?userid=${
      user.id
    }`;
    this.http.get(url, { responseType: 'text' });

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
}
