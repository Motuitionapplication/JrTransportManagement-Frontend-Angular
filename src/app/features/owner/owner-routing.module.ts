import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OwnerDashboardComponent } from './components/dashboard/owner-dashboard.component';
import { AuthGuard } from '../../core/auth.guard';

const routes: Routes = [
  { 
    path: '', 
    component: OwnerDashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'ROLE_OWNER' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OwnerRoutingModule {}
