import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from '../../admin/admin-dashboard.component';
import { AdminRoutingModule } from './admin-routing.module';


@NgModule({
  declarations: [AdminComponent, AdminDashboardComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    AdminRoutingModule
  ],
  exports: [AdminComponent]
})
export class AdminModule {}
