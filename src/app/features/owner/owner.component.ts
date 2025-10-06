import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-owner',
  templateUrl: './owner.component.html',
  styleUrls: ['./owner.component.scss']
})
export class OwnerComponent implements OnInit {
  sidebarCollapsed: boolean = false;
  activeSection: string = 'dashboard';

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  setActiveSection(section: string) {
    this.activeSection = section;
  }
  // Dashboard stats
  vehicleCount: number = 12;
  activeTrips: number = 5;
  walletBalance: number = 25000;
  monthlyEarnings: number = 85000;

  // Document alerts
  documentAlerts: any[] = [
    { documentType: 'Insurance', daysToExpiry: 15, vehicleNumber: 'MH-12-AB-1234' },
    { documentType: 'Registration', daysToExpiry: 30, vehicleNumber: 'MH-12-CD-5678' }
  ];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('Owner component initialized');
    
    // Listen to route changes and update active section
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const navigationEvent = event as NavigationEnd;
      this.updateActiveSection(navigationEvent.url);
    });
    
    // Set initial active section based on current route
    this.updateActiveSection(this.router.url);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  navigateToSection(section: string): void {
    this.router.navigate([`/owner/${section}`]);
  }

  private updateActiveSection(url: string): void {
    const segments = url.split('/');
    const lastSegment = segments[segments.length - 1];
    
    // Map URL segments to menu keys
    if (lastSegment === 'owner' || lastSegment === '') {
      this.activeSection = 'dashboard';
    } else {
      this.activeSection = lastSegment;
    }
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  /**
   * Close dropdown when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const userProfile = document.querySelector('.user-profile');
    
    if (!userProfile?.contains(target)) {
      this.showUserDropdown = false;
    }
  }

  /**
   * Handle user logout - clear session and redirect to dashboard
   */
  logout(): void {
    console.log('Owner logging out...');
    this.showUserDropdown = false;
    
    // Clear user session/token if needed
    localStorage.removeItem('authToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('ownerToken');
    sessionStorage.removeItem('userSession');
    sessionStorage.removeItem('ownerSession');
    
    // Navigate to dashboard page
    this.router.navigate(['/dashboard']);
  }
}
