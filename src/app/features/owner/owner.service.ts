import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EnvironmentService } from 'src/app/core/services/environment.service';
import { Driver } from 'src/app/models/driver.model';
import { VehicleOwner } from 'src/app/models/owner.model';

interface AssignmentHistoryDto {
  vehicleNumber: string;
  vehicleModel: string;
  driverFirstName: string;
  driverLastName: string;
  driverPhoneNumber: string;
  assignmentStartDate: string;
  assignmentEndDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class OwnerService {

  private apiUrl: string;
  private ownersCache: VehicleOwner[] | null = null;
  private driversCache = new Map<string, Driver[]>();

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {
    this.apiUrl = `${this.envService.getApiUrl()}/vehicle-owners`;
  }

  // --- NEW: Public method to update a single driver in the cache ---
  /**
   * Updates a specific driver's data within the driversCache.
   * This should be called by other services after a successful update/deactivation.
   * @param ownerId The ID of the owner whose driver list needs updating.
   * @param updatedDriver The driver object with the updated data.
   */
  public updateDriverInCache(ownerId: string, updatedDriver: Driver): void {
    if (this.driversCache.has(ownerId)) {
      console.log(`Updating driver ${updatedDriver.id} in cache for owner ${ownerId}.`);
      const drivers = this.driversCache.get(ownerId)!;
      const index = drivers.findIndex(d => d.id === updatedDriver.id);
      if (index !== -1) {
        drivers[index] = updatedDriver; // Replace the old driver object with the new one
        this.driversCache.set(ownerId, drivers);
      }
    }
  }

  createDriver(driverData: any): Observable<Driver> {
    const { ownerId, ...driverPayload } = driverData;
    if (!ownerId) {
      throw new Error('Owner ID is required to create a driver.');
    }
    const url = `${this.apiUrl}/${ownerId}/drivers`;

    return this.http.post<Driver>(url, driverPayload).pipe(
      // --- MODIFIED: Now updates the cache directly instead of just clearing it ---
      tap((savedDriver) => {
        if (this.driversCache.has(ownerId)) {
          console.log(`Adding new driver to cache for owner ${ownerId}.`);
          const cachedDrivers = this.driversCache.get(ownerId)!;
          cachedDrivers.push(savedDriver);
          this.driversCache.set(ownerId, cachedDrivers);
        }
      })
    );
  }

  // --- All other methods from your service remain the same ---
  // (getAllOwners, clearOwnersCache, deleteOwner, updateOwnerDetails, getDriversByOwner, etc.)

  getAllOwners(): Observable<VehicleOwner[]> {
    if (this.ownersCache) {
      return of(this.ownersCache);
    }
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(owners => {
        this.ownersCache = owners;
      })
    );
  }

  public clearOwnersCache(): void {
    this.ownersCache = null;
  }

  deleteOwner(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.clearOwnersCache();
        this.clearDriversCacheForOwner(id);
      })
    );
  }

  updateOwnerDetails(id: string, owner: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, owner).pipe(
      tap(() => this.clearOwnersCache())
    );
  }

  getDriversByOwner(ownerId: string): Observable<any[]> {
    if (this.driversCache.has(ownerId)) {
      return of(this.driversCache.get(ownerId)!);
    }
    return this.http.get<any[]>(`${this.apiUrl}/${ownerId}/drivers`).pipe(
      tap(drivers => this.driversCache.set(ownerId, drivers))
    );
  }
  
  public clearDriversCacheForOwner(ownerId: string): void {
    if (this.driversCache.has(ownerId)) {
      this.driversCache.delete(ownerId);
    }
  }

  createowner(owner: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, owner).pipe(
      tap(() => this.clearOwnersCache())
    );
  }
   getAssignmentHistoryForOwner(ownerId: string): Observable<AssignmentHistoryDto[]> {
    const url = `${this.apiUrl}/${ownerId}/assignment-history`;
    return this.http.get<AssignmentHistoryDto[]>(url);
  }
}
