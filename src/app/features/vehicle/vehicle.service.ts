import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvironmentService } from 'src/app/core/services/environment.service';

export interface Vehicle {
  id:string;
  vehicleNumber: string;
  manufacturer: string;
  model: string;
  vehicleType: string;
  capacity: number;
  status: string; // Assuming VehicleStatus enum is serialized as a string
  insuranceExpiryDate: string; // Assuming LocalDate is serialized as an ISO string
  driverId:string
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  private apiUrl: string;
    private ownersCache: any[] | null = null;
  
    private driversCache = new Map<string, any[]>();
  
    constructor(
      private http: HttpClient,
      private envService: EnvironmentService
    ) {
      this.apiUrl = `${this.envService.getApiUrl()}/vehicles`;
    }

    getvehiclesbyOwner(id:string)
    {
      return this.http.get<any[]>(`${this.apiUrl}/owner/${id}`);
    }
    saveVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, vehicle);
  }
}
