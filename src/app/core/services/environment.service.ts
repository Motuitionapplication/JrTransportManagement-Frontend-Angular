import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  
  constructor() {
    // Log environment info on startup
    this.logEnvironmentInfo();
  }

  /**
   * Check if running in local environment
   */
  isLocal(): boolean {
    return (environment as any).isLocal;
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return environment.production;
  }

  /**
   * Get current API URL
   */
  getApiUrl(): string {
    return environment.apiUrl;
  }

  /**
   * Get environment display name
   */
  getEnvironmentName(): string {
    if (this.isLocal()) {
      return 'Local Development';
    } else if (this.isProduction()) {
      return 'Production';
    } else {
      return 'Development';
    }
  }

  /**
   * Get environment color for UI indication
   */
  getEnvironmentColor(): string {
    if (this.isLocal()) {
      return '#28a745'; // Green for local
    } else if (this.isProduction()) {
      return '#dc3545'; // Red for production
    } else {
      return '#ffc107'; // Yellow for dev
    }
  }

  /**
   * Log environment information to console
   */
  private logEnvironmentInfo(): void {
    if (environment.production) {
      return;
    }
    console.log(`
🌍 Environment: ${this.getEnvironmentName()}
🔗 API URL: ${this.getApiUrl()}
🔐 Authentication: ${this.isLocal() ? 'Disabled' : 'Enabled'}
⚙️ PWA Features: ${environment.features.pwaInstall ? 'Enabled' : 'Disabled'}
    `);
  }

  /**
   * Get backend type description
   */
  getBackendDescription(): string {
    if (this.isLocal()) {
      return 'Local Spring Boot (localhost:8080)';
    } else {
      return 'Render Cloud Backend';
    }
  }

  /**
   * Get current backend status for display
   */
  getBackendStatus(): string {
    const apiUrl = this.getApiUrl();
    if (apiUrl.includes('localhost')) {
      return 'Local Backend';
    } else if (apiUrl.includes('render.com')) {
      return 'Cloud Backend (Render)';
    } else {
      return 'External Backend';
    }
  }
}
