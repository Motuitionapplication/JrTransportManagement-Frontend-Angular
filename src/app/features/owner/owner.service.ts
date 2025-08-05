import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvironmentService } from 'src/app/core/services/environment.service';
import { VehicleOwner } from 'src/app/models/owner.model';

@Injectable({
  providedIn: 'root'
})
export class OwnerService {

   private apiUrl: string;
 
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

   deleteOwner(id:string)
   {
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
     return this.http.get<any[]>(`${this.apiUrl}/${ownerId}/drivers`);
   }  
}