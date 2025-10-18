import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import {
  DriverService,
  DriverDashboardStats,
  DriverTripSummary,
  DriverBookingSummary,
  DriverMessageSummary,
  DriverChartData,
} from '../../driver.service';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = false;
  error: string | null = null;
  lastUpdated: Date | null = null;

  dashboardStats: DriverDashboardStats | null = null;
  recentTrips: DriverTripSummary[] = [];
  activeBookings: DriverBookingSummary[] = [];
  messageSummary: DriverMessageSummary[] = [];
  chartData: DriverChartData | null = null;
  chartBars: Array<{ label: string; value: number; heightPercent: number }> =
    [];

  readonly tripsLimit = 5;
  readonly bookingsLimit = 5;
  readonly messagesLimit = 5;
  readonly math = Math;

  private destroy$ = new Subject<void>();
  private cachedUserId: string | null = null;
  private hasLoggedDashboardConnection = false;

  constructor(
    private driverService: DriverService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refresh(): void {
    this.error = null;
    this.loading = true;
    this.fetchDashboardData();
  }

  navigateToMessages(): void {
    this.router.navigate(['/driver/messages']);
  }

  navigateToTrips(): void {
    this.router.navigate(['/driver/my-trips']);
  }

  navigateToBookings(): void {
    this.router.navigate(['/driver/bookings']);
  }

  formatCurrency(value?: number | null): string {
    if (value === undefined || value === null) {
      return '—';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatDateTime(value?: string | Date | null): string {
    if (!value) {
      return '—';
    }
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  trackById(_: number, item: { id?: string; conversationId?: string }): string {
    return item?.id || item?.conversationId || `${_}`;
  }

  private fetchDashboardData(): void {
    const userId = this.resolveUserId();
    if (!userId) {
      this.error =
        'Authentication required: Please log in as a driver to view dashboard.';
      this.loading = false;
      return;
    }

    const stats$ = this.driverService.getDashboardStats(userId).pipe(
      tap(() => this.logDashboardConnection()),
      catchError((error) => {
        this.handlePartialError('dashboard stats', error);
        return of(null);
      })
    );

    const trips$ = this.driverService
      .getRecentTrips(userId, this.tripsLimit)
      .pipe(
        tap(() => this.logDashboardConnection()),
        catchError((error) => {
          this.handlePartialError('recent trips', error);
          return of([] as DriverTripSummary[]);
        })
      );

    const bookings$ = this.driverService
      .getActiveBookings(userId, this.bookingsLimit)
      .pipe(
        tap(() => this.logDashboardConnection()),
        catchError((error) => {
          this.handlePartialError('active bookings', error);
          return of([] as DriverBookingSummary[]);
        })
      );

    const messages$ = this.driverService
      .getMessageSummary(userId, this.messagesLimit)
      .pipe(
        tap(() => this.logDashboardConnection()),
        catchError((error) => {
          this.handlePartialError('message summary', error);
          return of([] as DriverMessageSummary[]);
        })
      );

    const chart$ = this.driverService.getChartData(userId).pipe(
      tap(() => this.logDashboardConnection()),
      catchError((error) => {
        this.handlePartialError('dashboard chart', error);
        return of(null);
      })
    );

    forkJoin({
      stats: stats$,
      trips: trips$,
      bookings: bookings$,
      messages: messages$,
      chart: chart$,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ stats, trips, bookings, messages, chart }) => {
        this.dashboardStats = stats;
        this.recentTrips = trips ?? [];
        this.activeBookings = bookings ?? [];
        this.messageSummary = messages ?? [];
        this.chartData = chart;
        this.buildChartBars(chart);
        this.lastUpdated = new Date();
        this.loading = false;
      });
  }

  private resolveUserId(): string | null {
    if (this.cachedUserId) {
      return this.cachedUserId;
    }
    const user = this.authService.getCurrentUser();
    if (!user || user.id === undefined || user.id === null) {
      console.error(
        '❌ No authenticated user found. User must be logged in to access dashboard.'
      );
      return null;
    }
    this.cachedUserId = user.id.toString();
    return this.cachedUserId;
  }

  private handlePartialError(segment: string, error: unknown): void {
    console.error(`Driver dashboard: failed to load ${segment}`, error);
    let errorMessage = `Failed to load ${segment}`;

    if (error && typeof error === 'object' && 'status' in error) {
      const httpError = error as any;
      if (httpError.status === 0) {
        errorMessage += ': Backend server unavailable';
      } else if (httpError.status === 404) {
        errorMessage += ': Data not found';
      } else if (httpError.status === 500) {
        errorMessage += ': Server error';
      } else {
        errorMessage += `: HTTP ${httpError.status}`;
      }
    }

    errorMessage += '.';
    this.error = this.error ? `${this.error} ${errorMessage}` : errorMessage;
  }

  private buildChartBars(data: DriverChartData | null): void {
    if (!data?.series?.length) {
      this.chartBars = [];
      return;
    }
    const maxValue = Math.max(...data.series, 0);
    this.chartBars = data.series.map((value, index) => {
      const heightPercent =
        maxValue > 0 ? Math.max(4, (value / maxValue) * 100) : 0;
      return {
        label: data.labels?.[index] ?? `Item ${index + 1}`,
        value,
        heightPercent,
      };
    });
  }

  private logDashboardConnection(): void {
    if (this.hasLoggedDashboardConnection) {
      return;
    }
    this.hasLoggedDashboardConnection = true;
    console.log('✅ Driver Dashboard connected to', environment.apiUrl);
  }
}
