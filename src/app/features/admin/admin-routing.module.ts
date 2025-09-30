import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard.component';
import { AdminBookingsComponent } from './components/bookings/admin-bookings.component';
import { AdminDriversComponent } from './components/drivers/admin-drivers.component';
import { AdminCustomersComponent } from './components/customers/admin-customers.component';
import { AdminTrucksComponent } from './components/trucks/admin-trucks.component';
import { AdminPaymentsComponent } from './components/payments/admin-payments.component';
import { AdminReportsComponent } from './components/reports/admin-reports.component';
import { AdminSettingsComponent } from './components/settings/admin-settings.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'bookings', component: AdminBookingsComponent },
      { path: 'drivers', component: AdminDriversComponent },
      { path: 'customers', component: AdminCustomersComponent },
      { path: 'trucks', component: AdminTrucksComponent },
      { path: 'payments', component: AdminPaymentsComponent },
      { path: 'reports', component: AdminReportsComponent },
      { path: 'settings', component: AdminSettingsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
