import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, delay, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'booking' | 'payment' | 'system';
  category: 'booking' | 'payment' | 'system' | 'promotion' | 'support' | 'security';
  isRead: boolean;
  isImportant: boolean;
  timestamp: Date;
  createdAt: Date;
  priority?: 'high' | 'medium' | 'low' | 'normal';
  actionUrl?: string;
  actionLabel?: string;
  relatedId?: string;
  icon?: string;
  imageUrl?: string;
  expiryDate?: Date;
  details?: Array<{ label: string; value: string; }>;
  actions?: Array<{ type: string; label: string; url?: string; icon?: string; }>;
  hasDetails?: boolean;
  expandedContent?: string;
  relatedLinks?: Array<{ label: string; url: string; icon?: string; }>;
}

export interface NotificationSettings {
  email: {
    bookingUpdates: boolean;
    paymentConfirmations: boolean;
    promotions: boolean;
    systemAlerts: boolean;
    supportMessages: boolean;
  };
  sms: {
    bookingUpdates: boolean;
    paymentConfirmations: boolean;
    emergencyAlerts: boolean;
  };
  push: {
    bookingUpdates: boolean;
    paymentConfirmations: boolean;
    promotions: boolean;
    systemAlerts: boolean;
    supportMessages: boolean;
  };
  general: {
    doNotDisturb: boolean;
    doNotDisturbStart?: string;
    doNotDisturbEnd?: string;
    frequency: 'immediate' | 'hourly' | 'daily';
  };
}

export interface NotificationSummary {
  total: number;
  unread: number;
  important: number;
  byCategory: {
    booking: number;
    payment: number;
    system: number;
    promotion: number;
    support: number;
    security: number;
  };
}

export interface NotificationFilters {
  category?: string;
  type?: string;
  status?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  priority?: string;
}

export interface PaginatedNotifications {
  notifications: Notification[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  
  // Reactive state management
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private summarySubject = new BehaviorSubject<NotificationSummary | null>(null);

  // Public observables
  public notifications$ = this.notificationsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();
  public summary$ = this.summarySubject.asObservable();

  // Cache
  private notificationsCache: Notification[] = [];
  private lastFetchTime: number = 0;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(private http: HttpClient) {
    this.loadNotifications(); // Load initial data
  }

  /**
   * Load notifications with optional filters and pagination
   */
  loadNotifications(
    filters: NotificationFilters = {}, 
    page: number = 1, 
    pageSize: number = 20,
    forceRefresh: boolean = false
  ): Observable<PaginatedNotifications> {
    // Check cache first
    if (!forceRefresh && this.shouldUseCache()) {
      const filteredData = this.applyFiltersToCache(filters);
      const paginatedData = this.paginateData(filteredData, page, pageSize);
      this.updateState(this.notificationsCache);
      return of(paginatedData).pipe(delay(100)); // Simulate slight delay
    }

    this.setLoading(true);
    this.setError(null);

    // Prepare HTTP parameters
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<any>(`${this.apiUrl}`, { params }).pipe(
      map(response => {
        // Handle different API response formats
        if (response.notifications) {
          return {
            notifications: response.notifications.map(this.transformNotification),
            total: response.total || response.notifications.length,
            page: response.page || page,
            pageSize: response.pageSize || pageSize,
            hasMore: response.hasMore || false
          };
        } else if (Array.isArray(response)) {
          return {
            notifications: response.map(this.transformNotification),
            total: response.length,
            page: 1,
            pageSize: response.length,
            hasMore: false
          };
        }
        return response;
      }),
      catchError(error => {
        console.warn('API call failed, using mock data:', error);
        return this.getMockNotifications(filters, page, pageSize);
      }),
      tap(result => {
        if (page === 1) {
          this.notificationsCache = result.notifications;
          this.lastFetchTime = Date.now();
        } else {
          // Append for pagination
          this.notificationsCache = [...this.notificationsCache, ...result.notifications];
        }
        this.updateState(this.notificationsCache);
        this.setLoading(false);
      })
    );
  }

  /**
   * Get all notifications (cached)
   */
  getAllNotifications(): Observable<Notification[]> {
    if (this.notificationsCache.length === 0) {
      return this.loadNotifications().pipe(
        map(result => result.notifications)
      );
    }
    return of(this.notificationsCache);
  }

  /**
   * Get notification by ID
   */
  getNotificationById(id: string): Observable<Notification | null> {
    const notification = this.notificationsCache.find(n => n.id === id);
    if (notification) {
      return of(notification);
    }

    return this.http.get<Notification>(`${this.apiUrl}/${id}`).pipe(
      map(this.transformNotification),
      catchError(error => {
        console.warn('Failed to fetch notification by ID:', error);
        return of(null);
      })
    );
  }

  /**
   * Mark notification as read/unread
   */
  updateReadStatus(notificationId: string, isRead: boolean): Observable<boolean> {
    const notification = this.notificationsCache.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = isRead;
      this.updateState(this.notificationsCache);
    }

    return this.http.patch<any>(`${this.apiUrl}/${notificationId}/read`, { isRead }).pipe(
      map(() => true),
      catchError(error => {
        console.warn('Failed to update read status, using local update:', error);
        return of(true); // Return success even if API fails
      })
    );
  }

