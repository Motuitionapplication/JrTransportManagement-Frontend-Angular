<<<<<<< HEAD
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
=======
import { Component, OnInit } from '@angular/core';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'urgent';
  timestamp: Date;
  isRead: boolean;
  category: 'booking' | 'driver' | 'vehicle' | 'payment' | 'system' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionRequired?: boolean;
  relatedEntity?: {
    type: string;
    id: string;
    name: string;
  };
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  bookingUpdates: boolean;
  driverAlerts: boolean;
  vehicleAlerts: boolean;
  paymentAlerts: boolean;
  systemUpdates: boolean;
  maintenanceReminders: boolean;
  reportDigests: boolean;
}

interface NotificationStats {
  totalNotifications: number;
  unreadCount: number;
  todayCount: number;
  urgentCount: number;
  actionRequiredCount: number;
>>>>>>> JRT_ANGULAR_01
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
<<<<<<< HEAD
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
=======
export class NotificationsComponent implements OnInit {
  notifications: NotificationItem[] = [];
  filteredNotifications: NotificationItem[] = [];
  notificationStats: NotificationStats = {
    totalNotifications: 0,
    unreadCount: 0,
    todayCount: 0,
    urgentCount: 0,
    actionRequiredCount: 0
  };

  notificationSettings: NotificationSettings = {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    bookingUpdates: true,
    driverAlerts: true,
    vehicleAlerts: true,
    paymentAlerts: true,
    systemUpdates: false,
    maintenanceReminders: true,
    reportDigests: false
  };

  // Filter states
  activeFilter: string = 'all';
  activeCategory: string = 'all';
  activePriority: string = 'all';
  searchTerm: string = '';

  // View states
  selectedNotifications: Set<string> = new Set();
  showSettings: boolean = false;
  showFilters: boolean = false;

  ngOnInit(): void {
    this.loadNotifications();
    this.calculateStats();
  }

  loadNotifications(): void {
    // Mock notification data
    this.notifications = [
      {
        id: '1',
        title: 'New Booking Request',
        message: 'Customer John Doe has requested a ride from Airport to Downtown for tomorrow 2:00 PM',
        type: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        isRead: false,
        category: 'booking',
        priority: 'medium',
        actionRequired: true,
        relatedEntity: {
          type: 'booking',
          id: 'BK001234',
          name: 'Airport to Downtown'
        }
      },
      {
        id: '2',
        title: 'Driver Alert: Late Arrival',
        message: 'Driver Raj Kumar is running 20 minutes late for pickup. Customer has been notified.',
        type: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        isRead: false,
        category: 'driver',
        priority: 'high',
        actionRequired: true,
        relatedEntity: {
          type: 'driver',
          id: 'DR001',
          name: 'Raj Kumar'
        }
      },
      {
        id: '3',
        title: 'Vehicle Maintenance Due',
        message: 'Vehicle MH-12-AB-1234 is due for scheduled maintenance. Next service: Engine oil change',
        type: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        isRead: true,
        category: 'maintenance',
        priority: 'medium',
        actionRequired: true,
        relatedEntity: {
          type: 'vehicle',
          id: 'VH001',
          name: 'MH-12-AB-1234'
        }
      },
      {
        id: '4',
        title: 'Payment Received',
        message: 'Payment of ₹2,450 received from customer Maria Garcia for booking #BK001235',
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        isRead: true,
        category: 'payment',
        priority: 'low',
        relatedEntity: {
          type: 'booking',
          id: 'BK001235',
          name: 'Downtown to Mall'
        }
      },
      {
        id: '5',
        title: 'Critical: Vehicle Breakdown',
        message: 'Vehicle MH-12-CD-5678 has broken down on Highway 1. Driver safe, passenger assistance arranged.',
        type: 'error',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        isRead: false,
        category: 'vehicle',
        priority: 'critical',
        actionRequired: true,
        relatedEntity: {
          type: 'vehicle',
          id: 'VH002',
          name: 'MH-12-CD-5678'
        }
      },
      {
        id: '6',
        title: 'System Update Completed',
        message: 'Booking management system has been updated to version 2.1.5. New features are now available.',
        type: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        isRead: true,
        category: 'system',
        priority: 'low'
      },
      {
        id: '7',
        title: 'Driver Performance Alert',
        message: 'Driver Priya Sharma has maintained 5-star rating for 50 consecutive trips. Bonus recommended.',
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
        isRead: false,
        category: 'driver',
        priority: 'low',
        relatedEntity: {
          type: 'driver',
          id: 'DR002',
          name: 'Priya Sharma'
        }
      },
      {
        id: '8',
        title: 'Fuel Cost Alert',
        message: 'Daily fuel expenses have exceeded budget by 15%. Review routes and efficiency measures.',
        type: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        isRead: true,
        category: 'vehicle',
        priority: 'medium',
        actionRequired: true
      },
      {
        id: '9',
        title: 'Customer Feedback',
        message: 'Customer Sarah Wilson left 5-star review: "Excellent service, very punctual and courteous driver"',
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        isRead: true,
        category: 'booking',
        priority: 'low'
      },
      {
        id: '10',
        title: 'Insurance Renewal Reminder',
        message: 'Vehicle insurance for MH-12-EF-9012 expires in 7 days. Renewal documents attached.',
        type: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
        isRead: false,
        category: 'vehicle',
        priority: 'high',
        actionRequired: true,
        relatedEntity: {
          type: 'vehicle',
          id: 'VH003',
          name: 'MH-12-EF-9012'
        }
      }
    ];

    this.applyFilters();
  }

