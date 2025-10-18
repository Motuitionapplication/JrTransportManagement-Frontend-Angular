
import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';

// Components
import { CustomerComponent } from './customer.component';
import { CustomerDashboardComponent } from './components/customer-dashboard.component';
import { MyBookingsComponent } from './components/my-bookings/my-bookings.component';
// Force refresh - BookTransport component exists and builds successfully
import { BookTransportComponent } from './components/book-transport/book-transport.component';
import { MyTripsComponent } from './components/my-trips/my-trips.component';
import { TrackingComponent } from './components/tracking.component';
import { TransportHistoryComponent } from './components/transport-history.component';
import { WalletComponent } from './components/wallet.component';
import { MessagesComponent } from './components/messages.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SupportComponent } from './components/support/support.component';
import { NotificationsComponent } from './components/notifications/notifications.component';

// Routing
import { CustomerRoutingModule } from './customer-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { CustomerLayoutComponent } from './customer-layout/customer-layout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { BookingRequestComponent } from './booking-request/booking-request.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BookingHistoryComponent } from './booking-history/booking-history.component';

@NgModule({
  declarations: [CustomerComponent, ProfileComponent, CustomerLayoutComponent, BookingRequestComponent, BookingHistoryComponent],
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
