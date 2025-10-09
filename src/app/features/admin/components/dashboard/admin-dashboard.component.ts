import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookingService } from 'src/app/services/booking.service';
import { VehicleService } from 'src/app/services/vehicle.service';
import { OwnerService } from 'src/app/services/owner.service';
import { DashboardStatsService, DashboardStats } from 'src/app/services/dashboard-stats.service';
import { Booking } from 'src/app/models/booking.model';
import { ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

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
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('revenueChart', { static: false }) revenueChartRef!: ElementRef<HTMLCanvasElement>;

  private chartCtx: CanvasRenderingContext2D | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private destroy$ = new Subject<void>();

  statsData: StatCard[] = [
    { title: 'Total Bookings', value: 0, change: '', changeType: 'positive', icon: 'book_online' },
    { title: 'Active Drivers', value: 0, change: '', changeType: 'positive', icon: 'person' },
    { title: 'Monthly Revenue', value: '$0', change: '', changeType: 'positive', icon: 'attach_money' },
    { title: 'Pending Payments', value: 0, change: '', changeType: 'negative', icon: 'payment' }
  ];

  recentActivities: Activity[] = [];
  visibleActivities = 5;

  // internal caches
  private bookings: Booking[] = [];

  constructor(
    private bookingService: BookingService,
    private vehicleService: VehicleService,
    private ownerService: OwnerService,
    private statsService: DashboardStatsService
    ,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('Admin Dashboard Component initialized');
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // setup canvas context when view init completes
    if (this.revenueChartRef) {
      const canvas = this.revenueChartRef.nativeElement;
      this.chartCtx = canvas.getContext('2d');
      this.setupCanvasSize();
      // redraw when bookings change handled via bookings subscription
      // observe resizes
      try {
        this.resizeObserver = new ResizeObserver(() => {
          this.setupCanvasSize();
          this.drawRevenueChart();
        });
        this.resizeObserver.observe(canvas.parentElement || canvas);
      } catch (e) {
        // ResizeObserver may not be available in some environments
        window.addEventListener('resize', this.onWindowResize);
      }
    }
  }

  private onWindowResize = () => {
    this.setupCanvasSize();
    this.drawRevenueChart();
  }

  private loadDashboardData(): void {
    // Subscribe to bookings stream
    this.bookingService.bookings$
      .pipe(takeUntil(this.destroy$))
      .subscribe((bookings) => {
        this.bookings = bookings || [];
        this.updateStatsFromBookings();
        this.buildRecentActivitiesFromBookings();
        // redraw chart when bookings update
        this.drawRevenueChart();
      });

    // Fetch consolidated stats (try backend first, fall back to local computation)
    this.statsService.getAllStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe((s: DashboardStats) => {
        this.setStat('Total Bookings', s.totalBookings);
        this.setStat('Active Drivers', s.activeDrivers);
        this.setStat('Monthly Revenue', `$${s.monthlyRevenue.toFixed(2)}`);
        this.setStat('Pending Payments', s.pendingPayments);
      }, (err) => {
        console.warn('Dashboard stats fetch failed, falling back to local streams', err);
      });

    // Vehicles -> active drivers count approximation
    this.vehicleService.vehicles$
      .pipe(takeUntil(this.destroy$))
      .subscribe((vehicles) => {
        const activeDrivers = vehicles ? vehicles.filter(v => !!v.isActive).length : 0;
        this.setStat('Active Drivers', activeDrivers);
      });

    // Owners -> pending payments approximation (owners with pending wallet transactions)
    this.ownerService.owners$
      .pipe(takeUntil(this.destroy$))
      .subscribe((owners) => {
        // Approximate pending payments as owners with reserved amount > 0
        const pending = owners ? owners.reduce((acc, o) => acc + (o.wallet?.reservedAmount || 0), 0) : 0;
        this.setStat('Pending Payments', pending);
      });
  }

  private updateStatsFromBookings(): void {
    const totalBookings = this.bookings.length;
    const monthlyRevenue = this.bookings.reduce((acc, b) => acc + (b.pricing?.finalAmount || 0), 0);
    const pendingPaymentsCount = this.bookings.filter(b => b.payment?.status === 'pending').length;

    this.setStat('Total Bookings', totalBookings);
    this.setStat('Monthly Revenue', `$${monthlyRevenue.toFixed(2)}`);
    this.setStat('Pending Payments', pendingPaymentsCount);
  }

  private getMonthlyRevenueSeries(months: number = 6): { label: string; value: number }[] {
    // Build last `months` month buckets (including current month)
    const now = new Date();
    const series: { label: string; value: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString(undefined, { month: 'short' });
      series.push({ label, value: 0 });
    }

    this.bookings.forEach(b => {
      const created = new Date(b.createdAt || b.updatedAt || new Date());
      const monthIndex = series.findIndex(s => {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - (months - 1 - series.indexOf(s)), 1);
        return monthDate.getMonth() === created.getMonth() && monthDate.getFullYear() === created.getFullYear();
      });
      if (monthIndex !== -1) {
        series[monthIndex].value += (b.pricing?.finalAmount || 0);
      }
    });

    return series;
  }

  private setupCanvasSize(): void {
    if (!this.revenueChartRef) return;
    const canvas = this.revenueChartRef.nativeElement;
    const parent = canvas.parentElement as HTMLElement;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(300, Math.floor((parent.clientWidth) * dpr));
    canvas.height = Math.floor(240 * dpr);
    canvas.style.width = `${parent.clientWidth}px`;
    canvas.style.height = `240px`;
    this.chartCtx = canvas.getContext('2d');
    if (this.chartCtx) this.chartCtx.scale(dpr, dpr);
  }

  private drawRevenueChart(): void {
    if (!this.chartCtx || !this.revenueChartRef) return;
    const ctx = this.chartCtx;
    const canvas = this.revenueChartRef.nativeElement;
    const w = canvas.clientWidth;
    const h = 240;
    // clear
    ctx.clearRect(0, 0, w, h);

    const series = this.getMonthlyRevenueSeries(6);
    const max = Math.max(1, ...series.map(s => s.value));

    // margins
    const margin = { left: 40, right: 16, top: 16, bottom: 32 };
    const chartW = w - margin.left - margin.right;
    const chartH = h - margin.top - margin.bottom;

    // draw axes
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartH);
    ctx.lineTo(margin.left + chartW, margin.top + chartH);
    ctx.stroke();

    // draw grid lines and labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = margin.top + (chartH * i / gridLines);
      ctx.strokeStyle = '#f0f0f0';
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartW, y);
      ctx.stroke();

      const value = Math.round(max * (1 - i / gridLines));
      ctx.fillStyle = '#999';
      ctx.fillText(value.toString(), margin.left - 8, y);
    }

    // draw line
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.beginPath();
    series.forEach((s, i) => {
      const x = margin.left + (chartW * (i / (series.length - 1)));
      const y = margin.top + chartH - (chartH * (s.value / max));
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // draw area fill
    ctx.fillStyle = 'rgba(102,126,234,0.12)';
    ctx.lineTo(margin.left + chartW, margin.top + chartH);
    ctx.lineTo(margin.left, margin.top + chartH);
    ctx.closePath();
    ctx.fill();

    // draw points and labels
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#667eea';
    series.forEach((s, i) => {
      const x = margin.left + (chartW * (i / (series.length - 1)));
      const y = margin.top + chartH - (chartH * (s.value / max));
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // label
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.fillText(s.label, x, margin.top + chartH + 16);
      ctx.fillStyle = '#667eea';
      ctx.textAlign = 'center';
      ctx.fillText(`₹${Math.round(s.value)}`, x, y - 10);
      ctx.fillStyle = '#fff';
    });
  }

  private buildRecentActivitiesFromBookings(): void {
    this.recentActivities = this.bookings.map((booking) => ({
      id: parseInt(booking.id, 10), // Convert id to number
      type: booking.status === 'delivered' ? 'success' : booking.status === 'cancelled' ? 'error' : 'info',
      title: `Booking ${booking.status}`,
      subtitle: `Customer ID: ${booking.customerId}`,
      timestamp: new Date(booking.payment?.paymentDate || booking.tracking?.estimatedArrival || booking.tracking?.currentLocation?.timestamp || new Date())
    })).slice(0, this.visibleActivities) as Activity[]; // Explicitly cast to Activity[]
  }

  get recentActivitiesSlice(): (Activity & { isRead?: boolean })[] {
    return (this.recentActivities as any).slice(0, this.visibleActivities);
  }

  loadMore(): void {
    this.visibleActivities += 5;
  }

  toggleRead(activity: any, event?: Event): void {
    if (event) event.stopPropagation();
    activity.isRead = !activity.isRead;
  }

  openActivity(activity: any): void {
    // mark read and navigate where appropriate
    activity.isRead = true;
    // If activity references booking number, navigate to bookings page and filter
    const match = activity.title.match(/Booking\s+(JRT?\w+)/i) || activity.title.match(/booking\s+(JRT?\w+)/i);
    if (match && match[1]) {
      // Use router to navigate (lazy navigation to bookings list)
      try {
        (this as any).router.navigate(['/admin/bookings'], { queryParams: { q: match[1] } });
      } catch (e) {
        // router may not be injected in this component in some setups
        console.warn('Router navigation failed', e);
      }
    }
  }

  private setStat(title: string, value: string | number): void {
    const stat = this.statsData.find(s => s.title === title);
    if (stat) stat.value = value;
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getStatAbbreviation(title: string): string {
    if (!title) return '';
    const words = title.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }
}