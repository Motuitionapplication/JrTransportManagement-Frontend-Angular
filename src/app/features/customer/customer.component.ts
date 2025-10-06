import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {
  
  // Sidebar state
  sidebarCollapsed: boolean = false;
  
  // Active section state
  activeSection: string = 'dashboard';
  
  // User dropdown state
  showUserDropdown: boolean = false;

  // Menu items for sidebar navigation
  menuItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'bookings', label: 'My Bookings' },
    // { key: 'trucks', label: 'My Trucks' },
    { key: 'trips', label: 'My Trips' },
    { key: 'tracking', label: 'Tracking' },
    { key: 'transporthistory', label: 'Transport History' },
    // { key: 'earnings', label: 'Earnings' },
    // { key: 'schedule', label: 'Schedule' },
    // { key: 'documents', label: 'Documents' },
    { key: 'wallet', label: 'Wallet' },
    { key: 'messages', label: 'Messages' },
    { key: 'support', label: 'Support' },
    { key: 'profile', label: 'Profile' }
  ];

  // Document alerts for customer
  documentAlerts = [
    { documentType: 'Driving License', vehicleNumber: 'DL-2024-001', daysToExpiry: 30 },
    { documentType: 'Medical Certificate', vehicleNumber: 'MC-2024-002', daysToExpiry: 45 }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    console.log('customer component initialized');
    
    // Subscribe to router events to update active section
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.updateActiveSectionFromUrl(event.url);
        }
      });
    
    // Set initial active section based on current URL
    this.updateActiveSectionFromUrl(this.router.url);
    
    // Navigate to dashboard by default if we're at the customer root
    const currentUrl = this.router.url;
    if (currentUrl === '/customer' || currentUrl === '/customer/') {
      this.router.navigate(['/customer/dashboard']);
    }
  }

  /**
   * Update active section based on current URL
   */
  private updateActiveSectionFromUrl(url: string): void {
    if (url.includes('/customer/dashboard')) {
      this.activeSection = 'dashboard';
    } else if (url.includes('/customer/bookings')) {
      this.activeSection = 'bookings';
    } else if (url.includes('/customer/trips')) {
      this.activeSection = 'trips';
    } else if (url.includes('/customer/tracking')) {
      this.activeSection = 'tracking';
    } else if (url.includes('/customer/transport-history')) {
      this.activeSection = 'transporthistory';
    } else if (url.includes('/customer/wallet')) {
      this.activeSection = 'wallet';
    } else if (url.includes('/customer/messages')) {
      this.activeSection = 'messages';
    } else if (url.includes('/customer/support')) {
      this.activeSection = 'support';
    } else {
      this.activeSection = 'dashboard';
    }
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
    
    // Navigate to the appropriate route
    switch (section) {
      case 'dashboard':
        this.router.navigate(['/customer/dashboard']);
        break;
      case 'bookings':
        this.router.navigate(['/customer/bookings']);
        break;
      case 'trips':
        this.router.navigate(['/customer/trips']);
        break;
      case 'tracking':
        this.router.navigate(['/customer/tracking']);
        break;
      case 'transporthistory':
        this.router.navigate(['/customer/transport-history']);
        break;
      case 'wallet':
        this.router.navigate(['/customer/wallet']);
        break;
      case 'book-transport':
        this.router.navigate(['/customer/book-transport']);
        break;
      case 'payments':
        this.router.navigate(['/customer/payments']);
        break;
      case 'profile':
        this.router.navigate(['/customer/profile']);
        break;
      case 'messages':
        this.router.navigate(['/customer/messages']);
        break;
      case 'support':
        this.router.navigate(['/customer/support']);
        break;
      case 'notifications':
        this.router.navigate(['/customer/notifications']);
        break;
      default:
        console.warn('Unknown section:', section);
    }
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
      activecustomers: {
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
        title: 'customer assigned to booking #B456',
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
   * Get customer management data
   */
  getcustomerData() {
    return [
      {
        customerId: 'Baankein 2323',
        name: 'Name',
        entity: 'Reofine',
        may: 'Dec II',
        naz: 'Dec'
      },
      {
        customerId: 'Samkgut 2311',
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
      case 'customers':
        // Load customers data
        console.log('Loading customers data...');
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

  /**
   * Toggle user dropdown menu
   */
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
   * Handle user logout - redirect to dashboard
   */
  logout(): void {
    console.log('User logging out...');
    this.showUserDropdown = false;
    
    // Clear user session/token if needed
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('userSession');
    
    // Navigate to dashboard page
    this.router.navigate(['/dashboard']);
  }
}