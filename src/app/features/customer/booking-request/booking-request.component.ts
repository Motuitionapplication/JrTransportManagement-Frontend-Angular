import { Component, OnInit } from '@angular/core';
import { Customer } from 'src/app/models/customer.model';
import { CustomerService } from '../customer.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-booking-request',
  templateUrl: './booking-request.component.html',
  styleUrls: ['./booking-request.component.scss']
})
export class BookingRequestComponent implements OnInit {
  customer!: Customer;
  userId!: string;
  bookingForm!: FormGroup;
  loading: boolean = false; // ✅ Spinner state

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private snackBar: MatSnackBar
  ) {
    this.bookingForm = this.fb.group({
      pickupLocation: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        pincode: ['', Validators.required],
        country: ['', Validators.required]
      }),
      dropOffLocation: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        pincode: ['', Validators.required],
        country: ['', Validators.required]
      }),
      pickupDate: ['', Validators.required],
      pickupTime: ['', Validators.required],
      truckRequirements: this.fb.group({
        vehicleType: ['', Validators.required],
        cargoWeightKg: ['', Validators.required],
        cargoLengthMeters: ['', Validators.required],
        cargoWidthMeters: ['', Validators.required],
        cargoHeightMeters: ['', Validators.required]
      })
    });
  }

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') || '';

    if (this.userId) {
      this.customerService.getCustomerByUserId(this.userId).subscribe({
        next: (data) => {
          this.customer = data;
          console.log('Customer found:', this.customer.id, this.userId);
        },
        error: (err) => {
          console.error('Failed to load profile:', err);
        }
      });
    }
  }

  onSubmit() {
    if (this.bookingForm.valid && this.customer) {
      this.loading = true; // ✅ Show spinner
      this.customerService.createBooking(this.customer.id, this.bookingForm.value)
        .subscribe({
          next: () => {
            this.loading = false; // ✅ Hide spinner
            this.snackBar.open('Booking Request Sent Successfully 🎉', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.bookingForm.reset();
          },
          error: (err) => {
            this.loading = false;
            console.error('Booking failed:', err);
            this.snackBar.open('Booking Failed ❌ Try Again', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }
}
