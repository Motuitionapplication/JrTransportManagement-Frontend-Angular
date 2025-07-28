import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-management',
  template: `<div class="p-3">
    <h2 class="fw-bold text-primary mb-3">Admin Management</h2>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let admin of admins">
          <td>{{ admin.name }}</td>
          <td>{{ admin.email }}</td>
          <td>{{ admin.role }}</td>
        </tr>
      </tbody>
    </table>
  </div>`
})
export class AdminManagementComponent {
  admins = [
    { name: 'Super Admin', email: 'superadmin@example.com', role: 'Super Admin' },
    { name: 'Branch Admin', email: 'branchadmin@example.com', role: 'Branch Admin' }
  ];
}
