import { Component } from '@angular/core';

@Component({
  selector: 'app-customer-management',
  template: `<div class="p-3">
    <h2 class="fw-bold text-primary mb-3">Customer Management</h2>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone Number</th>
          <th>Address</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let customer of customers">
          <td>{{ customer.name }}</td>
          <td>{{ customer.phone }}</td>
          <td>{{ customer.address }}</td>
          <td>{{ customer.email }}</td>
        </tr>
      </tbody>
    </table>
  </div>`
})
export class CustomerManagementComponent {
  customers = [
    { name: 'John Doe', phone: '9876543210', address: '123 Main St, City', email: 'john@example.com' },
    { name: 'Jane Smith', phone: '9123456780', address: '456 Park Ave, City', email: 'jane@example.com' }
  ];
}
