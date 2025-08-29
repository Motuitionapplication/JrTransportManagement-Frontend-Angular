

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { LoginComponent } from '../../auth/login/login.component';
import { SignupComponent } from '../../auth/signup/signup.component';

@Component({
    selector: 'app-super-admin-dashboard',
    templateUrl: './super-admin-dashboard.component.html',
    styleUrls: ['./super-admin-dashboard.component.scss']
})
export class SuperAdminDashboardComponent implements OnInit, OnDestroy {
    isSidebarCollapsed = false;
    userMenuOpen = false;
    showWelcome = true;
    userFullName = '';
    userInitials = '';
    userRole = 'User';
    isLoggedIn = false;


    private routerSub: Subscription | undefined;

    constructor(
        private router: Router,
        private dialog: MatDialog,
        private overlay: Overlay
    ) {}

    ngOnInit(): void {
        this.updateUserInfo();
        // Update user info on every navigation (e.g., after login)
        this.routerSub = this.router.events.subscribe(() => {
            this.updateUserInfo();
        });
    }

    ngOnDestroy(): void {
        if (this.routerSub) {
            this.routerSub.unsubscribe();
        }
    }

    updateUserInfo(): void {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        this.userFullName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.username || 'Super Admin');
        this.userInitials = this.getInitials(this.userFullName);
        this.userRole = (user.roles && user.roles.length > 0) ? user.roles[0] : 'Super Admin';
        this.isLoggedIn = !!localStorage.getItem('token');
    }

    getInitials(name: string): string {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    toggleSidebar(): void {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }

    toggleUserMenu(): void {
        this.userMenuOpen = !this.userMenuOpen;
    }

    hideWelcome(): void {
        this.showWelcome = false;
    }


    signOut(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.isLoggedIn = false;
        this.router.navigate(['/dashboard']);
    }

    openProfile(): void {
        // TODO: Implement profile dialog or navigation
        alert('Profile page coming soon!');
    }

    openSettings(): void {
        // TODO: Implement settings dialog or navigation
        alert('Settings page coming soon!');
    }

    openSupport(): void {
        // TODO: Implement support dialog or navigation
        alert('Support page coming soon!');
    }

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
                // Save user and token to localStorage for persistence
                const user = result.user;
                if (user && user.token) {
                    localStorage.setItem('token', user.token);
                }
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                }
                this.isLoggedIn = true;
                // Check user role and redirect if super admin
                if (user && Array.isArray(user.roles) && user.roles.includes('ROLE_SUPER_ADMIN')) {
                    this.userFullName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.username || 'Super Admin');
                    this.userInitials = this.getInitials(this.userFullName);
                    this.userRole = 'Super Admin';
                    this.showWelcome = true;
                    this.router.navigate(['/super-admin-dashboard']);
                }
            } else if (result?.action === 'switch-to-signup') {
                this.openSignupDialog();
            }
        });
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
                setTimeout(() => {
                    this.openLoginDialog();
                }, 500);
            } else if (result?.action === 'switch-to-login') {
                this.openLoginDialog();
            }
        });
    }
}
