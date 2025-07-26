import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-owner-dashboard',
  template: `
    <div class="dashboard-container">
      <div class="header-section">
        <h2 class="dashboard-title">Vehicle Owner Dashboard</h2>
        <p class="welcome-text">Welcome to JR Transport Management System</p>
      </div>

      <!-- Quick Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><mat-icon>directions_car</mat-icon></div>
          <div class="stat-info">
            <h3>{{vehicleCount}}</h3>
            <p>Total Vehicles</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><mat-icon>route</mat-icon></div>
          <div class="stat-info">
            <h3>{{activeTrips}}</h3>
            <p>Active Trips</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><mat-icon>account_balance_wallet</mat-icon></div>
          <div class="stat-info">
            <h3>₹{{walletBalance}}</h3>
            <p>Wallet Balance</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><mat-icon>trending_up</mat-icon></div>
          <div class="stat-info">
            <h3>₹{{monthlyEarnings}}</h3>
            <p>Monthly Earnings</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <mat-card class="action-card" routerLink="/owner/vehicles">
          <mat-icon>directions_car</mat-icon>
          <h3>Manage Vehicles</h3>
          <p>Add, edit, and track your vehicles</p>
        </mat-card>
        
        <mat-card class="action-card" routerLink="/owner/drivers">
          <mat-icon>person</mat-icon>
          <h3>Driver Management</h3>
          <p>Manage driver profiles and assignments</p>
        </mat-card>
        
        <mat-card class="action-card" routerLink="/owner/bookings">
          <mat-icon>book_online</mat-icon>
          <h3>View Bookings</h3>
          <p>Monitor current and past bookings</p>
        </mat-card>
        
        <mat-card class="action-card" routerLink="/owner/wallet">
          <mat-icon>account_balance_wallet</mat-icon>
          <h3>Wallet</h3>
          <p>Manage payments and transactions</p>
        </mat-card>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Recent Activity</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="activity-list">
              <div class="activity-item">
                <mat-icon>check_circle</mat-icon>
                <span>New booking received for Mumbai → Delhi</span>
                <span class="time">2 hours ago</span>
              </div>
              <div class="activity-item">
                <mat-icon>local_shipping</mat-icon>
                <span>Vehicle MH-12-AB-1234 completed delivery</span>
                <span class="time">4 hours ago</span>
              </div>
              <div class="activity-item">
                <mat-icon>warning</mat-icon>
                <span>Driver license renewal due for Raj Kumar</span>
                <span class="time">1 day ago</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }
    
    .header-section {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .dashboard-title {
      color: #2c3e50;
      font-size: 2rem;
      margin-bottom: 10px;
    }
    
    .welcome-text {
      color: #7f8c8d;
      font-size: 1.1rem;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    .stat-icon {
      margin-right: 15px;
    }
    
    .stat-info h3 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: bold;
    }
    
    .stat-info p {
      margin: 5px 0 0 0;
      opacity: 0.9;
    }
    
    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .action-card {
      text-align: center;
      padding: 20px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .action-card:hover {
      transform: translateY(-2px);
    }
    
    .action-card mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #3f51b5;
    }
    
    .recent-activity {
      max-width: 600px;
    }
    
    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .activity-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .activity-item:last-child {
      border-bottom: none;
    }
    
    .activity-item .time {
      margin-left: auto;
      color: #666;
      font-size: 0.9rem;
    }
  `]
})
export class OwnerDashboardComponent implements OnInit {
  vehicleCount = 5;
  activeTrips = 12;
  walletBalance = 45000;
  monthlyEarnings = 125000;

  constructor() { }

  ngOnInit(): void {
    // Load dashboard data
  }
}
