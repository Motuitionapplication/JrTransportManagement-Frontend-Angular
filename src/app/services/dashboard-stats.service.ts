import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { EnvironmentService } from 'src/app/core/services/environment.service';
import { BookingService } from './booking.service';
import { VehicleService } from './vehicle.service';
import { OwnerService } from './owner.service';

export interface DashboardStats {
  totalBookings: number;
  activeDrivers: number;
  monthlyRevenue: number;
  pendingPayments: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardStatsService {
  private apiBase: string;

  constructor(
    private http: HttpClient,
    private env: EnvironmentService,
    private bookingService: BookingService,
    private vehicleService: VehicleService,
    private ownerService: OwnerService
  ) {
    this.apiBase = this.env.getApiUrl();
  }

  /**
   * Try to fetch a consolidated dashboard stats object from the backend.
   * If the backend call fails, fall back to computing stats from local services.
   */
  getAllStats(): Observable<DashboardStats> {
    const urlCandidates = [
      `${this.apiBase}/admin/dashboard`,
      `${this.apiBase}/dashboard/stats`,
      `${this.apiBase}/stats`
    ];

    // Try first candidate then fallback to local computation
    const tryUrl = urlCandidates[0];

    return this.http.get<any>(tryUrl).pipe(
      map((res) => this.normalizeResponse(res)),
      catchError(() => this.computeFromLocal())
    );
  }

  private normalizeResponse(res: any): DashboardStats {
    if (!res) return { totalBookings: 0, activeDrivers: 0, monthlyRevenue: 0, pendingPayments: 0 };
    return {
      totalBookings: Number(res.totalBookings ?? res.total ?? res.bookingsCount ?? 0),
      activeDrivers: Number(res.activeDrivers ?? res.driversActive ?? res.activeDriversCount ?? 0),
      monthlyRevenue: Number(res.monthlyRevenue ?? res.revenue ?? 0),
      pendingPayments: Number(res.pendingPayments ?? res.pending ?? res.pendingPaymentsCount ?? 0)
    };
  }

  private computeFromLocal(): Observable<DashboardStats> {
    return this.bookingService.bookings$.pipe(
      take(1),
      switchMap(bookings =>
        this.vehicleService.vehicles$.pipe(
          take(1),
          switchMap(vehicles =>
            this.ownerService.owners$.pipe(
              take(1),
              map(owners => {
                const totalBookings = bookings?.length || 0;
                const monthlyRevenue = bookings?.reduce((acc, b) => acc + (b.pricing?.finalAmount || 0), 0) || 0;
                const activeDrivers = vehicles ? vehicles.filter(v => !!v.isActive).length : 0;
                const pendingPayments = owners ? owners.reduce((acc, o) => acc + (o.wallet?.reservedAmount || 0), 0) : 0;

                return {
                  totalBookings,
                  activeDrivers,
                  monthlyRevenue,
                  pendingPayments
                } as DashboardStats;
              })
            )
          )
        )
      )
    );
  }
}
