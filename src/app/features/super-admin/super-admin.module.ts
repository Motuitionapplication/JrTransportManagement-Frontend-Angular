import { SidebarComponent } from './sidebar/sidebar.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { AgGridModule } from 'ag-grid-angular';
import { FormsModule } from '@angular/forms';
import { SuperAdminDashboardComponent } from './dashboard/super-admin-dashboard.component';
import { UserManagementComponent } from './user-management.component';
import { ApprovalManagementComponent } from './approval-management.component';
import { VehicleManagementComponent } from './vehicle-management.component';
import { ConsignmentManagementComponent } from './consignment-management.component';
import { PaymentManagementComponent } from './payment-management.component';
import { FareManagementComponent } from './fare-management.component';
import { ComplaintManagementComponent } from './complaint-management.component';
import { TermManagementComponent } from './term-management.component';
import { WalletManagementComponent } from './wallet-management.component';
import { AnalyticsComponent } from './analytics.component';
import { CustomerManagementComponent } from './customer-management.component';
import { OwnerManagementComponent } from './owner-management.component';
import { DriverManagementComponent } from './driver-management.component';
import { AdminManagementComponent } from './admin-management.component';
import { CustomerFetcherComponent } from '../Fetched/customer-fetcher/customer-fetcher.component';
import { AdminFetcherComponent } from '../Fetched/admin-fetcher/admin-fetcher.component';
import { OwnerFetcherComponent } from '../Fetched/owner-fetcher/owner-fetcher.component';

const routes: Routes = [
  {
    path: '',
    component: SuperAdminDashboardComponent,
    children: [
      { path: 'user-management', component: UserManagementComponent },
      { path: 'admin-management', component: AdminManagementComponent },
      { path: 'customer-management', component: CustomerManagementComponent },
      { path: 'owner-management', component: OwnerManagementComponent },
      { path: 'driver-management', component: DriverManagementComponent },
      { path: 'approval-management', component: ApprovalManagementComponent },
      { path: 'vehicle-management', component: VehicleManagementComponent },
      { path: 'consignment-management', component: ConsignmentManagementComponent },
      { path: 'payment-management', component: PaymentManagementComponent },
      { path: 'fare-management', component: FareManagementComponent },
      { path: 'complaint-management', component: ComplaintManagementComponent },
      { path: 'term-management', component: TermManagementComponent },
      { path: 'wallet-management', component: WalletManagementComponent },
      { path: 'analytics', component: AnalyticsComponent },
    ]
  }
];

@NgModule({
  declarations: [
    SuperAdminDashboardComponent,
    SidebarComponent,
    UserManagementComponent,
    AdminManagementComponent,
    CustomerManagementComponent,
    OwnerManagementComponent,
    DriverManagementComponent,
    ApprovalManagementComponent,
    VehicleManagementComponent,
    ConsignmentManagementComponent,
    PaymentManagementComponent,
    FareManagementComponent,
    ComplaintManagementComponent,
    TermManagementComponent,
    WalletManagementComponent,
    AnalyticsComponent,
    CustomerFetcherComponent,
    AdminFetcherComponent,
    OwnerFetcherComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  AgGridModule,
    FormsModule,
    MatTreeModule,
    MatIconModule
  ]
})
export class SuperAdminModule {}