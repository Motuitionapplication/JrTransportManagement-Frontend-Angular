import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerComponent } from './customer.component';
import { CustomerDashboardComponent } from './components/customer-dashboard.component';
import { MyBookingsComponent } from './components/my-bookings/my-bookings.component';
import { MyTripsComponent } from './components/my-trips/my-trips.component';
import { TrackingComponent } from './components/tracking.component';
import { TransportHistoryComponent } from './components/transport-history.component';
import { WalletComponent } from './components/wallet.component';
import { MessagesComponent } from './components/messages.component';
import { BookTransportComponent } from './components/book-transport/book-transport.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SupportComponent } from './components/support/support.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { AuthGuard } from '../../core/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: CustomerComponent,
    canActivate: [AuthGuard],
    data: { role: 'ROLE_CUSTOMER' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: CustomerDashboardComponent },
      { path: 'bookings', component: MyBookingsComponent },
      { path: 'my-bookings', redirectTo: 'bookings', pathMatch: 'full' },
      { path: 'trips', component: MyTripsComponent },
      { path: 'my-trips', redirectTo: 'trips', pathMatch: 'full' },
      { path: 'tracking', component: TrackingComponent },
      { path: 'transport-history', component: TransportHistoryComponent },
      { path: 'wallet', component: WalletComponent },
      { path: 'messages', component: MessagesComponent },
      { path: 'book-transport', component: BookTransportComponent },
      { path: 'new-booking', redirectTo: 'book-transport', pathMatch: 'full' },
      { path: 'payments', component: PaymentHistoryComponent },
      { path: 'payment-history', redirectTo: 'payments', pathMatch: 'full' },
      { path: 'profile', component: ProfileComponent },
      { path: 'support', component: SupportComponent },
      { path: 'notifications', component: NotificationsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule {}
