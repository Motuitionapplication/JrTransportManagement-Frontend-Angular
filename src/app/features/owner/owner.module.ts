import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

// Components
import { OwnerComponent } from './owner.component';
import { OwnerDashboardComponent } from './components/dashboard/owner-dashboard.component';
import { FleetComponent } from './components/fleet/fleet.component';
import { VehiclesComponent } from './components/vehicles/vehicles.component';
import { DriversComponent } from './components/drivers/drivers.component';
import { BookingsComponent } from './components/bookings/bookings.component';
import { WalletComponent } from './components/wallet/wallet.component';
import { EarningsComponent } from './components/earnings/earnings.component';
import { MaintenanceComponent } from './components/maintenance/maintenance.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { TrackingComponent } from './components/tracking/tracking.component';

const routes: Routes = [
  {
    path: '',
    component: OwnerComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: OwnerDashboardComponent },
      { path: 'fleet', component: FleetComponent },
      { path: 'vehicles', component: VehiclesComponent },
      { path: 'drivers', component: DriversComponent },
      { path: 'bookings', component: BookingsComponent },
      { path: 'wallet', component: WalletComponent },
      { path: 'earnings', component: EarningsComponent },
      { path: 'maintenance', component: MaintenanceComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'tracking', component: TrackingComponent }
    ]
  }
];

@NgModule({
  declarations: [
    OwnerComponent,
    OwnerDashboardComponent,
    FleetComponent,
    VehiclesComponent,
    DriversComponent,
    BookingsComponent,
    WalletComponent,
    EarningsComponent,
    MaintenanceComponent,
    AnalyticsComponent,
    NotificationsComponent,
    TrackingComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule
  ]
})
export class OwnerModule {}