  calculateStats(): void {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    this.notificationStats = {
      totalNotifications: this.notifications.length,
      unreadCount: this.notifications.filter(n => !n.isRead).length,
      todayCount: this.notifications.filter(n => n.timestamp >= todayStart).length,
      urgentCount: this.notifications.filter(n => n.priority === 'critical' || n.priority === 'high').length,
      actionRequiredCount: this.notifications.filter(n => n.actionRequired).length
    };
  }

  applyFilters(): void {
    let filtered = [...this.notifications];

    // Apply read/unread filter
    if (this.activeFilter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (this.activeFilter === 'read') {
      filtered = filtered.filter(n => n.isRead);
    } else if (this.activeFilter === 'action') {
      filtered = filtered.filter(n => n.actionRequired);
    }

    // Apply category filter
    if (this.activeCategory !== 'all') {
      filtered = filtered.filter(n => n.category === this.activeCategory);
    }

    // Apply priority filter
    if (this.activePriority !== 'all') {
      filtered = filtered.filter(n => n.priority === this.activePriority);
    }

    // Apply search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(term) || 
        n.message.toLowerCase().includes(term) ||
        n.relatedEntity?.name.toLowerCase().includes(term)
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    this.filteredNotifications = filtered;
  }

  // Filter methods
  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  setCategory(category: string): void {
    this.activeCategory = category;
    this.applyFilters();
  }

  setPriority(priority: string): void {
    this.activePriority = priority;
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.activeFilter = 'all';
    this.activeCategory = 'all';
    this.activePriority = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }

  // Notification actions
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.calculateStats();
      this.applyFilters();
    }
  }

  markAsUnread(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = false;
      this.calculateStats();
      this.applyFilters();
    }
  }

  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.selectedNotifications.delete(notificationId);
    this.calculateStats();
    this.applyFilters();
  }

  // Bulk actions
  selectNotification(notificationId: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedNotifications.add(notificationId);
    } else {
      this.selectedNotifications.delete(notificationId);
    }
  }

  selectAllVisible(): void {
    this.filteredNotifications.forEach(n => this.selectedNotifications.add(n.id));
  }

  deselectAll(): void {
    this.selectedNotifications.clear();
  }

  markSelectedAsRead(): void {
    this.selectedNotifications.forEach(id => {
      const notification = this.notifications.find(n => n.id === id);
      if (notification) {
        notification.isRead = true;
      }
    });
    this.calculateStats();
    this.applyFilters();
    this.selectedNotifications.clear();
  }

  deleteSelected(): void {
    this.notifications = this.notifications.filter(n => !this.selectedNotifications.has(n.id));
    this.selectedNotifications.clear();
    this.calculateStats();
    this.applyFilters();
>>>>>>> JRT_ANGULAR_01
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
<<<<<<< HEAD
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
=======
    this.calculateStats();
    this.applyFilters();
  }

  // Settings methods
>>>>>>> JRT_ANGULAR_01
  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

<<<<<<< HEAD
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
=======
  saveSettings(): void {
    // In a real app, this would save to backend
    console.log('Notification settings saved:', this.notificationSettings);
    this.showSettings = false;
  }

  // Utility methods
  getNotificationIcon(notification: NotificationItem): string {
    switch (notification.category) {
      case 'booking': return 'fas fa-calendar-alt';
      case 'driver': return 'fas fa-user';
      case 'vehicle': return 'fas fa-car';
      case 'payment': return 'fas fa-credit-card';
      case 'system': return 'fas fa-cog';
      case 'maintenance': return 'fas fa-wrench';
      default: return 'fas fa-bell';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'error': return 'fas fa-times-circle';
      case 'info': return 'fas fa-info-circle';
      case 'urgent': return 'fas fa-exclamation';
      default: return 'fas fa-bell';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#6366f1';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'info': return '#6366f1';
      case 'urgent': return '#dc2626';
      default: return '#64748b';
    }
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  }

  getSelectedCount(): number {
    return this.selectedNotifications.size;
  }

  // Navigation methods
  navigateToEntity(notification: NotificationItem): void {
    if (notification.relatedEntity) {
      // In a real app, this would navigate to the related entity
      console.log(`Navigate to ${notification.relatedEntity.type}:`, notification.relatedEntity.id);
    }
  }

  handleAction(notification: NotificationItem): void {
    // Mark as read when taking action
    this.markAsRead(notification.id);
    
    switch (notification.category) {
      case 'booking':
        // Navigate to booking management
        console.log('Navigate to booking:', notification.relatedEntity?.id);
        break;
      case 'driver':
        // Navigate to driver management
        console.log('Navigate to driver:', notification.relatedEntity?.id);
        break;
      case 'vehicle':
        // Navigate to vehicle management
        console.log('Navigate to vehicle:', notification.relatedEntity?.id);
        break;
      case 'payment':
        // Navigate to payment details
        console.log('Navigate to payment:', notification.relatedEntity?.id);
        break;
      case 'maintenance':
        // Navigate to maintenance scheduler
        console.log('Navigate to maintenance for:', notification.relatedEntity?.id);
        break;
      default:
        this.navigateToEntity(notification);
    }
  }

  exportNotifications(): void {
    const data = this.filteredNotifications.map(n => ({
      timestamp: n.timestamp.toISOString(),
      title: n.title,
      message: n.message,
      category: n.category,
      priority: n.priority,
      type: n.type,
      isRead: n.isRead,
      actionRequired: n.actionRequired
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notifications-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
>>>>>>> JRT_ANGULAR_01
