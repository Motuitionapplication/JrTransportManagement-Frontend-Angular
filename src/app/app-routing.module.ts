import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { StudentManagementComponent } from './features/students/student-management/student-management.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
<<<<<<< HEAD
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  
  // Authentication routes
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  
  // Dashboard routes
=======
>>>>>>> main
  { path: 'dashboard', component: DashboardComponent },
  { path: 'students', component: StudentManagementComponent },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
