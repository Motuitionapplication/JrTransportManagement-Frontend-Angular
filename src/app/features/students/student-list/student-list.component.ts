import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { StudentService } from '../../../services/student.service';
import { StudentResponse } from '../../../models/student.model';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss']
})
export class StudentListComponent implements OnInit {
  @Input() refreshList = false;
  @Output() editStudent = new EventEmitter<StudentResponse>();
  @Output() viewStudent = new EventEmitter<StudentResponse>();

  students: StudentResponse[] = [];
  filteredStudents: StudentResponse[] = [];
  searchTerm = '';
  isLoading = false;
  errorMessage = '';
  totalStudents = 0;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  // Sorting
  sortField: keyof StudentResponse = 'firstName';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.loadStudents();
    this.loadTotalCount();
  }

  ngOnChanges(): void {
    if (this.refreshList) {
      this.loadStudents();
    }
  }

  loadStudents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.studentService.getAllStudents().subscribe({
      next: (students: StudentResponse[]) => {
        this.students = students;
        this.applyFiltersAndSort();
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'Failed to load students';
        this.isLoading = false;
      }
    });
  }

  loadTotalCount(): void {
    this.studentService.getTotalActiveStudents().subscribe({
      next: (count: number) => {
        this.totalStudents = count;
      },
      error: (error: any) => {
        console.error('Failed to load student count:', error);
      }
    });
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.isLoading = true;
      this.studentService.searchStudents(this.searchTerm.trim()).subscribe({
        next: (students: StudentResponse[]) => {
          this.students = students;
          this.applyFiltersAndSort();
          this.isLoading = false;
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'Search failed';
          this.isLoading = false;
        }
      });
    } else {
      this.loadStudents();
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadStudents();
  }

  applyFiltersAndSort(): void {
    let filtered = [...this.students];

    // Apply local search filter if needed
    if (this.searchTerm && !this.isLoading) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.firstName.toLowerCase().includes(term) ||
        student.lastName.toLowerCase().includes(term) ||
        student.parentName.toLowerCase().includes(term) ||
        student.parentEmail.toLowerCase().includes(term)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = this.getFieldValue(a, this.sortField);
      const bValue = this.getFieldValue(b, this.sortField);
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    this.filteredStudents = filtered;
    this.updatePagination();
  }

  private getFieldValue(student: StudentResponse, field: keyof StudentResponse): any {
    return student[field] || '';
  }

  sort(field: keyof StudentResponse): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredStudents.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  getPaginatedStudents(): StudentResponse[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredStudents.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    const start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    const end = Math.min(this.totalPages, start + maxPages - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  onEditStudent(student: StudentResponse): void {
    this.editStudent.emit(student);
  }

  onViewStudent(student: StudentResponse): void {
    this.viewStudent.emit(student);
  }

  confirmDeleteStudent(student: StudentResponse): void {
    if (confirm(`Are you sure you want to deactivate ${student.firstName} ${student.lastName}?`)) {
      this.deleteStudent(student);
    }
  }

  deleteStudent(student: StudentResponse): void {
    this.studentService.deleteStudent(student.id).subscribe({
      next: () => {
        this.loadStudents();
        this.loadTotalCount();
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'Failed to delete student';
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'badge-success' : 'badge-danger';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getSortIcon(field: keyof StudentResponse): string {
    if (this.sortField !== field) {
      return 'fas fa-sort';
    }
    return this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  }

  refreshData(): void {
    this.loadStudents();
    this.loadTotalCount();
  }

  trackByStudentId(index: number, student: StudentResponse): number {
    return student.id;
  }

  // Utility method for template
  getMathMin(a: number, b: number): number {
    return Math.min(a, b);
  }
}
