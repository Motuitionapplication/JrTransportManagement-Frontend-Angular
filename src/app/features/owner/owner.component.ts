import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-owner',
  templateUrl: './owner.component.html',
  styleUrls: ['./owner.component.scss']
})
export class OwnerComponent implements OnInit {
  // Dashboard stats
  vehicleCount: number = 12;
  activeTrips: number = 5;
  walletBalance: number = 25000;
  monthlyEarnings: number = 85000;

  // Document alerts
  documentAlerts: any[] = [
    { documentType: 'Insurance', daysToExpiry: 15, vehicleNumber: 'MH-12-AB-1234' },
    { documentType: 'Registration', daysToExpiry: 30, vehicleNumber: 'MH-12-CD-5678' }
  ];

  constructor() { }

  ngOnInit(): void {
    console.log('Owner component initialized');
  }

  // Navigation methods
  manageVehicles(): void {
    console.log('Navigate to vehicle management');
  }

  trackVehicles(): void {
    console.log('Navigate to vehicle tracking');
  }

  manageDrivers(): void {
    console.log('Navigate to driver management');
  }

  viewBookings(): void {
    console.log('Navigate to bookings');
  }

  manageWallet(): void {
    console.log('Navigate to wallet');
  }

  viewReports(): void {
    console.log('Navigate to reports');
  }
}
