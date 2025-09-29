import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-owner',
  templateUrl: './owner.component.html',
  styleUrls: ['./owner.component.scss']
})
export class OwnerComponent implements OnInit {
  sidebarCollapsed: boolean = false;
  activeSection: string = 'dashboard';
  showUserDropdown: boolean = false;

  menuItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'vehicles', label: 'Manage Vehicles' },
  { key: 'drivers', label: 'Manage Drivers' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'wallet', label: 'Wallet' },
  { key: 'earnings', label: 'Earnings' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'tracking', label: 'Tracking' },
 // { key: 'reports', label: 'Reports' },
  //{ key: 'settings', label: 'Settings' }
];


  vehicleCount = 12;
  activeTrips = 5;
  walletBalance = 25000;
  monthlyEarnings = 85000;

  documentAlerts = [
    { documentType: 'Insurance', daysToExpiry: 15, vehicleNumber: 'MH-12-AB-1234' },
    { documentType: 'Registration', daysToExpiry: 30, vehicleNumber: 'MH-12-CD-5678' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('Owner component initialized');
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  /**
   * Close dropdown when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const userProfile = document.querySelector('.user-profile');
    
    if (!userProfile?.contains(target)) {
      this.showUserDropdown = false;
    }
  }

  /**
   * Handle user logout - clear session and redirect to dashboard
   */
  logout(): void {
    console.log('Owner logging out...');
    this.showUserDropdown = false;
    
    // Clear user session/token if needed
    localStorage.removeItem('authToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('ownerToken');
    sessionStorage.removeItem('userSession');
    sessionStorage.removeItem('ownerSession');
    
    // Navigate to dashboard page
    this.router.navigate(['/dashboard']);
  }
}
