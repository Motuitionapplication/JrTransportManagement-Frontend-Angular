import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface DashboardStats {
  totalBookings: number;
  completedTrips: number;
  pendingTrips: number;
  totalEarnings: number;
  thisMonthEarnings: number;
  averageRating: number;
  totalDistance: number;
  fuelExpense: number;
}

export interface RecentActivity {
  id: string;
  type: 'booking' | 'trip' | 'payment' | 'message';
  title: string;
  description: string;
  timestamp: Date;
  status?: string;
  amount?: number;
}

export interface QuickAction {
  title: string;
  icon: string;
  route: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Dashboard data
  stats: DashboardStats = {
    totalBookings: 0,
    completedTrips: 0,
    pendingTrips: 0,
    totalEarnings: 0,
    thisMonthEarnings: 0,
    averageRating: 0,
    totalDistance: 0,
    fuelExpense: 0
  };

  recentActivities: RecentActivity[] = [];
  quickActions: QuickAction[] = [
    {
      title: 'My Trips',
      icon: 'fas fa-route',
      route: '/driver/my-trips',
      color: 'primary',
      description: 'View and manage your trips'
    },
    {
      title: 'New Bookings',
      icon: 'fas fa-calendar-plus',
      route: '/driver/bookings',
      color: 'success',
      description: 'Check new booking requests'
    },
    {
      title: 'My Truck',
      icon: 'fas fa-truck',
      route: '/driver/my-truck',
      color: 'info',
      description: 'Manage vehicle information'
    },
    {
      title: 'Earnings',
      icon: 'fas fa-rupee-sign',
      route: '/driver/earnings',
      color: 'warning',
      description: 'View earnings and payments'
    },
    {
      title: 'Schedule',
      icon: 'fas fa-calendar-alt',
      route: '/driver/schedule',
      color: 'secondary',
      description: 'Manage your schedule'
    },
    {
      title: 'Messages',
      icon: 'fas fa-comments',
      route: '/driver/messages',
      color: 'primary',
      description: 'View customer messages'
    }
  ];

  // Loading states
  isLoading = true;
  statsLoading = true;
  activitiesLoading = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.statsLoading = true;
    this.activitiesLoading = true;

    // Simulate API calls with mock data
    this.loadStats();
    this.loadRecentActivities();
  }

  private loadStats(): void {
    // Mock data - replace with actual service call
    setTimeout(() => {
      this.stats = {
        totalBookings: 147,
        completedTrips: 142,
        pendingTrips: 5,
        totalEarnings: 85600,
        thisMonthEarnings: 12450,
        averageRating: 4.7,
        totalDistance: 18750,
        fuelExpense: 15230
      };
      this.statsLoading = false;
    }, 800);
  }

  private loadRecentActivities(): void {
    // Mock data - replace with actual service call
    setTimeout(() => {
      this.recentActivities = [
        {
          id: '1',
          type: 'booking',
          title: 'New Booking Request',
          description: 'Mumbai to Delhi - Heavy cargo',
          timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          status: 'pending'
        },
        {
          id: '2',
          type: 'trip',
          title: 'Trip Completed',
          description: 'Pune to Bangalore delivery completed',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          status: 'completed',
          amount: 8500
        },
        {
          id: '3',
          type: 'payment',
          title: 'Payment Received',
          description: 'Payment for trip #TR-2024-156',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          amount: 7200
        },
        {
          id: '4',
          type: 'message',
          title: 'New Message',
          description: 'Customer inquiry about delivery time',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        },
        {
          id: '5',
          type: 'trip',
          title: 'Trip Started',
          description: 'Chennai to Coimbatore pickup started',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          status: 'in-progress'
        }
      ];
      this.activitiesLoading = false;
      this.isLoading = false;
    }, 1000);
  }

  // Navigation methods
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Quick actions
  viewAllTrips(): void {
    this.router.navigate(['/driver/my-trips']);
  }

  viewBookings(): void {
    this.router.navigate(['/driver/bookings']);
  }

  viewEarnings(): void {
    this.router.navigate(['/driver/earnings']);
  }

  viewMessages(): void {
    this.router.navigate(['/driver/messages']);
  }

  // Activity handling
  handleActivityClick(activity: RecentActivity): void {
    switch (activity.type) {
      case 'booking':
        this.router.navigate(['/driver/bookings']);
        break;
      case 'trip':
        this.router.navigate(['/driver/my-trips']);
        break;
      case 'payment':
        this.router.navigate(['/driver/earnings']);
        break;
      case 'message':
        this.router.navigate(['/driver/messages']);
        break;
    }
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatDistance(distance: number): string {
    return `${distance.toLocaleString()} km`;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  getActivityIcon(type: string): string {
    const icons = {
      'booking': 'fas fa-calendar-plus',
      'trip': 'fas fa-route',
      'payment': 'fas fa-rupee-sign',
      'message': 'fas fa-comment'
    };
    return icons[type as keyof typeof icons] || 'fas fa-info-circle';
  }

  getActivityColor(type: string): string {
    const colors = {
      'booking': 'text-primary',
      'trip': 'text-success',
      'payment': 'text-warning',
      'message': 'text-info'
    };
    return colors[type as keyof typeof colors] || 'text-secondary';
  }

  getStatusBadgeClass(status: string): string {
    const classes = {
      'pending': 'badge bg-warning',
      'completed': 'badge bg-success',
      'in-progress': 'badge bg-primary',
      'cancelled': 'badge bg-danger'
    };
    return classes[status as keyof typeof classes] || 'badge bg-secondary';
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }

  // Calculate completion rate
  getCompletionRate(): number {
    if (this.stats.totalBookings === 0) return 0;
    return Math.round((this.stats.completedTrips / this.stats.totalBookings) * 100);
  }

  // Get earnings growth (mock calculation)
  getEarningsGrowth(): number {
    // Mock calculation - would be based on previous month data
    return 15.7; // 15.7% growth
  }
}