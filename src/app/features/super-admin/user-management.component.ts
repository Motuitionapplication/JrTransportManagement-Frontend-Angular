import { Component } from '@angular/core';
@Component({
  selector: 'app-user-management',
  template: `<div class="p-3">
    <h2 class="fw-bold text-primary mb-3">User Management</h2>
    <p>View, add, edit, and remove users. Assign roles and manage user access.</p>
    <ul>
      <li>Admins</li>
      <li>Drivers</li>
      <li>Owners</li>
      <li>Customers</li>
    </ul>
  </div>`
})
export class UserManagementComponent {}
