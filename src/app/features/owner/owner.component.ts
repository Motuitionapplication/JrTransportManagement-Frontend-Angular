import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { OwnerService } from './owner.service';
import { User } from 'src/app/models/auth.model';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-owner',
  templateUrl: './owner.component.html',
  styleUrls: ['./owner.component.scss']
})
export class OwnerComponent implements OnInit {
  // Dashboard stats
  vehicleCount = 12;
  activeTrips = 5;
  walletBalance = 25000;
  monthlyEarnings = 85000;
  showUserMenu = false;
  showMobileMenu = false;
  // Document alerts
  documentAlerts: any[] = [
    { documentType: 'Insurance', daysToExpiry: 15, vehicleNumber: 'MH-12-AB-1234' },
    { documentType: 'Registration', daysToExpiry: 30, vehicleNumber: 'MH-12-CD-5678' }
  ];

  sidebarCollapsed = false;
  activeSection: string = 'dashboard';
  user: User | null = null;

  dropdownOpen = false;

  constructor(public authService: AuthService,
    private ownerService: OwnerService,
    private elRef: ElementRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Owner component initialized');
    this.ownerService.getUser().subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (err) => {
        console.error('Error fetching user:', err);
      }
    });
  }

  // --- Dropdown ---
  toggleDropdown(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }

   logout(): void {
    this.showUserMenu = false;
    this.authService.logout();
    console.log('👋 User logged out');
    this.router.navigate(['/dashboard']);
  }
  // --- User Avatar ---
  getUserInitials(): string {
    if (!this.user) return '';
    const first = this.user.firstName ? this.user.firstName.charAt(0).toUpperCase() : '';
    const last = this.user.lastName ? this.user.lastName.charAt(0).toUpperCase() : '';
    return first + last;
  }

  // --- Navigation stubs ---
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  manageVehicles(): void { console.log('Navigate to vehicle management'); }
  trackVehicles(): void { console.log('Navigate to vehicle tracking'); }
  manageDrivers(): void { console.log('Navigate to driver management'); }
  viewBookings(): void { console.log('Navigate to bookings'); }
  manageWallet(): void { console.log('Navigate to wallet'); }
  viewReports(): void { console.log('Navigate to reports'); }
}
