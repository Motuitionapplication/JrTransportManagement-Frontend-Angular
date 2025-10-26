import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';

interface Notification {
  id: string;
  type: 'maintenance' | 'booking' | 'system' | 'payment' | 'document';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
  vehicleNumber?: string;
  bookingId?: string;
  actionRequired: boolean;
  actionUrl?: string;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

interface NotificationSettings {
  emailMaintenance: boolean;
  emailBookings: boolean;
  emailSystem: boolean;
  pushUrgent: boolean;
  pushAll: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {

  // Component State
  public notifications: Notification[] = [];
  public filteredNotifications: Notification[] = [];
  public paginatedNotifications: Notification[] = [];
  
  // Filter and Search
  public searchTerm = '';
  public selectedFilter = 'all';
  public sortBy = 'newest';
  
  // Pagination
  public currentPage = 1;
  public pageSize = 10;
  
  // UI State
  public isLoading = false;
  public showSettings = false;
  public showAlert = false;
  public alertMessage = '';
  public isError = false;
  
  // Settings
  public settings: NotificationSettings = {
    emailMaintenance: true,
    emailBookings: true,
    emailSystem: false,
    pushUrgent: true,
    pushAll: false,
    frequency: 'immediate'
  };
  
  // Subscriptions
  private refreshSubscription?: Subscription;
  
  // Computed Properties
  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  constructor() {
    this.loadNotifications();
    this.loadSettings();
  }

  ngOnInit(): void {
    this.filterNotifications();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  // Data Loading
  private loadNotifications(): void {
    this.isLoading = true;
    
    // Simulate API call - replace with actual service
    setTimeout(() => {
      this.notifications = [
        {
          id: '1',
          type: 'maintenance',
          priority: 'HIGH',
          title: 'Vehicle Maintenance Due',
          message: 'MH 12 AB 1234 is due for routine maintenance. Service date: Oct 25, 2025',
          vehicleNumber: 'MH 12 AB 1234',
          actionRequired: true,
          actionUrl: '/maintenance',
          isRead: false,
          createdAt: new Date(2025, 9, 18, 10, 30)
        },
        {
          id: '2',
          type: 'maintenance',
          priority: 'HIGH',
          title: 'Maintenance Overdue',
          message: 'KA 05 EF 9012 maintenance is overdue by 3 days. Immediate action required.',
          vehicleNumber: 'KA 05 EF 9012',
          actionRequired: true,
          actionUrl: '/maintenance',
          isRead: false,
          createdAt: new Date(2025, 9, 17, 15, 45)
        },
        {
          id: '3',
          type: 'booking',
          priority: 'MEDIUM',
          title: 'New Booking Request',
          message: 'New transport booking from Mumbai to Pune. Customer: John Doe',
          bookingId: 'BK001',
          actionRequired: true,
          actionUrl: '/bookings',
          isRead: true,
          createdAt: new Date(2025, 9, 17, 9, 15)
        },
        {
          id: '4',
          type: 'document',
          priority: 'MEDIUM',
          title: 'Document Expiry Alert',
          message: 'Insurance policy for DL 8C A 4567 expires in 15 days.',
          vehicleNumber: 'DL 8C A 4567',
          actionRequired: true,
          actionUrl: '/vehicles',
          isRead: false,
          createdAt: new Date(2025, 9, 16, 14, 20)
        },
        {
          id: '5',
          type: 'system',
          priority: 'LOW',
          title: 'System Update',
          message: 'New features available in the transport management system.',
          actionRequired: false,
          isRead: true,
          createdAt: new Date(2025, 9, 15, 11, 30)
        },
        {
          id: '6',
          type: 'payment',
          priority: 'HIGH',
          title: 'Payment Overdue',
          message: 'Payment for booking #BK002 is overdue. Amount: ₹15,000',
          bookingId: 'BK002',
          actionRequired: true,
          actionUrl: '/payments',
          isRead: false,
          createdAt: new Date(2025, 9, 14, 16, 45)
        }
      ];
      
      this.isLoading = false;
      this.filterNotifications();
    }, 1000);
  }

  private loadSettings(): void {
    // Load from localStorage or API
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }
  }

  public saveSettings(): void {
    localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    this.showSuccessAlert('Settings saved successfully');
  }

  private startAutoRefresh(): void {
    // Refresh notifications every 5 minutes
    this.refreshSubscription = interval(300000).subscribe(() => {
      this.loadNotifications();
    });
  }

  // Filtering and Sorting
  filterNotifications(): void {
    let filtered = [...this.notifications];
    
    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(term) ||
        n.message.toLowerCase().includes(term) ||
        n.vehicleNumber?.toLowerCase().includes(term) ||
        n.bookingId?.toLowerCase().includes(term)
      );
    }
    
    // Apply type filter
    if (this.selectedFilter !== 'all') {
      if (this.selectedFilter === 'unread') {
        filtered = filtered.filter(n => !n.isRead);
      } else {
        filtered = filtered.filter(n => n.type === this.selectedFilter);
      }
    }
    
    this.filteredNotifications = filtered;
    this.sortNotifications();
  }

  sortNotifications(): void {
    this.filteredNotifications.sort((a, b) => {
      switch (this.sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'priority':
          const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
    
    this.updatePagination();
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
    this.currentPage = 1;
    this.filterNotifications();
  }

  // Pagination
  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedNotifications = this.filteredNotifications.slice(startIndex, endIndex);
  }

  getStartIndex(): number {
    return Math.min((this.currentPage - 1) * this.pageSize + 1, this.filteredNotifications.length);
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredNotifications.length);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredNotifications.length / this.pageSize);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const maxVisible = 5;
    
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  // Notification Actions
  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      notification.isRead = true;
      // API call to mark as read
      this.filterNotifications();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    this.filterNotifications();
    this.showSuccessAlert('All notifications marked as read');
  }

  deleteNotification(notification: Notification): void {
    if (confirm('Are you sure you want to delete this notification?')) {
      this.notifications = this.notifications.filter(n => n.id !== notification.id);
      this.filterNotifications();
      this.showSuccessAlert('Notification deleted');
    }
  }

  clearAllNotifications(): void {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.notifications = [];
      this.filterNotifications();
      this.showSuccessAlert('All notifications cleared');
    }
  }

  handleNotificationAction(notification: Notification): void {
    this.markAsRead(notification);
    if (notification.actionUrl) {
      // Navigate to the relevant page
      console.log('Navigate to:', notification.actionUrl);
      // this.router.navigate([notification.actionUrl]);
    }
  }

  // Utility Methods
  getCountByType(type: string): number {
    return this.notifications.filter(n => n.type === type).length;
  }

  getNotificationIcon(type: string): string {
    const icons = {
      'maintenance': 'fas fa-wrench',
      'booking': 'fas fa-receipt',
      'system': 'fas fa-cog',
      'payment': 'fas fa-credit-card',
      'document': 'fas fa-file-alt'
    };
    return icons[type as keyof typeof icons] || 'fas fa-bell';
  }

  getNotificationIconClass(type: string): string {
    return `icon-${type}`;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  trackByNotification(index: number, item: Notification): string {
    return item.id;
  }

  // Settings
  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  // Alert Methods
  private showSuccessAlert(message: string): void {
    this.alertMessage = message;
    this.isError = false;
    this.showAlert = true;
    setTimeout(() => this.hideAlert(), 3000);
  }

  private showErrorAlert(message: string): void {
    this.alertMessage = message;
    this.isError = true;
    this.showAlert = true;
    setTimeout(() => this.hideAlert(), 5000);
  }

  hideAlert(): void {
    this.showAlert = false;
  }
}
