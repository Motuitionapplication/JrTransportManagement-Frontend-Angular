import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
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
    @ViewChild('profileInput') profileInput!: ElementRef<HTMLInputElement>;
    profileImageUrl: string | null = null;
    triggerProfileUpload(): void {
        if (this.profileInput) {
            this.profileInput.nativeElement.click();
        }
    }

    onProfileImageChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.profileImageUrl = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
    // Sidebar state
    isSidebarCollapsed = false;
    isMobileMenuOpen = false;
    
    // Menu state
    userMenuOpen = false;
    showWelcome = true;
        showMenu = false;
    
    // User information
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

    /**
     * Update user information from localStorage or default values
     */
    updateUserInfo(): void {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        this.userFullName = user.firstName && user.lastName ? 
            `${user.firstName} ${user.lastName}` : 
            (user.username || 'Super Admin');
        this.userInitials = this.getInitials(this.userFullName);
        this.userRole = (user.roles && user.roles.length > 0) ? 
            user.roles[0] : 'Super Admin';
        this.isLoggedIn = !!localStorage.getItem('token');
    }

    /**
     * Generate user initials from full name
     */
    getInitials(name: string): string {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    /**
     * Toggle sidebar collapse state
     */
    toggleSidebar(): void {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }

    /**
     * Toggle user management submenu
     */
    toggleUserMenu(): void {
        this.userMenuOpen = !this.userMenuOpen;
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu(): void {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        
        // Prevent body scroll when mobile menu is open
        if (this.isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu(): void {
        this.isMobileMenuOpen = false;
        document.body.style.overflow = '';
    }

    /**
     * Hide welcome message and show main content
     */
    hideWelcome(): void {
        this.showWelcome = false;
        
        // Close mobile menu if open
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
    }

    /**
     * Handle user sign out
     */
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
            this.router.navigate(['/']).then(() => {
                setTimeout(() => {
                    this.openLoginDialog();
                }, 200);
            });
        }
    }

    /**
     * Open user profile (placeholder)
     */
    openProfile(): void {
        // TODO: Implement profile dialog or navigation
        alert('Profile page coming soon!');
    }

    /**
     * Open settings (placeholder)
     */
    openSettings(): void {
        // TODO: Implement settings dialog or navigation
        alert('Settings page coming soon!');
    }

    /**
     * Open support (placeholder)
     */
    openSupport(): void {
        // TODO: Implement support dialog or navigation
        alert('Support page coming soon!');
    }

    /**
     * Open login dialog
     */
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
                    this.userFullName = user.firstName && user.lastName ? 
                        `${user.firstName} ${user.lastName}` : 
                        (user.username || 'Super Admin');
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

    /**
     * Open signup dialog
     */
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

    /**
     * Handle window resize events
     */
    @HostListener('window:resize', ['$event'])
    onResize(event: any): void {
        // Close mobile menu on desktop resize
        if (event.target.innerWidth > 768) {
            this.closeMobileMenu();
        }
    }

    /**
     * Simulate user login (utility method for testing)
     */
    loginUser(userData: any): void {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userData.token || 'mock-token');
        this.updateUserInfo();
        this.isLoggedIn = true;
        this.showWelcome = true;
    }

    /**
     * Handle navigation link clicks
     */
    onNavLinkClick(): void {
        this.hideWelcome();
    }

        /**
         * Toggle user dropdown menu (for template)
         */
        toggleMenu(): void {
            this.showMenu = !this.showMenu;
        }
}