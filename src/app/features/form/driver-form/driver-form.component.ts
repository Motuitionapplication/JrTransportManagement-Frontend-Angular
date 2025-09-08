import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-driver-form',
  templateUrl: './driver-form.component.html',
  styleUrls: ['./driver-form.component.scss']
})
export class DriverFormComponent implements OnInit {
  driverForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DriverFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ownerId: string }
  ) { }

  ngOnInit(): void {
    this.driverForm = this.fb.group({
      // Fields from the grid
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      
      // --- MODIFIED LINE ---
      // Added a pattern validator for the Indian phone number format (+91 followed by 10 digits)
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+91[0-9]{10}$/)]],
      
      status: ['AVAILABLE', Validators.required],

      // New required fields from the backend
      password: ['', [Validators.required, Validators.minLength(6)]],
      dateOfBirth: [null, Validators.required],
      fatherName: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      profilePhoto: ['default.png', Validators.required] // Or handle file upload
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    // Ensure the form is valid before proceeding
    if (this.driverForm.valid) {
      // 1. Get the raw form values (this includes password, email, etc.)
      const formValue = this.driverForm.value;

      // 2. Pass the complete object when closing the dialog
      this.dialogRef.close(formValue);
    }
  }
}
