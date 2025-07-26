import { Component } from '@angular/core';

@Component({
  selector: 'app-owner-management',
  template: `<div class="p-3">
    <h2 class="fw-bold text-primary mb-3">Owner Management</h2>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Name</th>
          <th>Vehicle Number</th>
          <th>Vehicle Details</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let owner of owners">
          <td>{{ owner.name }}</td>
          <td>{{ owner.vehicleNumber }}</td>
          <td>{{ owner.vehicleDetails }}</td>
        </tr>
      </tbody>
    </table>
  </div>`
})
export class OwnerManagementComponent {
  owners = [
    { name: 'Ravi Kumar', vehicleNumber: 'KL11AA1111', vehicleDetails: 'Ashok Leyland, 2018' },
    { name: 'Priya Singh', vehicleNumber: 'MH12BB2222', vehicleDetails: 'Force Traveller, 2020' }
  ];
}
