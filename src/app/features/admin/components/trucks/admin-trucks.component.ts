import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

export interface Truck {
  id: number;
  vehicleNumber: string;
  model: string;
  brand: string;
  year: number;
  capacity: number; // in tons
  fuelType: 'diesel' | 'petrol' | 'electric' | 'hybrid';
  status: 'active' | 'maintenance' | 'inactive' | 'out-of-service';
  driverId?: number;
  driverName?: string;
  currentLocation?: string;
  lastMaintenanceDate: Date;
  nextMaintenanceDate: Date;
  totalTrips: number;
  totalKilometers: number;
  fuelEfficiency: number; // km per liter
  registrationDate: Date;
  insuranceExpiryDate: Date;
  permitExpiryDate: Date;
  availabilityStatus: 'available' | 'on-trip' | 'maintenance' | 'unavailable';
  monthlyRevenue: number;
}

@Component({
  selector: 'app-admin-trucks',
  templateUrl: './admin-trucks.component.html',
  styleUrls: ['./admin-trucks.component.scss']
})
export class AdminTrucksComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table configuration
  displayedColumns: string[] = ['vehicleNumber', 'model', 'driver', 'status', 'location', 'maintenance', 'trips', 'revenue', 'actions'];
  dataSource = new MatTableDataSource<Truck>();

  // Filter states
  statusFilter: string = 'all';
  availabilityFilter: string = 'all';
  searchQuery: string = '';
  fuelTypeFilter: string = 'all';

  // Fleet statistics
  fleetStats = {
    total: 0,
    active: 0,
    onTrip: 0,
    maintenance: 0,
    totalCapacity: 0,
    monthlyRevenue: 0,
    averageEfficiency: 0
  };

  // Filter options
  statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'out-of-service', label: 'Out of Service' }
  ];

  availabilityOptions = [
    { value: 'all', label: 'All Availability' },
    { value: 'available', label: 'Available' },
    { value: 'on-trip', label: 'On Trip' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'unavailable', label: 'Unavailable' }
  ];

  fuelTypeOptions = [
    { value: 'all', label: 'All Fuel Types' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'petrol', label: 'Petrol' },
    { value: 'electric', label: 'Electric' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.loadTrucks();
    this.calculateFleetStats();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Custom filter predicate
    this.dataSource.filterPredicate = (data: Truck, filter: string): boolean => {
      const searchString = filter.toLowerCase();
      return (
        data.vehicleNumber.toLowerCase().includes(searchString) ||
        data.model.toLowerCase().includes(searchString) ||
        data.brand.toLowerCase().includes(searchString) ||
        (!!data.driverName && data.driverName.toLowerCase().includes(searchString)) ||
        (!!data.currentLocation && data.currentLocation.toLowerCase().includes(searchString))
      );
    };
  }

  /**
   * Load trucks data (replace with actual service call)
   */
  loadTrucks(): void {
    const mockTrucks: Truck[] = [
      {
        id: 1,
        vehicleNumber: 'MH-12-AB-1234',
        model: 'Tata LPT 1109',
        brand: 'Tata Motors',
        year: 2022,
        capacity: 5.5,
        fuelType: 'diesel',
        status: 'active',
        driverId: 101,
        driverName: 'Raj Kumar',
        currentLocation: 'Mumbai Central',
        lastMaintenanceDate: new Date('2024-01-01'),
        nextMaintenanceDate: new Date('2024-04-01'),
        totalTrips: 245,
        totalKilometers: 58420,
        fuelEfficiency: 12.5,
        registrationDate: new Date('2022-03-15'),
        insuranceExpiryDate: new Date('2024-03-14'),
        permitExpiryDate: new Date('2024-12-31'),
        availabilityStatus: 'on-trip',
        monthlyRevenue: 125000
      },
      {
        id: 2,
        vehicleNumber: 'GJ-05-CD-5678',
        model: 'Ashok Leyland Dost',
        brand: 'Ashok Leyland',
        year: 2021,
        capacity: 3.5,
        fuelType: 'diesel',
        status: 'active',
        driverId: 102,
        driverName: 'Suresh Patel',
        currentLocation: 'Ahmedabad',
        lastMaintenanceDate: new Date('2023-12-15'),
        nextMaintenanceDate: new Date('2024-03-15'),
        totalTrips: 189,
        totalKilometers: 42380,
        fuelEfficiency: 14.2,
        registrationDate: new Date('2021-07-10'),
        insuranceExpiryDate: new Date('2024-07-09'),
        permitExpiryDate: new Date('2024-12-31'),
        availabilityStatus: 'available',
        monthlyRevenue: 98500
      },
      {
        id: 3,
        vehicleNumber: 'KA-03-EF-9012',
        model: 'Mahindra Bolero Pickup',
        brand: 'Mahindra',
        year: 2023,
        capacity: 1.5,
        fuelType: 'diesel',
        status: 'maintenance',
        currentLocation: 'Bangalore Service Center',
        lastMaintenanceDate: new Date('2024-01-20'),
        nextMaintenanceDate: new Date('2024-04-20'),
        totalTrips: 156,
        totalKilometers: 28950,
        fuelEfficiency: 16.8,
        registrationDate: new Date('2023-01-25'),
        insuranceExpiryDate: new Date('2025-01-24'),
        permitExpiryDate: new Date('2024-12-31'),
        availabilityStatus: 'maintenance',
        monthlyRevenue: 65200
      },
      {
        id: 4,
        vehicleNumber: 'DL-1C-GH-3456',
        model: 'Eicher Pro 1049',
        brand: 'Eicher Motors',
        year: 2022,
        capacity: 4.99,
        fuelType: 'diesel',
        status: 'active',
        driverId: 103,
        driverName: 'Amit Singh',
        currentLocation: 'New Delhi',
        lastMaintenanceDate: new Date('2023-11-30'),
        nextMaintenanceDate: new Date('2024-02-28'),
        totalTrips: 298,
        totalKilometers: 67230,
        fuelEfficiency: 13.1,
        registrationDate: new Date('2022-05-08'),
        insuranceExpiryDate: new Date('2024-05-07'),
        permitExpiryDate: new Date('2024-12-31'),
        availabilityStatus: 'available',
        monthlyRevenue: 142300
      },
      {
        id: 5,
        vehicleNumber: 'TN-07-IJ-7890',
        model: 'Force Traveller',
        brand: 'Force Motors',
        year: 2020,
        capacity: 2.5,
        fuelType: 'diesel',
        status: 'inactive',
        currentLocation: 'Chennai Depot',
        lastMaintenanceDate: new Date('2023-09-15'),
        nextMaintenanceDate: new Date('2024-01-15'),
        totalTrips: 412,
        totalKilometers: 89640,
        fuelEfficiency: 11.9,
        registrationDate: new Date('2020-11-12'),
        insuranceExpiryDate: new Date('2024-11-11'),
        permitExpiryDate: new Date('2024-12-31'),
        availabilityStatus: 'unavailable',
        monthlyRevenue: 0
      }
    ];

    this.dataSource.data = mockTrucks;
  }

  /**
   * Calculate fleet statistics
   */
  calculateFleetStats(): void {
    const trucks = this.dataSource.data;
    this.fleetStats = {
      total: trucks.length,
      active: trucks.filter(t => t.status === 'active').length,
      onTrip: trucks.filter(t => t.availabilityStatus === 'on-trip').length,
      maintenance: trucks.filter(t => t.status === 'maintenance').length,
      totalCapacity: trucks.reduce((sum, t) => sum + t.capacity, 0),
      monthlyRevenue: trucks.reduce((sum, t) => sum + t.monthlyRevenue, 0),
      averageEfficiency: trucks.length > 0 ? 
        Math.round((trucks.reduce((sum, t) => sum + t.fuelEfficiency, 0) / trucks.length) * 10) / 10 : 0
    };
  }

  /**
   * Apply search filter
   */
  applySearchFilter(): void {
    this.dataSource.filter = this.searchQuery.trim().toLowerCase();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Apply status filter
   */
  applyStatusFilter(): void {
    // Implement filtering logic here
    console.log('Filtering by status:', this.statusFilter);
  }

  /**
   * Apply availability filter
   */
  applyAvailabilityFilter(): void {
    // Implement filtering logic here
    console.log('Filtering by availability:', this.availabilityFilter);
  }

  /**
   * Apply fuel type filter
   */
  applyFuelTypeFilter(): void {
    // Implement filtering logic here
    console.log('Filtering by fuel type:', this.fuelTypeFilter);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.availabilityFilter = 'all';
    this.fuelTypeFilter = 'all';
    this.dataSource.filter = '';
    this.loadTrucks();
  }

  /**
   * Export fleet data
   */
  exportFleetData(): void {
    console.log('Exporting fleet data...');
    // Implement export functionality (CSV, PDF, etc.)
  }

  /**
   * Add new truck
   */
  addNewTruck(): void {
    console.log('Adding new truck...');
    // Open add truck dialog or navigate to form
  }

  /**
   * View truck details
   */
  viewTruck(truck: Truck): void {
    console.log('Viewing truck:', truck);
    // Navigate to truck detail page or open modal
  }

  /**
   * Edit truck
   */
  editTruck(truck: Truck): void {
    console.log('Editing truck:', truck);
    // Navigate to truck edit page or open modal
  }

  /**
   * Delete truck
   */
  deleteTruck(truck: Truck): void {
    console.log('Deleting truck:', truck);
    // Show confirmation dialog and delete truck
  }

  /**
   * Assign driver to truck
   */
  assignDriver(truck: Truck): void {
    console.log('Assigning driver to truck:', truck);
    // Open driver assignment dialog
  }

  /**
   * Schedule maintenance
   */
  scheduleMaintenance(truck: Truck): void {
    console.log('Scheduling maintenance for:', truck);
    // Open maintenance scheduling dialog
  }

  /**
   * Track truck location
   */
  trackTruck(truck: Truck): void {
    console.log('Tracking truck:', truck);
    // Open GPS tracking or location page
  }

  /**
   * View trip history
   */
  viewTripHistory(truck: Truck): void {
    console.log('Viewing trip history for:', truck);
    // Navigate to trip history page
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'maintenance':
        return 'status-maintenance';
      case 'inactive':
        return 'status-inactive';
      case 'out-of-service':
        return 'status-out-of-service';
      default:
        return 'status-unknown';
    }
  }

  /**
   * Get availability badge class
   */
  getAvailabilityClass(availability: string): string {
    switch (availability) {
      case 'available':
        return 'availability-available';
      case 'on-trip':
        return 'availability-on-trip';
      case 'maintenance':
        return 'availability-maintenance';
      case 'unavailable':
        return 'availability-unavailable';
      default:
        return 'availability-unknown';
    }
  }

  /**
   * Format currency display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  /**
   * Format date display
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  /**
   * Check if maintenance is due soon
   */
  isMaintenanceDue(truck: Truck): boolean {
    const today = new Date();
    const daysUntilMaintenance = Math.ceil((truck.nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilMaintenance <= 30; // Due within 30 days
  }

  /**
   * Check if documents are expiring soon
   */
  areDocumentsExpiring(truck: Truck): boolean {
    const today = new Date();
    const insuranceDays = Math.ceil((truck.insuranceExpiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const permitDays = Math.ceil((truck.permitExpiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return insuranceDays <= 30 || permitDays <= 30; // Expiring within 30 days
  }
}