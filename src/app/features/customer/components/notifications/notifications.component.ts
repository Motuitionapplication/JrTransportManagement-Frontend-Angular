import { Component, OnInit } from '@angular/core';

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

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  // Data
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  notificationSettings: NotificationSettings | null = null;
  notificationSummary: NotificationSummary | null = null;
  
  // UI State
  activeTab: string = 'all';
  selectedNotifications: string[] = [];
  showSettingsModal: boolean = false;
  viewMode: string = 'list';
  expandedNotifications: string[] = [];
  
  // Filters
  categoryFilter: string = 'all';
  typeFilter: string = 'all';
  statusFilter: string = 'all';
  searchQuery: string = '';
  selectedFilter: string = 'all';
  selectedType: string = 'all';
  selectedPriority: string = 'all';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalPages: number = 0;
  
  // Loading states
  isLoading: boolean = false;
  isUpdatingSettings: boolean = false;
  isBulkUpdating: boolean = false;
  isLoadingMore: boolean = false;
  isSaving: boolean = false;
  isPerformingBulkAction: boolean = false;
  
  // Computed properties
  unreadCount: number = 0;
  totalNotifications: number = 0;
  todayCount: number = 0;
  weekCount: number = 0;
  
  // Modal states
  showBulkActionModal: boolean = false;
  bulkActionConfig: any = null;
  
  // Form and additional properties
  notificationSettingsForm: any = null;
  bulkSelectionMode: boolean = false;
  hasMoreNotifications: boolean = false;
  emailNotificationOptions: Array<{ id: string; label: string; key: string; description?: string; }> = [];
  pushNotificationOptions: Array<{ id: string; label: string; key: string; description?: string; }> = [];
  smsNotificationOptions: Array<{ id: string; label: string; key: string; description?: string; }> = [];

  constructor() {}

  ngOnInit(): void {
    this.loadNotifications();
    this.loadNotificationSettings();
    this.calculateSummary();
  }

  // Load notifications
  loadNotifications(): void {
    this.isLoading = true;
    // Mock data - replace with actual API call
    setTimeout(() => {
      this.notifications = [
        {
          id: 'NOTIF-001',
          title: 'Booking Confirmed',
          message: 'Your transport booking JRT-2024-015 has been confirmed. Driver will arrive at 10:00 AM.',
          type: 'success',
          category: 'booking',
          isRead: false,
          isImportant: true,
          timestamp: new Date(Date.now() - 30 * 60000), // 30 minutes ago
          createdAt: new Date(Date.now() - 30 * 60000),
          actionUrl: '/customer/my-bookings/JRT-2024-015',
          actionLabel: 'View Booking',
          relatedId: 'JRT-2024-015',
          icon: 'fas fa-check-circle'
        },
        {
          id: 'NOTIF-002',
          title: 'Payment Successful',
          message: 'Payment of $145.00 has been processed successfully for booking JRT-2024-015.',
          type: 'success',
          category: 'payment',
          isRead: true,
          isImportant: false,
          timestamp: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
          createdAt: new Date(Date.now() - 2 * 60 * 60000),
          actionUrl: '/customer/payment-history/PAY-001',
          actionLabel: 'View Receipt',
          relatedId: 'PAY-001',
          icon: 'fas fa-credit-card'
        },
        {
          id: 'NOTIF-003',
          title: 'Driver En Route',
          message: 'Your driver John Smith is on the way to pickup location. ETA: 15 minutes.',
          type: 'info',
          category: 'booking',
          isRead: false,
          isImportant: true,
          timestamp: new Date(Date.now() - 45 * 60000), // 45 minutes ago
          createdAt: new Date(Date.now() - 45 * 60000),
          actionUrl: '/customer/track/JRT-2024-015',
          actionLabel: 'Track Live',
          relatedId: 'JRT-2024-015',
          icon: 'fas fa-truck'
        },
        {
          id: 'NOTIF-004',
          title: 'Support Ticket Update',
          message: 'Your support ticket SUP-2024-001 has been updated with a response from our team.',
          type: 'info',
          category: 'support',
          isRead: false,
          isImportant: false,
          timestamp: new Date(Date.now() - 3 * 60 * 60000), // 3 hours ago
          createdAt: new Date(Date.now() - 3 * 60 * 60000),
          actionUrl: '/customer/support/tickets/SUP-2024-001',
          actionLabel: 'View Ticket',
          relatedId: 'SUP-2024-001',
          icon: 'fas fa-headset'
        },
        {
          id: 'NOTIF-005',
          title: 'Special Promotion',
          message: '🎉 Get 20% off your next booking! Use code SAVE20. Valid until January 31st.',
          type: 'info',
          category: 'promotion',
          isRead: true,
          isImportant: false,
          timestamp: new Date(Date.now() - 6 * 60 * 60000), // 6 hours ago
          createdAt: new Date(Date.now() - 6 * 60 * 60000),
          actionUrl: '/customer/book-transport',
          actionLabel: 'Book Now',
          icon: 'fas fa-gift',
          expiryDate: new Date('2024-01-31T23:59:59')
        },
        {
          id: 'NOTIF-006',
          title: 'Security Alert',
          message: 'New login detected from Chrome on Windows. Location: Springfield, IL. If this wasn\'t you, please contact support.',
          type: 'warning',
          category: 'security',
          isRead: false,
          isImportant: true,
          timestamp: new Date(Date.now() - 12 * 60 * 60000), // 12 hours ago
          createdAt: new Date(Date.now() - 12 * 60 * 60000),
          actionUrl: '/customer/profile/security',
          actionLabel: 'Review Security',
          icon: 'fas fa-shield-alt'
        },
        {
          id: 'NOTIF-007',
          title: 'Booking Cancelled',
          message: 'Booking JRT-2024-012 has been cancelled due to vehicle breakdown. Full refund processed.',
          type: 'warning',
          category: 'booking',
          isRead: true,
          isImportant: true,
          timestamp: new Date(Date.now() - 24 * 60 * 60000), // 1 day ago
          createdAt: new Date(Date.now() - 24 * 60 * 60000),
          actionUrl: '/customer/payment-history',
          actionLabel: 'View Refund',
          relatedId: 'JRT-2024-012',
          icon: 'fas fa-times-circle'
        },
        {
          id: 'NOTIF-008',
          title: 'System Maintenance',
          message: 'Scheduled maintenance on January 25th from 2:00 AM to 4:00 AM EST. Service may be temporarily unavailable.',
          type: 'info',
          category: 'system',
          isRead: true,
          isImportant: false,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000), // 2 days ago
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60000),
          icon: 'fas fa-tools'
        },
        {
          id: 'NOTIF-009',
          title: 'Rate Your Experience',
          message: 'How was your recent transport service with driver Mike Johnson? Your feedback helps us improve.',
          type: 'info',
          category: 'booking',
          isRead: false,
          isImportant: false,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60000), // 3 days ago
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60000),
          actionUrl: '/customer/rate-service/JRT-2024-010',
          actionLabel: 'Rate Service',
          relatedId: 'JRT-2024-010',
          icon: 'fas fa-star'
        },
        {
          id: 'NOTIF-010',
          title: 'Welcome to JR Transport',
          message: 'Welcome! Complete your profile to get personalized booking recommendations and faster service.',
          type: 'info',
          category: 'system',
          isRead: true,
          isImportant: false,
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60000), // 1 week ago
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60000),
          actionUrl: '/customer/profile',
          actionLabel: 'Complete Profile',
          icon: 'fas fa-user-plus'
        }
      ];
      this.filterNotifications();
      this.calculateSummary();
      this.isLoading = false;
    }, 1000);
  }

  // Load notification settings
  loadNotificationSettings(): void {
    // Mock data - replace with actual API call
    this.notificationSettings = {
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

  // Calculate notification summary
  calculateSummary(): void {
    const unread = this.notifications.filter(n => !n.isRead).length;
    const important = this.notifications.filter(n => n.isImportant).length;
    
    // Calculate today and week counts
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const todayCount = this.notifications.filter(n => new Date(n.timestamp) >= todayStart).length;
    const weekCount = this.notifications.filter(n => new Date(n.timestamp) >= weekStart).length;
    
    const byCategory = {
      booking: this.notifications.filter(n => n.category === 'booking').length,
      payment: this.notifications.filter(n => n.category === 'payment').length,
      system: this.notifications.filter(n => n.category === 'system').length,
      promotion: this.notifications.filter(n => n.category === 'promotion').length,
      support: this.notifications.filter(n => n.category === 'support').length,
      security: this.notifications.filter(n => n.category === 'security').length
    };
    
    // Update computed properties
    this.unreadCount = unread;
    this.totalNotifications = this.notifications.length;
    this.todayCount = todayCount;
    this.weekCount = weekCount;
    
    this.notificationSummary = {
      total: this.notifications.length,
      unread,
      important,
      byCategory
    };
  }

  // Filter notifications
  filterNotifications(): void {
    let filtered = this.notifications.filter(notification => {
      const matchesCategory = this.categoryFilter === 'all' || notification.category === this.categoryFilter;
      const matchesType = this.typeFilter === 'all' || notification.type === this.typeFilter;
      const matchesStatus = this.statusFilter === 'all' || 
        (this.statusFilter === 'read' && notification.isRead) ||
        (this.statusFilter === 'unread' && !notification.isRead) ||
        (this.statusFilter === 'important' && notification.isImportant);
      
      const matchesSearch = !this.searchQuery ||
        notification.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchesCategory && matchesType && matchesStatus && matchesSearch;
    });

    // Apply tab filter
    if (this.activeTab !== 'all') {
      filtered = filtered.filter(notification => {
        switch (this.activeTab) {
          case 'unread':
            return !notification.isRead;
          case 'important':
            return notification.isImportant;
          case 'booking':
          case 'payment':
          case 'system':
          case 'promotion':
          case 'support':
          case 'security':
            return notification.category === this.activeTab;
          default:
            return true;
        }
      });
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredNotifications = filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Tab management
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.filterNotifications();
  }

  // Notification actions
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.calculateSummary();
      console.log('Marked as read:', notificationId);
      // API call to mark as read
    }
  }

  markAsUnread(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && notification.isRead) {
      notification.isRead = false;
      this.calculateSummary();
      console.log('Marked as unread:', notificationId);
      // API call to mark as unread
    }
  }

  toggleImportant(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isImportant = !notification.isImportant;
      this.calculateSummary();
      console.log('Toggled important:', notificationId, notification.isImportant);
      // API call to toggle important
    }
  }

  deleteNotification(notificationId: string): void {
    if (confirm('Are you sure you want to delete this notification?')) {
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
      this.selectedNotifications = this.selectedNotifications.filter(id => id !== notificationId);
      this.filterNotifications();
      this.calculateSummary();
      console.log('Deleted notification:', notificationId);
      // API call to delete
    }
  }

  // Bulk actions
  toggleSelectAll(): void {
    const allVisible = this.filteredNotifications.map(n => n.id);
    if (this.selectedNotifications.length === allVisible.length) {
      this.selectedNotifications = [];
    } else {
      this.selectedNotifications = [...allVisible];
    }
  }

  toggleSelectNotification(notificationId: string): void {
    const index = this.selectedNotifications.indexOf(notificationId);
    if (index > -1) {
      this.selectedNotifications.splice(index, 1);
    } else {
      this.selectedNotifications.push(notificationId);
    }
  }

  bulkMarkAsRead(): void {
    if (this.selectedNotifications.length === 0) return;
    
    this.isBulkUpdating = true;
    // Mock API call
    setTimeout(() => {
      this.selectedNotifications.forEach(id => {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
          notification.isRead = true;
        }
      });
      this.selectedNotifications = [];
      this.calculateSummary();
      this.isBulkUpdating = false;
      console.log('Bulk marked as read');
    }, 1000);
  }

  bulkDelete(): void {
    if (this.selectedNotifications.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${this.selectedNotifications.length} notifications?`)) {
      this.isBulkUpdating = true;
      // Mock API call
      setTimeout(() => {
        this.notifications = this.notifications.filter(n => !this.selectedNotifications.includes(n.id));
        this.selectedNotifications = [];
        this.filterNotifications();
        this.calculateSummary();
        this.isBulkUpdating = false;
        console.log('Bulk deleted');
      }, 1000);
    }
  }

  markAllAsRead(): void {
    if (confirm('Mark all notifications as read?')) {
      this.isBulkUpdating = true;
      // Mock API call
      setTimeout(() => {
        this.notifications.forEach(n => n.isRead = true);
        this.calculateSummary();
        this.isBulkUpdating = false;
        console.log('All marked as read');
      }, 1000);
    }
  }

  clearAllNotifications(): void {
    if (confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      this.isBulkUpdating = true;
      // Mock API call
      setTimeout(() => {
        this.notifications = [];
        this.selectedNotifications = [];
        this.filterNotifications();
        this.calculateSummary();
        this.isBulkUpdating = false;
        console.log('All notifications cleared');
      }, 1000);
    }
  }

  // Navigate to action
  performAction(notification: Notification): void {
    if (notification.actionUrl) {
      console.log('Navigating to:', notification.actionUrl);
      // Implement navigation logic
      // this.router.navigate([notification.actionUrl]);
    }
    
    // Mark as read when clicking
    this.markAsRead(notification.id);
  }

  // Settings management
  openSettings(): void {
    this.showSettingsModal = true;
  }

  closeSettings(): void {
    this.showSettingsModal = false;
  }

  updateNotificationSettings(): void {
    if (!this.notificationSettings) return;
    
    this.isUpdatingSettings = true;
    
    // Mock API call
    setTimeout(() => {
      console.log('Notification settings updated:', this.notificationSettings);
      this.isUpdatingSettings = false;
      this.showSettingsModal = false;
      alert('Notification settings updated successfully!');
    }, 1500);
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filterNotifications();
    }
  }

  getPaginationPages(): number[] {
    const pages = [];
    const maxVisible = 5;
    const start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Utility methods
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'error': return 'fas fa-times-circle';
      case 'info': return 'fas fa-info-circle';
      default: return 'fas fa-bell';
    }
  }

  getNotificationTypeClass(type: string): string {
    switch (type) {
      case 'success': return 'notification-success';
      case 'warning': return 'notification-warning';
      case 'error': return 'notification-error';
      case 'info': return 'notification-info';
      default: return 'notification-default';
    }
  }

  getCategoryColor(category: string): string {
    switch (category) {
      case 'booking': return '#007bff';
      case 'payment': return '#28a745';
      case 'system': return '#6c757d';
      case 'promotion': return '#ffc107';
      case 'support': return '#17a2b8';
      case 'security': return '#dc3545';
      default: return '#6c757d';
    }
  }

  isSelected(notificationId: string): boolean {
    return this.selectedNotifications.includes(notificationId);
  }

  isExpired(notification: Notification): boolean {
    if (!notification.expiryDate) return false;
    return new Date() > new Date(notification.expiryDate);
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: new Date(timestamp).getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    }).format(new Date(timestamp));
  }

  formatFullDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  // Additional methods required by HTML template
  openNotificationSettings(): void {
    this.openSettings();
  }

  applyFilters(): void {
    this.filterNotifications();
  }

  markSelectedAsRead(): void {
    this.bulkMarkAsRead();
  }

  deleteSelected(): void {
    this.bulkDelete();
  }

  setViewMode(mode: string): void {
    this.viewMode = mode;
  }

  toggleSelection(notificationId: string, event?: Event): void {
    this.toggleSelectNotification(notificationId);
  }

  getPriorityClass(priority?: string): string {
    const priorityClasses = {
      'high': 'priority-high',
      'medium': 'priority-medium',
      'low': 'priority-low'
    };
    return priorityClasses[priority as keyof typeof priorityClasses] || 'priority-normal';
  }

  getTimeAgo(date: Date): string {
    return this.formatTimestamp(date);
  }

  getTypeClass(type: string): string {
    return this.getNotificationTypeClass(type);
  }

  getActionButtonClass(actionType: string): string {
    const actionClasses = {
      'primary': 'btn-primary',
      'success': 'btn-success',
      'warning': 'btn-warning',
      'danger': 'btn-danger',
      'info': 'btn-info'
    };
    return actionClasses[actionType as keyof typeof actionClasses] || 'btn-outline-primary';
  }

  handleNotificationAction(notification: Notification, action: any): void {
    console.log('Handling notification action:', notification.id, action);
    this.performAction(notification);
  }

  toggleRead(notification: Notification): void {
    if (notification.isRead) {
      this.markAsUnread(notification.id);
    } else {
      this.markAsRead(notification.id);
    }
  }

  toggleExpanded(notificationId: string): void {
    const index = this.expandedNotifications.indexOf(notificationId);
    if (index > -1) {
      this.expandedNotifications.splice(index, 1);
    } else {
      this.expandedNotifications.push(notificationId);
    }
  }

  isExpanded(notificationId: string): boolean {
    return this.expandedNotifications.includes(notificationId);
  }

  clearFilters(): void {
    this.selectedFilter = 'all';
    this.selectedType = 'all';
    this.selectedPriority = 'all';
    this.searchQuery = '';
    this.applyFilters();
  }

  loadMoreNotifications(): void {
    this.isLoadingMore = true;
    // Simulate loading more notifications
    setTimeout(() => {
      this.isLoadingMore = false;
      console.log('Loaded more notifications');
    }, 1000);
  }

  closeSettingsModal(): void {
    this.closeSettings();
  }

  saveNotificationSettings(): void {
    this.isSaving = true;
    setTimeout(() => {
      this.updateNotificationSettings();
      this.isSaving = false;
    }, 1000);
  }

  closeBulkActionModal(): void {
    this.showBulkActionModal = false;
    this.bulkActionConfig = null;
  }

  performBulkAction(): void {
    if (!this.bulkActionConfig) return;
    
    this.isPerformingBulkAction = true;
    setTimeout(() => {
      switch (this.bulkActionConfig.action) {
        case 'markRead':
          this.markSelectedAsRead();
          break;
        case 'delete':
          this.deleteSelected();
          break;
      }
      this.isPerformingBulkAction = false;
      this.closeBulkActionModal();
    }, 1000);
  }

  // Additional methods needed by HTML template
  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }

  toggleBulkSelectionMode(): void {
    this.bulkSelectionMode = !this.bulkSelectionMode;
    if (!this.bulkSelectionMode) {
      this.selectedNotifications = [];
    }
  }

  confirmBulkAction(action?: string): void {
    this.bulkActionConfig = {
      action: action || 'markRead',
      count: this.selectedNotifications.length
    };
    this.showBulkActionModal = true;
  }
}