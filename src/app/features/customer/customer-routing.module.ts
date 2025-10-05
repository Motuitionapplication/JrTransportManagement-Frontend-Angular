import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerComponent } from './customer.component';
import { ProfileComponent } from './profile/profile.component';
import { CustomerLayoutComponent } from './customer-layout/customer-layout.component';
import { BookingRequestComponent } from './booking-request/booking-request.component';

const routes: Routes = [
   {path: '',
    component: CustomerLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: CustomerComponent },
      { path: 'profile', component: ProfileComponent },
      {path : 'booking',component:BookingRequestComponent}
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule {}
