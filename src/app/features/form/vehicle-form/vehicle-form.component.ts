import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Vehicle, VehicleService } from '../../vehicle/vehicle.service'; // Adjust path

@Component({
  selector: 'app-vehicle-form',
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.scss']
})
export class VehicleFormComponent implements OnInit {
  vehicleForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  
  // Enum-like object for the vehicle type dropdown
  vehicleTypes = ['TRUCK', 'VAN', 'TRAILER', 'CONTAINER', 'PICKUP'];

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    public dialogRef: MatDialogRef<VehicleFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ownerId: string }
  ) {
    this.vehicleForm = this.fb.group({
      vehicleNumber: ['', [Validators.required, Validators.pattern('^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$')]],
      vehicleType: ['', Validators.required],
      model: ['', Validators.required],
      manufacturer: ['', Validators.required],
      year: ['', [Validators.required, Validators.min(1990), Validators.max(new Date().getFullYear())]],
      capacity: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {}

  /**
   * Handles the form submission.
   */
  onSubmit(): void {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched(); // Show validation errors
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formValue = this.vehicleForm.value;
    const vehiclePayload: Vehicle = {
      ...formValue,
      owner: { id: this.data.ownerId } // Attach the owner's ID
    };

    this.vehicleService.saveVehicle(vehiclePayload).subscribe({
      next: (savedVehicle) => {
        this.isLoading = false;
        // Close the dialog and pass back the new vehicle
        this.dialogRef.close(savedVehicle); 
      },
      error: (err) => {
        console.error('Error saving vehicle:', err);
        this.error = 'Failed to save vehicle. Please check the details and try again.';
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
