import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DriverDashboardComponent } from './driver-dashboard.component';

const routes: Routes = [
  { path: '', component: DriverDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverRoutingModule {}
