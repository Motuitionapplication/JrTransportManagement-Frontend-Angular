import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, registerables, ChartConfiguration, ChartType } from 'chart.js';

Chart.register(...registerables);

interface Transaction {
  id: string;
  date: Date;
  type: 'revenue' | 'expense';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  vehicleNumber?: string;
  bookingId?: string;
}

interface VehiclePerformance {
  vehicleNumber: string;
  type: string;
  revenue: number;
  trips: number;
  efficiency: number;
  expenses: number;
  profit: number;
}

@Component({
  selector: 'app-earnings',
  templateUrl: './earnings.component.html',
  styleUrls: ['./earnings.component.scss']
})
export class EarningsComponent implements OnInit, AfterViewInit {

  @ViewChild('revenueChart') revenueChartRef!: ElementRef;
  @ViewChild('expenseChart') expenseChartRef!: ElementRef;
  @ViewChild('vehiclePerformanceChart') vehiclePerformanceChartRef!: ElementRef;

  // Date Range
  selectedPeriod = 'month';
  showDateRangePicker = false;
  customDateRange = {
    from: '',
    to: ''
  };

  // Loading and UI States
  isLoading = false;
  isRefreshing = false;
  showAlert = false;
  alertMessage = '';
  isError = false;

  // Key Metrics
  totalRevenue = 245000;
  totalExpenses = 180000;
  netProfit = 65000;
  profitMargin = 26.5;
  activeVehicles = 8;
  completedTrips = 145;
  totalBookings = 152;
  averageTripValue = 1611;

  // Trends (percentage change from previous period)
  revenueTrend = 12.5;
  expensesTrend = -8.2;
  profitTrend = 18.7;
  marginTrend = 3.2;

  // Financial Breakdown
  grossRevenue = 245000;
  fuelCosts = 85000;
  maintenanceCosts = 32000;
  driverPayments = 45000;
  insuranceCosts = 12000;
  otherExpenses = 6000;

  // Chart Types - Fixed typing
  revenueChartType: 'line' | 'bar' = 'line';

  // Data Arrays
  topVehicles: VehiclePerformance[] = [];
  recentTransactions: Transaction[] = [];

  // Charts
  private revenueChart?: Chart;
  private expenseChart?: Chart;
  private vehiclePerformanceChart?: Chart;

  constructor() {
    this.Math = Math; // Make Math available in template
  }

