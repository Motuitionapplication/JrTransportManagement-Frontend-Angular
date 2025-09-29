import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

import { DriverComponent } from './driver.component';

const routes: Routes = [
  {
    path: '',
    component: DriverComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DriverComponent }, // Temporary
      { path: 'profile', component: DriverComponent }, // Temporary
      { path: 'service-center', component: DriverComponent }, // Temporary
      { path: 'customers', component: DriverComponent }, // Temporary
      { path: 'earnings', component: DriverComponent }, // Temporary
      { path: 'rewards', component: DriverComponent }, // Temporary
      { path: 'settings', component: DriverComponent } // Temporary
    ]
  }
];

@NgModule({
  declarations: [
    DriverComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule
  ],
  exports: [
    DriverComponent
  ]
})
export class DriverModule { }
