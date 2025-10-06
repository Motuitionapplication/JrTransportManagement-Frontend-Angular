import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-driver-dashboard',
  templateUrl: './driver-dashboard.component.html',
  styleUrls: ['./driver-dashboard.component.scss']
})
export class DriverDashboardComponent implements OnInit {
  
  // Driver stats
  totalBookings = 25;
  activeTrips = 3;
  totalEarnings = 45000;
  completedTrips = 22;
  
  // Recent activities
  recentActivities = [
    {
      id: 1,
      type: 'success',
      title: 'Trip completed',
      subtitle: 'Booking #B123 - Mumbai to Delhi',
      timestamp: new Date()
    },
    {
      id: 2,
      type: 'info',
      title: 'New booking assigned',
      subtitle: 'Booking #B124 - Pune to Bangalore',
      timestamp: new Date()
    },
    {
      id: 3,
      type: 'warning',
      title: 'Document expiring soon',
      subtitle: 'Driving license expires in 30 days',
      timestamp: new Date()
    }
  ];

  constructor() { }

  ngOnInit(): void {
    console.log('Driver dashboard initialized');
  }

}