import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../customer.service';
import { Customer } from 'src/app/models/customer.model';

@Component({
  selector: 'app-booking-history',
  templateUrl: './booking-history.component.html',
  styleUrls: ['./booking-history.component.scss']
})
export class BookingHistoryComponent implements OnInit {

  customer!: Customer;
  bookings: any[] = [];
  userId!: string;
  isLoading = true; // <-- 1. Add isLoading flag, default to true

  constructor(private customerservice: CustomerService) { }

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') || '';
    if (this.userId) {
      this.customerservice.getCustomerByUserId(this.userId).subscribe({
        next: (data) => {
          this.customer = data;
          console.log('Customer found:', this.customer.id, this.userId);

          this.customerservice.getBookingHistory(this.customer.id).subscribe({
            next: (history) => {
              this.bookings = history;
              this.isLoading = false; // <-- 2. Stop loading on success
              console.log('Booking history loaded:', this.bookings);
            },
            error: (err) => {
              console.error('Failed to load booking history:', err);
              this.isLoading = false; // <-- 3. Stop loading on error
            }
          });
        },
        error: (err) => {
          console.error('Failed to load profile:', err);
          this.isLoading = false; // <-- 4. Also stop loading if profile fails
        }
      });
    } else {
        this.isLoading = false; // Handle case where there's no userId
    }
  }
}