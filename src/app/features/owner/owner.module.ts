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

const routes: Routes = [
  {
    path: '',
    component: OwnerComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: OwnerDashboardComponent },
      { path: 'vehicles', component: OwnerDashboardComponent }, // Temporary placeholder
      { path: 'drivers', component: OwnerDashboardComponent }, // Temporary placeholder
      { path: 'bookings', component: OwnerDashboardComponent }, // Temporary placeholder
      { path: 'payments', component: OwnerDashboardComponent }, // Temporary placeholder
      { path: 'wallet', component: OwnerDashboardComponent }, // Temporary placeholder
      { path: 'earnings', component: OwnerDashboardComponent }, // Temporary placeholder
      { path: 'service-center', component: OwnerDashboardComponent }, // Temporary placeholder
      { path: 'documents', component: OwnerDashboardComponent }, // Temporary placeholder
      { path: 'notifications', component: OwnerDashboardComponent }, // Temporary placeholder
      { path: 'profile', component: OwnerDashboardComponent }, // Temporary placeholder
      { path: 'support', component: OwnerDashboardComponent }, // Temporary placeholder
      { path: 'reviews', component: OwnerDashboardComponent }, // Temporary placeholder
      { path: 'reports', component: OwnerDashboardComponent }, // Temporary placeholder
      { path: 'business', component: OwnerDashboardComponent } // Temporary placeholder
    ]
  }
];

@NgModule({
  declarations: [
    OwnerComponent,
    OwnerDashboardComponent
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
