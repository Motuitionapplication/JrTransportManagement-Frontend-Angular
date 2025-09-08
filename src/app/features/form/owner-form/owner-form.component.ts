import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-owner-form',
  templateUrl: './owner-form.component.html',
  styleUrls: ['./owner-form.component.scss']
})
export class OwnerFormComponent implements OnInit {
  ownerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<OwnerFormComponent>
  ) { }

  ngOnInit(): void {
    this.ownerForm = this.fb.group({
      // --- Required Profile Information ---
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      
      // --- UPDATED PHONE VALIDATION ---
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern("^[0-9]{10}$") // Ensures exactly 10 digits
      ]],

      password: ['', [Validators.required, Validators.minLength(6)]],

      // --- Required Address Information ---
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],

        // --- UPDATED PINCODE VALIDATION ---
        pincode: ['', [
          Validators.required,
          Validators.pattern("^[0-9]{6}$") // Ensures exactly 6 digits
        ]],

        country: ['India', Validators.required]
      }),

      // --- Default Statuses (sent in the background) ---
      accountStatus: ['ACTIVE', Validators.required],
      verificationStatus: ['PENDING', Validators.required]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.ownerForm.valid) {
      this.dialogRef.close(this.ownerForm.value);
    } else {
      this.ownerForm.markAllAsTouched();
    }
  }
}