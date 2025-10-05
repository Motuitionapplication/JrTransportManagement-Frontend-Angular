
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerComponent } from './customer.component';
import { CustomerRoutingModule } from './customer-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { CustomerLayoutComponent } from './customer-layout/customer-layout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { BookingRequestComponent } from './booking-request/booking-request.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [CustomerComponent, ProfileComponent, CustomerLayoutComponent, BookingRequestComponent],
  imports: [CommonModule, CustomerRoutingModule,
    FormsModule,
    ReactiveFormsModule,
     MatFormFieldModule, 
     MatProgressSpinnerModule,
    MatSnackBarModule,         
    MatProgressSpinnerModule],
  exports: [CustomerComponent]
})
export class CustomerModule {}
