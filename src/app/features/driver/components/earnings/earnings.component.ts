import { Component, OnInit } from '@angular/core';

export interface EarningsData {
  id: string;
  tripId: string;
  customerName: string;
  date: Date;
  baseFare: number;
  distanceCharge: number;
  timeCharge: number;
  tips: number;
  bonuses: number;
  totalEarnings: number;
  commission: number;
  netEarnings: number;
  paymentStatus: 'paid' | 'pending' | 'processing';
  paymentMethod: string;
  tripDistance: number;
  tripDuration: number;
}

export interface EarningsSummary {
  totalEarnings: number;
  netEarnings: number;
  totalCommission: number;
  totalTrips: number;
  averagePerTrip: number;
  topEarningDay: {
    date: Date;
    amount: number;
  };
}

export interface WeeklyStats {
  weekStart: Date;
  weekEnd: Date;
  totalEarnings: number;
  totalTrips: number;
  averagePerTrip: number;
  dailyBreakdown: {
    day: string;
    earnings: number;
    trips: number;
  }[];
}

@Component({
  selector: 'app-earnings',
  templateUrl: './earnings.component.html',
  styleUrls: ['./earnings.component.scss']
})
export class EarningsComponent implements OnInit {
  earnings: EarningsData[] = [];
  filteredEarnings: EarningsData[] = [];
  summary: EarningsSummary = {
    totalEarnings: 0,
    netEarnings: 0,
    totalCommission: 0,
    totalTrips: 0,
    averagePerTrip: 0,
    topEarningDay: {
      date: new Date(),
      amount: 0
    }
  };
  
  weeklyStats: WeeklyStats[] = [];
  loading = true;
  
  // Filters
  dateRange = {
    start: '',
    end: ''
  };
  paymentStatus = '';
  sortBy = 'date';
  sortOrder = 'desc';
  
  constructor() { }

  ngOnInit(): void {
    this.loadEarnings();
  }

