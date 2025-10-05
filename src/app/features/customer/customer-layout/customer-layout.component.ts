import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { Customer } from 'src/app/models/customer.model';
import { CustomerService } from '../customer.service';

@Component({
  selector: 'app-customer-layout',
  templateUrl: './customer-layout.component.html',
  styleUrls: ['./customer-layout.component.scss']
})
export class CustomerLayoutComponent implements OnInit {
  customer?: Customer;
  sidebarCollapsed = false;
  activeSection = 'dashboard';

  sidebarItems = [
    { key: 'dashboard', label: 'Dashboard', route: 'dashboard' },
    { key: 'booking', label: 'Book Transport', route: 'booking' },
    { key: 'history', label: 'Booking History', route: 'history' },
    { key: 'tracking', label: 'Track Vehicle', route: 'tracking' },
    { key: 'goods', label: 'Goods Placement', route: 'goods' },
    { key: 'wallet', label: 'Wallet', route: 'wallet' },
    { key: 'payment', label: 'Payment History', route: 'payment' },
    { key: 'profile', label: 'Profile', route: 'profile' },
    { key: 'reviews', label: 'Reviews', route: 'reviews' },
    { key: 'support', label: 'Support', route: 'support' },
  ];

  constructor(
    private customerService: CustomerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
  const userId = localStorage.getItem('userId');

  if (userId) {
    this.loadCustomerProfile(userId);

    this.customerService.customerUpdated$.subscribe(() => {
      this.loadCustomerProfile(userId); // reload name into topbar
    });
  } else {
    this.router.navigate(['/login']);
  }
}


  loadCustomerProfile(userId: string): void {
    this.customerService.getCustomerByUserId(userId).subscribe({
      next: (res: Customer) => {
        res.profile.firstName = res.profile.firstName || 'Unknown';
        res.profile.lastName = res.profile.lastName || '';
        this.customer = res;
      },
      error: (err) => console.error(err),
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  setActiveSection(key: string): void {
    this.activeSection = key;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/dashboard']);
  }
}
