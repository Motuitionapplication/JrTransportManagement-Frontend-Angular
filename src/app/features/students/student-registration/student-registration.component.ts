import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentService } from '../../../services/student.service';
import { StudentRegistrationRequest, StudentResponse } from '../../../models/student.model';

@Component({
  selector: 'app-student-registration',
  templateUrl: './student-registration.component.html',
  styleUrls: ['./student-registration.component.scss']
})
export class StudentRegistrationComponent implements OnInit {
  @Input() editMode = false;
  @Input() studentData: StudentResponse | null = null;
  @Output() studentRegistered = new EventEmitter<StudentResponse>();
  @Output() cancelRegistration = new EventEmitter<void>();

  registrationForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  genderOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService
  ) {
    this.registrationForm = this.createForm();
  }

  ngOnInit(): void {
    this.setDefaultEnrollmentDate();
    if (this.editMode && this.studentData) {
      this.populateFormWithStudentData();
    }
  }

  private populateFormWithStudentData(): void {
    if (this.studentData) {
      this.registrationForm.patchValue({
        firstName: this.studentData.firstName,
        lastName: this.studentData.lastName,
        dateOfBirth: this.studentData.dateOfBirth,
        gender: this.studentData.gender,
        address: this.studentData.address,
        parentName: this.studentData.parentName,
        parentPhone: this.studentData.parentPhone,
        parentEmail: this.studentData.parentEmail,
        emergencyContact: this.studentData.emergencyContact,
        emergencyPhone: this.studentData.emergencyPhone,
        medicalInfo: this.studentData.medicalInfo || '',
        allergies: this.studentData.allergies || '',
        enrollmentDate: this.studentData.enrollmentDate
      });
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Personal Information
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      address: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      
      // Parent Information
      parentName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      parentPhone: ['', [Validators.required, Validators.pattern('^[+]?[0-9]{10,15}$')]],
      parentEmail: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      
      // Emergency Contact
      emergencyContact: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      emergencyPhone: ['', [Validators.required, Validators.pattern('^[+]?[0-9]{10,15}$')]],
      
      // Medical Information
      medicalInfo: ['', [Validators.maxLength(500)]],
      allergies: ['', [Validators.maxLength(300)]],
      
      // Enrollment Date
      enrollmentDate: ['', [Validators.required]]
    });
  }

  private setDefaultEnrollmentDate(): void {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    this.registrationForm.patchValue({ enrollmentDate: formattedDate });
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const registrationData: StudentRegistrationRequest = this.registrationForm.value;
      
      if (this.editMode && this.studentData) {
        // Update existing student
        this.studentService.updateStudent(this.studentData.id, registrationData).subscribe({
          next: (response: StudentResponse) => {
            this.successMessage = 'Student updated successfully!';
            this.isSubmitting = false;
            this.studentRegistered.emit(response);
            setTimeout(() => this.cancelRegistration.emit(), 1500);
          },
          error: (error: any) => {
            this.errorMessage = error.message || 'Failed to update student. Please try again.';
            this.isSubmitting = false;
          }
        });
      } else {
        // Register new student
        this.studentService.registerStudent(registrationData).subscribe({
          next: (response: StudentResponse) => {
            this.successMessage = 'Student registered successfully!';
            this.isSubmitting = false;
            this.studentRegistered.emit(response);
            this.resetForm();
          },
          error: (error: any) => {
            this.errorMessage = error.message || 'Failed to register student. Please try again.';
            this.isSubmitting = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.resetForm();
    this.cancelRegistration.emit();
  }

  resetForm(): void {
    this.registrationForm.reset();
    this.setDefaultEnrollmentDate();
    this.errorMessage = '';
    this.successMessage = '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Validation helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.registrationForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid phone number';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      address: 'Address',
      parentName: 'Parent Name',
      parentPhone: 'Parent Phone',
      parentEmail: 'Parent Email',
      emergencyContact: 'Emergency Contact',
      emergencyPhone: 'Emergency Phone',
      medicalInfo: 'Medical Information',
      allergies: 'Allergies',
      enrollmentDate: 'Enrollment Date'
    };
    return labels[fieldName] || fieldName;
  }

  // Date validation
  getMaxDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getMinDateOfBirth(): string {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return minDate.toISOString().split('T')[0];
  }

  getMaxDateOfBirth(): string {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  }
}
