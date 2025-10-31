import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
// Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
// Components
import { OwnerComponent } from './owner.component';
import { Dashboard1Component } from './components/dashboard1/dashboard1.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { VehiclesComponent } from './components/vehicles/vehicles.component';
import { DriversComponent } from './components/drivers/drivers.component';
// import { BookingsComponent } from './components/bookings/bookings.component';
import { EarningsComponent } from './components/earnings/earnings.component';
import { TrackingComponent } from './components/tracking/tracking.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { DriverComponent } from '../driver/driver.component';
import { OwnerRoutingModule } from './owner-routing.module';
import { MaintenanceComponent } from './components/maintenance/maintenance.component';
import { VehicleFormComponent } from '../form/vehicle-form/vehicle-form.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
@NgModule({
  declarations: [
    OwnerComponent,
    Dashboard1Component,
    SidebarComponent,
    VehiclesComponent,
    DriversComponent,
    EarningsComponent,
    TrackingComponent,
    AnalyticsComponent,
    NotificationsComponent,
    MaintenanceComponent,
    VehicleFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    OwnerRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatTableModule,
    MatCheckboxModule,
    AgGridModule,
    MatProgressSpinnerModule
]
})
export class OwnerModule {}
