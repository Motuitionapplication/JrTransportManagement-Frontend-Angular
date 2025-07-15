import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface CacheItem {
  key: string;
  data: any;
  timestamp: number;
  expiry: number;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public isOnline$ = this.isOnlineSubject.asObservable();

  private readonly CACHE_PREFIX = 'jr_transport_cache_';
  private readonly DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.setupNetworkListeners();
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnlineSubject.next(true);
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnlineSubject.next(false);
    });
  }

  public isOnline(): boolean {
    return this.isOnlineSubject.value;
  }

  public cacheData(key: string, data: any, duration: number = this.DEFAULT_CACHE_DURATION): void {
    const cacheItem: CacheItem = {
      key,
      data,
      timestamp: Date.now(),
      expiry: Date.now() + duration
    };

    try {
      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  public getCachedData(key: string): any | null {
    try {
      const cached = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!cached) return null;

      const cacheItem: CacheItem = JSON.parse(cached);
      
      // Check if cache has expired
      if (Date.now() > cacheItem.expiry) {
        this.removeCachedData(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  public removeCachedData(key: string): void {
    try {
      localStorage.removeItem(this.CACHE_PREFIX + key);
    } catch (error) {
      console.warn('Failed to remove cached data:', error);
    }
  }

  public clearAllCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  public storeOfflineAction(action: any): void {
    const offlineActions = this.getOfflineActions();
    offlineActions.push({
      ...action,
      timestamp: Date.now(),
      id: this.generateId()
    });
    
    try {
      localStorage.setItem('jr_transport_offline_actions', JSON.stringify(offlineActions));
    } catch (error) {
      console.warn('Failed to store offline action:', error);
    }
  }

  public getOfflineActions(): any[] {
    try {
      const actions = localStorage.getItem('jr_transport_offline_actions');
      return actions ? JSON.parse(actions) : [];
    } catch (error) {
      console.warn('Failed to retrieve offline actions:', error);
      return [];
    }
  }

  public clearOfflineActions(): void {
    try {
      localStorage.removeItem('jr_transport_offline_actions');
    } catch (error) {
      console.warn('Failed to clear offline actions:', error);
    }
  }

  private syncOfflineData(): void {
    const offlineActions = this.getOfflineActions();
    if (offlineActions.length > 0) {
      console.log('Syncing offline data...', offlineActions);
      // Implement sync logic here when backend is available
      // For now, we'll just clear the actions
      this.clearOfflineActions();
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  public getDataWithOfflineSupport<T>(
    key: string,
    fetchFunction: () => Observable<T>,
    cacheDuration?: number
  ): Observable<T> {
    // Try to get cached data first
    const cachedData = this.getCachedData(key);
    
    if (cachedData && !this.isOnline()) {
      return of(cachedData);
    }

    if (this.isOnline()) {
      return new Observable<T>(observer => {
        fetchFunction().subscribe({
          next: (data) => {
            this.cacheData(key, data, cacheDuration);
            observer.next(data);
            observer.complete();
          },
          error: (error) => {
            // If online fetch fails, try cached data
            if (cachedData) {
              observer.next(cachedData);
              observer.complete();
            } else {
              observer.error(error);
            }
          }
        });
      });
    } else {
      // Offline - return cached data or error
      if (cachedData) {
        return of(cachedData);
      } else {
        throw new Error('No cached data available offline');
      }
    }
  }
}
