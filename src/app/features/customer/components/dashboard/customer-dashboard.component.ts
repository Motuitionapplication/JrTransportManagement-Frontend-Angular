import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { Customer } from '../../../../models/customer.model';
import { Booking } from '../../../../models/booking.model';
import { HttpErrorResponse } from '@angular/common/http';
import { CustomerService } from '../../customer.service';

// --- Local Interfaces for this Component's Template ---
// These define the structure your HTML template expects.
interface StatCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color?: string;
  clickable?: boolean;
  route?: string;
}

interface RecentActivity {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  subtitle: string;
  timestamp: Date;
  bookingNumber: string;
}

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss']
})
export class CustomerDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // --- Component State ---
  isLoading = true;
  isRefreshing = false;
  errorMessage = '';
  lastUpdated: Date | null = null;
  customer: Customer | null = null;

  // --- Data for Display ---
  statsData: StatCard[] = [];
  recentActivities: RecentActivity[] = [];
  upcomingBookings: Booking[] = []; // Uses the real Booking model

  constructor(
    private router: Router,
    private customerService: CustomerService // Inject CustomerService directly
  ) {}

  ngOnInit(): void {
    this.loadAllDashboardData();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Fetches all necessary data for the dashboard in a sequential chain.
   * Replaces all previous 'load...' methods.
   */
  private loadAllDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.errorMessage = "Cannot identify user. Please log in again.";
      this.isLoading = false;
      return;
    }

    this.customerService.getCustomerByUserId(userId).pipe(
      // Use switchMap to get the customer, then use their ID for the next call
      switchMap(customer => {
        console.log('✅ Fetched customer:', customer.id);
        this.customer = customer;
        // Return the next observable in the chain: the booking history
        return this.customerService.getBookingHistory(customer.id);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (bookings) => {
        // This block runs only after BOTH calls are successful
        console.log('✅ Fetched booking history:', bookings.length);
        
        // Populate customer stats and process booking lists for display
        if (this.customer) {
          this.customer.totalBookings = bookings.length;
        }
        this.processBookingsForDashboard(bookings);
        this.updateStatsCards();
        
        this.isLoading = false;
        this.lastUpdated = new Date();
        console.log('✅ Dashboard loaded successfully with real data');
      },
      error: (err: HttpErrorResponse) => {
        console.error('❌ Failed to load dashboard data:', err);
        this.errorMessage = (err.status === 401)
          ? "Your session has expired. Please log in again."
          : "Could not load dashboard data. Please try again.";
        this.isLoading = false;
      }
    });
  }
  private processBookingsForDashboard(allBookings: Booking[]): void {
    // 1. Filter for "Upcoming Bookings" where status is 'pending'
    this.upcomingBookings = allBookings
      .filter(b => b.status === 'pending')
      .sort((a, b) => new Date(a.pickup.scheduledDate).getTime() - new Date(b.pickup.scheduledDate).getTime());

    // 2. Create the "Recent Activities" list from the 5 most recent bookings
    this.recentActivities = [...allBookings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(b => ({
        id: b.id,
        type: 'info',
        title: `Booking ${b.status.charAt(0).toUpperCase() + b.status.slice(1).toLowerCase()}`,
        subtitle: `From ${b.pickup.address.city} to ${b.delivery.address.city}`,
        timestamp: new Date(b.createdAt),
        bookingNumber: b.bookingNumber
      }));
  }

  /**
   * This method is preserved and now uses the real customer data.
   */
  private updateStatsCards(): void {
    if (!this.customer) return;

    this.statsData = [
      {
        title: 'Total Bookings',
        value: this.customer.totalBookings || 0,
        change: '', changeType: 'neutral', icon: 'book_online', color: 'primary', clickable: true, route: '/customer/bookings'
      },
      {
        title: 'Active Trips',
        value: this.customer.activeTrips || 0,
        change: '', changeType: 'neutral', icon: 'local_shipping', color: 'accent', clickable: true, route: '/customer/tracking'
      },
      {
        title: 'Total Spent',
        value: this.formatCurrency(this.customer.revenue || 0),
        change: '', changeType: 'neutral', icon: 'account_balance_wallet', color: 'warn', clickable: true, route: '/customer/payments'
      },
      {
        title: 'Pending Payments',
        value: this.customer.pendingPayments || 0,
        // FIX: Provide a default of 0 to safely perform the comparison
        change: (this.customer.pendingPayments || 0) > 0 ? 'Payment required' : 'All clear',
        changeType: (this.customer.pendingPayments || 0) > 0 ? 'negative' : 'positive',
        icon: 'pending_actions',
        color: (this.customer.pendingPayments || 0) > 0 ? 'warn' : 'primary', 
        clickable: true, 
        route: '/customer/payments'
      }
    ];
  }

  // --- ALL OTHER METHODS ARE PRESERVED ---

  private setupAutoRefresh(): void {
    setInterval(() => {
      if (!this.isLoading && !this.isRefreshing) {
        console.log('🔄 Auto-refreshing dashboard...');
        this.refreshDashboard();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  public refreshDashboard(): void {
    this.isRefreshing = true;
    this.loadAllDashboardData();
    // The 'isRefreshing' flag will be set to false inside loadAllDashboardData
    // We can add a slight delay for better UX
    setTimeout(() => {
      if(this.isRefreshing) this.isRefreshing = false;
    }, 1500);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
  getColor(color: string): string {
  switch (color) {
    case 'primary': return '#1976d2'; // blue
    case 'accent': return '#ff9800'; // orange
    case 'warn': return '#f44336'; // red
    default: return color || '#4caf50'; // green fallback
  }
}


  navigateToBooking(bookingId: string): void {
    this.router.navigate(['/customer/bookings', bookingId]);
  }
  
  onStatCardClick(stat: StatCard): void {
    if (stat.clickable && stat.route) {
      this.router.navigate([stat.route]);
    }
  }

  viewAllBookings(): void {
    this.router.navigate(['/customer/bookings']);
  }
  notifications()
  {
    this.router.navigate(['/customer/notifications']);
  }

  // Utility methods
  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'in_transit': return 'status-transit'; // Corrected from 'in-transit'
      case 'delivered': return 'status-completed';
      default: return 'status-default';
    }
  }

  getTimeAgo(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }

  formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(dateObj);
  }

  public formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  // Track by functions for ngFor performance
  trackStats(index: number, stat: StatCard): string {
    return stat.title;
  }

  trackActivity(index: number, activity: RecentActivity): string {
    return activity.id;
  }

  trackBooking(index: number, booking: Booking): string {
    return booking.id;
  }
}

