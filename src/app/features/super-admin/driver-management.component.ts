import { Component } from '@angular/core';

@Component({
  selector: 'app-driver-management',
  template: `<div class="p-3">
    <h2 class="fw-bold text-primary mb-3">Driver Management</h2>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Name</th>
          <th>Vehicle Number</th>
          <th>Vehicle Details</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let driver of drivers">
          <td>{{ driver.name }}</td>
          <td>{{ driver.vehicleNumber }}</td>
          <td>{{ driver.vehicleDetails }}</td>
        </tr>
      </tbody>
    </table>
  </div>`
})
export class DriverManagementComponent {
  drivers = [
    { name: 'Amit Sharma', vehicleNumber: 'DL01CC3333', vehicleDetails: 'Eicher Pro, 2017' },
    { name: 'Sunil Verma', vehicleNumber: 'TN09DD4444', vehicleDetails: 'BharatBenz, 2022' }
  ];
}