  loadEarnings(): void {
    this.loading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.earnings = this.generateMockEarnings();
      this.filteredEarnings = [...this.earnings];
      this.calculateSummary();
      this.calculateWeeklyStats();
      this.loading = false;
    }, 1000);
  }

  generateMockEarnings(): EarningsData[] {
    const earnings: EarningsData[] = [];
    const today = new Date();
    
    for (let i = 0; i < 25; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const baseFare = Math.random() * 50 + 20;
      const distanceCharge = Math.random() * 30 + 10;
      const timeCharge = Math.random() * 20 + 5;
      const tips = Math.random() > 0.7 ? Math.random() * 15 + 5 : 0;
      const bonuses = Math.random() > 0.8 ? Math.random() * 25 + 10 : 0;
      const totalEarnings = baseFare + distanceCharge + timeCharge + tips + bonuses;
      const commission = totalEarnings * 0.2; // 20% commission
      const netEarnings = totalEarnings - commission;
      
      earnings.push({
        id: `earning_${i + 1}`,
        tripId: `TRIP${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        customerName: this.getRandomCustomerName(),
        date: date,
        baseFare: Math.round(baseFare * 100) / 100,
        distanceCharge: Math.round(distanceCharge * 100) / 100,
        timeCharge: Math.round(timeCharge * 100) / 100,
        tips: Math.round(tips * 100) / 100,
        bonuses: Math.round(bonuses * 100) / 100,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        commission: Math.round(commission * 100) / 100,
        netEarnings: Math.round(netEarnings * 100) / 100,
        paymentStatus: this.getRandomPaymentStatus(),
        paymentMethod: this.getRandomPaymentMethod(),
        tripDistance: Math.round((Math.random() * 25 + 5) * 100) / 100,
        tripDuration: Math.floor(Math.random() * 90 + 15)
      });
    }
    
    return earnings.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  getRandomCustomerName(): string {
    const names = [
      'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis',
      'David Wilson', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Miller',
      'William Jones', 'Jessica Garcia', 'James Rodriguez', 'Ashley Martinez'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  getRandomPaymentStatus(): 'paid' | 'pending' | 'processing' {
    const statuses: ('paid' | 'pending' | 'processing')[] = ['paid', 'pending', 'processing'];
    const weights = [0.7, 0.2, 0.1]; // 70% paid, 20% pending, 10% processing
    const random = Math.random();
    
    if (random < weights[0]) return 'paid';
    if (random < weights[0] + weights[1]) return 'pending';
    return 'processing';
  }

  getRandomPaymentMethod(): string {
    const methods = ['Credit Card', 'Cash', 'Digital Wallet', 'Bank Transfer'];
    return methods[Math.floor(Math.random() * methods.length)];
  }

  calculateSummary(): void {
    const filteredData = this.filteredEarnings;
    
    this.summary = {
      totalEarnings: filteredData.reduce((sum, earning) => sum + earning.totalEarnings, 0),
      netEarnings: filteredData.reduce((sum, earning) => sum + earning.netEarnings, 0),
      totalCommission: filteredData.reduce((sum, earning) => sum + earning.commission, 0),
      totalTrips: filteredData.length,
      averagePerTrip: filteredData.length > 0 ? 
        filteredData.reduce((sum, earning) => sum + earning.netEarnings, 0) / filteredData.length : 0,
      topEarningDay: this.getTopEarningDay(filteredData)
    };
    
    // Round values
    this.summary.totalEarnings = Math.round(this.summary.totalEarnings * 100) / 100;
    this.summary.netEarnings = Math.round(this.summary.netEarnings * 100) / 100;
    this.summary.totalCommission = Math.round(this.summary.totalCommission * 100) / 100;
    this.summary.averagePerTrip = Math.round(this.summary.averagePerTrip * 100) / 100;
  }

  getTopEarningDay(earnings: EarningsData[]): { date: Date; amount: number } {
    const dailyEarnings = new Map<string, number>();
    
    earnings.forEach(earning => {
      const dateKey = earning.date.toDateString();
      const currentAmount = dailyEarnings.get(dateKey) || 0;
      dailyEarnings.set(dateKey, currentAmount + earning.netEarnings);
    });
    
    let topDay = { date: new Date(), amount: 0 };
    dailyEarnings.forEach((amount, dateStr) => {
      if (amount > topDay.amount) {
        topDay = { date: new Date(dateStr), amount };
      }
    });
    
    topDay.amount = Math.round(topDay.amount * 100) / 100;
    return topDay;
  }

  calculateWeeklyStats(): void {
    const weeklyMap = new Map<string, WeeklyStats>();
    
    this.filteredEarnings.forEach(earning => {
      const weekStart = this.getWeekStart(earning.date);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const weekKey = weekStart.toISOString();
      
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, {
          weekStart,
          weekEnd,
          totalEarnings: 0,
          totalTrips: 0,
          averagePerTrip: 0,
          dailyBreakdown: this.initializeDailyBreakdown()
        });
      }
      
      const weekStats = weeklyMap.get(weekKey)!;
      weekStats.totalEarnings += earning.netEarnings;
      weekStats.totalTrips++;
      
      const dayIndex = earning.date.getDay();
      weekStats.dailyBreakdown[dayIndex].earnings += earning.netEarnings;
      weekStats.dailyBreakdown[dayIndex].trips++;
    });
    
    // Calculate averages and sort
    weeklyMap.forEach(week => {
      week.averagePerTrip = week.totalTrips > 0 ? week.totalEarnings / week.totalTrips : 0;
      week.totalEarnings = Math.round(week.totalEarnings * 100) / 100;
      week.averagePerTrip = Math.round(week.averagePerTrip * 100) / 100;
      
      week.dailyBreakdown.forEach(day => {
        day.earnings = Math.round(day.earnings * 100) / 100;
      });
    });
    
    this.weeklyStats = Array.from(weeklyMap.values())
      .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime())
      .slice(0, 4); // Last 4 weeks
  }

  getWeekStart(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day;
    result.setDate(diff);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  initializeDailyBreakdown() {
    return [
      { day: 'Sunday', earnings: 0, trips: 0 },
      { day: 'Monday', earnings: 0, trips: 0 },
      { day: 'Tuesday', earnings: 0, trips: 0 },
      { day: 'Wednesday', earnings: 0, trips: 0 },
      { day: 'Thursday', earnings: 0, trips: 0 },
      { day: 'Friday', earnings: 0, trips: 0 },
      { day: 'Saturday', earnings: 0, trips: 0 }
    ];
  }

  applyFilters(): void {
    this.filteredEarnings = this.earnings.filter(earning => {
      // Date range filter
      if (this.dateRange.start && this.dateRange.end) {
        const earningDate = earning.date;
        const startDate = new Date(this.dateRange.start);
        const endDate = new Date(this.dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        
        if (earningDate < startDate || earningDate > endDate) {
          return false;
        }
      }
      
      // Payment status filter
      if (this.paymentStatus && earning.paymentStatus !== this.paymentStatus) {
        return false;
      }
      
      return true;
    });
    
    this.applySorting();
    this.calculateSummary();
    this.calculateWeeklyStats();
  }

  applySorting(): void {
    this.filteredEarnings.sort((a, b) => {
      let valueA: any, valueB: any;
      
      switch (this.sortBy) {
        case 'date':
          valueA = a.date.getTime();
          valueB = b.date.getTime();
          break;
        case 'earnings':
          valueA = a.netEarnings;
          valueB = b.netEarnings;
          break;
        case 'customer':
          valueA = a.customerName;
          valueB = b.customerName;
          break;
        default:
          return 0;
      }
      
      const comparison = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  clearFilters(): void {
    this.dateRange = { start: '', end: '' };
    this.paymentStatus = '';
    this.sortBy = 'date';
    this.sortOrder = 'desc';
    this.filteredEarnings = [...this.earnings];
    this.calculateSummary();
    this.calculateWeeklyStats();
  }

  exportEarnings(): void {
    // TODO: Implement CSV/PDF export functionality
    console.log('Exporting earnings data...');
  }

  viewTripDetails(tripId: string): void {
    console.log('Viewing trip details:', tripId);
    // TODO: Navigate to trip details or open modal
  }

  requestPayment(earningId: string): void {
    console.log('Requesting payment for:', earningId);
    // TODO: Implement payment request functionality
  }

  getPaymentStatusClass(status: string): string {
    return `status-${status}`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }
}