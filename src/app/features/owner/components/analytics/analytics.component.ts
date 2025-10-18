import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {

  selectedPeriod = '30days';
  activeTab = 'overview';

  // Performance Metrics
  performanceMetrics = {
    totalTrips: 456,
    totalRevenue: 342500,
    averageTripValue: 751.10,
    customerSatisfaction: 4.7,
    driverEfficiency: 89.2,
    vehicleUtilization: 85.6,
    fuelEfficiency: 12.5, // km/l
    onTimePercentage: 92.3,
    cancellationRate: 3.2,
    repeatCustomerRate: 67.8
  };

  // Trip Analytics
  tripAnalytics = {
    peakHours: [
      { hour: '07:00-08:00', trips: 45, revenue: 38500 },
      { hour: '08:00-09:00', trips: 52, revenue: 44200 },
      { hour: '09:00-10:00', trips: 38, revenue: 32100 },
      { hour: '17:00-18:00', trips: 48, revenue: 41300 },
      { hour: '18:00-19:00', trips: 55, revenue: 47800 },
      { hour: '19:00-20:00', trips: 42, revenue: 35600 }
    ],
    popularRoutes: [
      { route: 'Mumbai Central → Pune', trips: 89, revenue: 156700, avgDuration: '3h 30m' },
      { route: 'Bandra → Andheri', trips: 156, revenue: 89400, avgDuration: '45m' },
      { route: 'Airport → Colaba', trips: 134, revenue: 76500, avgDuration: '55m' },
      { route: 'Thane → Mumbai', trips: 98, revenue: 67800, avgDuration: '1h 15m' }
    ],
    distanceDistribution: [
      { range: '0-10 km', trips: 145, percentage: 31.8, avgFare: 245 },
      { range: '10-25 km', trips: 189, percentage: 41.4, avgFare: 485 },
      { range: '25-50 km', trips: 89, percentage: 19.5, avgFare: 875 },
      { range: '50+ km', trips: 33, percentage: 7.3, avgFare: 1650 }
    ]
  };

  // Customer Analytics
  customerAnalytics = {
    demographics: [
      { type: 'Business', percentage: 45, count: 234, avgSpend: 950 },
      { type: 'Individual', percentage: 55, count: 287, avgSpend: 620 }
    ],
    loyaltySegments: [
      { segment: 'VIP (20+ trips)', count: 45, revenue: 89500, percentage: 26.1 },
      { segment: 'Regular (5-19 trips)', count: 123, revenue: 156800, percentage: 45.8 },
      { segment: 'Occasional (2-4 trips)', count: 189, revenue: 78200, percentage: 22.8 },
      { segment: 'New (1 trip)', count: 164, revenue: 17900, percentage: 5.3 }
    ],
    satisfactionTrends: [
      { period: 'Week 1', rating: 4.6, responses: 89 },
      { period: 'Week 2', rating: 4.7, responses: 95 },
      { period: 'Week 3', rating: 4.8, responses: 87 },
      { period: 'Week 4', rating: 4.7, responses: 92 }
    ]
  };

  // Financial Analytics
  financialAnalytics = {
    revenueBreakdown: [
      { source: 'Base Fare', amount: 198500, percentage: 58.0 },
      { source: 'Distance Charges', amount: 89700, percentage: 26.2 },
      { source: 'Time Charges', amount: 34200, percentage: 10.0 },
      { source: 'Peak Hour Surcharge', amount: 20100, percentage: 5.8 }
    ],
    costAnalysis: [
      { category: 'Fuel', amount: 67800, percentage: 35.2 },
      { category: 'Driver Payments', amount: 89500, percentage: 46.5 },
      { category: 'Vehicle Maintenance', amount: 23400, percentage: 12.2 },
      { category: 'Insurance', amount: 11700, percentage: 6.1 }
    ],
    profitMargins: {
      gross: 342500,
      expenses: 192400,
      netProfit: 150100,
      marginPercentage: 43.8
    }
  };

  // Operational Analytics
  operationalMetrics = {
    fleetUtilization: [
      { vehicle: 'MH-12-AB-1234', utilization: 89.5, trips: 156, revenue: 125600, downtime: 2.5 },
      { vehicle: 'MH-12-CD-5678', utilization: 85.2, trips: 142, revenue: 108900, downtime: 3.8 },
      { vehicle: 'MH-12-EF-9012', utilization: 82.1, trips: 158, revenue: 108000, downtime: 4.2 }
    ],
    driverPerformance: [
      { driver: 'Rajesh Kumar', rating: 4.8, trips: 156, earnings: 89500, efficiency: 94.2 },
      { driver: 'Suresh Patil', rating: 4.6, trips: 142, earnings: 78900, efficiency: 87.8 },
      { driver: 'Amit Sharma', rating: 4.4, trips: 158, earnings: 67800, efficiency: 82.5 }
    ],
    maintenanceCosts: [
      { month: 'Jul', cost: 12400, vehicles: 3 },
      { month: 'Aug', cost: 8900, vehicles: 3 },
      { month: 'Sep', cost: 15600, vehicles: 3 }
    ]
  };

  constructor() { }

  ngOnInit(): void {
    console.log('Analytics component initialized');
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  setPeriod(period: string): void {
    this.selectedPeriod = period;
    console.log('Period changed to:', period);
  }

  exportAnalyticsReport(): void {
    console.log('Exporting analytics report for period:', this.selectedPeriod);
  }

  downloadDashboard(): void {
    console.log('Downloading analytics dashboard');
  }

  shareReport(): void {
    console.log('Sharing analytics report');
  }

  viewDetailedReport(type: string): void {
    console.log('Viewing detailed report for:', type);
  }

  optimizeOperations(): void {
    console.log('Opening operations optimization recommendations');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getPerformanceColor(value: number, benchmark: number): string {
    const ratio = value / benchmark;
    if (ratio >= 1.1) return '#10b981';
    if (ratio >= 0.9) return '#f59e0b';
    return '#ef4444';
  }

  getTrendIcon(current: number, previous: number): string {
    if (current > previous) return 'fa-arrow-up';
    if (current < previous) return 'fa-arrow-down';
    return 'fa-minus';
  }

  getTrendColor(current: number, previous: number): string {
    if (current > previous) return '#10b981';
    if (current < previous) return '#ef4444';
    return '#6b7280';
  }

  calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  getUtilizationColor(utilization: number): string {
    if (utilization >= 85) return '#10b981';
    if (utilization >= 70) return '#f59e0b';
    return '#ef4444';
  }

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return '#10b981';
    if (rating >= 4.0) return '#f59e0b';
    return '#ef4444';
  }

}