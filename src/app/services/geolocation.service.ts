import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type GeolocationPermissionState = 'granted' | 'prompt' | 'denied' | 'unsupported';

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  // BehaviorSubject holds current permission state; components can subscribe via permission$()
  private permissionState$ = new BehaviorSubject<GeolocationPermissionState>('unsupported');

  constructor() {
    // Try to initialise permission state eagerly
    this.updatePermissionState().catch(() => {
      // swallow errors during bootstrap; consumer can call again
    });
  }

  /** Quick check for geolocation support in current browser */
  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator;
  }

  // Public observable for reactive permission state
  public permission$(): Observable<GeolocationPermissionState> {
    return this.permissionState$.asObservable();
  }

  /**
   * Query the Permissions API (if available) and update the BehaviorSubject.
   * Falls back to 'prompt' when Permissions API isn't available or on error.
   */
  public async updatePermissionState(): Promise<GeolocationPermissionState> {
    try {
      if ((navigator as any).permissions && typeof (navigator as any).permissions.query === 'function') {
        // Some browsers expose navigator.permissions
        const status = await (navigator as any).permissions.query({ name: 'geolocation' as PermissionName });
        const mapped = this.mapPermissionState(status.state);
        this.permissionState$.next(mapped);

        // Listen for changes and update accordingly
        if (typeof status.onchange === 'function' || 'onchange' in status) {
          // status is a PermissionStatus
          status.onchange = () => {
            const s = this.mapPermissionState(status.state);
            this.permissionState$.next(s);
          };
        }

        return mapped;
      }
    } catch (err) {
      // ignore and fallthrough to fallback
      console.warn('Permissions API unavailable or error while querying geolocation permission', err);
    }

    // Fallback: treat as 'prompt' since we can't detect programmatically
    this.permissionState$.next('prompt');
    return 'prompt';
  }

  /** Convenience: request latest permission state */
  public async requestPermission(): Promise<GeolocationPermissionState> {
    return this.updatePermissionState();
  }

  /**
   * Request the user's current position once. Resolves with position or rejects with error.
   * On success the permission state is set to 'granted'. On error we refresh permission state.
   */
  public requestLocationOnce(timeoutMs = 10000): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        this.permissionState$.next('unsupported');
        return reject(new Error('Geolocation API not available'));
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // On successful retrieval, mark permission as granted
          this.permissionState$.next('granted');
          resolve(pos);
        },
        async (err) => {
          // Refresh the permission state from the Permissions API if available
          try { await this.updatePermissionState(); } catch (e) { /* noop */ }
          reject(err);
        },
        { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 }
      );
    });
  }

  /** Helper returning plain latitude/longitude pair */
  public async getCurrentPosition(timeoutMs = 10000): Promise<{ latitude: number; longitude: number }> {
    const pos = await this.requestLocationOnce(timeoutMs);
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    };
  }

  /** Observable wrapper around a single geolocation read */
  public getCurrentPosition$(timeoutMs = 10000): Observable<{ latitude: number; longitude: number }> {
    return new Observable(observer => {
      this.requestLocationOnce(timeoutMs)
        .then(position => {
          observer.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          observer.complete();
        })
        .catch(error => {
          observer.error(error instanceof Error ? error : new Error(String(error)));
        });
    });
  }

  /**
   * Start watching position; returns watch id or null if not available.
   * Caller must call stopWatchingPosition with the returned id.
   */
  public startWatchingPosition(successCb: PositionCallback, errorCb?: PositionErrorCallback): number | null {
    if (!('geolocation' in navigator)) {
      this.permissionState$.next('unsupported');
      return null;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        this.permissionState$.next('granted');
        successCb(pos);
      },
      (err) => {
        this.updatePermissionState().catch(() => {});
        if (errorCb) errorCb(err);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );
    return id;
  }

  /**
   * Stop watching position by id returned from startWatchingPosition
   */
  public stopWatchingPosition(id: number | null): void {
    if (id !== null && typeof id === 'number' && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(id);
    }
  }

  private mapPermissionState(state: PermissionState | string): GeolocationPermissionState {
    switch (state) {
      case 'granted': return 'granted';
      case 'denied': return 'denied';
      case 'prompt': return 'prompt';
      default: return 'unsupported';
    }
  }
}
