import { Component } from '@angular/core';
@Component({
  selector: 'app-payment-management',
  template: `<div class="p-3">
    <h2 class="fw-bold text-danger mb-3">Payment Management</h2>
    <p>View payment history, process refunds, and manage payment gateways.</p>
    <ul>
      <li>Payment History</li>
      <li>Refunds</li>
      <li>Payment Gateways</li>
    </ul>
  </div>`
})
export class PaymentManagementComponent {}
