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
      console.log(`Cache cleared for ownerId: ${ownerId}`);
    }
  }

createDriver(driverData: any): Observable<Driver> {
    const { ownerId, ...driverPayload } = driverData;
    if (!ownerId) {
      throw new Error('Owner ID is required to create a driver.');
    }
    const url = `${this.apiUrl}/${ownerId}/drivers`;

    console.log(`Sending POST request to: ${url}`);
    console.log('With payload:', driverPayload);
    return this.http.post<Driver>(url, driverPayload);
  }

  createowner(owner:any)
  {
    return this.http.post(`${this.apiUrl}`, owner);
  }
}
