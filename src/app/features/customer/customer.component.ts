
import { Component, OnInit } from '@angular/core';
import { CustomerService } from './customer.service';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {
  customer?: Customer;

  constructor(private customerService: CustomerService) { }

  ngOnInit(): void {
    console.log('Customer component initialized');
    // Get logged-in user from localStorage
    const userStr = localStorage.getItem('auth-user');
    let userId = '';
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user.id?.toString() || '';
      } catch (e) {
        console.error('Failed to parse user from localStorage:', e);
      }
    }
    if (userId) {
      this.customerService.getCustomerByUserId(userId).subscribe({
        next: (data) => {
          this.customer = data;
        },
        error: (err) => {
          console.error('Failed to fetch customer details:', err);
        }
      });
    }
  }
}
