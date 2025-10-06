import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuperAdminComponent } from './super-admin.component';
import { AuthGuard } from '../../core/auth.guard';

const routes: Routes = [
  { 
    path: '', 
    component: SuperAdminComponent,
    canActivate: [AuthGuard],
    data: { role: 'ROLE_SUPER_ADMIN' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperAdminRoutingModule {}
