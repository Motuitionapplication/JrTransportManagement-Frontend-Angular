import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit {

  vehicles = [
    {
      id: 'V001',
      plateNumber: 'MH-12-AB-1234',
      type: 'Truck',
      model: 'Tata Ace',
      year: 2020,
      capacity: '1.5 Tons',
      status: 'Active',
      driver: 'John Doe',
      driverId: 'D001',
      lastService: new Date('2024-09-15'),
      nextService: new Date('2024-12-15'),
      fuelType: 'Diesel',
      insurance: {
        provider: 'HDFC ERGO',
        expiryDate: new Date('2025-03-20'),
        policyNumber: 'INS123456'
      },
      registration: {
        expiryDate: new Date('2025-08-10'),
        rcNumber: 'RC789012'
      },
      totalTrips: 145,
      totalEarnings: 75000,
      monthlyEarnings: 12500
    },
    {
      id: 'V002',
      plateNumber: 'MH-12-CD-5678',
      type: 'Van',
      model: 'Mahindra Bolero Pickup',
      year: 2021,
      capacity: '1 Ton',
      status: 'Maintenance',
      driver: 'Jane Smith',
      driverId: 'D002',
      lastService: new Date('2024-08-20'),
      nextService: new Date('2024-11-20'),
      fuelType: 'Diesel',
      insurance: {
        provider: 'ICICI Lombard',
        expiryDate: new Date('2025-01-15'),
        policyNumber: 'INS654321'
      },
      registration: {
        expiryDate: new Date('2025-06-25'),
        rcNumber: 'RC345678'
      },
      totalTrips: 98,
      totalEarnings: 48000,
      monthlyEarnings: 8000
    },
    {
      id: 'V003',
      plateNumber: 'MH-12-EF-9012',
      type: 'Truck',
      model: 'Ashok Leyland Dost',
      year: 2019,
      capacity: '2 Tons',
      status: 'Active',
      driver: 'Mike Johnson',
      driverId: 'D003',
      lastService: new Date('2024-09-10'),
      nextService: new Date('2024-12-10'),
      fuelType: 'Diesel',
      insurance: {
        provider: 'Bajaj Allianz',
        expiryDate: new Date('2025-05-30'),
        policyNumber: 'INS987654'
      },
      registration: {
        expiryDate: new Date('2025-04-18'),
        rcNumber: 'RC901234'
      },
      totalTrips: 203,
      totalEarnings: 95000,
      monthlyEarnings: 15800
    }
  ];

  filterStatus = '';
  filterType = '';
  searchTerm = '';
  selectedVehicle: any = null;
  showAddVehicleModal = false;
  showVehicleDetails = false;

  constructor() { }

  ngOnInit(): void {
    console.log('Vehicles component initialized');
  }

  get filteredVehicles() {
    return this.vehicles.filter(vehicle => {
      const matchesStatus = !this.filterStatus || vehicle.status.toLowerCase() === this.filterStatus.toLowerCase();
      const matchesType = !this.filterType || vehicle.type.toLowerCase() === this.filterType.toLowerCase();
      const matchesSearch = !this.searchTerm || 
        vehicle.plateNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        vehicle.driver.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesStatus && matchesType && matchesSearch;
    });
  }

  addNewVehicle(): void {
    this.showAddVehicleModal = true;
  }

  editVehicle(vehicleId: string): void {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      this.selectedVehicle = { ...vehicle };
      this.showAddVehicleModal = true;
    }
  }

  deleteVehicle(vehicleId: string): void {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      this.vehicles = this.vehicles.filter(v => v.id !== vehicleId);
      console.log('Vehicle deleted:', vehicleId);
    }
  }

  viewVehicleDetails(vehicleId: string): void {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      this.selectedVehicle = vehicle;
      this.showVehicleDetails = true;
    }
  }

  assignDriver(vehicleId: string): void {
    console.log('Assigning driver to vehicle:', vehicleId);
  }

  scheduleService(vehicleId: string): void {
    console.log('Scheduling service for vehicle:', vehicleId);
  }

  trackVehicle(vehicleId: string): void {
    console.log('Tracking vehicle:', vehicleId);
  }

  closeModal(): void {
    this.showAddVehicleModal = false;
    this.showVehicleDetails = false;
    this.selectedVehicle = null;
  }

  saveVehicle(): void {
    // Implementation for saving vehicle data
    console.log('Saving vehicle data:', this.selectedVehicle);
    this.closeModal();
  }

  getDaysUntilExpiry(expiryDate: Date): number {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getExpiryStatus(expiryDate: Date): string {
    const days = this.getDaysUntilExpiry(expiryDate);
    if (days <= 0) return 'expired';
    if (days <= 30) return 'warning';
    return 'valid';
  }

}