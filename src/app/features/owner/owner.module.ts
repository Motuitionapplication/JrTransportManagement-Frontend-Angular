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

// Components
import { OwnerComponent } from './owner.component';
import { Dashboard1Component } from './components/dashboard1/dashboard1.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

const routes: Routes = [
  {
    path: '',
    component: OwnerComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard1Component },

    ]
  }
];

@NgModule({
  declarations: [
    OwnerComponent,
    Dashboard1Component,
    SidebarComponent
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
  ]
})
export class OwnerModule {}
