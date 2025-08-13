import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvironmentService } from 'src/app/core/services/environment.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl: string;
  
    constructor(
      private http: HttpClient,
      private envService: EnvironmentService
    ) {
      this.apiUrl = `${this.envService.getApiUrl()}/payments`;
    }

    getPaymentByDriver(id:string)
    {
      return this.http.get<any[]>(`${this.apiUrl}/driver/${id}`);
    }
}
