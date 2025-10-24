import { Component, OnInit } from '@angular/core';
import { DriverService } from 'src/app/features/driver/driver.service';
import { Driver as DriverModel } from 'src/app/models/driver.model';

/**
 * Local view model used by the admin drivers UI (simplified)
 */
interface DriverView {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  vehicleType: string;
  status: 'active' | 'inactive' | 'busy' | 'available' | 'on_trip' | 'off_duty' | 'break';
  rating: number;
  totalTrips: number;
  joinDate: Date;
}

@Component({
  selector: 'app-admin-drivers',
  templateUrl: './admin-drivers.component.html',
  styleUrls: ['./admin-drivers.component.scss']
})
export class AdminDriversComponent implements OnInit {
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedVehicleType: string = '';

  // internal collection of drivers used by the UI
  drivers: DriverView[] = [];
  filteredDrivers: DriverView[] = [];

  // loading / error states
  loading = false;
  error: string | null = null;

  constructor(private driverService: DriverService) { }

  ngOnInit(): void {
    this.loadDrivers();
  }

  private mapToView(d: DriverModel): DriverView {
    return {
      id: d.id,
      name: `${d.profile.firstName} ${d.profile.lastName}`,
      phone: d.profile.phoneNumber,
      email: d.profile.email,
      licenseNumber: d.drivingLicense?.licenseNumber || '',
      vehicleType: d.currentVehicle ? 'truck' : (d.assignedVehicles?.[0] || 'unknown'),
      status: (d.status as any) || 'off_duty',
      rating: d.rating?.averageRating || 0,
      totalTrips: d.totalTripsCompleted || 0,
      joinDate: d.createdAt ? new Date(d.createdAt) : new Date()
    };
  }

  loadDrivers(): void {
    this.loading = true;
    this.error = null;
    this.driverService.getAllDrivers().subscribe({
      next: (list: DriverModel[]) => {
        this.drivers = list.map((d: DriverModel) => this.mapToView(d));
        this.filteredDrivers = [...this.drivers];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load drivers', err);
        this.error = 'Failed to load drivers';
        this.loading = false;
      }
    });
  }

  filterDrivers(): void {
    this.filteredDrivers = this.drivers.filter(driver => {
      const matchesSearch = !this.searchTerm || 
        driver.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        driver.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        driver.phone.includes(this.searchTerm);
      
      const matchesStatus = !this.selectedStatus || driver.status === this.selectedStatus;
      const matchesVehicle = !this.selectedVehicleType || driver.vehicleType === this.selectedVehicleType;
      
      return matchesSearch && matchesStatus && matchesVehicle;
    });
  }

  getDriverInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getJoinedDays(joinDate: Date): number {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getActiveDrivers(): number {
    return this.drivers.filter(d => d.status === 'active').length;
  }

  getBusyDrivers(): number {
    return this.drivers.filter(d => d.status === 'busy').length;
  }

  getInactiveDrivers(): number {
    return this.drivers.filter(d => d.status === 'inactive').length;
  }

  getAverageRating(): string {
    const sum = this.drivers.reduce((acc, driver) => acc + driver.rating, 0);
    return (sum / this.drivers.length).toFixed(1);
  }

  addNewDriver(): void {
    // Navigate to create driver page or open a modal; placeholder for now
    console.log('Add new driver clicked');
  }

  viewDriver(driver: DriverView): void {
    console.log('View driver:', driver);
    // TODO: navigate to driver detail page, e.g. this.router.navigate(['/admin/drivers', driver.id]);
  }

  editDriver(driver: DriverView): void {
    console.log('Edit driver:', driver);
    // TODO: navigate to edit page or open edit modal
  }

  removeDriver(driver: DriverView): void {
    console.log('Remove driver:', driver);
    // call backend to delete
    if (!confirm(`Delete driver ${driver.name}?`)) return;
    this.driverService.deleteDriver(driver.id).subscribe({
      next: () => {
        this.drivers = this.drivers.filter(d => d.id !== driver.id);
        this.filteredDrivers = this.filteredDrivers.filter(d => d.id !== driver.id);
      },
      error: (err) => {
        console.error('Failed to delete driver', err);
        alert('Failed to delete driver');
      }
    });
  }
}