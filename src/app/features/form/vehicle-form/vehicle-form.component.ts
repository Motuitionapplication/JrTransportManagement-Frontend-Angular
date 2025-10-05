import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Vehicle, VehicleService } from '../../vehicle/vehicle.service';

@Component({
  selector: 'app-vehicle-form',
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.scss']
})
export class VehicleFormComponent implements OnInit {
  vehicleForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  vehicleTypes = ['TRUCK', 'VAN', 'TRAILER', 'CONTAINER', 'PICKUP'];
  statusOptions = ['available', 'in_transit', 'maintenance', 'inactive'];

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    public dialogRef: MatDialogRef<VehicleFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ownerId: string }
  ) {
    this.vehicleForm = this.fb.group({
      vehicleNumber: [
        '',
        [
          Validators.required,
          Validators.pattern('^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$')
        ]
      ],
      vehicleType: ['', Validators.required],
      model: ['', Validators.required],
      manufacturer: ['', Validators.required],
      year: ['', [Validators.required, Validators.min(1990), Validators.max(new Date().getFullYear())]],
      capacity: ['', [Validators.required, Validators.min(0)]],

      // Status
      status: ['available', Validators.required],

      // Fare Details
      fareDetails: this.fb.group({
        perKmRate: [0, Validators.required],
        wholeFare: [0, Validators.required],
        sharingFare: [0, Validators.required],
        gstIncluded: [true],
        movingInsurance: [0]
      }),

      // Documents
      documents: this.fb.group({
        registration: this.fb.group({
          number: ['', Validators.required],
          expiryDate: ['', Validators.required],
          documentUrl: ['']
        }),
        insurance: this.fb.group({
          policyNumber: ['', Validators.required],
          expiryDate: ['', Validators.required],
          provider: ['', Validators.required],
          documentUrl: ['']
        }),
        permit: this.fb.group({
          number: ['', Validators.required],
          expiryDate: ['', Validators.required],
          documentUrl: ['']
        }),
        fitness: this.fb.group({
          certificateNumber: ['', Validators.required],
          expiryDate: ['', Validators.required],
          documentUrl: ['']
        }),
        pollution: this.fb.group({
          certificateNumber: ['', Validators.required],
          expiryDate: ['', Validators.required],
          documentUrl: ['']
        })
      }),

      nextServiceDate: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formValue = this.vehicleForm.value;
    const vehiclePayload: Vehicle = {
      ...formValue,
      ownerId: this.data.ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      maintenanceHistory: [],
      currentLocation: undefined,
      driverId: undefined
    };

    this.vehicleService.saveVehicle(vehiclePayload).subscribe({
      next: (savedVehicle) => {
        this.isLoading = false;
        this.dialogRef.close(savedVehicle);
      },
      error: (err) => {
        console.error('Error saving vehicle:', err);
        this.error = 'Failed to save vehicle. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
