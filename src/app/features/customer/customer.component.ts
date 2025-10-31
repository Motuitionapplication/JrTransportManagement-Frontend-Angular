import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { CustomerService } from './customer.service';
import { forkJoin } from 'rxjs';
import { Customer } from 'src/app/models/customer.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Booking } from 'src/app/models/booking.model';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {

  // Sidebar state
  sidebarCollapsed: boolean = false;

  totalBookingsCount: number = 0;
  bookings: Booking[] = [];

  customer: Customer | null = null;
  // Active section state
  activeSection: string = 'dashboard';

  // User dropdown state
  showUserDropdown: boolean = false;

  isLoading: boolean = true;
    errorMessage: string | null = null;

  // Menu items for sidebar navigation
  menuItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'bookings', label: 'My Bookings' },
    { key: 'trips', label: 'My Trips' },
    { key: 'tracking', label: 'Tracking' },
    { key: 'transporthistory', label: 'Transport History' },
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

  constructor(private router: Router, private authService: AuthService, private customerService: CustomerService) { }

  ngOnInit(): void {
    console.log('customer component initialized');

    // <-- 5. CALL THE METHOD TO FETCH DATA
    this.loadCustomerData();

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

    const currentUrl = this.router.url;
    if (currentUrl === '/customer' || currentUrl === '/customer/') {
      this.router.navigate(['/customer/dashboard']);
    }
  }

  private loadCustomerData(): void {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      console.error('User ID not found in local storage. Cannot fetch customer details.');
      this.isLoading = false;
      // Optionally, navigate to login
      this.authService.logout();
      return;
    }
    this.isLoading = true;

    this.customerService.getCustomerByUserId(userId).subscribe({
      next: (customerData) => {
        this.customer = customerData;
        console.log('✅ Customer data fetched:', this.customer.id);

        // Once we have the customer data (and customer.id), fetch their booking history.
        this.customerService.getBookingHistory(this.customer.id).subscribe({
          next: (bookingHistory) => {
            this.bookings = bookingHistory;
            console.log('✅ Booking history fetched:', this.bookings.length);

            // Update the totalBookings property for the dashboard stats
            if (this.customer) {
              this.customer.totalBookings = this.bookings.length;
            }

            // All data is loaded successfully, so stop the loading indicator.
            this.isLoading = false;
          },
          error: (err: HttpErrorResponse) => {
            console.error('❌ Failed to fetch booking history:', err);
            this.errorMessage = "We couldn't load your booking history.";
            this.isLoading = false; // Stop loading on inner error
          }
        });
      },
      error: (err: HttpErrorResponse) => {
        // This catches errors for the initial customer data fetch.
        console.error('❌ Failed to fetch primary customer data:', err);
        
        if (err.status === 401) {
          this.errorMessage = "Your session has expired. Please log in again.";
          this.authService.logout();
        } else {
          this.errorMessage = "We couldn't load your profile. Please try again later.";
        }

        this.isLoading = false; 
      }
    });
  }


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

  closeSidebarOnMobile(): void {
    if (window.innerWidth <= 768) {
      this.sidebarCollapsed = true;
    }
  }


  getDashboardStats() {
    if (!this.customer) {
      return {
        totalBookings: { value: 0, change: '0%', changeType: 'neutral' },
        revenue: { value: '$0', change: '0%', changeType: 'neutral' },
        activeTrips: { value: 0, change: '0%', changeType: 'neutral' },
        pendingPayments: { value: 0, change: '0%', changeType: 'neutral' }
      };
    }

    // Use dynamic data from the fetched customer object
    return {
      totalBookings: {
        value: this.customer.totalBookings || 0, // Use real data
        change: '+5.0%', // This can also be calculated
        changeType: 'positive'
      },
      revenue: {
        value: `$${this.customer.revenue || 0}`, // Use real data
        change: '-3.2%',
        changeType: 'negative'
      },
      activeTrips: {
        value: this.customer.activeTrips || 0, // Use real data
        change: '+4.1%',
        changeType: 'positive'
      },
      pendingPayments: {
        value: this.customer.pendingPayments || 0, // Use real data
        change: '-13%',
        changeType: 'negative'
      }
    };
  }


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


  navigateToSection(section: string, additionalData?: any): void {
    this.setActiveSection(section);

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


  handleLogout(): void {
    console.log('User logging out...');
  }


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
    this.authService.logout();
    this.router.navigate(['/dashboard']);
  }
}