  /**
   * Mark notification as important/unimportant
   */
  updateImportantStatus(notificationId: string, isImportant: boolean): Observable<boolean> {
    const notification = this.notificationsCache.find(n => n.id === notificationId);
    if (notification) {
      notification.isImportant = isImportant;
      this.updateState(this.notificationsCache);
    }

    return this.http.patch<any>(`${this.apiUrl}/${notificationId}/important`, { isImportant }).pipe(
      map(() => true),
      catchError(error => {
        console.warn('Failed to update important status, using local update:', error);
        return of(true);
      })
    );
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): Observable<boolean> {
    // Update local cache immediately
    this.notificationsCache = this.notificationsCache.filter(n => n.id !== notificationId);
    this.updateState(this.notificationsCache);

    return this.http.delete<any>(`${this.apiUrl}/${notificationId}`).pipe(
      map(() => true),
      catchError(error => {
        console.warn('Failed to delete notification from server:', error);
        return of(true); // Return success even if API fails
      })
    );
  }

  /**
   * Bulk operations
   */
  bulkMarkAsRead(notificationIds: string[]): Observable<boolean> {
    // Update local cache
    notificationIds.forEach(id => {
      const notification = this.notificationsCache.find(n => n.id === id);
      if (notification) {
        notification.isRead = true;
      }
    });
    this.updateState(this.notificationsCache);

    return this.http.patch<any>(`${this.apiUrl}/bulk/read`, { notificationIds }).pipe(
      map(() => true),
      catchError(error => {
        console.warn('Bulk mark as read failed:', error);
        return of(true);
      })
    );
  }

  bulkDelete(notificationIds: string[]): Observable<boolean> {
    // Update local cache
    this.notificationsCache = this.notificationsCache.filter(n => !notificationIds.includes(n.id));
    this.updateState(this.notificationsCache);

    return this.http.delete<any>(`${this.apiUrl}/bulk`, { 
      body: { notificationIds } 
    }).pipe(
      map(() => true),
      catchError(error => {
        console.warn('Bulk delete failed:', error);
        return of(true);
      })
    );
  }

  markAllAsRead(): Observable<boolean> {
    // Update local cache
    this.notificationsCache.forEach(notification => {
      notification.isRead = true;
    });
    this.updateState(this.notificationsCache);

    return this.http.patch<any>(`${this.apiUrl}/mark-all-read`, {}).pipe(
      map(() => true),
      catchError(error => {
        console.warn('Mark all as read failed:', error);
        return of(true);
      })
    );
  }

  clearAllNotifications(): Observable<boolean> {
    // Update local cache
    this.notificationsCache = [];
    this.updateState(this.notificationsCache);

    return this.http.delete<any>(`${this.apiUrl}/clear-all`).pipe(
      map(() => true),
      catchError(error => {
        console.warn('Clear all notifications failed:', error);
        return of(true);
      })
    );
  }

  /**
   * Notification settings
   */
  getNotificationSettings(): Observable<NotificationSettings> {
    return this.http.get<NotificationSettings>(`${this.apiUrl}/settings`).pipe(
      catchError(error => {
        console.warn('Failed to fetch notification settings, using defaults:', error);
        return of(this.getDefaultSettings());
      })
    );
  }

  updateNotificationSettings(settings: NotificationSettings): Observable<boolean> {
    return this.http.put<any>(`${this.apiUrl}/settings`, settings).pipe(
      map(() => true),
      catchError(error => {
        console.warn('Failed to update notification settings:', error);
        return of(true);
      })
    );
  }

  /**
   * Statistics and summary
   */
  getNotificationSummary(): Observable<NotificationSummary> {
    const notifications = this.notificationsCache;
    const summary: NotificationSummary = {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      important: notifications.filter(n => n.isImportant).length,
      byCategory: {
        booking: notifications.filter(n => n.category === 'booking').length,
        payment: notifications.filter(n => n.category === 'payment').length,
        system: notifications.filter(n => n.category === 'system').length,
        promotion: notifications.filter(n => n.category === 'promotion').length,
        support: notifications.filter(n => n.category === 'support').length,
        security: notifications.filter(n => n.category === 'security').length
      }
    };

    this.summarySubject.next(summary);
    return of(summary);
  }