  ngOnInit(): void {
    this.loadEarningsData();
    this.loadTopVehicles();
    this.loadRecentTransactions();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  // Data Loading Methods
  private loadEarningsData(): void {
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      // Data is already initialized in component properties
      this.isLoading = false;
      this.showSuccessAlert('Earnings data loaded successfully');
    }, 1000);
  }

  private loadTopVehicles(): void {
    this.topVehicles = [
      {
        vehicleNumber: 'MH 12 AB 1234',
        type: 'TRUCK',
        revenue: 45000,
        trips: 28,
        efficiency: 92,
        expenses: 25000,
        profit: 20000
      },
      {
        vehicleNumber: 'KA 05 EF 9012',
        type: 'TRUCK',
        revenue: 38000,
        trips: 24,
        efficiency: 88,
        expenses: 22000,
        profit: 16000
      },
      {
        vehicleNumber: 'DL 8C A 4567',
        type: 'VAN',
        revenue: 32000,
        trips: 35,
        efficiency: 85,
        expenses: 18000,
        profit: 14000
      },
      {
        vehicleNumber: 'GJ 01 HH 8901',
        type: 'CONTAINER',
        revenue: 55000,
        trips: 18,
        efficiency: 90,
        expenses: 35000,
        profit: 20000
      },
      {
        vehicleNumber: 'TN 33 CC 2345',
        type: 'TRAILER',
        revenue: 42000,
        trips: 22,
        efficiency: 78,
        expenses: 28000,
        profit: 14000
      }
    ];
  }

  private loadRecentTransactions(): void {
    this.recentTransactions = [
      {
        id: 'T001',
        date: new Date(2025, 9, 18),
        type: 'revenue',
        description: 'Mumbai to Pune delivery - MH 12 AB 1234',
        amount: 8500,
        status: 'completed',
        vehicleNumber: 'MH 12 AB 1234'
      },
      {
        id: 'T002',
        date: new Date(2025, 9, 17),
        type: 'expense',
        description: 'Fuel cost - KA 05 EF 9012',
        amount: -3200,
        status: 'completed',
        vehicleNumber: 'KA 05 EF 9012'
      },
      {
        id: 'T003',
        date: new Date(2025, 9, 17),
        type: 'revenue',
        description: 'Delhi to Jaipur transport',
        amount: 12000,
        status: 'pending'
      },
      {
        id: 'T004',
        date: new Date(2025, 9, 16),
        type: 'expense',
        description: 'Vehicle maintenance - DL 8C A 4567',
        amount: -7500,
        status: 'completed'
      },
      {
        id: 'T005',
        date: new Date(2025, 9, 16),
        type: 'revenue',
        description: 'Container transport - GJ 01 HH 8901',
        amount: 25000,
        status: 'completed'
      }
    ];
  }

  // Chart Initialization
  private initializeCharts(): void {
    this.createRevenueChart();
    this.createExpenseChart();
    this.createVehiclePerformanceChart();
  }

  private createRevenueChart(): void {
    if (!this.revenueChartRef?.nativeElement) return;
    
    const ctx = this.revenueChartRef.nativeElement.getContext('2d');
    if (!ctx) return;
    
    // Fixed chart configuration with proper typing
    const config: ChartConfiguration = {
      type: this.revenueChartType as ChartType, // Explicit casting
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [{
          label: 'Revenue',
          data: [180000, 195000, 210000, 185000, 220000, 235000, 225000, 240000, 250000, 245000],
          borderColor: '#667eea',
          backgroundColor: this.revenueChartType === 'line' ? 'transparent' : '#667eea',
          tension: 0.4,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value: number | string) => this.formatChartTick(value)
            }
          }
        }
      }
    };
    
    this.revenueChart = new Chart(ctx, config);
  }

  private createExpenseChart(): void {
    if (!this.expenseChartRef?.nativeElement) return;
    
    const ctx = this.expenseChartRef.nativeElement.getContext('2d');
    if (!ctx) return;
    
    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Fuel', 'Maintenance', 'Driver Pay', 'Insurance', 'Others'],
        datasets: [{
          data: [85000, 32000, 45000, 12000, 6000],
          backgroundColor: [
            '#ff9a9e',
            '#fecfef',
            '#a8edea',
            '#fed6e3',
            '#d299c2'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        }
      }
    };
    
    this.expenseChart = new Chart(ctx, config);
  }

  private createVehiclePerformanceChart(): void {
    if (!this.vehiclePerformanceChartRef?.nativeElement) return;
    
    const ctx = this.vehiclePerformanceChartRef.nativeElement.getContext('2d');
    if (!ctx) return;
    
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.topVehicles.map(v => v.vehicleNumber),
        datasets: [
          {
            label: 'Revenue',
            data: this.topVehicles.map(v => v.revenue),
            backgroundColor: '#667eea'
          },
          {
            label: 'Expenses',
            data: this.topVehicles.map(v => v.expenses),
            backgroundColor: '#ff9a9e'
          },
          {
            label: 'Profit',
            data: this.topVehicles.map(v => v.profit),
            backgroundColor: '#a8edea'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value: number | string) => this.formatChartTick(value)
            }
          }
        }
      }
    };
    
    this.vehiclePerformanceChart = new Chart(ctx, config);
  }

  // Period Selection Methods
  setPeriod(period: string): void {
    if (period === 'custom') {
      this.showDateRangePicker = true;
    } else {
      this.selectedPeriod = period;
      this.refreshData();
    }
  }

  closeDateRangePicker(): void {
    this.showDateRangePicker = false;
  }

  applyCustomDateRange(): void {
    if (this.customDateRange.from && this.customDateRange.to) {
      this.selectedPeriod = 'custom';
      this.showDateRangePicker = false;
      this.refreshData();
    }
  }

  getPeriodLabel(): string {
    switch (this.selectedPeriod) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'custom':
        return `${this.customDateRange.from} to ${this.customDateRange.to}`;
      default:
        return 'This Month';
    }
  }

  // Chart Control Methods
  setRevenueChartType(type: 'line' | 'bar'): void {
    this.revenueChartType = type;
    if (this.revenueChart) {
      this.revenueChart.destroy();
      this.createRevenueChart();
    }
  }

  // Action Methods
  refreshData(): void {
    this.isRefreshing = true;
    setTimeout(() => {
      this.isRefreshing = false;
      this.loadEarningsData();
      this.showSuccessAlert('Data refreshed successfully');
    }, 2000);
  }

  exportReport(): void {
    // Implement report export logic
    this.showSuccessAlert('Report exported successfully');
  }

  addExpense(): void {
    // Navigate to add expense page or open modal
    console.log('Add expense clicked');
  }

  recordPayment(): void {
    // Navigate to record payment page or open modal
    console.log('Record payment clicked');
  }

  generateInvoice(): void {
    // Navigate to invoice generation or open modal
    console.log('Generate invoice clicked');
  }

  viewReports(): void {
    // Navigate to reports page
    console.log('View reports clicked');
  }

  viewAllVehicles(): void {
    // Navigate to vehicles performance page
    console.log('View all vehicles clicked');
  }

  viewAllTransactions(): void {
    // Navigate to transactions page
    console.log('View all transactions clicked');
  }

  // Utility Methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN').format(amount);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

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

  // Make Math available in template
  Math = Math;

  private formatChartTick(value: number | string): string {
    const numericValue = typeof value === 'string' ? Number(value) : value;
    return `₹${numericValue / 1000}K`;
  }
}
