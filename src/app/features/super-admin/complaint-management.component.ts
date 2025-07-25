import { Component } from '@angular/core';
@Component({
  selector: 'app-complaint-management',
  template: `<div class="p-3">
    <h2 class="fw-bold text-dark mb-3">Complaint Management</h2>
    <p>View and resolve complaints from users, drivers, and owners.</p>
    <ul>
      <li>User Complaints</li>
      <li>Driver Complaints</li>
      <li>Owner Complaints</li>
    </ul>
  </div>`
})
export class ComplaintManagementComponent {}
