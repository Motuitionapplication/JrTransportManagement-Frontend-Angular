import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvironmentService } from 'src/app/core/services/environment.service';
import { DriverDTO } from 'src/app/models/driver.dto';
import { OwnerService } from '../owner/owner.service';
import { tap } from 'rxjs/operators';
import { Driver } from 'src/app/models/driver.model';

@Injectable({
  providedIn: 'root'
})
export class DriverService {

  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService,
    private ownerService: OwnerService
  ) {
    this.apiUrl = `${this.envService.getApiUrl()}/transport/drivers`;
  }

  /**
   * Fetch all drivers from backend
   */
  getAllDrivers() {
    return this.http.get<Driver[]>(`${this.apiUrl}`);
  }

  /**
   * Fetch single driver by id
   */
  getDriverById(driverId: string) {
    return this.http.get<Driver>(`${this.apiUrl}/${driverId}`);
  }

  /**
   * Create a new driver
   */
  createDriver(driverDTO: DriverDTO) {
    return this.http.post<Driver>(`${this.apiUrl}`, driverDTO);
  }

  updateDriverDetails(driverId: string, driverDTO: DriverDTO): Observable<DriverDTO> {
    return this.http.put<DriverDTO>(`${this.apiUrl}/${driverId}`, driverDTO);
  }

  deleteDriver(driverId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${driverId}`);
  }

  deactivateDriver(driverId: string, ownerId: string): Observable<Driver> {
    return this.http.patch<Driver>(`${this.apiUrl}/${driverId}/deactivate`, {}).pipe(
      // --- NEW: Tap into the successful response to update the cache ---
      tap((updatedDriver) => {
        // Use the public method from OwnerService to update its internal cache
        this.ownerService.updateDriverInCache(ownerId, updatedDriver);
      })
    );
  }

  assignVehicle(driverId: string, vehicleId: string) {
    const requestBody = { vehicleId: vehicleId };

    return this.http.patch(`${this.apiUrl}/${driverId}/assign-vehicle`, requestBody);
  }
  unassignvehicle(driverId: string) {
    return this.http.patch(`${this.apiUrl}/${driverId}/unassign-vehicle`, { driverId });

  }
}

