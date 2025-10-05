
import { Component, OnInit } from '@angular/core';
import { CustomerService } from './customer.service';
import { Customer } from '../../models/customer.model';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})

export class CustomerComponent implements OnInit {
  toggleSidebar() {
    throw new Error('Method not implemented.');
  }
sidebarItems = [
  { key: 'dashboard', label: 'Dashboard', route: '' }, // relative to /customer
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


  setActiveSection(arg0: string) {
    throw new Error('Method not implemented.');
  }
  customer?: Customer;
  sidebarCollapsed: any;
  activeSection: any;

  constructor(private customerService: CustomerService,
    private authservice: AuthService,
    private router: Router) { }

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');

    if (userId) {
      console.log('CustomerComponent: Loaded userId =', userId);
      this.loadCustomerProfile(userId);
    } else {
      console.warn('No userId found in localStorage. Redirecting to login...');
      this.router.navigate(['/login']); // optional: redirect
    }
  }

  // Fetch customer profile
  loadCustomerProfile(userId: string): void {
  this.customerService.getCustomerByUserId(userId).subscribe({
    next: (res: Customer) => {
      // Set defaults if null
      res.profile.firstName = res.profile.firstName || 'Unknown';
      res.profile.lastName = res.profile.lastName || '';
      this.customer = res;
      console.log('✅ Loaded customer profile:', this.customer);
    },
    error: (err) => console.error(err),
  });
}
  logout(): void {
    console.log('👋 Logging out from CustomerComponent');
    this.authservice.logout();
    this.router.navigate(['/dashboard']); // redirect to dashboard/login
  }

}
