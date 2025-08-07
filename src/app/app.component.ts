import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { PwaService } from './core/services/pwa.service';
import { OfflineService } from './core/services/offline.service';
import { EnvironmentService } from './core/services/environment.service';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'JR Transport Management';
  isOnline = true;
  canInstallPwa = false;
  currentRoute = '';
  showUserMenu = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private pwaService: PwaService,
    private offlineService: OfflineService,
    public envService: EnvironmentService,
    public authService: AuthService,
    private dialog: MatDialog,
    private overlay: Overlay
  ) {}

  ngOnInit(): void {
    this.initializeApp();
    this.setupRouterEvents();
    this.setupNetworkStatus();
    this.checkPwaInstallability();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeApp(): void {
    console.log('JR Transport Management PWA initialized');
  }

  private setupRouterEvents(): void {
    const routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = event.url;
          console.log('🧭 Route changed to:', this.currentRoute);
        }
      });
    
    this.subscriptions.push(routerSub);
  }

  private setupNetworkStatus(): void {
    const networkSub = this.offlineService.isOnline$.subscribe(status => {
      this.isOnline = status;
    });
    
    this.subscriptions.push(networkSub);
  }

  private checkPwaInstallability(): void {
    // Check periodically if PWA can be installed
    setInterval(() => {
      this.canInstallPwa = this.pwaService.canInstall();
    }, 1000);
  }

  public installPwa(): void {
    this.pwaService.installPwa();
  }

  public getStatusText(): string {
    if (this.isOnline) {
      return 'Connected';
    } else {
      return 'Working Offline';
    }
  }

  public hasActiveRoute(): boolean {
    return this.currentRoute !== '' && this.currentRoute !== '/';
  }

  // Authentication Methods
  openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '400px',
      minWidth: '350px',
      maxWidth: '90vw',
      height: '60vh',
      minHeight: '400px',
      maxHeight: '70vh',
      disableClose: false,
      panelClass: ['auth-dialog', 'jr-dialog', 'stable-dialog'],
      autoFocus: false,
      hasBackdrop: true,
      backdropClass: 'auth-backdrop',
      restoreFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      position: { top: '15vh' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        console.log('✅ User logged in successfully');
        this.showUserMenu = false;
        // Navigation is already handled by the login component based on user role
        // No need to override with dashboard navigation
      } else if (result?.action === 'switch-to-signup') {
        this.openSignupDialog();
      }
    });
  }
showMobileMenu = false;

toggleMobileMenu() {
  this.showMobileMenu = !this.showMobileMenu;

  const nav = document.querySelector('.main-nav');
  if (nav) {
    nav.classList.toggle('open', this.showMobileMenu);
  }
}

  openSignupDialog(): void {
    const dialogRef = this.dialog.open(SignupComponent, {
      width: '400px',
      minWidth: '350px',
      maxWidth: '90vw',
      height: '70vh',
      minHeight: '500px',
      maxHeight: '80vh',
      disableClose: false,
      panelClass: ['auth-dialog', 'jr-dialog', 'stable-dialog'],
      autoFocus: false,
      hasBackdrop: true,
      backdropClass: 'auth-backdrop',
      restoreFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      position: { top: '10vh' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        console.log('✅ User registered successfully');
        // Show success message and open login dialog
        setTimeout(() => {
          this.openLoginDialog();
        }, 500);
      } else if (result?.action === 'switch-to-login') {
        this.openLoginDialog();
      }
    });
  }

  // User Menu Methods
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  getCurrentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user ? `${user.firstName} ${user.lastName}` : 'User';
  }

  getCurrentUserRole(): string {
    const user = this.authService.getCurrentUser();
    if (!user || !user.roles?.length) return 'Guest';
    
    const role = user.roles[0].replace('ROLE_', '');
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  viewProfile(): void {
    this.showUserMenu = false;
    // TODO: Navigate to profile page
    console.log('🔧 Profile page not implemented yet');
  }

  viewSettings(): void {
    this.showUserMenu = false;
    // TODO: Navigate to settings page
    console.log('🔧 Settings page not implemented yet');
  }

  logout(): void {
    this.showUserMenu = false;
    this.authService.logout();
    console.log('👋 User logged out');
    this.router.navigate(['/dashboard']);
  }

  // Close user menu when clicking outside
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const userMenu = target.closest('.user-menu');
    if (!userMenu && this.showUserMenu) {
      this.showUserMenu = false;
    }
  }
}
  
