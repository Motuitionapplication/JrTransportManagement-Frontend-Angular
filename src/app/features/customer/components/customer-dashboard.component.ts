import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { 
  DashboardService, 
  DashboardStats, 
  RecentActivity, 
  QuickAction, 
  BookingTrend, 
  NotificationSummary, 
  CustomerProfile, 
  UpcomingBooking 
} from '../../../services/dashboard.service';

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative';
  icon: string;
  trend?: number;
}

@Component({
  selector: 'app-customer-dashboard',
  template: `
    <div class="customer-dashboard">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading dashboard...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage && !isLoading" class="error-container">
        <mat-icon color="warn">error_outline</mat-icon>
        <h3>Error Loading Dashboard</h3>
        <p>{{ errorMessage }}</p>
        <button mat-raised-button color="primary" (click)="refreshDashboard()">
          <mat-icon>refresh</mat-icon>
          Try Again
        </button>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!isLoading && !errorMessage" class="dashboard-content">
        <!-- Header Section -->
        <div class="header-section">
          <div class="header-content">
            <div class="header-text">
              <h1 class="dashboard-title">
                Welcome back{{ customerProfile?.name ? ', ' + customerProfile?.name : '' }}!
              </h1>
              <p class="dashboard-subtitle">Your JR Transport Management Portal</p>
              <div class="last-updated" *ngIf="lastUpdated">
                <mat-icon>schedule</mat-icon>
                <span>Last updated: {{ formatDate(lastUpdated) }}</span>
              </div>
            </div>
            <div class="header-actions">
              <button mat-icon-button 
                      [disabled]="isRefreshing" 
                      (click)="refreshDashboard()" 
                      matTooltip="Refresh Dashboard">
                <mat-icon [class.rotating]="isRefreshing">refresh</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card" *ngFor="let stat of statsData" 
               [class.loading]="!stat.value && stat.value !== 0">
            <div class="stat-icon">
              <mat-icon>{{ stat.icon }}</mat-icon>
            </div>
            <div class="stat-content">
              <h3 class="stat-value">{{ stat.value || '...' }}</h3>
              <p class="stat-title">{{ stat.title }}</p>
              <span class="stat-change" [ngClass]="stat.changeType">
                {{ stat.change || 'Loading...' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Dashboard Row -->
        <div class="dashboard-row">
          <!-- Quick Actions -->
          <mat-card class="actions-card">
            <mat-card-header>
              <mat-card-title>Quick Actions</mat-card-title>
              <mat-card-subtitle>Get things done faster</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="actions-grid">
                <button *ngFor="let action of quickActions" 
                        mat-stroked-button 
                        class="quick-action-btn"
                        [disabled]="!action.isEnabled"
                        (click)="handleQuickAction(action)">
                  <mat-icon>{{ action.icon }}</mat-icon>
                  <span>{{ action.title }}</span>
                  <span *ngIf="action.badgeCount && action.badgeCount > 0" class="action-badge">{{ action.badgeCount }}</span>
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Recent Activity -->
          <mat-card class="activity-card">
            <mat-card-header>
              <mat-card-title>Recent Activity</mat-card-title>
              <mat-card-subtitle>Your latest activities</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="recentActivities.length === 0" class="empty-state">
                <mat-icon>history</mat-icon>
                <p>No recent activity</p>
              </div>
              <div class="activity-list" *ngIf="recentActivities.length > 0">
                <div class="activity-item" 
                     *ngFor="let activity of recentActivities; trackBy: trackActivity"
                     (click)="navigateToActivity(activity)">
                  <div class="activity-icon" [ngClass]="activity.type">
                    <mat-icon>{{ getActivityIcon(activity.type) }}</mat-icon>
                  </div>
                  <div class="activity-details">
                    <h4 class="activity-title">{{ activity.title }}</h4>
                    <p class="activity-description" *ngIf="activity.subtitle">{{ activity.subtitle }}</p>
                    <div class="activity-meta">
                      <span class="activity-time">{{ getTimeAgo(activity.timestamp) }}</span>
                      <span *ngIf="activity.status" 
                            class="activity-status" 
                            [ngClass]="getStatusColor(activity.status)">
                        {{ activity.status }}
                      </span>
                    </div>
                  </div>
                  <mat-icon class="activity-arrow">chevron_right</mat-icon>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Upcoming Bookings -->
        <mat-card class="bookings-card" *ngIf="upcomingBookings.length > 0">
          <mat-card-header>
            <mat-card-title>Upcoming Bookings</mat-card-title>
            <mat-card-subtitle>Your scheduled transportation</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="bookings-list">
              <div class="booking-item" 
                   *ngFor="let booking of upcomingBookings; trackBy: trackBooking"
                   (click)="navigateToBooking(booking.id)">
                <div class="booking-icon">
                  <mat-icon>local_shipping</mat-icon>
                </div>
                <div class="booking-details">
                  <h4 class="booking-title">{{ booking.from }} → {{ booking.to }}</h4>
                  <p class="booking-date">Departure: {{ formatDate(booking.departureTime) }}</p>
                  <div class="booking-meta">
                    <span class="booking-type" *ngIf="booking.vehicle">{{ booking.vehicle.type }}</span>
                    <span class="booking-status" [ngClass]="getStatusColor(booking.status)">
                      {{ booking.status }}
                    </span>
                  </div>
                </div>
                <div class="booking-time">
                  <small>ETA: {{ formatDate(booking.estimatedArrival) }}</small>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Notifications Summary -->
        <mat-card class="notifications-card" *ngIf="notifications">
          <mat-card-header>
            <mat-card-title>
              Notifications Summary
              <span *ngIf="notifications.unreadMessages > 0" class="notification-badge">
                {{ notifications.unreadMessages }}
              </span>
            </mat-card-title>
            <mat-card-subtitle>Important updates and alerts</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="notifications-summary">
              <div class="notification-item" *ngIf="notifications.unreadMessages > 0">
                <div class="notification-icon message">
                  <mat-icon>message</mat-icon>
                </div>
                <div class="notification-content">
                  <h4 class="notification-title">Unread Messages</h4>
                  <p class="notification-message">You have {{ notifications.unreadMessages }} unread messages</p>
                </div>
              </div>

              <div class="notification-item" *ngIf="notifications.pendingPayments > 0">
                <div class="notification-icon payment">
                  <mat-icon>payment</mat-icon>
                </div>
                <div class="notification-content">
                  <h4 class="notification-title">Pending Payments</h4>
                  <p class="notification-message">{{ notifications.pendingPayments }} payments require attention</p>
                </div>
              </div>

              <div class="notification-item" *ngIf="notifications.activeBookings > 0">
                <div class="notification-icon booking">
                  <mat-icon>book_online</mat-icon>
                </div>
                <div class="notification-content">
                  <h4 class="notification-title">Active Bookings</h4>
                  <p class="notification-message">{{ notifications.activeBookings }} bookings in progress</p>
                </div>
              </div>

              <div class="notification-item" *ngIf="notifications.overduePayments > 0">
                <div class="notification-icon error">
                  <mat-icon>warning</mat-icon>
                </div>
                <div class="notification-content">
                  <h4 class="notification-title">Overdue Payments</h4>
                  <p class="notification-message">{{ notifications.overduePayments }} payments are overdue</p>
                </div>
              </div>

              <div *ngIf="!notifications.unreadMessages && !notifications.pendingPayments && !notifications.activeBookings && !notifications.overduePayments" 
                   class="empty-state">
                <mat-icon>notifications_none</mat-icon>
                <p>No notifications at this time</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .customer-dashboard {
      padding: 0;
      width: 100%;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    /* Loading and Error States */
    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      padding: 2rem;
      text-align: center;
    }

    .loading-container mat-spinner {
      margin-bottom: 1rem;
    }

    .error-container mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
    }

    .error-container h3 {
      margin: 0.5rem 0;
      color: #f44336;
    }

    .error-container p {
      color: #666;
      margin-bottom: 1.5rem;
    }

    /* Header Section */
    .header-section {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
      border-radius: 0 0 24px 24px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2rem;
    }

    .header-text {
      flex: 1;
    }

    .dashboard-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .dashboard-subtitle {
      font-size: 1.1rem;
      margin: 0;
      opacity: 0.9;
    }

    .last-updated {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      opacity: 0.8;
      font-size: 0.9rem;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .rotating {
      animation: rotate 1s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin: 0 1rem 2rem 1rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    }

    .stat-card.loading {
      opacity: 0.6;
      pointer-events: none;
    }

    .stat-icon {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    .stat-icon mat-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
      color: #333;
    }

    .stat-title {
      font-size: 0.9rem;
      color: #666;
      margin: 0.25rem 0;
      font-weight: 500;
    }

    .stat-change {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      display: inline-block;
    }

    .stat-change.positive {
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .stat-change.negative {
      background: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    /* Dashboard Row */
    .dashboard-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin: 2rem 1rem;
    }

    @media (max-width: 1024px) {
      .dashboard-row {
        grid-template-columns: 1fr;
      }
    }

    /* Cards */
    .actions-card, .activity-card, .bookings-card, .notifications-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(0, 0, 0, 0.05);
      margin-bottom: 1.5rem;
    }

    .bookings-card, .notifications-card {
      margin: 0 1rem 2rem 1rem;
    }

    /* Quick Actions */
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
    }

    .quick-action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      height: auto;
      min-height: 80px;
      position: relative;
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    .quick-action-btn:hover:not([disabled]) {
      background-color: #f5f5f5;
      transform: translateY(-1px);
    }

    .quick-action-btn mat-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .action-badge {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: #f44336;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 0.7rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Activity List */
    .activity-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .activity-item:hover {
      background-color: #f8f9fa;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      background: #f5f5f5;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .activity-icon.booking {
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .activity-icon.payment {
      background: rgba(33, 150, 243, 0.1);
      color: #2196f3;
    }

    .activity-icon.shipment {
      background: rgba(255, 152, 0, 0.1);
      color: #ff9800;
    }

    .activity-icon.message {
      background: rgba(156, 39, 176, 0.1);
      color: #9c27b0;
    }

    .activity-details {
      flex: 1;
    }

    .activity-title {
      font-size: 0.95rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
      color: #333;
    }

    .activity-description {
      font-size: 0.85rem;
      color: #666;
      margin: 0 0 0.5rem 0;
    }

    .activity-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .activity-time {
      font-size: 0.8rem;
      color: #999;
    }

    .activity-status {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
      text-transform: uppercase;
    }

    .activity-arrow {
      color: #ccc;
      flex-shrink: 0;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
      color: #ccc;
    }

    /* Bookings List */
    .bookings-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .booking-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .booking-item:hover {
      background: #e9ecef;
      transform: translateY(-1px);
    }

    .booking-icon {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .booking-details {
      flex: 1;
    }

    .booking-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
      color: #333;
    }

    .booking-date {
      font-size: 0.9rem;
      color: #666;
      margin: 0 0 0.5rem 0;
    }

    .booking-meta {
      display: flex;
      gap: 1rem;
    }

    .booking-type {
      font-size: 0.8rem;
      color: #999;
    }

    .booking-status {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
      text-transform: uppercase;
    }

    .booking-amount {
      text-align: right;
    }

    .amount {
      font-size: 1.1rem;
      font-weight: 700;
      color: #4caf50;
    }

    /* Notifications */
    .notifications-card .mat-card-header {
      position: relative;
    }

    .notification-badge {
      background: #f44336;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      font-size: 0.8rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-left: 0.5rem;
    }

    .notifications-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .notification-item:hover {
      background-color: #f8f9fa;
    }

    .notification-item.unread {
      background-color: rgba(76, 175, 80, 0.02);
      border-left: 4px solid #4caf50;
    }

    .notification-item:last-child {
      border-bottom: none;
    }

    .notification-icon {
      background: #f5f5f5;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      font-size: 0.95rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
      color: #333;
    }

    .notification-message {
      font-size: 0.85rem;
      color: #666;
      margin: 0 0 0.5rem 0;
      line-height: 1.4;
    }

    .notification-time {
      font-size: 0.8rem;
      color: #999;
    }

    .notification-actions {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      background: #4caf50;
      border-radius: 50%;
    }

    /* Status Colors */
    .text-success { color: #4caf50 !important; }
    .text-warning { color: #ff9800 !important; }
    .text-danger { color: #f44336 !important; }
    .text-info { color: #2196f3 !important; }
    .text-primary { color: #6366f1 !important; }
    .text-muted { color: #6c757d !important; }

    /* Responsive Design */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .dashboard-title {
        font-size: 2rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        margin: 0 0.5rem 2rem 0.5rem;
      }

      .dashboard-row {
        margin: 2rem 0.5rem;
      }

      .bookings-card, .notifications-card {
        margin: 0 0.5rem 2rem 0.5rem;
      }

      .actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .booking-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .booking-amount {
        align-self: flex-end;
      }
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .activity-icon.success {
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .activity-icon.warning {
      background: rgba(255, 152, 0, 0.1);
      color: #ff9800;
    }

    .activity-icon.error {
      background: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    .activity-icon.info {
      background: rgba(33, 150, 243, 0.1);
      color: #2196f3;
    }

    .activity-details {
      flex: 1;
    }

    .activity-title {
      font-size: 0.9rem;
      font-weight: 600;
      margin: 0;
      color: #333;
    }

    .activity-subtitle {
      font-size: 0.8rem;
      color: #666;
      margin: 0.25rem 0;
    }

    .activity-time {
      font-size: 0.75rem;
      color: #999;
    }

    .quick-actions {
      margin: 2rem 1rem;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: #333;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .action-card {
      padding: 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
      border-radius: 12px;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    .action-card mat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      color: #4caf50;
      margin-bottom: 1rem;
    }

    .action-card h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .action-card p {
      font-size: 0.9rem;
      color: #666;
      margin: 0;
      line-height: 1.4;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .dashboard-row {
        grid-template-columns: 1fr;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
        margin: 1rem;
      }
      
      .actions-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      }
      
      .header-section {
        margin: 0.5rem;
        padding: 1.5rem;
      }
      
      .dashboard-title {
        font-size: 2rem;
      }
    }
  `]
})
export class CustomerDashboardComponent implements OnInit, OnDestroy {
  
