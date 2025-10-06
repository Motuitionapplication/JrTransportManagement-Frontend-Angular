import { Component, OnInit } from '@angular/core';

export interface ReportData {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeDrivers: number;
  activeCustomers: number;
  totalKilometers: number;
  fuelCosts: number;
  profitMargin: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

@Component({
  selector: 'app-admin-reports',
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.scss']
})
export class AdminReportsComponent implements OnInit {

  // Date range for reports
  startDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1); // First day of current month
  endDate: Date = new Date(); // Today

  // Report type selection
  selectedReportType: string = 'overview';
  reportTypes = [
    { value: 'overview', label: 'Business Overview' },
    { value: 'revenue', label: 'Revenue Analysis' },
    { value: 'bookings', label: 'Booking Analytics' },
    { value: 'drivers', label: 'Driver Performance' },
    { value: 'customers', label: 'Customer Analytics' },
    { value: 'fleet', label: 'Fleet Utilization' }
  ];

  // Report data
  reportData: ReportData = {
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeDrivers: 0,
    activeCustomers: 0,
    totalKilometers: 0,
    fuelCosts: 0,
    profitMargin: 0
  };

  // Chart data
  revenueChartData: ChartData = {
    labels: [],
    datasets: []
  };

  bookingsChartData: ChartData = {
    labels: [],
    datasets: []
  };

  driverPerformanceData: ChartData = {
    labels: [],
    datasets: []
  };

  fleetUtilizationData: ChartData = {
    labels: [],
    datasets: []
  };

  // Key Performance Indicators
  kpis = [
    {
      title: 'Revenue Growth',
      value: '+12.5%',
      trend: 'up',
      description: 'Compared to last month'
    },
    {
      title: 'Customer Satisfaction',
      value: '4.8/5',
      trend: 'up',
      description: 'Average rating'
    },
    {
      title: 'Fleet Utilization',
      value: '85%',
      trend: 'stable',
      description: 'Average utilization rate'
    },
    {
      title: 'Driver Efficiency',
      value: '92%',
      trend: 'up',
      description: 'On-time delivery rate'
    }
  ];

  // Top performing metrics
  topMetrics = {
    topRoutes: [
      { route: 'Mumbai - Pune', bookings: 45, revenue: 125000 },
      { route: 'Delhi - Jaipur', bookings: 38, revenue: 98000 },
      { route: 'Bangalore - Chennai', bookings: 32, revenue: 87000 },
      { route: 'Ahmedabad - Surat', bookings: 28, revenue: 76000 },
      { route: 'Kolkata - Bhubaneswar', bookings: 24, revenue: 65000 }
    ],
    topDrivers: [
      { name: 'Raj Kumar', trips: 28, rating: 4.9, earnings: 45000 },
      { name: 'Suresh Patel', trips: 25, rating: 4.8, earnings: 42000 },
      { name: 'Amit Singh', trips: 23, rating: 4.7, earnings: 38000 },
      { name: 'Vikash Sharma', trips: 21, rating: 4.6, earnings: 36000 },
      { name: 'Ramesh Kumar', trips: 19, rating: 4.5, earnings: 33000 }
    ],
    topCustomers: [
      { name: 'ABC Corp', bookings: 15, spending: 85000 },
      { name: 'XYZ Industries', bookings: 12, spending: 72000 },
      { name: 'Tech Solutions Inc', bookings: 10, spending: 58000 },
      { name: 'Global Enterprises', bookings: 8, spending: 45000 },
      { name: 'Innovation Ltd', bookings: 7, spending: 38000 }
    ]
  };

  constructor() { }

  ngOnInit(): void {
    this.loadReportData();
    this.generateChartData();
  }

  /**
   * Load report data based on selected date range
   */
  loadReportData(): void {
    // Mock data - replace with actual API calls
    this.reportData = {
      totalBookings: 1245,
      completedBookings: 1089,
      cancelledBookings: 156,
      totalRevenue: 2850000,
      monthlyRevenue: 485000,
      activeDrivers: 248,
      activeCustomers: 1850,
      totalKilometers: 425000,
      fuelCosts: 125000,
      profitMargin: 22.5
    };
  }

