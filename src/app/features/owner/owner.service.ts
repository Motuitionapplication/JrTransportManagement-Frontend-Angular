import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  // ------------------- USER (AUTH) METHODS -------------------
  /**
   * Get the currently logged-in user.
   * Requires backend endpoint like /api/auth/me that works with JWT.
   */
  getUser(): Observable<any> {
    const token = localStorage.getItem('token'); // adjust if you store elsewhere
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    // Prefer /me instead of /signin
    return this.http.get<any>(
      `${this.envService.getApiUrl()}/auth/me`,
      { headers }
    );
  }

  // ------------------- DRIVER METHODS -------------------
  public updateDriverInCache(ownerId: string, updatedDriver: Driver): void {
    if (this.driversCache.has(ownerId)) {
      console.log(`Updating driver ${updatedDriver.id} in cache for owner ${ownerId}.`);
      const drivers = this.driversCache.get(ownerId)!;
      const index = drivers.findIndex(d => d.id === updatedDriver.id);
      if (index !== -1) {
        drivers[index] = updatedDriver;
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

  // ------------------- OWNER METHODS -------------------
  getAllOwners(): Observable<VehicleOwner[]> {
    if (this.ownersCache) {
      return of(this.ownersCache);
    }
    return this.http.get<VehicleOwner[]>(this.apiUrl).pipe(
      tap(owners => {
        this.ownersCache = owners;
      })
    );
  }

  public clearOwnersCache(): void {
    this.ownersCache = null;
  }

  createOwner(owner: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, owner).pipe(
      tap(() => this.clearOwnersCache())
    );
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

  // ------------------- ASSIGNMENT HISTORY -------------------
  getAssignmentHistoryForOwner(ownerId: string): Observable<AssignmentHistoryDto[]> {
    const url = `${this.apiUrl}/${ownerId}/assignment-history`;
    return this.http.get<AssignmentHistoryDto[]>(url);
  }
}
