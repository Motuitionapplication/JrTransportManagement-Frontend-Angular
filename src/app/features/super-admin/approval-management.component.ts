import { Component } from '@angular/core';
@Component({
  selector: 'app-approval-management',
  template: `<div class="p-3">
    <h2 class="fw-bold text-success mb-3">Approval Management</h2>
    <p>Approve or reject new registrations, vehicle requests, and consignment requests.</p>
    <ul>
      <li>Pending User Approvals</li>
      <li>Vehicle Approvals</li>
      <li>Consignment Approvals</li>
    </ul>
  </div>`
})
export class ApprovalManagementComponent {}
