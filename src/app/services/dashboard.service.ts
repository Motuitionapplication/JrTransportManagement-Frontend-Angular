import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, throwError } from 'rxjs';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  totalBookings: number;
  activeShipments: number;
  totalSpent: number;
  pendingPayments: number;
  completedTrips: number;
  cancelledBookings: number;
  monthlyBookings: number;
  weeklyBookings: number;
}

export interface RecentActivity {
  id: number;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  subtitle?: string;
  timestamp: Date;
  bookingId?: string;
  amount?: number;
  status?: string;
  actionUrl?: string;
  read?: boolean;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  routerLink: string;
  isEnabled: boolean;
  badgeCount?: number;
}

export interface BookingTrend {
  month: string;
  bookings: number;
  revenue: number;
  cancelled: number;
}

export interface NotificationSummary {
  unreadMessages: number;
  pendingPayments: number;
  activeBookings: number;
  overduePayments: number;
}

export interface CustomerProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  memberSince: Date;
  totalBookings: number;
  loyaltyPoints: number;
  preferredRoute?: string;
  avatar?: string;
}

export interface UpcomingBooking {
  id: string;
  from: string;
  to: string;
  departureTime: Date;
  estimatedArrival: Date;
  status: 'confirmed' | 'pending' | 'in-transit' | 'delayed';
  driver?: {
    name: string;
    phone: string;
    rating: number;
  };
  vehicle?: {
    number: string;
    type: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;
  
  // BehaviorSubjects for reactive state management
  private statsSubject = new BehaviorSubject<DashboardStats | null>(null);
  private activitiesSubject = new BehaviorSubject<RecentActivity[]>([]);
  private quickActionsSubject = new BehaviorSubject<QuickAction[]>([]);
  private trendsSubject = new BehaviorSubject<BookingTrend[]>([]);
  private notificationsSubject = new BehaviorSubject<NotificationSummary | null>(null);
  private profileSubject = new BehaviorSubject<CustomerProfile | null>(null);
  private upcomingBookingsSubject = new BehaviorSubject<UpcomingBooking[]>([]);

  // Public observables
  public stats$ = this.statsSubject.asObservable();
  public activities$ = this.activitiesSubject.asObservable();
  public quickActions$ = this.quickActionsSubject.asObservable();
  public trends$ = this.trendsSubject.asObservable();
  public notifications$ = this.notificationsSubject.asObservable();
  public profile$ = this.profileSubject.asObservable();
  public upcomingBookings$ = this.upcomingBookingsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeDefaultActions();
  }

  /**
   * Load complete dashboard data
   */
  loadDashboardData(): Observable<any> {
    return combineLatest([
      this.loadStats(),
      this.loadRecentActivities(),
      this.loadBookingTrends(),
      this.loadNotifications(),
      this.loadProfile(),
      this.loadUpcomingBookings()
    ]).pipe(
      map(([stats, activities, trends, notifications, profile, upcomingBookings]) => ({
        stats,
        activities,
        trends,
        notifications,
        profile,
        upcomingBookings
      })),
      shareReplay(1)
    );
  }

