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

    showConfirmDialog: boolean = false;
  confirmMessage: string = '';
  confirmCallback: (() => void) | null = null;

   constructor(
    public dialogRef: MatDialogRef<AssignVehicleComponent>,
    private driverService: DriverService,
    @Inject(MAT_DIALOG_DATA) public data: { driver: any; vehicles: Vehicle[] }
  ) {
    this.driver = data.driver;
    this.availableVehicles = data.vehicles.filter(v => !v.driverId || v.driverId.trim() === '');
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

  onCancel(): void {
    this.dialogRef.close();
  }
   showConfirmation(message: string, callback: () => void) {
    this.confirmMessage = message;
    this.confirmCallback = callback;
    this.showConfirmDialog = true;
  }
  onConfirmYes() {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.showConfirmDialog = false;
    this.confirmCallback = null;
  }

  onConfirmNo() {
    this.showConfirmDialog = false;
    this.confirmCallback = null;
  }

  // Updated onConfirm method with double confirmation
  onConfirm(): void {
    if (!this.selectedVehicleId) {
      this.error = 'Please select a vehicle to assign.';
      return;
    }

    this.showConfirmation(
      `Are you sure you want to assign this vehicle to ${this.driver.firstName}?`,
      () => {
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
          },
        });
      }
    );
  }
}
