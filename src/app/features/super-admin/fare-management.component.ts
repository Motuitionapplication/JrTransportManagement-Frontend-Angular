import { Component } from '@angular/core';
@Component({
  selector: 'app-fare-management',
  template: `<div class="p-3">
    <h2 class="fw-bold text-secondary mb-3">Fare Management</h2>
    <p>Set and update fare rates, view fare history, and manage fare policies.</p>
    <ul>
      <li>Fare Rates</li>
      <li>Fare History</li>
      <li>Fare Policies</li>
    </ul>
  </div>`
})
export class FareManagementComponent {}