  /**
   * Load dashboard statistics
   */
  loadStats(): Observable<DashboardStats> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      map(response => this.mapStatsResponse(response)),
      tap(stats => this.statsSubject.next(stats)),
      catchError(error => {
        console.error('Error loading dashboard stats, using mock data:', error);
        // Generate dynamic mock data with current timestamp
        const baseDate = new Date();
        const randomBookings = Math.floor(Math.random() * 50) + 10; // 10-60 bookings
        const activeShipments = Math.floor(Math.random() * 8) + 1; // 1-8 active
        const totalSpent = Math.round((Math.random() * 2000 + 500) * 100) / 100; // $500-$2500
        
        const mockStats: DashboardStats = {
          totalBookings: randomBookings,
          activeShipments: activeShipments,
          totalSpent: totalSpent,
          pendingPayments: Math.floor(Math.random() * 5), // 0-4 pending
          completedTrips: randomBookings - activeShipments - Math.floor(Math.random() * 3),
          cancelledBookings: Math.floor(Math.random() * 3), // 0-2 cancelled
          monthlyBookings: Math.floor(randomBookings * 0.4), // ~40% of total
          weeklyBookings: Math.floor(Math.random() * 5) + 1 // 1-5 this week
        };
        this.statsSubject.next(mockStats);
        return [mockStats];
      })
    );
  }

  /**
   * Load recent activities
   */
  loadRecentActivities(limit: number = 10): Observable<RecentActivity[]> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http.get<any[]>(`${this.apiUrl}/activities`, { params }).pipe(
      map(response => response.map(activity => this.mapActivityResponse(activity))),
      tap(activities => this.activitiesSubject.next(activities)),
      catchError(error => {
        console.error('Error loading recent activities, using mock data:', error);
        // Generate dynamic mock activities with current timestamps
        const activities = ['Booking Confirmed', 'Payment Processed', 'Trip Completed', 'Trip Delayed', 'Booking Cancelled'];
        const locations = ['Downtown Office', 'Airport Terminal', 'Shopping Mall', 'University Campus', 'Business District'];
        const types: ('success' | 'info' | 'warning' | 'error')[] = ['success', 'info', 'warning', 'error'];
        
        const mockActivities: RecentActivity[] = Array.from({ length: limit }, (_, index) => {
          const randomActivity = activities[Math.floor(Math.random() * activities.length)];
          const randomLocation = locations[Math.floor(Math.random() * locations.length)];
          const randomType = types[Math.floor(Math.random() * types.length)];
          const hoursAgo = Math.floor(Math.random() * 168) + 1; // 1-168 hours (1 week)
          
          return {
            id: index + 1,
            type: randomType,
            title: randomActivity,
            subtitle: `Trip to ${randomLocation}`,
            timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
            bookingId: `BK${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
            amount: randomActivity.includes('Payment') ? Math.round((Math.random() * 100 + 20) * 100) / 100 : undefined,
            read: Math.random() > 0.3 // 70% chance of being read
          };
        });
        this.activitiesSubject.next(mockActivities);
        return [mockActivities];
      })
    );
  }

  /**
   * Load booking trends for charts
   */
  loadBookingTrends(months: number = 6): Observable<BookingTrend[]> {
    const params = new HttpParams().set('months', months.toString());
    
    return this.http.get<any[]>(`${this.apiUrl}/trends`, { params }).pipe(
      map(response => response.map(trend => this.mapTrendResponse(trend))),
      tap(trends => this.trendsSubject.next(trends)),
      catchError(error => {
        console.error('Error loading booking trends:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Load notification summary
   */
  loadNotifications(): Observable<NotificationSummary> {
    return this.http.get<any>(`${this.apiUrl}/notifications`).pipe(
      map(response => this.mapNotificationResponse(response)),
      tap(notifications => this.notificationsSubject.next(notifications)),
      catchError(error => {
        console.error('Error loading notifications:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Load customer profile
   */
  loadProfile(): Observable<CustomerProfile> {
    return this.http.get<any>(`${this.apiUrl}/profile`).pipe(
      map(response => this.mapProfileResponse(response)),
      tap(profile => this.profileSubject.next(profile)),
      catchError(error => {
        console.error('Error loading profile:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Load upcoming bookings
   */
  loadUpcomingBookings(limit: number = 5): Observable<UpcomingBooking[]> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http.get<any[]>(`${this.apiUrl}/upcoming-bookings`, { params }).pipe(
      map(response => response.map(booking => this.mapUpcomingBookingResponse(booking))),
      tap(bookings => this.upcomingBookingsSubject.next(bookings)),
      catchError(error => {
        console.error('Error loading upcoming bookings:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Refresh all dashboard data
   */
  refreshDashboard(): Observable<any> {
    return this.loadDashboardData();
  }

  /**
   * Get current stats synchronously (from cache)
   */
  getCurrentStats(): DashboardStats | null {
    return this.statsSubject.value;
  }

  /**
   * Get current activities synchronously (from cache)
   */
  getCurrentActivities(): RecentActivity[] {
    return this.activitiesSubject.value;
  }

  /**
   * Initialize default quick actions
   */
  private initializeDefaultActions(): void {
    const defaultActions: QuickAction[] = [
      {
        id: 'new-booking',
        title: 'New Booking',
        description: 'Create a new transport booking request',
        icon: 'add_box',
        routerLink: '/customer/book-transport',
        isEnabled: true
      },
      {
        id: 'my-bookings',
        title: 'My Bookings',
        description: 'View and manage your bookings',
        icon: 'book_online',
        routerLink: '/customer/my-bookings',
        isEnabled: true
      },
      {
        id: 'track-shipment',
        title: 'Track Shipment',
        description: 'Track your active shipments in real-time',
        icon: 'track_changes',
        routerLink: '/customer/tracking',
        isEnabled: true
      },
      {
        id: 'payment-history',
        title: 'Payment History',
        description: 'View payments and transaction history',
        icon: 'payment',
        routerLink: '/customer/payment-history',
        isEnabled: true
      },
      {
        id: 'wallet',
        title: 'My Wallet',
        description: 'Manage your wallet and add funds',
        icon: 'account_balance_wallet',
        routerLink: '/customer/wallet',
        isEnabled: true
      },
      {
        id: 'messages',
        title: 'Messages',
        description: 'View messages from drivers and support',
        icon: 'mail',
        routerLink: '/customer/messages',
        isEnabled: true
      },
      {
        id: 'profile',
        title: 'Profile Settings',
        description: 'Manage your account and preferences',
        icon: 'account_circle',
        routerLink: '/customer/profile',
        isEnabled: true
      },
      {
        id: 'support',
        title: 'Customer Support',
        description: 'Get help and contact support team',
        icon: 'support_agent',
        routerLink: '/customer/support',
        isEnabled: true
      }
    ];
    
    this.quickActionsSubject.next(defaultActions);
  }

  /**
   * Update quick action badge count
   */
  updateActionBadge(actionId: string, count: number): void {
    const actions = this.quickActionsSubject.value;
    const action = actions.find(a => a.id === actionId);
    if (action) {
      action.badgeCount = count > 0 ? count : undefined;
      this.quickActionsSubject.next([...actions]);
    }
  }

  // Response mapping methods
  private mapStatsResponse(response: any): DashboardStats {
    return {
      totalBookings: response.totalBookings || 0,
      activeShipments: response.activeShipments || 0,
      totalSpent: response.totalSpent || 0,
      pendingPayments: response.pendingPayments || 0,
      completedTrips: response.completedTrips || 0,
      cancelledBookings: response.cancelledBookings || 0,
      monthlyBookings: response.monthlyBookings || 0,
      weeklyBookings: response.weeklyBookings || 0
    };
  }

  private mapActivityResponse(response: any): RecentActivity {
    return {
      id: response.id,
      type: response.type || 'info',
      title: response.title || 'Activity',
      subtitle: response.subtitle,
      timestamp: new Date(response.timestamp || response.createdAt),
      bookingId: response.bookingId,
      amount: response.amount,
      status: response.status,
      actionUrl: response.actionUrl
    };
  }

  private mapTrendResponse(response: any): BookingTrend {
    return {
      month: response.month || response.period,
      bookings: response.bookings || 0,
      revenue: response.revenue || 0,
      cancelled: response.cancelled || 0
    };
  }

  private mapNotificationResponse(response: any): NotificationSummary {
    return {
      unreadMessages: response.unreadMessages || 0,
      pendingPayments: response.pendingPayments || 0,
      activeBookings: response.activeBookings || 0,
      overduePayments: response.overduePayments || 0
    };
  }

  private mapProfileResponse(response: any): CustomerProfile {
    return {
      id: response.id,
      name: response.name || response.fullName,
      email: response.email,
      phone: response.phone || response.phoneNumber,
      memberSince: new Date(response.memberSince || response.createdAt),
      totalBookings: response.totalBookings || 0,
      loyaltyPoints: response.loyaltyPoints || 0,
      preferredRoute: response.preferredRoute,
      avatar: response.avatar || response.profileImage
    };
  }

  private mapUpcomingBookingResponse(response: any): UpcomingBooking {
    return {
      id: response.id || response.bookingId,
      from: response.from || response.origin,
      to: response.to || response.destination,
      departureTime: new Date(response.departureTime),
      estimatedArrival: new Date(response.estimatedArrival || response.arrivalTime),
      status: response.status || 'confirmed',
      driver: response.driver ? {
        name: response.driver.name,
        phone: response.driver.phone,
        rating: response.driver.rating || 0
      } : undefined,
      vehicle: response.vehicle ? {
        number: response.vehicle.number || response.vehicle.registrationNumber,
        type: response.vehicle.type || response.vehicle.vehicleType
      } : undefined
    };
  }

  /**
   * Clear cached data
   */
  clearCache(): void {
    this.statsSubject.next(null);
    this.activitiesSubject.next([]);
    this.trendsSubject.next([]);
    this.notificationsSubject.next(null);
    this.profileSubject.next(null);
    this.upcomingBookingsSubject.next([]);
  }
}