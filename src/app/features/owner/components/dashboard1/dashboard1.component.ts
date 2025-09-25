import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard1',
  templateUrl: './dashboard1.component.html',
  styleUrls: ['./dashboard1.component.scss']
})
export class Dashboard1Component {
  // Top Cards Data
  totalVehicles: number = 10;
  activeBookings: number = 5;
  todaysEarnings: number = 1250;
  maintenanceAlerts: number = 2;

  // Fleet Management
  fleet = [
    { vehicle: 'V-1001', driver: 'John Doe', status: 'Available' },
    { vehicle: 'V-1002', driver: 'Jane Smith', status: 'Booked' },
    { vehicle: 'V-1003', driver: 'Tom Brown', status: 'Maintenance' }
  ];

  // Driver Management
  drivers = [
    { name: 'John Doe', license: '2024-05-15', vehicle: 'V-1001' },
    { name: 'Jane Smith', license: '2023-11-30', vehicle: 'V-1002' },
    { name: 'Tom Brown', license: '2024-09-20', vehicle: '-' }
  ];

  // Vehicle Bookings
  bookings = [
    { id: 'B-2001', customer: 'Michael Scott', date: '2024-05-10', payment: 'Paid' }
  ];

  // Maintenance
  maintenance = [
    { vehicle: 'V-1003', date: '2024-05-15', action: 'Schedule' },
    { vehicle: 'Maintenance', date: '2024-04-20', action: 'Pending' }
  ];
}
