import { Component, OnInit } from '@angular/core';

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative';
  icon: string;
}

interface Activity {
  id: number;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  subtitle?: string;
  timestamp: Date;
}

@Component({
  selector: 'app-customer-dashboard',
  template: `
    <div class="customer-dashboard">
      <!-- Header Section -->
      <div class="header-section">
        <h1 class="dashboard-title">Customer Dashboard</h1>
        <p class="dashboard-subtitle">Welcome to your JR Transport Management Portal</p>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card" *ngFor="let stat of statsData">
          <div class="stat-icon">
            <mat-icon>{{ stat.icon }}</mat-icon>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ stat.value }}</h3>
            <p class="stat-title">{{ stat.title }}</p>
            <span class="stat-change" [ngClass]="stat.changeType">
              {{ stat.change }}
            </span>
          </div>
        </div>
      </div>

      <!-- Charts and Activity Row -->
      <div class="dashboard-row">
        <!-- Booking History Chart Card -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Booking History</mat-card-title>
            <mat-card-subtitle>Your booking trends over time</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-container">
              <!-- Placeholder for chart -->
              <div class="chart-placeholder">
                <mat-icon>timeline</mat-icon>
                <p>Chart implementation pending</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Recent Activity Card -->
        <mat-card class="activity-card">
          <mat-card-header>
            <mat-card-title>Recent Activity</mat-card-title>
            <mat-card-subtitle>Your latest booking activities</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="activity-list">
              <div class="activity-item" *ngFor="let activity of recentActivities">
                <div class="activity-icon" [ngClass]="activity.type">
                  <mat-icon>{{ getActivityIcon(activity.type) }}</mat-icon>
                </div>
                <div class="activity-details">
                  <h4 class="activity-title">{{ activity.title }}</h4>
                  <p class="activity-subtitle" *ngIf="activity.subtitle">{{ activity.subtitle }}</p>
                  <span class="activity-time">{{ getTimeAgo(activity.timestamp) }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2 class="section-title">Quick Actions</h2>
        <div class="actions-grid">
          <mat-card class="action-card" routerLink="/customer/new-booking">
            <mat-icon>add_box</mat-icon>
            <h3>New Booking</h3>
            <p>Create a new transport booking request</p>
          </mat-card>

          <mat-card class="action-card" routerLink="/customer/bookings">
            <mat-icon>book_online</mat-icon>
            <h3>My Bookings</h3>
            <p>View and manage your bookings</p>
          </mat-card>

          <mat-card class="action-card" routerLink="/customer/tracking">
            <mat-icon>track_changes</mat-icon>
            <h3>Track Shipment</h3>
            <p>Track your active shipments in real-time</p>
          </mat-card>

          <mat-card class="action-card" routerLink="/customer/payments">
            <mat-icon>payment</mat-icon>
            <h3>Payment History</h3>
            <p>View payments and transaction history</p>
          </mat-card>

          <mat-card class="action-card" routerLink="/customer/profile">
            <mat-icon>account_circle</mat-icon>
            <h3>Profile Settings</h3>
            <p>Manage your account and preferences</p>
          </mat-card>

          <mat-card class="action-card" routerLink="/customer/support">
            <mat-icon>support_agent</mat-icon>
            <h3>Customer Support</h3>
            <p>Get help and contact support team</p>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .customer-dashboard {
      padding: 0;
      width: 100%;
      min-height: 100%;
    }

    .header-section {
      text-align: center;
      margin-bottom: 2rem;
      padding: 2rem;
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
      border-radius: 12px;
      margin: 1rem;
    }

    .dashboard-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
    }

    .dashboard-subtitle {
      font-size: 1.1rem;
      margin: 0.5rem 0 0 0;
      opacity: 0.9;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin: 2rem 1rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    .stat-icon {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
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
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
      color: #333;
    }

    .stat-title {
      font-size: 0.9rem;
      color: #666;
      margin: 0.25rem 0;
    }

    .stat-change {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 20px;
    }

    .stat-change.positive {
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .stat-change.negative {
      background: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    .dashboard-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      margin: 2rem 1rem;
    }

    .chart-card, .activity-card {
      background: white;
      border-radius: 12px;
    }

    .chart-container {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chart-placeholder {
      text-align: center;
      color: #666;
    }

    .chart-placeholder mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
    }

    .activity-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .activity-item:last-child {
      border-bottom: none;
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
export class CustomerDashboardComponent implements OnInit {
  
  statsData: StatCard[] = [
    {
      title: 'Total Bookings',
      value: 24,
      change: '+3 this month',
      changeType: 'positive',
      icon: 'book_online'
    },
    {
      title: 'Active Shipments',
      value: 4,
      change: '+2 this week',
      changeType: 'positive',
      icon: 'local_shipping'
    },
    {
      title: 'Total Spent',
      value: '$1,250',
      change: '+$320 this month',
      changeType: 'positive',
      icon: 'attach_money'
    },
    {
      title: 'Pending Payments',
      value: 1,
      change: '-2 from last month',
      changeType: 'positive',
      icon: 'payment'
    }
  ];

  recentActivities: Activity[] = [
    {
      id: 1,
      type: 'success',
      title: 'Booking confirmed',
      subtitle: 'Booking #B12345 from Mumbai to Delhi',
      timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      id: 2,
      type: 'info',
      title: 'Payment processed',
      subtitle: 'Payment of $250 successfully processed',
      timestamp: new Date(Date.now() - 1000 * 60 * 45) // 45 minutes ago
    },
    {
      id: 3,
      type: 'success',
      title: 'Shipment delivered',
      subtitle: 'Booking #B12340 successfully delivered',
      timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
    },
    {
      id: 4,
      type: 'info',
      title: 'Shipment in transit',
      subtitle: 'Booking #B12339 is on the way',
      timestamp: new Date(Date.now() - 1000 * 60 * 90) // 1.5 hours ago
    },
    {
      id: 5,
      type: 'warning',
      title: 'Payment reminder',
      subtitle: 'Payment due for booking #B12338',
      timestamp: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
    }
  ];

  constructor() { }

  ngOnInit(): void {
    console.log('Customer Dashboard Component initialized');
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }
}