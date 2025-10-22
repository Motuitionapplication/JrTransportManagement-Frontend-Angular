
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
import { MatTooltipModule } from '@angular/material/tooltip';

// Components
import { CustomerComponent } from './customer.component';
import { CustomerDashboardComponent } from './components/customer-dashboard.component';
// New Dynamic Dashboard Component
import { CustomerDashboardComponent as DynamicDashboardComponent } from './components/dashboard/customer-dashboard.component';
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

// New folder-based components
import { WalletComponent as NewWalletComponent } from './components/wallet/wallet.component';
import { MessageComponent } from './components/message/message.component';
import { TransportHistoryComponent as NewTransportHistoryComponent } from './components/transport-history/transport-history.component';

// Routing
import { CustomerRoutingModule } from './customer-routing.module';

@NgModule({
  declarations: [
    CustomerComponent,
    CustomerDashboardComponent,
    DynamicDashboardComponent,
    MyBookingsComponent,
    BookTransportComponent,
    MyTripsComponent,
    TrackingComponent,
    TransportHistoryComponent,
    WalletComponent,
    MessagesComponent,
    PaymentHistoryComponent,
    ProfileComponent,
    SupportComponent,
    NotificationsComponent,
    // New folder-based components
    NewWalletComponent,
    MessageComponent,
    NewTransportHistoryComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    CustomerRoutingModule,
    // Angular Material Modules
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatBadgeModule,
    MatMenuModule,
    MatDialogModule,
    MatStepperModule,
    MatTooltipModule
  ],
  providers: [
    TitleCasePipe
  ],
  exports: [
    CustomerComponent,
    CustomerDashboardComponent,
    DynamicDashboardComponent,
    MyBookingsComponent,
    BookTransportComponent,
    MyTripsComponent,
    TrackingComponent,
    TransportHistoryComponent,
    WalletComponent,
    MessagesComponent,
    PaymentHistoryComponent,
    ProfileComponent,
    SupportComponent,
    NotificationsComponent,
    // New folder-based components
    NewWalletComponent,
    MessageComponent,
    NewTransportHistoryComponent
  ]
})
export class CustomerModule {}
