import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DriverComponent } from './driver.component';
import { DriverDashboardComponent } from './components/driver-dashboard.component';
import { DriverBookingsComponent } from './components/driver-bookings.component';
import { AuthGuard } from '../../core/auth.guard';

// Folder-based detailed components
import { MyTripsComponent } from './components/my-trips/my-trips.component';
import { EarningsComponent } from './components/earnings/earnings.component';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { ProfileComponent } from './components/profile/profile.component';
import { DocumentsComponent } from './components/documents/documents.component';
import { MessagesComponent } from './components/messages/messages.component';
import { MyTruckComponent } from './components/my-truck/my-truck.component';
import { SupportComponent } from './components/support/support.component';

const routes: Routes = [
  { 
    path: '', 
    component: DriverComponent,
    canActivate: [AuthGuard],
    data: { role: 'ROLE_DRIVER' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DriverDashboardComponent },
      { path: 'my-trips', component: MyTripsComponent },
      { path: 'bookings', component: DriverBookingsComponent },
      { path: 'my-truck', component: MyTruckComponent },
      { path: 'earnings', component: EarningsComponent },
      { path: 'schedule', component: ScheduleComponent },
      { path: 'documents', component: DocumentsComponent },
      { path: 'messages', component: MessagesComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'support-center', component: SupportComponent },
      
      // Legacy redirects for backward compatibility
      { path: 'trucks', redirectTo: 'my-truck', pathMatch: 'full' },
      { path: 'support', redirectTo: 'support-center', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverRoutingModule {}
