import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NotificationService, Notification, NotificationSettings, NotificationSummary, NotificationFilters } from '../../../../services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
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
  notificationSettingsForm!: FormGroup;
  bulkSelectionMode: boolean = false;
  hasMoreNotifications: boolean = false;
  emailNotificationOptions: Array<{ id: string; label: string; key: string; description?: string; }> = [];
  pushNotificationOptions: Array<{ id: string; label: string; key: string; description?: string; }> = [];
  smsNotificationOptions: Array<{ id: string; label: string; key: string; description?: string; }> = [];

  // Error handling
  error: string | null = null;

  constructor(
    private notificationService: NotificationService,
    private formBuilder: FormBuilder
  ) {
    this.initializeForm();
    this.initializeNotificationOptions();
  }

  ngOnInit(): void {
    this.setupSubscriptions();
    this.loadInitialData();
    this.setupSearchDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.notificationSettingsForm = this.formBuilder.group({
      email_bookingUpdates: [true],
      email_paymentConfirmations: [true],
      email_promotions: [false],
      email_systemAlerts: [true],
      email_supportMessages: [true],
      push_bookingUpdates: [true],
      push_paymentConfirmations: [true],
      push_promotions: [true],
      push_systemAlerts: [true],
      push_supportMessages: [true],
      sms_bookingUpdates: [true],
      sms_paymentConfirmations: [true],
      sms_emergencyAlerts: [true],
      digestFrequency: ['immediate'],
      quietHours: ['none'],
      autoDeleteAfter: ['never']
    });
  }

  private initializeNotificationOptions(): void {
    this.emailNotificationOptions = [
      { id: 'email_bookingUpdates', key: 'bookingUpdates', label: 'Booking Updates', description: 'Get notified about booking confirmations, changes, and cancellations' },
      { id: 'email_paymentConfirmations', key: 'paymentConfirmations', label: 'Payment Confirmations', description: 'Receive confirmations for successful payments and failed transactions' },
      { id: 'email_promotions', key: 'promotions', label: 'Promotions & Offers', description: 'Get special offers, discounts, and promotional campaigns' },
      { id: 'email_systemAlerts', key: 'systemAlerts', label: 'System Alerts', description: 'Important system updates and maintenance notifications' },
      { id: 'email_supportMessages', key: 'supportMessages', label: 'Support Messages', description: 'Communication from customer support team' }
    ];

    this.pushNotificationOptions = [
      { id: 'push_bookingUpdates', key: 'bookingUpdates', label: 'Booking Updates', description: 'Real-time booking status updates' },
      { id: 'push_paymentConfirmations', key: 'paymentConfirmations', label: 'Payment Confirmations', description: 'Instant payment notifications' },
      { id: 'push_promotions', key: 'promotions', label: 'Promotions', description: 'Special offers and time-sensitive deals' },
      { id: 'push_systemAlerts', key: 'systemAlerts', label: 'System Alerts', description: 'Critical system notifications' },
      { id: 'push_supportMessages', key: 'supportMessages', label: 'Support Messages', description: 'Support team communications' }
    ];

    this.smsNotificationOptions = [
      { id: 'sms_bookingUpdates', key: 'bookingUpdates', label: 'Booking Updates', description: 'SMS alerts for booking status changes' },
      { id: 'sms_paymentConfirmations', key: 'paymentConfirmations', label: 'Payment Confirmations', description: 'SMS payment confirmations' },
      { id: 'sms_emergencyAlerts', key: 'emergencyAlerts', label: 'Emergency Alerts', description: 'Critical emergency notifications only' }
    ];
  }

  private setupSubscriptions(): void {
    // Subscribe to notifications
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
        this.filterNotifications();
        this.calculateSummary();
      });

    // Subscribe to loading state
    this.notificationService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
      });

    // Subscribe to errors
    this.notificationService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.error = error;
      });

    // Subscribe to unread count
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });

    // Subscribe to summary
    this.notificationService.summary$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.notificationSummary = summary;
      });
  }

  private setupSearchDebounce(): void {
    // Setup search debounce
    this.notificationSettingsForm.get('searchQuery')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.searchQuery = query || '';
        this.applyFilters();
      });
  }

  private loadInitialData(): void {
    this.loadNotifications();
    this.loadNotificationSettings();
  }

  // Load notifications
  loadNotifications(forceRefresh: boolean = false): void {
    const filters: NotificationFilters = {
      category: this.categoryFilter !== 'all' ? this.categoryFilter : undefined,
      type: this.typeFilter !== 'all' ? this.typeFilter : undefined,
      status: this.statusFilter !== 'all' ? this.statusFilter : undefined,
      search: this.searchQuery || undefined,
      priority: this.selectedPriority !== 'all' ? this.selectedPriority : undefined
    };

    this.notificationService.loadNotifications(filters, this.currentPage, this.itemsPerPage, forceRefresh)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.totalPages = Math.ceil(result.total / this.itemsPerPage);
          this.hasMoreNotifications = result.hasMore;
          this.totalNotifications = result.total;
        },
        error: (error) => {
          console.error('Failed to load notifications:', error);
          this.error = 'Failed to load notifications. Please try again.';
        }
      });
  }

  // Load notification settings
  loadNotificationSettings(): void {
    this.notificationService.getNotificationSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          this.notificationSettings = settings;
          this.updateFormWithSettings(settings);
        },
        error: (error) => {
          console.error('Failed to load notification settings:', error);
        }
      });
  }

  private updateFormWithSettings(settings: NotificationSettings): void {
    if (this.notificationSettingsForm) {
      this.notificationSettingsForm.patchValue({
        email_bookingUpdates: settings.email.bookingUpdates,
        email_paymentConfirmations: settings.email.paymentConfirmations,
        email_promotions: settings.email.promotions,
        email_systemAlerts: settings.email.systemAlerts,
        email_supportMessages: settings.email.supportMessages,
        push_bookingUpdates: settings.push.bookingUpdates,
        push_paymentConfirmations: settings.push.paymentConfirmations,
        push_promotions: settings.push.promotions,
        push_systemAlerts: settings.push.systemAlerts,
        push_supportMessages: settings.push.supportMessages,
        sms_bookingUpdates: settings.sms.bookingUpdates,
        sms_paymentConfirmations: settings.sms.paymentConfirmations,
        sms_emergencyAlerts: settings.sms.emergencyAlerts,
        digestFrequency: settings.general.frequency
      });
    }
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
    this.notificationService.updateReadStatus(notificationId, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Marked as read:', notificationId);
        },
        error: (error) => {
          console.error('Failed to mark as read:', error);
        }
      });
  }

  markAsUnread(notificationId: string): void {
    this.notificationService.updateReadStatus(notificationId, false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Marked as unread:', notificationId);
        },
        error: (error) => {
          console.error('Failed to mark as unread:', error);
        }
      });
  }

  toggleImportant(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      this.notificationService.updateImportantStatus(notificationId, !notification.isImportant)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Toggled important:', notificationId);
          },
          error: (error) => {
            console.error('Failed to toggle important:', error);
          }
        });
    }
  }

  deleteNotification(notificationId: string): void {
    if (confirm('Are you sure you want to delete this notification?')) {
      this.notificationService.deleteNotification(notificationId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.selectedNotifications = this.selectedNotifications.filter(id => id !== notificationId);
            console.log('Deleted notification:', notificationId);
          },
          error: (error) => {
            console.error('Failed to delete notification:', error);
          }
        });
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
    this.notificationService.bulkMarkAsRead(this.selectedNotifications)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.selectedNotifications = [];
          this.isBulkUpdating = false;
          console.log('Bulk marked as read');
        },
        error: (error) => {
          console.error('Bulk mark as read failed:', error);
          this.isBulkUpdating = false;
        }
      });
  }

  bulkDelete(): void {
    if (this.selectedNotifications.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${this.selectedNotifications.length} notifications?`)) {
      this.isBulkUpdating = true;
      this.notificationService.bulkDelete(this.selectedNotifications)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.selectedNotifications = [];
            this.isBulkUpdating = false;
            console.log('Bulk deleted');
          },
          error: (error) => {
            console.error('Bulk delete failed:', error);
            this.isBulkUpdating = false;
          }
        });
    }
  }

  markAllAsRead(): void {
    if (confirm('Mark all notifications as read?')) {
      this.isBulkUpdating = true;
      this.notificationService.markAllAsRead()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isBulkUpdating = false;
            console.log('All marked as read');
          },
          error: (error) => {
            console.error('Mark all as read failed:', error);
            this.isBulkUpdating = false;
          }
        });
    }
  }

  clearAllNotifications(): void {
    if (confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      this.isBulkUpdating = true;
      this.notificationService.clearAllNotifications()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.selectedNotifications = [];
            this.isBulkUpdating = false;
            console.log('All notifications cleared');
          },
          error: (error) => {
            console.error('Clear all notifications failed:', error);
            this.isBulkUpdating = false;
          }
        });
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
    
    // Convert form values to settings format
    const formValues = this.notificationSettingsForm.value;
    const settings: NotificationSettings = {
      email: {
        bookingUpdates: formValues.email_bookingUpdates,
        paymentConfirmations: formValues.email_paymentConfirmations,
        promotions: formValues.email_promotions,
        systemAlerts: formValues.email_systemAlerts,
        supportMessages: formValues.email_supportMessages
      },
      sms: {
        bookingUpdates: formValues.sms_bookingUpdates,
        paymentConfirmations: formValues.sms_paymentConfirmations,
        emergencyAlerts: formValues.sms_emergencyAlerts
      },
      push: {
        bookingUpdates: formValues.push_bookingUpdates,
        paymentConfirmations: formValues.push_paymentConfirmations,
        promotions: formValues.push_promotions,
        systemAlerts: formValues.push_systemAlerts,
        supportMessages: formValues.push_supportMessages
      },
      general: {
        doNotDisturb: false,
        doNotDisturbStart: '22:00',
        doNotDisturbEnd: '08:00',
        frequency: formValues.digestFrequency || 'immediate'
      }
    };

    this.notificationService.updateNotificationSettings(settings)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationSettings = settings;
          this.isUpdatingSettings = false;
          this.showSettingsModal = false;
          alert('Notification settings updated successfully!');
          console.log('Notification settings updated');
        },
        error: (error) => {
          console.error('Failed to update notification settings:', error);
          this.isUpdatingSettings = false;
          alert('Failed to update settings. Please try again.');
        }
      });
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
    this.currentPage = 1; // Reset to first page when filtering
    this.loadNotifications();
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
    this.statusFilter = 'all';
    this.categoryFilter = 'all';
    this.typeFilter = 'all';
    this.selectedPriority = 'all';
    this.searchQuery = '';
    this.activeTab = 'all';
    this.applyFilters();
  }

  loadMoreNotifications(): void {
    if (this.hasMoreNotifications && !this.isLoadingMore) {
      this.isLoadingMore = true;
      this.currentPage++;
      
      const filters: NotificationFilters = {
        category: this.categoryFilter !== 'all' ? this.categoryFilter : undefined,
        type: this.typeFilter !== 'all' ? this.typeFilter : undefined,
        status: this.statusFilter !== 'all' ? this.statusFilter : undefined,
        search: this.searchQuery || undefined,
        priority: this.selectedPriority !== 'all' ? this.selectedPriority : undefined
      };

      this.notificationService.loadNotifications(filters, this.currentPage, this.itemsPerPage)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.hasMoreNotifications = result.hasMore;
            this.isLoadingMore = false;
            console.log('Loaded more notifications');
          },
          error: (error) => {
            console.error('Failed to load more notifications:', error);
            this.isLoadingMore = false;
            this.currentPage--; // Revert page increment on error
          }
        });
    }
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

  refreshNotifications(): void {
    this.currentPage = 1;
    this.loadNotifications(true); // Force refresh
  }

  // Export notifications to CSV
  exportNotifications(): void {
    try {
      const csvData = this.convertToCSV(this.notifications);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `notifications_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export notifications. Please try again.');
    }
  }

  private convertToCSV(notifications: Notification[]): string {
    const headers = ['ID', 'Title', 'Message', 'Type', 'Category', 'Status', 'Priority', 'Created Date'];
    const rows = notifications.map(notification => [
      notification.id,
      `"${notification.title.replace(/"/g, '""')}"`,
      `"${notification.message.replace(/"/g, '""')}"`,
      notification.type,
      notification.category,
      notification.isRead ? 'Read' : 'Unread',
      notification.priority || 'Normal',
      new Date(notification.createdAt).toLocaleDateString()
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
}