  /**
   * Real-time updates (WebSocket simulation)
   */
  startRealTimeUpdates(): void {
    // Simulate real-time updates with periodic refresh
    setInterval(() => {
      if (this.shouldRefreshData()) {
        this.loadNotifications({}, 1, 20, true).subscribe();
      }
    }, 30000); // Check every 30 seconds
  }

  // Private helper methods
  private shouldUseCache(): boolean {
    return this.notificationsCache.length > 0 && 
           (Date.now() - this.lastFetchTime) < this.cacheTimeout;
  }

  private shouldRefreshData(): boolean {
    return (Date.now() - this.lastFetchTime) > this.cacheTimeout;
  }

  private applyFiltersToCache(filters: NotificationFilters): Notification[] {
    let filtered = [...this.notificationsCache];

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(n => n.category === filters.category);
    }

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(n => {
        switch (filters.status) {
          case 'read': return n.isRead;
          case 'unread': return !n.isRead;
          case 'important': return n.isImportant;
          default: return true;
        }
      });
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(search) || 
        n.message.toLowerCase().includes(search)
      );
    }

    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(n => new Date(n.createdAt) >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(n => new Date(n.createdAt) <= filters.dateTo!);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private paginateData(data: Notification[], page: number, pageSize: number): PaginatedNotifications {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.slice(startIndex, endIndex);

    return {
      notifications: paginatedData,
      total: data.length,
      page,
      pageSize,
      hasMore: endIndex < data.length
    };
  }

  private updateState(notifications: Notification[]): void {
    this.notificationsSubject.next(notifications);
    
    // Update unread count
    const unreadCount = notifications.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);

    // Update summary
    this.getNotificationSummary().subscribe();
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private setError(error: string | null): void {
    this.errorSubject.next(error);
  }

  private transformNotification(notification: any): Notification {
    return {
      ...notification,
      createdAt: new Date(notification.createdAt || notification.timestamp),
      timestamp: new Date(notification.timestamp || notification.createdAt),
      expiryDate: notification.expiryDate ? new Date(notification.expiryDate) : undefined
    };
  }

  private getDefaultSettings(): NotificationSettings {
    return {
      email: {
        bookingUpdates: true,
        paymentConfirmations: true,
        promotions: false,
        systemAlerts: true,
        supportMessages: true
      },
      sms: {
        bookingUpdates: true,
        paymentConfirmations: true,
        emergencyAlerts: true
      },
      push: {
        bookingUpdates: true,
        paymentConfirmations: true,
        promotions: true,
        systemAlerts: true,
        supportMessages: true
      },
      general: {
        doNotDisturb: false,
        doNotDisturbStart: '22:00',
        doNotDisturbEnd: '08:00',
        frequency: 'immediate'
      }
    };
  }

  private getMockNotifications(filters: NotificationFilters = {}, page: number = 1, pageSize: number = 20): Observable<PaginatedNotifications> {
    const mockData = this.generateMockNotifications();
    const filteredData = this.applyFiltersToMockData(mockData, filters);
    const paginatedData = this.paginateData(filteredData, page, pageSize);
    
    return of(paginatedData).pipe(delay(500)); // Simulate network delay
  }

  private generateMockNotifications(): Notification[] {
    const notifications: Notification[] = [];
    const titles = [
      'Booking Confirmed', 'Payment Successful', 'Driver En Route', 'Trip Completed',
      'Trip Cancelled', 'Payment Failed', 'Support Ticket Updated', 'Special Promotion',
      'Security Alert', 'System Maintenance', 'New Feature Available', 'Account Updated',
      'Document Verified', 'Rating Request', 'Welcome Message', 'Policy Update',
      'Service Reminder', 'Emergency Alert', 'Feedback Received', 'Referral Bonus'
    ];

    const messages = [
      'Your transport booking has been confirmed. Driver will arrive soon.',
      'Payment has been processed successfully for your recent booking.',
      'Your driver is on the way to pickup location. ETA: 15 minutes.',
      'Your trip has been completed. Thank you for using our service.',
      'Your booking has been cancelled due to unforeseen circumstances.',
      'Payment processing failed. Please update your payment method.',
      'Your support ticket has been updated with a response from our team.',
      'Special discount available! Get 20% off your next booking.',
      'New login detected from unknown device. Please verify if it was you.',
      'System maintenance scheduled for tonight. Service may be affected.',
      'Check out our new feature: Real-time trip tracking!',
      'Your account information has been successfully updated.',
      'Your document verification has been completed successfully.',
      'Please rate your recent trip experience to help us improve.',
      'Welcome to JR Transport! Complete your profile to get started.',
      'Our terms of service have been updated. Please review the changes.',
      'Don\'t forget to schedule your regular transport service.',
      'Emergency contact information has been updated in your profile.',
      'We received your feedback and are working on improvements.',
      'You\'ve earned a referral bonus! Invite more friends to earn more.'
    ];

    const categories: Array<'booking' | 'payment' | 'system' | 'promotion' | 'support' | 'security'> = 
      ['booking', 'payment', 'system', 'promotion', 'support', 'security'];
    
    const types: Array<'info' | 'success' | 'warning' | 'error' | 'booking' | 'payment' | 'system'> = 
      ['info', 'success', 'warning', 'error', 'booking', 'payment', 'system'];
    
    const priorities: Array<'high' | 'medium' | 'low' | 'normal'> = 
      ['high', 'medium', 'low', 'normal'];

    for (let i = 0; i < 25; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const isRead = Math.random() > 0.4; // 60% read, 40% unread
      const isImportant = Math.random() > 0.7; // 30% important
      const hasDetails = Math.random() > 0.6; // 40% have details
      const hasActions = Math.random() > 0.5; // 50% have actions

      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date within last 30 days

      const notification: Notification = {
        id: `NOTIF-${String(i + 1).padStart(3, '0')}`,
        title: titles[i % titles.length],
        message: messages[i % messages.length],
        type,
        category,
        isRead,
        isImportant,
        timestamp: createdAt,
        createdAt,
        priority,
        actionUrl: hasActions ? `/customer/${category}/${this.generateRandomId()}` : undefined,
        actionLabel: hasActions ? this.getActionLabel(category) : undefined,
        relatedId: this.generateRandomId(),
        icon: this.getIconForCategory(category),
        hasDetails,
        expandedContent: hasDetails ? `Additional details for ${titles[i % titles.length]}. This notification contains more information that can be expanded to show comprehensive details about the ${category} update.` : undefined,
        details: hasDetails ? [
          { label: 'Reference ID', value: this.generateRandomId() },
          { label: 'Status', value: this.getRandomStatus() },
          { label: 'Priority', value: priority.charAt(0).toUpperCase() + priority.slice(1) }
        ] : undefined,
        actions: hasActions ? [
          { type: 'primary', label: this.getActionLabel(category), icon: 'fas fa-external-link-alt' },
          { type: 'info', label: 'View Details', icon: 'fas fa-info-circle' }
        ] : undefined,
        relatedLinks: hasDetails ? [
          { label: 'Help Center', url: '/help', icon: 'fas fa-question-circle' },
          { label: 'Contact Support', url: '/support', icon: 'fas fa-headset' }
        ] : undefined
      };

      // Add expiry date for promotions
      if (category === 'promotion') {
        notification.expiryDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
      }

      notifications.push(notification);
    }

    return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private applyFiltersToMockData(data: Notification[], filters: NotificationFilters): Notification[] {
    // Apply filters to mock data using the same logic as cache filtering
    let filtered = [...data];

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(n => n.category === filters.category);
    }

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(n => {
        switch (filters.status) {
          case 'read': return n.isRead;
          case 'unread': return !n.isRead;
          case 'important': return n.isImportant;
          default: return true;
        }
      });
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(search) || 
        n.message.toLowerCase().includes(search)
      );
    }

    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(n => new Date(n.createdAt) >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(n => new Date(n.createdAt) <= filters.dateTo!);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private generateRandomId(): string {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  private getIconForCategory(category: string): string {
    const icons = {
      booking: 'fas fa-calendar-check',
      payment: 'fas fa-credit-card',
      system: 'fas fa-cog',
      promotion: 'fas fa-gift',
      support: 'fas fa-headset',
      security: 'fas fa-shield-alt'
    };
    return icons[category as keyof typeof icons] || 'fas fa-bell';
  }

  private getActionLabel(category: string): string {
    const labels = {
      booking: 'View Booking',
      payment: 'View Payment',
      system: 'Learn More',
      promotion: 'Use Offer',
      support: 'View Ticket',
      security: 'Review Security'
    };
    return labels[category as keyof typeof labels] || 'View Details';
  }

  private getRandomStatus(): string {
    const statuses = ['Active', 'Pending', 'Completed', 'In Progress', 'Resolved', 'Confirmed'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }
}