  /**
   * Generate chart data for visualization
   */
  generateChartData(): void {
    // Revenue Chart Data
    this.revenueChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Monthly Revenue (₹)',
          data: [380000, 425000, 465000, 485000, 520000, 485000, 545000, 580000, 485000, 425000, 465000, 485000],
          backgroundColor: ['rgba(33, 150, 243, 0.1)'],
          borderColor: 'rgba(33, 150, 243, 1)',
          borderWidth: 2
        }
      ]
    };

    // Bookings Chart Data
    this.bookingsChartData = {
      labels: ['Completed', 'Cancelled', 'In Progress'],
      datasets: [
        {
          label: 'Bookings Distribution',
          data: [1089, 156, 45],
          backgroundColor: [
            'rgba(76, 175, 80, 0.8)',
            'rgba(244, 67, 54, 0.8)',
            'rgba(255, 152, 0, 0.8)'
          ]
        }
      ]
    };

    // Driver Performance Data
    this.driverPerformanceData = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Average Rating',
          data: [4.6, 4.7, 4.8, 4.7],
          backgroundColor: ['rgba(156, 39, 176, 0.1)'],
          borderColor: 'rgba(156, 39, 176, 1)',
          borderWidth: 2
        }
      ]
    };

    // Fleet Utilization Data
    this.fleetUtilizationData = {
      labels: ['Active', 'Maintenance', 'Idle'],
      datasets: [
        {
          label: 'Fleet Status',
          data: [85, 10, 5],
          backgroundColor: [
            'rgba(76, 175, 80, 0.8)',
            'rgba(255, 152, 0, 0.8)',
            'rgba(158, 158, 158, 0.8)'
          ]
        }
      ]
    };
  }

  /**
   * Update reports when date range changes
   */
  onDateRangeChange(): void {
    console.log('Date range changed:', this.startDate, 'to', this.endDate);
    this.loadReportData();
    this.generateChartData();
  }

  /**
   * Update reports when report type changes
   */
  onReportTypeChange(): void {
    console.log('Report type changed to:', this.selectedReportType);
    this.loadReportData();
    this.generateChartData();
  }

  /**
   * Export report data
   */
  exportReport(format: string): void {
    console.log(`Exporting report in ${format} format`);
    // Implement export functionality
  }

  /**
   * Generate detailed report
   */
  generateDetailedReport(): void {
    console.log('Generating detailed report...');
    // Implement detailed report generation
  }

  /**
   * Schedule automatic report
   */
  scheduleReport(): void {
    console.log('Scheduling automatic report...');
    // Implement report scheduling functionality
  }

  /**
   * Format currency display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format number display
   */
  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-IN').format(value);
  }

  /**
   * Get trend icon based on trend direction
   */
  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up':
        return 'fas fa-arrow-up';
      case 'down':
        return 'fas fa-arrow-down';
      case 'stable':
        return 'fas fa-minus';
      default:
        return 'fas fa-minus';
    }
  }

  /**
   * Get trend color class
   */
  getTrendColorClass(trend: string): string {
    switch (trend) {
      case 'up':
        return 'trend-up';
      case 'down':
        return 'trend-down';
      case 'stable':
        return 'trend-stable';
      default:
        return 'trend-stable';
    }
  }

  /**
   * Calculate completion rate
   */
  get completionRate(): number {
    return this.reportData.totalBookings > 0 
      ? Math.round((this.reportData.completedBookings / this.reportData.totalBookings) * 100)
      : 0;
  }

  /**
   * Calculate cancellation rate
   */
  get cancellationRate(): number {
    return this.reportData.totalBookings > 0 
      ? Math.round((this.reportData.cancelledBookings / this.reportData.totalBookings) * 100)
      : 0;
  }
}