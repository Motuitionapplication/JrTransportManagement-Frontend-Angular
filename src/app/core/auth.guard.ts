import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'];
    
    // TEMPORARY: Allow access for development/testing
    // TODO: Remove this bypass once authentication is properly set up
    console.log('🚧 AuthGuard: Development mode - bypassing authentication');
    return true;

    // Check if user is authenticated
    if (!this.authService.isAuthenticated) {
      console.log('🔒 AuthGuard: User not authenticated, redirecting to login');
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Check if specific role is required
    if (requiredRole) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        console.log('🔒 AuthGuard: No user data found, redirecting to login');
        this.router.navigate(['/auth/login']);
        return false;
      }

      // Check if user has required role
      if (!currentUser?.roles.includes(requiredRole)) {
        console.log('🔒 AuthGuard: Access denied. Required role:', requiredRole, 'User roles:', currentUser?.roles);
        this.router.navigate(['/auth/unauthorized']);
        return false;
      }
    }

    console.log('✅ AuthGuard: Access granted');
    return true;
  }
}
