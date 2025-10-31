import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

// Modules
import { AdminRoutingModule } from './admin-routing.module';
import { AdminSettingsModule } from './components/settings/admin-settings.module';

// Components
import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard.component';
import { AdminBookingsComponent } from './components/bookings/admin-bookings.component';
import { AdminDriversComponent } from './components/drivers/admin-drivers.component';
import { AdminCustomersComponent } from './components/customers/admin-customers.component';
import { AdminTrucksComponent } from './components/trucks/admin-trucks.component';
import { AdminPaymentsComponent } from './components/payments/admin-payments.component';
import { AdminReportsComponent } from './components/reports/admin-reports.component';

@NgModule({
  declarations: [
    AdminComponent,
    AdminDashboardComponent,
    AdminBookingsComponent,
    AdminDriversComponent,
    AdminCustomersComponent,
    AdminTrucksComponent,
    AdminPaymentsComponent,
    AdminReportsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    
    // Angular Material Modules
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    
    // Feature Modules
    AdminRoutingModule,
    AdminSettingsModule
  ],
  exports: [AdminComponent]
})
export class AdminModule {}
