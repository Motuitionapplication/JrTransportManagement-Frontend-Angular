import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { StudentManagementComponent } from './features/students/student-management/student-management.component';
import { OwnerComponent } from './features/owner/owner.component';
import { CustomerComponent } from './features/customer/customer.component';
import { DriverComponent } from './features/driver/driver.component';
import { AdminComponent } from './features/admin/admin.component';
import { SuperAdminComponent } from './features/super-admin/super-admin.component';
import { UnauthorizedComponent } from './features/unauthorized/unauthorized.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'students', component: StudentManagementComponent },
  { path: 'owner', component: OwnerComponent },
  { path: 'customer', component: CustomerComponent },
  { path: 'driver', component: DriverComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'super-admin', component: SuperAdminComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
