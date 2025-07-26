import { Component } from '@angular/core';
@Component({
  selector: 'app-vehicle-management',
  template: `<div class="p-3">
    <h2 class="fw-bold text-warning mb-3">Vehicle Management</h2>
    <p>Manage vehicles, assign drivers, and track vehicle status.</p>
    <ul>
      <li>Vehicle List</li>
      <li>Assign Drivers</li>
      <li>Vehicle Status</li>
    </ul>
  </div>`
})
export class VehicleManagementComponent {}
