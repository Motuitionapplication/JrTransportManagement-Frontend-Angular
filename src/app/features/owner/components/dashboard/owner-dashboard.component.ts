import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-owner-dashboard',
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.scss']
})
export class OwnerDashboardComponent implements OnInit {

  // Dashboard statistics
  vehicleCount: number = 0;
  activeTrips: number = 0;
  walletBalance: number = 0;
  monthlyEarnings: number = 0;

  // Recent activity list
  recentActivities: { message: string; time: string; type: string }[] = [];

  constructor() {}

  ngOnInit(): void {
    // Mock data – replace with API calls later
    this.vehicleCount = 12;
    this.activeTrips = 5;
    this.walletBalance = 15200;
    this.monthlyEarnings = 48200;

    this.recentActivities = [
      { message: 'New booking received for Mumbai → Delhi', time: '2 hours ago', type: 'success' },
      { message: 'Vehicle MH-12-AB-1234 completed delivery', time: '4 hours ago', type: 'truck' },
      { message: 'Driver license renewal due for Raj Kumar', time: '1 day ago', type: 'warning' }
    ];
  }

}
