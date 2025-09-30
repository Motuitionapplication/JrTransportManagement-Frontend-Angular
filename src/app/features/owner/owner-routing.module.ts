import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OwnerComponent } from './owner.component';
import { Dashboard1Component } from './components/dashboard1/dashboard1.component';
import { VehiclesComponent } from './components/vehicles/vehicles.component';
// import { DriverComponent } from '../driver/driver.component';
import { BookingsComponent } from './components/bookings/bookings.component';
import { EarningsComponent } from './components/earnings/earnings.component';
import { TrackingComponent } from './components/tracking/tracking.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { DriversComponent } from './components/drivers/drivers.component';
import { MaintenanceComponent } from './components/maintenance/maintenance.component';

const routes: Routes = [
  {
    path: '',
    component: OwnerComponent, // Layout with sidebar
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // default
      { path: 'dashboard', component: Dashboard1Component },
      { path: 'vehicles', component: VehiclesComponent },
      { path: 'drivers', component: DriversComponent },
      { path: 'bookings', component: BookingsComponent },
      { path: 'earnings', component: EarningsComponent },
      { path: 'tracking', component: TrackingComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'maintenance', component: MaintenanceComponent },
      { path: 'notifications', component: NotificationsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OwnerRoutingModule {}
