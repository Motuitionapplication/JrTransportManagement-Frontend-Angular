import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

    // Get all payments with optional query params
    getAllPayments(params?: any): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}`, { params: params });
    }

    // Process a refund for a payment
    processRefund(paymentId: number | string, payload: { amount: number; reason?: string }) {
      return this.http.post<any>(`${this.apiUrl}/${paymentId}/refund`, payload);
    }

    // Retry a failed payment
    retryPayment(paymentId: number | string) {
      return this.http.post<any>(`${this.apiUrl}/${paymentId}/retry`, {});
    }

    // Resolve a dispute
    resolveDispute(paymentId: number | string, payload: { resolution: string; refund?: boolean }) {
      return this.http.post<any>(`${this.apiUrl}/${paymentId}/resolve`, payload);
    }

    // Send a payment reminder notification
    sendReminder(paymentId: number | string) {
      return this.http.post<any>(`${this.apiUrl}/${paymentId}/remind`, {});
    }

    // Download receipt (returns blob)
    getReceipt(paymentId: number | string) {
      return this.http.get(`${this.apiUrl}/${paymentId}/receipt`, { responseType: 'blob' });
    }
}
