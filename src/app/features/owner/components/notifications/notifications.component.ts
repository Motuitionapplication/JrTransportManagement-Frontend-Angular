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
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
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
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    this.calculateStats();
    this.applyFilters();
  }

  // Settings methods
  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

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