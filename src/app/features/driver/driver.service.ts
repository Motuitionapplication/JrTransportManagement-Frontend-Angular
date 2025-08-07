import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvironmentService } from 'src/app/core/services/environment.service';
import { DriverDTO } from 'src/app/models/driver.dto';

@Injectable({
  providedIn: 'root'
})
export class DriverService {

  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {
    this.apiUrl = `${this.envService.getApiUrl()}/transport/drivers`;
  }

  updateDriverDetails(driverId: string, driverDTO: DriverDTO): Observable<DriverDTO> {
  return this.http.put<DriverDTO>(`${this.apiUrl}/${driverId}`, driverDTO);
}

    deleteDriver(driverId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${driverId}`);
    }
  

}

