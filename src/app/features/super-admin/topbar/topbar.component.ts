import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent {

      // Menu state
    userMenuOpen = false;
    showWelcome = true;
    
    // User information
    userFullName = '';
    userInitials = '';
    userRole = 'User';
    isLoggedIn = false;

    showMenu: boolean = false;
  notificationCount: number = 3; // You can make this dynamic

      constructor(
          private router: Router,
      ) {}

  // Toggle user dropdown menu
  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  // Close menu (useful if clicking outside in the future)
  closeMenu(): void {
    this.showMenu = false;
  }

  // Example sign out action
    signOut(): void {
        if (confirm('Are you sure you want to sign out?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            this.isLoggedIn = false;
            this.userFullName = '';
            this.userInitials = '';
            this.userRole = '';
            this.showWelcome = false;
            // Navigate to a neutral route, then open login dialog
            this.router.navigate(['/'])
        }
    }

}
