import { Component, OnInit } from '@angular/core';
import { OwnerService } from './owner.service';
import { User } from 'src/app/models/auth.model';

@Component({
  selector: 'app-owner',
  templateUrl: './owner.component.html',
  styleUrls: ['./owner.component.scss']
})
export class OwnerComponent implements OnInit {
toggleSidebar() {
throw new Error('Method not implemented.');
}
setActiveSection(arg0: string) {
throw new Error('Method not implemented.');
}
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
sidebarCollapsed: any;
activeSection: any;
user: User | null = null;

  constructor(private ownerService: OwnerService) { }

  ngOnInit(): void {
    console.log('Owner component initialized');
        this.ownerService.getUser().subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (err) => {
        console.error('Error fetching user:', err);
      }
    });
  }
getUserInitials(): string {
  if (!this.user) return '';
  const first = this.user.firstName ? this.user.firstName.charAt(0).toUpperCase() : '';
  const last = this.user.lastName ? this.user.lastName.charAt(0).toUpperCase() : '';
  return first + last;
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
