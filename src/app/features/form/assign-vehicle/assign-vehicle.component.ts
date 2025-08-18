import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DriverService } from '../../driver/driver.service'; // Adjust path
import { Vehicle } from '../../vehicle/vehicle.service'; // Adjust path

@Component({
  selector: 'app-assign-vehicle',
  templateUrl: './assign-vehicle.component.html',
  styleUrls: ['./assign-vehicle.component.scss']
})
export class AssignVehicleComponent {
  selectedVehicleId: string = '';
  isLoading = false;
  error: string | null = null;
  availableVehicles: Vehicle[];
  driver: any;

  constructor(
    public dialogRef: MatDialogRef<AssignVehicleComponent>,
    private driverService: DriverService,
    @Inject(MAT_DIALOG_DATA) public data: { driver: any; vehicles: Vehicle[] }
  ) {
    this.driver = data.driver;
    if (data.vehicles && data.vehicles.length > 0) {
      console.log('Inspecting vehicle data:', data.vehicles[0]);
    } 
    this.availableVehicles = data.vehicles.filter(
      v => !v.driverId || v.driverId.trim() === ''
    );
  }
   public onVehicleSelectionChange(event: any): void {
    console.log('Selection event fired! Selected Vehicle ID:', event.value);
    this.selectedVehicleId = event.value;
  }

  /** Helper to display selected vehicle in mat-select trigger */
  getSelectedVehicleText(): string {
    if (!this.selectedVehicleId) {
      return '';
    }
    const selectedVehicle = this.availableVehicles.find(
      v => v.id === this.selectedVehicleId
    );
    return selectedVehicle
      ? `${selectedVehicle.vehicleNumber} - (${selectedVehicle.manufacturer} ${selectedVehicle.model})`
      : '';
  }

  onConfirm(): void {
    if (!this.selectedVehicleId) {
      this.error = 'Please select a vehicle to assign.';
      return;
    }
    this.isLoading = true;
    this.error = null;

    this.driverService.assignVehicle(this.driver.id, this.selectedVehicleId).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialogRef.close({ success: true });
      },
      error: (err) => {
        this.isLoading = false;
        this.error =
          err.error?.message ||
          'Failed to assign vehicle. It might already be allotted.';
        console.error(err);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
