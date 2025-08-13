import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EnvironmentService } from 'src/app/core/services/environment.service';
import { Driver } from 'src/app/models/driver.model';
import { VehicleOwner } from 'src/app/models/owner.model';

@Injectable({
  providedIn: 'root'
})
export class OwnerService {

  private apiUrl: string;
  private ownersCache: any[] | null = null;

  private driversCache = new Map<string, any[]>();

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {
    this.apiUrl = `${this.envService.getApiUrl()}/vehicle-owners`;
  }

  // Get all customers
  getAllOwners(): Observable<VehicleOwner[]> {
    if (this.ownersCache) {
      console.log('Returning cached owners.');
      return of(this.ownersCache); // 'of' wraps the cached data in an Observable
    }

    return this.http.get<any[]>(this.apiUrl).pipe(
      // The 'tap' operator lets us "peek" at the data without changing it
      tap(owners => {
        // Store the fetched data in our cache for next time
        this.ownersCache = owners;
        console.log('Owners cached.');
      })
    );
  }

  public clearOwnersCache(): void {
    this.ownersCache = null;
    console.log('Owner cache cleared.');
  }

  deleteOwner(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      // ✅ ADD THIS: Clear cache after deleting
      tap(() => {
        this.clearOwnersCache();
        this.clearDriversCacheForOwner(id); // Also clear their drivers from cache
      })
    );
  }

  updateOwner(id: string, status: string): Observable<any> {
    const params = new HttpParams().set('status', status);
    return this.http.put(`${this.apiUrl}/${id}/account-status`, null, { params });
  }

  updateOwnerDetails(id: string, owner: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, owner).pipe(
      // ✅ ADD THIS: Clear cache after updating
      tap(() => {
        this.clearOwnersCache();
      })
    );
  }

  getDriversByOwner(ownerId: string): Observable<any[]> {
    if (this.driversCache.has(ownerId)) {
      console.log(`Returning cached drivers for ownerId: ${ownerId}`);
      return of(this.driversCache.get(ownerId)!);
    }
    console.log(`Fetching drivers from API for ownerId: ${ownerId}`);
    return this.http.get<any[]>(`${this.apiUrl}/${ownerId}/drivers`).pipe(
      tap(drivers => {
        console.log(`Caching drivers for ownerId: ${ownerId}`);
        this.driversCache.set(ownerId, drivers);
      })
    );
  }

  public clearDriversCacheForOwner(ownerId: string): void {
    if (this.driversCache.has(ownerId)) {
      this.driversCache.delete(ownerId);
      console.log(`Cache for drivers of owner ${ownerId} cleared.`);
    }
  }

  createDriver(driverData: any): Observable<Driver> {
    const { ownerId, ...driverPayload } = driverData;
    if (!ownerId) {
      throw new Error('Owner ID is required to create a driver.');
    }
    const url = `${this.apiUrl}/${ownerId}/drivers`;

    return this.http.post<Driver>(url, driverPayload).pipe(
      // ✅ ADD THIS: When a new driver is added to an owner,
      // their list of drivers is now outdated. Clear it.
      tap(() => {
        this.clearDriversCacheForOwner(ownerId);
      })
    );
  }

  createowner(owner: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, owner).pipe(
      tap(() => {
        // When a new owner is created, the list of all owners is now stale.
        this.clearOwnersCache();
      })
    );
  }
}
