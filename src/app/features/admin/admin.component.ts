import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/auth.model';

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
  
  // User dropdown state
  showUserDropdown: boolean = false;
  // Displayed user info
  userName: string = 'Admin';
  userRole: string = 'Admin';
  userAvatarUrl: string = 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=AD';
  userInitials: string = 'AD';
  private currentUser: User | null = null;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    console.log('Admin component initialized');
    // Redirect to dashboard by default if at root admin path
    if (this.router.url === '/admin' || this.router.url === '/admin/') {
      this.router.navigate(['/admin/dashboard']);
    }

    // Initialize displayed user from AuthService (if already stored)
    try {
      const stored = this.authService.getCurrentUser();
      if (stored) this.setUser(stored);
    } catch (e) { /* ignore */ }

    // Subscribe to auth state updates to reflect login/logout
    this.authService.authState$.subscribe(state => {
      if (state && state.user) {
        this.setUser(state.user);
      } else {
        // reset to defaults
        this.userName = 'Admin';
        this.userRole = 'Admin';
        this.userAvatarUrl = 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=AD';
        this.currentUser = null;
      }
    });
  }

  /**
   * Toggle sidebar collapsed state
   */
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
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
    // Navigate to the section using Angular router
    this.router.navigate([`/admin/${section}`]);
    
    // Add any section-specific logic here
    switch (section) {
      case 'bookings':
        console.log('Navigating to bookings...');
        break;
      case 'drivers':
        console.log('Navigating to drivers...');
        break;
      case 'customers':
        console.log('Navigating to customers...');
        break;
      case 'trucks':
        console.log('Navigating to trucks...');
        break;
      case 'payments':
        console.log('Navigating to payments...');
        break;
      case 'reports':
        console.log('Navigating to reports...');
        break;
      case 'settings':
        console.log('Navigating to settings...');
        break;
      default:
        console.log('Navigating to dashboard...');
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
    // Use AuthService to clear stored auth
    try { this.authService.logout(); } catch (e) { console.warn('logout failed', e); }
    try { localStorage.removeItem('authToken'); } catch {}
    try { sessionStorage.removeItem('userSession'); } catch {}
    // Navigate to login page
    this.router.navigate(['/auth/login']);
  }

  private setUser(user: User): void {
    this.currentUser = user;
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Admin';
    this.userName = name;
    this.userRole = (user.roles && user.roles.length > 0) ? (user.roles.includes('ROLE_ADMIN') ? 'Admin' : user.roles[0]) : 'User';
    const initials = (((user.firstName && user.firstName[0]) || (user.username && user.username[0]) || 'A') + ((user.lastName && user.lastName[0]) || '')).toUpperCase();
    this.userInitials = initials;
    this.userAvatarUrl = `https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=${initials}`;
  }
}