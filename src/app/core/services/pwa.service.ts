import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { concat, interval } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  promptEvent: any;

  constructor(
    private swUpdate: SwUpdate,
    private appRef: ApplicationRef
  ) {
    this.initializeServiceWorker();
    this.setupInstallPrompt();
  }

  private initializeServiceWorker(): void {
    if (this.swUpdate.isEnabled) {
      // Check for updates every 6 hours
      const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable === true));
      const everySixHours$ = interval(6 * 60 * 60 * 1000);
      const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

      everySixHoursOnceAppIsStable$.subscribe(() => this.swUpdate.checkForUpdate());

      // Handle version updates
      this.swUpdate.versionUpdates.subscribe(event => {
        if (event.type === 'VERSION_READY') {
          this.showUpdateNotification(event as VersionReadyEvent);
        }
      });

      // Handle unrecoverable states
      this.swUpdate.unrecoverable.subscribe(event => {
        console.error('An error occurred that we cannot recover from:', event.reason);
        console.error('Please reload the page.');
        this.showReloadNotification();
      });
    }
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.promptEvent = e;
    });
    
    // iOS-specific install detection
    this.detectiOSInstallPrompt();
  }

  private detectiOSInstallPrompt(): void {
    // Check if running on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = ('standalone' in (window as any).navigator) && ((window as any).navigator.standalone);
    
    if (isIOS && !isInStandaloneMode) {
      // Show iOS-specific install instructions
      this.showiOSInstallInstructions();
    }
  }

  private showiOSInstallInstructions(): void {
    // You can customize this to show iOS-specific install instructions
    console.log('iOS detected - Educare PWA can be installed via Safari Share button');
  }

  public async installPwa(): Promise<void> {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // For iOS, show instruction modal instead of automatic install
      this.showIOSInstallModal();
      return;
    }

    if (this.promptEvent) {
      this.promptEvent.prompt();
      const result = await this.promptEvent.userChoice;
      console.log('PWA install result:', result);
      this.promptEvent = null;
    }
  }

  private showIOSInstallModal(): void {
    const message = `To install Educare on your iOS device:
    
1. Tap the Share button (⬆️) in Safari
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" to confirm
    
This will add the Educare app to your home screen for easy access!`;
    
    alert(message);
  }

  public canInstall(): boolean {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = ('standalone' in (window as any).navigator) && ((window as any).navigator.standalone);
    
    // For iOS, show install button if not in standalone mode
    if (isIOS) {
      return !isInStandaloneMode;
    }
    
    // For other platforms, use the standard prompt event
    return !!this.promptEvent;
  }

  public isIOSDevice(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  public isInStandaloneMode(): boolean {
    return ('standalone' in (window as any).navigator) && ((window as any).navigator.standalone);
  }

  private showUpdateNotification(event: VersionReadyEvent): void {
    const message = 'A new version of Educare is available. Update now?';
    if (confirm(message)) {
      this.swUpdate.activateUpdate().then(() => document.location.reload());
    }
  }

  private showReloadNotification(): void {
    const message = 'An error occurred. Please reload the application.';
    if (confirm(message)) {
      document.location.reload();
    }
  }

  public isOnline(): boolean {
    return navigator.onLine;
  }

  public getNetworkStatus(): string {
    return this.isOnline() ? 'online' : 'offline';
  }
}
