import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    const requiredRole = route.data['role'];
    if (token && userRole && requiredRole && userRole === requiredRole) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
