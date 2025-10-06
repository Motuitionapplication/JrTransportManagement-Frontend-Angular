import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-earnings',
  templateUrl: './earnings.component.html',
  styleUrls: ['./earnings.component.scss']
})
export class EarningsComponent implements OnInit {

  selectedPeriod = 'monthly';
  selectedYear = new Date().getFullYear();

  earningsData = {
    today: {
      gross: 8500,
      commission: 1275,
      net: 7225,
      trips: 12,
      avgPerTrip: 708.33
    },
    thisWeek: {
      gross: 45600,
      commission: 6840,
      net: 38760,
      trips: 68,
      avgPerTrip: 670.59
    },
    thisMonth: {
      gross: 185600,
      commission: 27840,
      net: 157760,
      trips: 245,
      avgPerTrip: 757.55
    },
    thisYear: {
      gross: 1856000,
      commission: 278400,
      net: 1577600,
      trips: 2450,
      avgPerTrip: 757.55
    }
  };

  monthlyEarnings = [
    { month: 'Jan 2024', gross: 142000, commission: 21300, net: 120700, trips: 178 },
    { month: 'Feb 2024', gross: 156000, commission: 23400, net: 132600, trips: 195 },
    { month: 'Mar 2024', gross: 178000, commission: 26700, net: 151300, trips: 223 },
    { month: 'Apr 2024', gross: 165000, commission: 24750, net: 140250, trips: 207 },
    { month: 'May 2024', gross: 189000, commission: 28350, net: 160650, trips: 236 },
    { month: 'Jun 2024', gross: 198000, commission: 29700, net: 168300, trips: 248 },
    { month: 'Jul 2024', gross: 205000, commission: 30750, net: 174250, trips: 256 },
    { month: 'Aug 2024', green: 195000, commission: 29250, net: 165750, trips: 244 },
    { month: 'Sep 2024', gross: 185600, commission: 27840, net: 157760, trips: 245 }
  ];

  vehicleEarnings = [
    {
      vehicleId: 'V001',
      vehiclePlate: 'MH-12-AB-1234',
      driverName: 'Rajesh Kumar',
      monthlyGross: 68500,
      monthlyCommission: 10275,
      monthlyNet: 58225,
      monthlyTrips: 89,
      avgEarningsPerTrip: 769.66,
      fuelCost: 12400,
      maintenanceCost: 3200,
      totalExpenses: 15600,
      profitMargin: 73.5
    },
    {
      vehicleId: 'V002',
      vehiclePlate: 'MH-12-CD-5678',
      driverName: 'Suresh Patil',
      monthlyGross: 62800,
      monthlyCommission: 9420,
      monthlyNet: 53380,
      monthlyTrips: 78,
      avgEarningsPerTrip: 805.13,
      fuelCost: 11200,
      maintenanceCost: 2800,
      totalExpenses: 14000,
      profitMargin: 73.8
    },
    {
      vehicleId: 'V003',
      vehiclePlate: 'MH-12-EF-9012',
      driverName: 'Amit Sharma',
      monthlyGross: 54300,
      monthlyCommission: 8145,
      monthlyNet: 46155,
      monthlyTrips: 78,
      avgEarningsPerTrip: 696.15,
      fuelCost: 9800,
      maintenanceCost: 4200,
      totalExpenses: 14000,
      profitMargin: 69.7
    }
  ];

  earningsBreakdown = {
    shortDistance: { earnings: 45600, percentage: 24.6, trips: 123 },
    mediumDistance: { earnings: 89500, percentage: 48.2, trips: 98 },
    longDistance: { earnings: 50500, percentage: 27.2, trips: 24 },
    peak: { earnings: 67800, percentage: 36.5, trips: 87 },
    offPeak: { earnings: 117800, percentage: 63.5, trips: 158 }
  };

  expenseCategories = [
    { category: 'Fuel', amount: 33400, percentage: 42.1 },
    { category: 'Maintenance', amount: 10200, percentage: 12.8 },
    { category: 'Insurance', amount: 8500, percentage: 10.7 },
    { category: 'Platform Commission', amount: 27840, percentage: 35.1 },
    { category: 'Other', amount: 1200, percentage: 1.5 }
  ];

  constructor() { }

  ngOnInit(): void {
    console.log('Earnings component initialized');
  }

  get currentPeriodData() {
    switch(this.selectedPeriod) {
      case 'daily': return this.earningsData.today;
      case 'weekly': return this.earningsData.thisWeek;
      case 'monthly': return this.earningsData.thisMonth;
      case 'yearly': return this.earningsData.thisYear;
      default: return this.earningsData.thisMonth;
    }
  }

  get topPerformingVehicle() {
    return this.vehicleEarnings.reduce((top, vehicle) => 
      vehicle.monthlyNet > top.monthlyNet ? vehicle : top
    );
  }

  get averageEarningsPerTrip() {
    const totalEarnings = this.vehicleEarnings.reduce((sum, v) => sum + v.monthlyGross, 0);
    const totalTrips = this.vehicleEarnings.reduce((sum, v) => sum + v.monthlyTrips, 0);
    return totalTrips > 0 ? totalEarnings / totalTrips : 0;
  }

  get totalExpenses() {
    return this.expenseCategories.reduce((sum, category) => sum + category.amount, 0);
  }

  setPeriod(period: string): void {
    this.selectedPeriod = period;
  }

  viewVehicleDetails(vehicleId: string): void {
    console.log('Viewing vehicle earnings details:', vehicleId);
  }

  exportEarningsReport(): void {
    console.log('Exporting earnings report for period:', this.selectedPeriod);
  }

  downloadTaxStatement(): void {
    console.log('Downloading tax statement');
  }

  viewEarningsTrends(): void {
    console.log('Viewing earnings trends analysis');
  }

  optimizeEarnings(): void {
    console.log('Opening earnings optimization suggestions');
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
    if (ratio >= 1.1) return '#10b981'; // Green for above benchmark
    if (ratio >= 0.9) return '#f59e0b'; // Yellow for near benchmark
    return '#ef4444'; // Red for below benchmark
  }

  getExpenseCategoryColor(category: string): string {
    const colors = {
      'Fuel': '#ef4444',
      'Maintenance': '#f59e0b',
      'Insurance': '#3b82f6',
      'Platform Commission': '#8b5cf6',
      'Other': '#6b7280'
    };
    return colors[category as keyof typeof colors] || '#6b7280';
  }

  calculateGrowthPercentage(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

}