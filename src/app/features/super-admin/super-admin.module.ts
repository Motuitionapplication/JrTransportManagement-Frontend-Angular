import { SidebarComponent } from './sidebar/sidebar.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
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
import { WalletManagementsComponent } from '../wallet-managements/wallet-managements.component';
import { AppAdminWalletComponent } from '../wallet-managements/app-admin-wallet/app-admin-wallet.component';
import { AppCustomerWalletComponent } from '../wallet-managements/app-customer-wallet/app-customer-wallet.component';
import { AppDriverWalletComponent } from '../wallet-managements/app-driver-wallet/app-driver-wallet.component';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from '@angular/material/select';
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
    OwnerFetcherComponent,
    WalletManagementsComponent,
    AppCustomerWalletComponent,
    AppDriverWalletComponent,
    AppAdminWalletComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  AgGridModule,
    FormsModule,
    MatTreeModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule
  ]
})
export class SuperAdminModule {}