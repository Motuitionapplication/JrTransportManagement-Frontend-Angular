
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

// Components
import { CustomerComponent } from './customer.component';
import { CustomerDashboardComponent } from './components/customer-dashboard.component';

// Routing
import { CustomerRoutingModule } from './customer-routing.module';

@NgModule({
  declarations: [
    CustomerComponent,
    CustomerDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    CustomerRoutingModule,
    // Angular Material Modules
    MatCardModule,
    MatIconModule
  ],
  exports: [
    CustomerComponent,
    CustomerDashboardComponent
  ]
})
export class CustomerModule {}
