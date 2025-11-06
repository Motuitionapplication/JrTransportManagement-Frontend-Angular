import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly apiUrl = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) {}

  saveSettings(settings: any): Observable<any> {
    console.log('Sending settings payload: ', settings); // Debugging log
    return this.http.post<any>(this.apiUrl, settings);
  }

  getSettings(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getBackupHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/backup-history`);
  }

  createBackup(backup: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/backup-history`, backup);
  }

  deleteBackup(backupId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/backup-history/${backupId}`);
  }

  restoreBackup(backupId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/backup-history/${backupId}/restore`,
      {}
    );
  }
}
