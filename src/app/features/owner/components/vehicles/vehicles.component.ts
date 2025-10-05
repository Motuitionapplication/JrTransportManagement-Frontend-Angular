import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VehicleFormComponent } from '../../../form/vehicle-form/vehicle-form.component';
import { VehicleService } from '../../../vehicle/vehicle.service';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit {
  ownerId: string | null = null;
  vehicles: any[] = [];

  constructor(
    private dialog: MatDialog,
    private vehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    console.log('VehiclesComponent initialized');

    // 1️⃣ Fetch Owner ID dynamically
    this.vehicleService.getOwnerId().subscribe({
      next: (id) => {
        this.ownerId = id;
        console.log('Owner ID:', id);

        // 2️⃣ Once Owner ID is fetched, get vehicle list
        this.fetchVehiclesByOwner(id);
      },
      error: (err) => {
        console.error('Error getting owner ID:', err);
      }
    });
  }

  fetchVehiclesByOwner(ownerId: string) {
    this.vehicleService.getvehiclesbyOwner(ownerId).subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles;
        console.log('Vehicles list:', vehicles);
      },
      error: (err) => {
        console.error('Error fetching vehicles:', err);
      }
    });
  }

  openAddVehicleDialog(): void {
    if (!this.ownerId) {
      console.error('Cannot open dialog: Owner ID not yet loaded.');
      return;
    }

    const dialogRef = this.dialog.open(VehicleFormComponent, {
      width: '600px',
      data: { ownerId: this.ownerId } // ✅ use the dynamically fetched Owner ID
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('New vehicle added:', result);
        // Refresh the vehicle list after adding a new vehicle
        this.fetchVehiclesByOwner(this.ownerId!);
      }
    });
  }
  deleteVehicle(vehicleId: string) {
  if (!confirm('Are you sure you want to delete this vehicle?')) return;

  this.vehicleService.deleteVehicle(vehicleId).subscribe({
    next: () => {
      this.vehicles = this.vehicles.filter(v => v.id !== vehicleId);
      console.log('Vehicle deleted successfully');
    },
    error: (err) => {
      console.error('Error deleting vehicle', err);
      alert('Failed to delete vehicle');
    }
  });
}
}
