import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { EnvironmentService } from 'src/app/core/services/environment.service';
import { DriverDTO } from 'src/app/models/driver.dto';
import { OwnerService } from '../owner/owner.service';
import { catchError, map, tap } from 'rxjs/operators';
import { Driver } from 'src/app/models/driver.model';

export interface DriverDashboardStats {
  totalEarnings: number;
  todayEarnings: number;
  tripsToday: number;
  activeBookings: number;
  unreadMessages: number;
}

export interface DriverTripSummary {
  id: string;
  pickupLocation?: string;
  dropLocation?: string;
  scheduledAt?: string;
  status?: string;
  amount?: number;
}

export interface DriverBookingSummary {
  id: string;
  customerName?: string;
  pickupTime?: string;
  destination?: string;
  status?: string;
}

export interface DriverMessageSummary {
  conversationId: string;
  subject?: string;
  unreadCount: number;
  lastMessageAt?: string;
}

export interface DriverChartData {
  labels: string[];
  series: number[];
}

@Injectable({
  providedIn: 'root',
})
export class DriverService {
  getAllDrivers() {
    throw new Error('Method not implemented.');
  }
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService,
    private ownerService: OwnerService
  ) {
    this.apiUrl = `${this.envService.getApiUrl()}/transport/drivers`;
  }

  /**
   * Test backend connectivity for debugging
   */
  testConnection(): Observable<any> {
    const url = `${this.apiUrl}/test`;
    console.log('🧪 Testing backend connectivity to:', url);
    return this.http.get(url, { responseType: 'text' }).pipe(
      tap({
        next: (response) =>
          console.log('✅ Backend connection test successful:', response),
        error: (error) =>
          console.error('❌ Backend connection test failed:', error),
      })
    );
  }

  /**
   * Fetch dashboard summary stats for the given driver (user) id.
   */
  getDashboardStats(userId: string): Observable<DriverDashboardStats> {
    const url = `${this.apiUrl}/dashboard/${encodeURIComponent(userId)}/stats`;
    this.logRequest('GET', url);
    return this.http.get<DriverDashboardStats>(url).pipe(
      tap({
        next: (data) => this.logResponse('getDashboardStats', data),
        error: (error) => this.logError('getDashboardStats', error),
      })
    );
  }

  /**
   * Fetch recent trips for the dashboard view.
   */
  getRecentTrips(userId: string, limit = 5): Observable<DriverTripSummary[]> {
    const url = `${this.apiUrl}/${encodeURIComponent(
      userId
    )}/trips?limit=${limit}`;
    this.logRequest('GET', url);
    return this.http.get<DriverTripSummary[]>(url).pipe(
      tap({
        next: (data) => this.logResponse('getRecentTrips', data),
        error: (error) => this.logError('getRecentTrips', error),
      })
    );
  }

  /**
   * Fetch active bookings assigned to the driver.
   */
  getActiveBookings(
    userId: string,
    limit = 5
  ): Observable<DriverBookingSummary[]> {
    const url = `${this.apiUrl}/${encodeURIComponent(
      userId
    )}/bookings/active?limit=${limit}`;
    this.logRequest('GET', url);
    return this.http.get<DriverBookingSummary[]>(url).pipe(
      tap({
        next: (data) => this.logResponse('getActiveBookings', data),
        error: (error) => this.logError('getActiveBookings', error),
      })
    );
  }

  /**
   * Fetch unread message summary for the driver.
   */
  getMessageSummary(
    userId: string,
    limit = 5
  ): Observable<DriverMessageSummary[]> {
    const url = `${this.apiUrl}/${encodeURIComponent(
      userId
    )}/messages/summary?limit=${limit}`;
    this.logRequest('GET', url);
    return this.http.get<DriverMessageSummary[]>(url).pipe(
      tap({
        next: (data) => this.logResponse('getMessageSummary', data),
        error: (error) => this.logError('getMessageSummary', error),
      })
    );
  }

  /**
   * Fetch compact chart data (labels + series) for dashboard visualisation.
   */
  getChartData(userId: string): Observable<DriverChartData> {
    const url = `${this.apiUrl}/${encodeURIComponent(userId)}/dashboard/chart`;
    this.logRequest('GET', url);
    return this.http.get<DriverChartData>(url).pipe(
      tap({
        next: (data) => this.logResponse('getChartData', data),
        error: (error) => this.logError('getChartData', error),
      })
    );
  }

  /** Get driver record by driverId */
  getDriverById(driverId: string): Observable<Driver> {
    const url = `${this.apiUrl}/${encodeURIComponent(driverId)}`;
    this.logRequest('GET', url);
    return this.http.get<Driver>(url).pipe(
      tap({
        next: (data) => this.logResponse('getDriverById', data),
        error: (error) => this.logError('getDriverById', error),
      }),
      catchError(
        this.handleError(
          'getDriverById',
          'Unable to load driver details. Please try again.'
        )
      )
    );
  }

  /**
   * Create a new driver
   */
  getDriverByUserId(userId: string): Observable<Driver> {
    const url = `${this.apiUrl}/profile/userId/${encodeURIComponent(userId)}`;
    this.logRequest('GET', url);
    return this.http.get<Driver>(url).pipe(
      tap({
        next: (data) => this.logResponse('getDriverByUserId', data),
        error: (error) => this.logError('getDriverByUserId', error),
      }),
      catchError(
        this.handleError(
          'getDriverByUserId',
          'We could not load your driver profile. Please refresh or contact support.'
        )
      )
    );
  }

  // COPILOT-FIX: minimal profile creation helper exposed to profile component
  createMinimalDriver(payload: {
    userId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  }): Observable<Driver> {
    const url = `${this.apiUrl}/minimal`;
    this.logRequest('POST', url, payload);
    return this.http.post<Driver>(url, payload).pipe(
      tap({
        next: (data) => this.logResponse('createMinimalDriver', data),
        error: (error) => this.logError('createMinimalDriver', error),
      }),
      catchError(
        this.handleError(
          'createMinimalDriver',
          'We could not create a driver profile automatically. Please try again later or contact support.'
        )
      )
    );
  }

  updateDriver(
    driverId: string,
    payload: Partial<DriverDTO>
  ): Observable<Driver> {
    const url = `${this.apiUrl}/${encodeURIComponent(driverId)}`;
    this.logRequest('PUT', url, payload);
    return this.http.put<Driver>(url, payload).pipe(
      tap({
        next: (data) => this.logResponse('updateDriver', data),
        error: (error) => this.logError('updateDriver', error),
      }),
      catchError(
        this.handleError(
          'updateDriver',
          'We could not save your profile changes. Please review the fields or try again later.'
        )
      )
    );
  }

  uploadDriverFile(
    driverId: string,
    file: File,
    type: 'avatar' | 'license' | 'document'
  ): Observable<any> {
    const url = `${this.apiUrl}/${encodeURIComponent(driverId)}/attachments`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    this.logRequest('POST', url, {
      type,
      fileName: file.name,
      size: file.size,
    });

    return this.http.post(url, formData).pipe(
      tap({
        next: (data) => this.logResponse('uploadDriverFile', data),
        error: (error) => this.logError('uploadDriverFile', error),
      }),
      catchError(
        this.handleError(
          'uploadDriverFile',
          'We could not upload the selected file. Please verify the file type and try again.'
        )
      )
    );
  }

  /** Upload dedicated profile photo and receive URL (string) */
  uploadProfilePhoto(driverId: string, file: File): Observable<string> {
    const url = `${this.apiUrl}/${encodeURIComponent(driverId)}/upload-photo`;
    const formData = new FormData();
    formData.append('file', file);
    this.logRequest('POST', url, { fileName: file.name, size: file.size });
    return this.http.post(url, formData, { responseType: 'text' }).pipe(
      tap({
        next: (data) => this.logResponse('uploadProfilePhoto', data),
        error: (error) => this.logError('uploadProfilePhoto', error),
      }),
      catchError(
        this.handleError(
          'uploadProfilePhoto',
          'We could not update your profile photo. Please try again.'
        )
      )
    );
  }

  /**
   * Legacy helper kept for backward compatibility with existing flows.
   * Prefer using updateDriver going forward.
   */
  updateDriverDetails(
    driverId: string,
    driverDTO: DriverDTO
  ): Observable<DriverDTO> {
    return this.updateDriver(driverId, driverDTO).pipe(map(() => driverDTO));
  }

  deleteDriver(driverId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${driverId}`);
  }

  deactivateDriver(driverId: string, ownerId: string): Observable<Driver> {
    return this.http
      .patch<Driver>(`${this.apiUrl}/${driverId}/deactivate`, {})
      .pipe(
        // --- NEW: Tap into the successful response to update the cache ---
        tap((updatedDriver) => {
          // Use the public method from OwnerService to update its internal cache
          this.ownerService.updateDriverInCache(ownerId, updatedDriver);
        })
      );
  }

  assignVehicle(driverId: string, vehicleId: string) {
    const requestBody = { vehicleId: vehicleId };

    return this.http.patch(
      `${this.apiUrl}/${driverId}/assign-vehicle`,
      requestBody
    );
  }
  unassignvehicle(driverId: string) {
    return this.http.patch(`${this.apiUrl}/${driverId}/unassign-vehicle`, {
      driverId,
    });
  }

  /**
   * Update driver's last-known location.
   * Preferred endpoint: PATCH /api/transport/drivers/{driverId}/location
   * TODO: Confirm backend path/contract if different.
   */
  updateDriverLocation(
    driverId: string,
    coords: { latitude: number; longitude: number }
  ): Observable<Driver> {
    const url = `${this.apiUrl}/${encodeURIComponent(driverId)}/location`;
    this.logRequest('PATCH', url, coords);
    return this.http
      .patch<Driver>(url, {
        latitude: coords.latitude,
        longitude: coords.longitude,
      })
      .pipe(
        tap({
          next: (data) => this.logResponse('updateDriverLocation', data),
          error: (error) => this.logError('updateDriverLocation', error),
        })
      );
  }

  private logRequest(method: string, url: string, payload?: unknown): void {
    if (this.envService.isLocal()) {
      console.debug(`[DriverService] ${method} ${url}`, payload ?? '');
    }
  }

  private logResponse(context: string, payload: unknown): void {
    if (this.envService.isLocal()) {
      console.debug(`[DriverService] ${context} response`, payload);
    }
  }

  private logError(context: string, error: unknown): void {
    if (this.envService.isLocal()) {
      console.error(`[DriverService] ${context} error`, error);
    }
  }

  private handleError(
    operation: string,
    fallbackMessage: string
  ): (error: HttpErrorResponse) => Observable<never> {
    return (error: HttpErrorResponse) => {
      this.logError(operation, error);

      let userMessage = fallbackMessage;
      if (error.status === 0) {
        userMessage =
          'Network error: please check your connection and try again.';
      } else if (error.status === 401) {
        userMessage = 'Session expired, please login again.';
      } else if (error.status === 404) {
        userMessage = 'Requested driver information was not found.';
      }

      return throwError(() => ({ ...error, userMessage }));
    };
  }
}
