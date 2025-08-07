import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EnvironmentService } from 'src/app/core/services/environment.service';
import { VehicleOwner } from 'src/app/models/owner.model';

@Injectable({
  providedIn: 'root'
})
export class OwnerService {

  private apiUrl: string;
  
  // === NEW: A private Map to act as our cache ===
  // The key will be the ownerId (string), and the value will be the array of drivers.
  private driversCache = new Map<string, any[]>();

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {
    this.apiUrl = `${this.envService.getApiUrl()}/vehicle-owners`;
  }

  // Get all customers
  getAllOwners(): Observable<VehicleOwner[]> {
    return this.http.get<VehicleOwner[]>(this.apiUrl);
  }

  deleteOwner(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateOwner(id: string, status: string): Observable<any> {
    const params = new HttpParams().set('status', status);
    return this.http.put(`${this.apiUrl}/${id}/account-status`, null, { params });
  }

  updateOwnerDetails(id: string, owner: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, owner);
  }

  // === MODIFIED: This method now uses the cache ===
  getDriversByOwner(ownerId: string): Observable<any[]> {
    // 1. Check if the drivers for this owner are already in the cache
    if (this.driversCache.has(ownerId)) {
      // If yes, return the cached data as an Observable using `of()`
      console.log(`Returning cached drivers for ownerId: ${ownerId}`);
      return of(this.driversCache.get(ownerId)!);
    }

    // 2. If not in the cache, make the HTTP request
    console.log(`Fetching drivers from API for ownerId: ${ownerId}`);
    return this.http.get<any[]>(`${this.apiUrl}/${ownerId}/drivers`).pipe(
      // 3. Use the `tap` operator to save the result to the cache before returning
      tap(drivers => {
        console.log(`Caching drivers for ownerId: ${ownerId}`);
        this.driversCache.set(ownerId, drivers);
      })
    );
  }

  // === NEW: Method to clear the cache for a specific owner ===
  // This ensures data is fresh after an update, add, or delete.
  public clearDriversCacheForOwner(ownerId: string): void {
    if (this.driversCache.has(ownerId)) {
      this.driversCache.delete(ownerId);
      console.log(`Cache cleared for ownerId: ${ownerId}`);
    }
  }
}