  // Data properties
  statsData: StatCard[] = [];
  recentActivities: RecentActivity[] = [];
  quickActions: QuickAction[] = [];
  bookingTrends: BookingTrend[] = [];
  notifications: NotificationSummary | null = null;
  customerProfile: CustomerProfile | null = null;
  upcomingBookings: UpcomingBooking[] = [];

  // UI state
  isLoading: boolean = false;
  isRefreshing: boolean = false;
  errorMessage: string = '';
  showError: boolean = false;
  lastUpdated: Date | null = null;

  // Component lifecycle
  private destroy$ = new Subject<void>();

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeDashboard();
    this.subscribeToData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeDashboard(): void {
    this.loadDashboardData();
    this.setupAutoRefresh();
  }

  private subscribeToData(): void {
    // Subscribe to stats
    this.dashboardService.stats$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((stats: DashboardStats | null) => {
      if (stats) {
        this.updateStatsCards(stats);
      }
    });

    // Subscribe to activities
    this.dashboardService.activities$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((activities: RecentActivity[]) => {
      this.recentActivities = activities;
    });

    // Subscribe to quick actions
    this.dashboardService.quickActions$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((actions: QuickAction[]) => {
      this.quickActions = actions;
    });

    // Subscribe to trends
    this.dashboardService.trends$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((trends: BookingTrend[]) => {
      this.bookingTrends = trends;
    });

    // Subscribe to notifications
    this.dashboardService.notifications$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((notifications: NotificationSummary | null) => {
      this.notifications = notifications;
      this.updateActionBadges(notifications);
    });

    // Subscribe to profile
    this.dashboardService.profile$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((profile: CustomerProfile | null) => {
      this.customerProfile = profile;
    });

    // Subscribe to upcoming bookings
    this.dashboardService.upcomingBookings$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((bookings: UpcomingBooking[]) => {
      this.upcomingBookings = bookings;
    });
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.clearError();

    this.dashboardService.loadDashboardData().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.handleError('Failed to load dashboard data', error);
        return [];
      }),
      finalize(() => {
        this.isLoading = false;
        this.lastUpdated = new Date();
      })
    ).subscribe({
      next: (data: any) => {
        console.log('Dashboard data loaded successfully', data);
      }
    });
  }

  private updateStatsCards(stats: DashboardStats): void {
    this.statsData = [
      {
        title: 'Total Bookings',
        value: stats.totalBookings,
        change: this.getBookingChangeText(stats.monthlyBookings),
        changeType: stats.monthlyBookings >= 0 ? 'positive' : 'negative',
        icon: 'book_online',
        trend: stats.monthlyBookings
      },
      {
        title: 'Active Shipments',
        value: stats.activeShipments,
        change: this.getShipmentChangeText(stats.weeklyBookings),
        changeType: stats.weeklyBookings >= 0 ? 'positive' : 'negative',
        icon: 'local_shipping',
        trend: stats.weeklyBookings
      },
      {
        title: 'Total Spent',
        value: this.formatCurrency(stats.totalSpent),
        change: 'This lifetime',
        changeType: 'positive',
        icon: 'attach_money',
        trend: stats.totalSpent
      },
      {
        title: 'Pending Payments',
        value: stats.pendingPayments,
        change: stats.pendingPayments > 0 ? 'Requires attention' : 'All clear',
        changeType: stats.pendingPayments > 0 ? 'negative' : 'positive',
        icon: 'payment',
        trend: stats.pendingPayments
      }
    ];
  }

  private updateActionBadges(notifications: NotificationSummary | null): void {
    if (!notifications) return;

    this.dashboardService.updateActionBadge('messages', notifications.unreadMessages);
    this.dashboardService.updateActionBadge('payment-history', notifications.pendingPayments);
    this.dashboardService.updateActionBadge('my-bookings', notifications.activeBookings);
  }

  private setupAutoRefresh(): void {
    // Refresh data every 5 minutes
    setInterval(() => {
      this.refreshDashboard();
    }, 5 * 60 * 1000);
  }

  refreshDashboard(): void {
    this.isRefreshing = true;
    
    this.dashboardService.refreshDashboard().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.handleError('Failed to refresh dashboard', error);
        return [];
      }),
      finalize(() => {
        this.isRefreshing = false;
        this.lastUpdated = new Date();
      })
    ).subscribe({
      next: () => {
        this.showSuccessMessage('Dashboard refreshed successfully');
      }
    });
  }



  // Navigation methods
  navigateToBooking(bookingId: string): void {
    this.router.navigate(['/customer/booking-details', bookingId]);
  }

  navigateToActivity(activity: RecentActivity): void {
    if (activity.actionUrl) {
      this.router.navigate([activity.actionUrl]);
    } else if (activity.bookingId) {
      this.router.navigate(['/customer/booking-details', activity.bookingId]);
    } else {
      this.router.navigate(['/customer/dashboard']);
    }
  }

  // Action handlers
  handleQuickAction(action: QuickAction): void {
    if (!action.isEnabled) {
      return;
    }

    this.router.navigate([action.routerLink]);
  }

  // Notification handlers
  markNotificationAsRead(notificationId: string): void {
    // Implementation will depend on actual service methods
    console.log('Mark notification as read:', notificationId);
    this.showSuccessMessage('Notification marked as read');
  }

  clearAllNotifications(): void {
    // Implementation will depend on actual service methods
    console.log('Clear all notifications');
    this.showSuccessMessage('All notifications cleared');
  }

  // Utility methods
  private getBookingChangeText(monthlyBookings: number): string {
    const change = Math.abs(monthlyBookings);
    const direction = monthlyBookings >= 0 ? 'increase' : 'decrease';
    return `${change} ${direction} this month`;
  }

  private getShipmentChangeText(weeklyBookings: number): string {
    const change = Math.abs(weeklyBookings);
    const direction = weeklyBookings >= 0 ? 'more' : 'fewer';
    return `${change} ${direction} this week`;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  private clearError(): void {
    this.errorMessage = '';
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.errorMessage = message;

    // Show user-friendly error messages
    if (error.status === 401) {
      this.errorMessage = 'Session expired. Please login again.';
      this.router.navigate(['/auth/login']);
    } else if (error.status === 403) {
      this.errorMessage = 'Access denied. Please contact support.';
    } else if (error.status === 500) {
      this.errorMessage = 'Server error. Please try again later.';
    } else if (!error.status) {
      this.errorMessage = 'Network error. Please check your connection.';
    }
  }

  private showSuccessMessage(message: string): void {
    // Implement toast notification or similar
    console.log('Success:', message);
  }

  getActivityIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'booking': 'book_online',
      'payment': 'payment',
      'shipment': 'local_shipping',
      'message': 'message',
      'notification': 'notifications',
      'default': 'info'
    };
    return iconMap[type] || iconMap['default'];
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'confirmed': 'text-success',
      'pending': 'text-warning',
      'cancelled': 'text-danger',
      'in-transit': 'text-info',
      'delivered': 'text-success',
      'processing': 'text-primary'
    };
    return colorMap[status.toLowerCase()] || 'text-muted';
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }

  getTimeAgo(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return this.formatDate(dateObj);
  }

  // Track by functions for ngFor performance
  trackActivity(index: number, activity: RecentActivity): string {
    return activity.id.toString();
  }

  trackBooking(index: number, booking: UpcomingBooking): string {
    return booking.id;
  }


}