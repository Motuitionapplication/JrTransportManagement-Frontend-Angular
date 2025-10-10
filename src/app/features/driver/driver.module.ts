import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { DriverRoutingModule } from './driver-routing.module';
import { DriverComponent } from './driver.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DriverBookingsComponent } from './components/driver-bookings.component';

// New detailed components with folder structure
import { MyTripsComponent } from './components/my-trips/my-trips.component';
import { EarningsComponent } from './components/earnings/earnings.component';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { ProfileComponent } from './components/profile/profile.component';
import { DocumentsComponent } from './components/documents/documents.component';
import { MessagesComponent } from './components/messages/messages.component';
import { MyTruckComponent } from './components/my-truck/my-truck.component';
import { SupportComponent } from './components/support/support.component';
import { LocationPromptComponent } from '../../components/location-prompt/location-prompt.component';

@NgModule({
  declarations: [
    DriverComponent,
    DashboardComponent,
    DriverBookingsComponent,
    // Detailed components
    MyTripsComponent,
    EarningsComponent,
    ScheduleComponent,
    ProfileComponent,
    DocumentsComponent,
    MessagesComponent,
    MyTruckComponent,
    SupportComponent
    , LocationPromptComponent
  ],
  imports: [
    CommonModule,
    DriverRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule
  ],
  exports: [
    DriverComponent
  ]
})
export class DriverModule { }
