import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Components
import { StudentManagementComponent } from './student-management/student-management.component';
import { StudentRegistrationComponent } from './student-registration/student-registration.component';
import { StudentListComponent } from './student-list/student-list.component';

// Services
import { StudentService } from '../../services/student.service';

@NgModule({
  declarations: [
    StudentManagementComponent,
    StudentRegistrationComponent,
    StudentListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    StudentService
  ],
  exports: [
    StudentManagementComponent,
    StudentRegistrationComponent,
    StudentListComponent
  ]
})
export class StudentsModule { }
