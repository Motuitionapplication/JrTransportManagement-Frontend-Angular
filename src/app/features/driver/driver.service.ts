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

  /** Get driver record by driverId */
  getDriverById(driverId: string): Observable<Driver> {
    return this.http.get<Driver>(`${this.apiUrl}/${driverId}`);
  }

  /**
   * Get driver details by associated userId.
   * Endpoint expectation: GET /transport/drivers/profile/userId/{userId}
   */
  getDriverByUserId(userId: string): Observable<Driver> {
    return this.http.get<Driver>(`${this.apiUrl}/profile/userId/${encodeURIComponent(userId)}`);
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

  /**
   * Update driver's last-known location.
   * Preferred endpoint: PATCH /api/transport/drivers/{driverId}/location
   * TODO: Confirm backend path/contract if different.
   */
  updateDriverLocation(driverId: string, coords: { latitude: number; longitude: number }): Observable<Driver> {
    const url = `${this.apiUrl}/${driverId}/location`;
    return this.http.patch<Driver>(url, {
      latitude: coords.latitude,
      longitude: coords.longitude
    });
  }
}

