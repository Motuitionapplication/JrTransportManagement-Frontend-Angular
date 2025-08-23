
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { LoginComponent } from '../auth/login/login.component';
import { SignupComponent } from '../auth/signup/signup.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  showUserMenu = false;
  showMobileMenu = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private overlay: Overlay
  ) {}

  ngOnInit(): void {}

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


  openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '100vw',
      minWidth: '0',
      maxWidth: '100vw',
      height: '100vh',
      minHeight: '0',
      maxHeight: '100vh',
      disableClose: false,
      panelClass: ['auth-dialog', 'jr-dialog', 'stable-dialog'],
      autoFocus: false,
      hasBackdrop: true,
      backdropClass: 'auth-backdrop',
      restoreFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      position: { top: '0' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.showUserMenu = false;
        // Check user role and redirect if super admin
        const user = result.user;
        if (user && Array.isArray(user.roles) && user.roles.includes('ROLE_SUPER_ADMIN')) {
          this.router.navigate(['/super-admin']);
        }
        // Otherwise, stay on dashboard or handle other roles as needed
      } else if (result?.action === 'switch-to-signup') {
        this.openSignupDialog();
      }
    });
  }


  openSignupDialog(): void {
    const dialogRef = this.dialog.open(SignupComponent, {
      width: '100vw',
      minWidth: '0',
      maxWidth: '100vw',
      height: '100vh',
      minHeight: '0',
      maxHeight: '100vh',
      disableClose: false,
      panelClass: ['auth-dialog', 'jr-dialog', 'stable-dialog'],
      autoFocus: false,
      hasBackdrop: true,
      backdropClass: 'auth-backdrop',
      restoreFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      position: { top: '0' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        setTimeout(() => {
          this.openLoginDialog();
        }, 500);
      } else if (result?.action === 'switch-to-login') {
        this.openLoginDialog();
      }
    });
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    // Optionally handle mobile nav
  }

  navigateToVehicleManagement(): void {
    // Future implementation - Vehicle Management Module
    console.log('Vehicle Management - Coming Soon!');
  }

  navigateToDriverManagement(): void {
    // Future implementation - Driver Management Module
    console.log('Driver Management - Coming Soon!');
  }

  navigateToRouteManagement(): void {
    // Future implementation - Route Management Module
    console.log('Route Management - Coming Soon!');
  }

  navigateToFleetTracking(): void {
    // Future implementation - Fleet Tracking Module
    console.log('Fleet Tracking - Coming Soon!');
  }

  navigateToCustomerManagement(): void {
    // Future implementation - Customer Management Module
    console.log('Customer Management - Coming Soon!');
  }

  // Legacy methods (keeping for now)
  navigateToStudentManagement(): void {
    this.router.navigate(['/students']);
  }

  navigateToTeacherManagement(): void {
    // Future implementation
    console.log('Teacher Management - Coming Soon!');
  }

  navigateToClassManagement(): void {
    // Future implementation
    console.log('Class Management - Coming Soon!');
  }

  navigateToAttendance(): void {
    // Future implementation
    console.log('Attendance - Coming Soon!');
  }
}
