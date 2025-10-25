import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { LoginComponent } from '../auth/login/login.component';
import { SignupComponent } from '../auth/signup/signup.component';

declare function calculateFare(): void;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  showUserMenu = false;
  showMobileMenu = false;
   loading: boolean = false;
   pickupCity: string = '';
  deliveryCity: string = '';
  truckType: string = '';
  fareResult: { distance: number; fare: number } | null = null;

  baseFare: number = 1500;
  rateMap: Record<string, number> = {
    mini: 12,
    medium: 15,
    large: 19,
    container: 19,
    trailer: 23
  };

  private openCageKey: string = '908bac17a2834879887e887db99c7c08';

  private async getCoordinates(city: string): Promise<{ lat: number; lon: number }> {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${this.openCageKey}&limit=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw `City "${city}" not found`;
    }

    return {
      lat: data.results[0].geometry.lat,
      lon: data.results[0].geometry.lng
    };
  }

  private async getDistance(from: { lat: number; lon: number }, to: { lat: number; lon: number }): Promise<number> {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) throw 'Distance not found';
    return data.routes[0].distance / 1000; // km
  }

  async calculateFare() {
    if (!this.pickupCity || !this.deliveryCity || !this.truckType) {
      alert('Please fill all fields');
      return;
    }

    try {
      this.loading = true;

      const fromCoords = await this.getCoordinates(this.pickupCity);
      const toCoords = await this.getCoordinates(this.deliveryCity);
      const distance = await this.getDistance(fromCoords, toCoords);
      const fare = this.baseFare + distance * this.rateMap[this.truckType];

      this.fareResult = { distance, fare };

    } catch (err: any) {
      alert('Error: ' + err);
    } finally {
      this.loading = false;
    }
  }

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
   getTruckTypeName(truckType: string): string {
    const truckNames: { [key: string]: string } = {
      'mini': 'Mini Truck (1-2 Ton)',
      'medium': 'Medium Truck (3-9 Ton)', 
      'large': 'Large Truck (10+ Ton)',
      'container': 'Container Truck',
      'trailer': 'Trailer'
    };
    return truckNames[truckType] || truckType;
  }
  resetFareForm(): void {
  // Reset form fields
  this.pickupCity = '';
  this.deliveryCity = '';
  this.truckType = '';
  
  // Clear fare result
  this.fareResult = null;
  
  // Reset loading state
  this.loading = false;

  
  console.log('🔄 Fare form reset - ready for new calculation');
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

  // Add these methods to your existing component
  closeFareResult(): void {
    this.fareResult = null;
  }

  bookNow(): void {
    if (!this.authService.getCurrentUser()) {
      this.openLoginDialog();
      return;
    }
    
    // Navigate to booking with fare data
    console.log('🚚 Booking with fare:', this.fareResult);
    // Following project's role-based routing pattern
    this.router.navigate(['/customer/book-transport'], { 
      state: { 
        fareData: {
          pickup: this.pickupCity,
          delivery: this.deliveryCity,
          truckType: this.truckType,
          ...this.fareResult
        }
      }
    });
    this.closeFareResult();
  }

  recalculate(): void {
    this.closeFareResult();
    this.resetFareForm();
  }

}
