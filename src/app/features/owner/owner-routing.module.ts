import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OwnerDashboardComponent } from './components/dashboard/owner-dashboard.component';

const routes: Routes = [
  { path: '', component: OwnerDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OwnerRoutingModule {}
