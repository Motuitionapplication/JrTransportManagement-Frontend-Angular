import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  ownerName: string = 'Owner Name';
  
  // Sidebar state
  sidebarCollapsed: boolean = false;
  
  // Active section state
  activeSection: string = 'dashboard';

  constructor() { }

  ngOnInit(): void {
    console.log('Admin component initialized');
    // Set default active section
    this.activeSection = 'dashboard';
    // Example: fetch owner name from service or storage
    // this.ownerName = this.authService.getOwnerName();
    // For now, set a default name
    this.ownerName = 'John Doe';
  }

  /**
   * Toggle sidebar collapsed state
   */
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  /**
   * Set the active section for navigation
   * @param section - The section to activate
   */
  setActiveSection(section: string): void {
    this.activeSection = section;
    console.log('Active section changed to:', section);
  }

  /**
   * Check if a section is currently active
   * @param section - The section to check
   * @returns boolean indicating if section is active
   */
  isActiveSection(section: string): boolean {
    return this.activeSection === section;
  }

  /**
   * Handle mobile menu toggle
   * On mobile, clicking menu should show/hide sidebar
   */
  handleMobileMenuToggle(): void {
    if (window.innerWidth <= 768) {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    } else {
      this.toggleSidebar();
    }
  }

  /**
   * Close sidebar when clicking outside (for mobile)
   */
  closeSidebarOnMobile(): void {
    if (window.innerWidth <= 768) {
      this.sidebarCollapsed = true;
    }
  }

  // Sample data for dashboard (you can replace with actual service calls)
  
  /**
   * Get dashboard stats data
   */
  getDashboardStats() {
    return {
      totalBookings: {
        value: 1245,
        change: '+5.0%',
        changeType: 'positive'
      },
      revenue: {
        value: '$54,630',
        change: '-3.2%',
        changeType: 'negative'
      },
      activeDrivers: {
        value: 248,
        change: '+4.1%',
        changeType: 'positive'
      },
      pendingPayments: {
        value: 32,
        change: '-13%',
        changeType: 'negative'
      }
    };
  }

  /**
   * Get recent activity data
   */
  getRecentActivity() {
    return [
      {
        id: 1,
        type: 'success',
        icon: '+',
        title: 'New booking #B123',
        subtitle: 'from John Doe',
        timestamp: new Date()
      },
      {
        id: 2,
        type: 'warning',
        icon: '📦',
        title: 'Driver assigned to booking #B456',
        subtitle: '',
        timestamp: new Date()
      },
      {
        id: 3,
        type: 'success',
        icon: '✓',
        title: 'Booking #B789 completed',
        subtitle: '',
        timestamp: new Date()
      },
      {
        id: 4,
        type: 'error',
        icon: '!',
        title: 'Payment failure for booking #B101',
        subtitle: '',
        timestamp: new Date()
      }
    ];
  }

  /**
   * Get driver management data
   */
  getDriverData() {
    return [
      {
        driverId: 'Baankein 2323',
        name: 'Name',
        entity: 'Reofine',
        may: 'Dec II',
        naz: 'Dec'
      },
      {
        driverId: 'Samkgut 2311',
        name: 'Name',
        entity: 'Ragnon',
        may: 'Dec 3',
        naz: 'Dec'
      }
    ];
  }

  /**
   * Navigate to specific section with additional logic if needed
   */
  navigateToSection(section: string, additionalData?: any): void {
    this.setActiveSection(section);
    
    // Add any section-specific logic here
    switch (section) {
      case 'bookings':
        // Load booking data
        console.log('Loading bookings data...');
        break;
      case 'drivers':
        // Load drivers data
        console.log('Loading drivers data...');
        break;
      case 'customers':
        // Load customers data
        console.log('Loading customers data...');
        break;
      case 'trucks':
        // Load trucks data
        console.log('Loading trucks data...');
        break;
      case 'payments':
        // Load payments data
        console.log('Loading payments data...');
        break;
      case 'reports':
        // Load reports data
        console.log('Loading reports data...');
        break;
      case 'settings':
        // Load settings data
        console.log('Loading settings data...');
        break;
      default:
        console.log('Loading dashboard data...');
    }
  }

  /**
   * Handle user logout
   */
  handleLogout(): void {
    // Add logout logic here
    console.log('User logging out...');
    // Redirect to login page or clear user session
  }

  /**
   * Handle notification click
   */
  handleNotificationClick(): void {
    console.log('Notification clicked');
    // Show notification dropdown or navigate to notifications page
  }

  /**
   * Handle user profile dropdown
   */
  handleProfileDropdown(): void {
    console.log('Profile dropdown clicked');
    // Show user menu dropdown
  }
}