import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GeolocationService, GeolocationPermissionState } from '../../services/geolocation.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.scss']
})
export class DriverComponent implements OnInit {

  // Sidebar state
  sidebarCollapsed: boolean = false;
  
  // Active section state
  activeSection: string = 'dashboard';
  
  // Services dropdown state
  servicesOpen: boolean = false;
  
  // User dropdown state
  showUserDropdown: boolean = false;

  // Menu items for sidebar navigation
  menuItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'bookings', label: 'My Bookings' },
    { key: 'my-truck', label: 'My Trucks' },
    { key: 'my-trips', label: 'My Trips' },
    { key: 'earnings', label: 'Earnings' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'documents', label: 'Documents' },
    { key: 'messages', label: 'Messages' },
    { key: 'support-center', label: 'Support Center' },
    { key: 'profile', label: 'Profile' }
  ];

  // Document alerts for driver
  documentAlerts = [
    { documentType: 'Driving License', vehicleNumber: 'DL-2024-001', daysToExpiry: 30 },
    { documentType: 'Medical Certificate', vehicleNumber: 'MC-2024-002', daysToExpiry: 45 }
  ];

  // --- Geolocation prompt state ---
  showPrompt: boolean = false; // controls whether the location prompt modal is shown
  // TODO: replace this placeholder with real auth/role check
  isDriverUser: boolean = true;
  private geolocationSub: Subscription | null = null;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private geo: GeolocationService
  ) { }

  /**
   * Set the active section for navigation
   */
  setActiveSection(section: string): void {
    this.activeSection = section;
    console.log('Active section changed to:', section);
  }

  /**
   * Toggle sidebar collapsed state
   */
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  ngOnInit(): void {
    console.log('Driver component initialized');
    
    // Listen to route changes and update active section
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const navigationEvent = event as NavigationEnd;
      this.updateActiveSection(navigationEvent.url);
    });
    
    // Set initial active section based on current route
    this.updateActiveSection(this.router.url);

    // Geolocation: show prompt for drivers if permission is not granted
    if (this.isDriverUser) {
      // init permission state and subscribe
      this.geo.updatePermissionState().then((state: GeolocationPermissionState) => {
        this.showPrompt = state !== 'granted';
      }).catch(() => {
        this.showPrompt = true;
      });

      this.geolocationSub = this.geo.permission$().subscribe((state) => {
        this.showPrompt = this.isDriverUser && state !== 'granted';
      });
    }
  }

  ngOnDestroy(): void {
    if (this.geolocationSub) {
      this.geolocationSub.unsubscribe();
      this.geolocationSub = null;
    }
  }

  // Called by the LocationPromptComponent when Retry is clicked
  onRetryLocation(): void {
    // Try to request location once; on success hide prompt
    this.geo.requestLocationOnce(12000).then(pos => {
      console.log('Location obtained', pos.coords);
      this.showPrompt = false;
    }).catch(err => {
      console.warn('Location request failed', err);
      // keep the prompt visible; permission change will update via permission$()
    });
  }

  // Called when user clicks Maybe later - app may allow dismissing non-blocking
  onCancelPrompt(): void {
    // NOTE: make this blocking by removing the ability to cancel
    this.showPrompt = false;
  }

  /**
   * Navigate to specific section
   */
  navigateToSection(section: string): void {
    console.log('Navigating to driver section:', section);
    console.log('Navigation URL:', `/driver/${section}`);
    
    // Set active section immediately for UI responsiveness
    this.setActiveSection(section);
    
    // Navigate to the route
    this.router.navigate([`/driver/${section}`]).then(success => {
      if (success) {
        console.log('Navigation successful to:', `/driver/${section}`);
      } else {
        console.error('Navigation failed to:', `/driver/${section}`);
      }
    }).catch(error => {
      console.error('Navigation error:', error);
    });
  }

  /**
   * Update active section based on current URL
   */
  private updateActiveSection(url: string): void {
    const segments = url.split('/');
    const lastSegment = segments[segments.length - 1];
    
    console.log('Updating active section for URL:', url, 'Last segment:', lastSegment);
    
    // Map URL segments to menu keys
    if (lastSegment === 'driver' || lastSegment === '') {
      this.activeSection = 'dashboard';
    } else if (lastSegment === 'my-trips') {
      this.activeSection = 'my-trips';
    } else if (lastSegment === 'my-truck' || lastSegment === 'trucks') {
      this.activeSection = 'my-truck'; // Both routes point to same component
    } else if (lastSegment === 'support-center' || lastSegment === 'support') {
      this.activeSection = 'support-center'; // Handle both old and new routes
    } else {
      this.activeSection = lastSegment;
    }
    
    console.log('Active section set to:', this.activeSection);
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
   * Handle user logout - redirect to login
   */
  logout(): void {
    console.log('User logging out...');
    this.showUserDropdown = false;
    
    // Clear user session/token
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('userSession');
    
    // Navigate to login page
    this.router.navigate(['/auth/login']);
  }
}