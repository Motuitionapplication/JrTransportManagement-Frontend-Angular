import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Admin } from '../models/admin.model';
import { EnvironmentService } from '../core/services/environment.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {
    this.apiUrl = `${this.envService.getApiUrl()}/admin`;
  }

  // Add new admin
  addAdmin(admin: Admin): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, admin);
  }

  // Fetch all admins
  getAllAdmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(`${this.apiUrl}/all`);
  }

  // Fetch admin by ID
  getAdminById(id: number): Observable<Admin> {
    return this.http.get<Admin>(`${this.apiUrl}/${id}`);
  }

  // Edit admin
  editAdmin(id: number, admin: Admin): Observable<any> {
    return this.http.put(`${this.apiUrl}/edit/${id}`, admin);
  }

  // Delete admin
  deleteAdmin(id: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}
