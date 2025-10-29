import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { OwnerService } from './owner.service';
import { User } from 'src/app/models/auth.model';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-owner',
  templateUrl: './owner.component.html',
  styleUrls: ['./owner.component.scss'],
})
export class OwnerComponent implements OnInit {
  // Dashboard stats
  vehicleCount = 12;
  activeTrips = 5;
  walletBalance = 25000;
  monthlyEarnings = 85000;

  // UI State Management - CLEANED UP VERSION
  sidebarCollapsed = false; // Single source of truth for sidebar state
  dropdownOpen = false;
  activeSection: string = 'dashboard';

  // User data
  user: User | null = null;

  // Document alerts
  documentAlerts: any[] = [
    {
      documentType: 'Insurance',
      daysToExpiry: 15,
      vehicleNumber: 'MH-12-AB-1234',
    },
    {
      documentType: 'Registration',
      daysToExpiry: 30,
      vehicleNumber: 'MH-12-CD-5678',
    },
  ];

  // Menu items configuration

  menuItems = [
    { label: 'Dashboard', route: 'dashboard',name:'dashboard_2'},
    { label: 'Vehicles', route: 'vehicles',name:'local_taxi' },
    { label: 'Drivers', route: 'drivers', name:'man' },
    // { label: 'Bookings', route: 'bookings', icon: '📅' },
    { label: 'Earnings', route: 'earnings', name: 'currency_rupee_circle' },
    { label: 'Maintenance', route: 'maintenance', name: 'build' },
    { label: 'Tracking', route: 'tracking', name: 'location_on' },
    { label: 'Analytics', route: 'analytics', name: 'bar_chart_4_bars' },
    { label: 'Notifications', route: 'notifications', name: 'notifications' },
  ];

  constructor(
    public authService: AuthService,
    private ownerService: OwnerService,
    private elRef: ElementRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Owner component initialized');
    this.loadUserData();
    this.handleWindowResize();
  }

  // --- User Data Management ---
  private loadUserData(): void {
    this.ownerService.getUser().subscribe({
      next: (data) => {
        this.user = data;
        console.log('User data loaded:', data);
      },
      error: (err) => {
        console.error('Error fetching user:', err);
      },
    });
  }

  getUserInitials(): string {
    if (!this.user) return 'OU';
    const first = this.user.firstName
      ? this.user.firstName.charAt(0).toUpperCase()
      : '';
    const last = this.user.lastName
      ? this.user.lastName.charAt(0).toUpperCase()
      : '';
    return first + last || 'OU';
  }

  // --- Sidebar Management - FIXED VERSION ---
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    console.log(
      'Sidebar toggled:',
      this.sidebarCollapsed ? 'collapsed' : 'expanded'
    );

    // Store preference in localStorage
    localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed.toString());
  }

  private handleWindowResize(): void {
    // Auto-collapse sidebar on mobile devices
    if (window.innerWidth <= 1024) {
      this.sidebarCollapsed = true;
    } else {
      // Restore sidebar state from localStorage on desktop
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState !== null) {
        this.sidebarCollapsed = savedState === 'true';
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any): void {
    this.handleWindowResize();
  }

  // --- Dropdown Management ---
  toggleDropdown(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    // Close dropdown if clicking outside
    if (!this.elRef.nativeElement.contains(target)) {
      this.dropdownOpen = false;
    }

    // Close sidebar on mobile when clicking outside
    if (window.innerWidth <= 1024 && !this.sidebarCollapsed) {
      const sidebar = this.elRef.nativeElement.querySelector('.sidebar');
      const menuToggle = this.elRef.nativeElement.querySelector('.menu-toggle');

      if (
        sidebar &&
        !sidebar.contains(target) &&
        !menuToggle.contains(target)
      ) {
        this.sidebarCollapsed = true;
      }
    }
  }

  // --- Navigation Methods ---
  setActiveSection(section: string): void {
    this.activeSection = section;
    console.log('Active section set to:', section);

    // Auto-collapse sidebar on mobile after navigation
    if (window.innerWidth <= 1024) {
      this.sidebarCollapsed = true;
    }
  }

  navigateToSection(route: string): void {
    this.router.navigate([route]);

    // Extract section name from route
    const section = route.split('/').pop() || 'dashboard';
    this.setActiveSection(section);
  }

  // --- Authentication ---
  logout(): void {
    this.dropdownOpen = false;
    console.log('👋 User logging out...');

    this.authService.logout();
    this.router.navigate(['/dashboard']);
  }

  // --- Quick Action Methods ---
  manageVehicles(): void {
    console.log('Navigate to vehicle management');
    this.navigateToSection('/owner/vehicles');
  }

  trackVehicles(): void {
    console.log('Navigate to vehicle tracking');
    this.navigateToSection('/owner/tracking');
  }

  manageDrivers(): void {
    console.log('Navigate to driver management');
    this.navigateToSection('/owner/drivers');
  }

  viewBookings(): void {
    console.log('Navigate to bookings');
    this.navigateToSection('/owner/bookings');
  }

  manageWallet(): void {
    console.log('Navigate to wallet');
    this.navigateToSection('/owner/earnings');
  }

  viewReports(): void {
    console.log('Navigate to reports');
    this.navigateToSection('/owner/analytics');
  }

  // --- Utility Methods ---
  getNotificationCount(): number {
    return this.documentAlerts.length;
  }

  hasExpiredDocuments(): boolean {
    return this.documentAlerts.some((alert) => alert.daysToExpiry <= 7);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
