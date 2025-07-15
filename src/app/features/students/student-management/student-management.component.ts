import { Component, OnInit } from '@angular/core';
import { StudentResponse } from '../../../models/student.model';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-student-management',
  templateUrl: './student-management.component.html',
  styleUrls: ['./student-management.component.scss']
})
export class StudentManagementComponent implements OnInit {
  activeView: 'list' | 'register' = 'list';
  refreshList = false;
  selectedStudent: StudentResponse | null = null;
  
  // Stats properties
  totalStudents = 0;
  newStudentsThisMonth = 0;
  activeStudents = 0;

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  showRegisterForm(): void {
    this.activeView = 'register';
    this.selectedStudent = null;
  }

  showStudentList(): void {
    this.activeView = 'list';
    this.selectedStudent = null;
    this.triggerListRefresh();
    this.loadStats(); // Refresh stats when showing list
  }

  onStudentRegistered(student: StudentResponse): void {
    this.showStudentList();
    this.triggerListRefresh(); // Trigger refresh after registration
    this.loadStats(); // Refresh stats after registration
    console.log('✅ Student registered, refreshing stats...');
  }

  onCancelRegistration(): void {
    this.showStudentList();
  }

  onEditStudent(student: StudentResponse): void {
    this.selectedStudent = student;
    this.activeView = 'register';
  }

  onViewStudent(student: StudentResponse): void {
    this.selectedStudent = student;
    // You can implement a view-only modal or component here
    console.log('Viewing student:', student);
  }

  private triggerListRefresh(): void {
    this.refreshList = !this.refreshList;
  }

  loadStats(): void {
    console.log('🔄 Loading student statistics...');
    this.loadTotalStudents();
    // You can add other stats loading here later
  }

  loadTotalStudents(): void {
    this.studentService.getTotalActiveStudents().subscribe({
      next: (count: number) => {
        this.totalStudents = count;
        this.activeStudents = count; // For now, assume all are active
        console.log('📊 Updated total students count:', count);
      },
      error: (error: any) => {
        console.error('❌ Failed to load student count:', error);
        this.totalStudents = 0;
      }
    });
  }
}
