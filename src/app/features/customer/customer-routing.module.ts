import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerComponent } from './customer.component';
import { CustomerDashboardComponent } from './components/customer-dashboard.component';
import { AuthGuard } from '../../core/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: CustomerComponent,
    canActivate: [AuthGuard],
    data: { role: 'ROLE_CUSTOMER' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: CustomerDashboardComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule {}
