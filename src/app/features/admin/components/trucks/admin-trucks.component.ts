import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { VehicleService } from 'src/app/services/vehicle.service';
import { Vehicle } from 'src/app/models/vehicle.model';
// For Excel export
import * as XLSX from 'xlsx';
// For PDF export
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatDialog } from '@angular/material/dialog';
import { VehicleDialogComponent } from '../../../Fetched/vehicle-dialog/vehicle-dialog.component';

export interface Truck {
  id: number;
  originalId?: string; // keep reference to Vehicle.id when mapped from backend
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

  // Add a property for trucks if not already declared
  trucks: any[] = [];

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

  loading = false;
  error: string | null = null;

  constructor(private vehicleService: VehicleService, private dialog: MatDialog) { }

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
    this.loading = true;
    this.error = null;
    this.vehicleService.getAllVehicles().subscribe({ next: (list) => {
      if (list && list.length > 0) {
        // Map vehicles to Truck view and filter only trucks
        const trucks = list.filter(v => v.vehicleType === 'truck').map(v => this.mapToTruck(v));
        this.dataSource.data = trucks;
      } else {
        // Fallback to previous mock data if service has no vehicles yet
        console.warn('VehicleService returned no vehicles, using local mock data');
        this.dataSource.data = this.getMockTrucks();
      }
      this.loading = false;
      this.calculateFleetStats();
    }, error: (err) => {
      console.error('Failed to load vehicles', err);
      this.error = 'Failed to load vehicles';
      this.loading = false;
      this.dataSource.data = this.getMockTrucks();
      this.calculateFleetStats();
    } });
  }

  // Map backend Vehicle -> local Truck view
  private mapToTruck(v: Vehicle): Truck {
    return {
      id: Number(v.id) || 0,
      originalId: v.id,
      vehicleNumber: v.vehicleNumber,
      model: v.model,
      brand: v.manufacturer || '',
      year: v.year || new Date().getFullYear(),
      capacity: v.capacity || 0,
      fuelType: (v.fareDetails && v.fareDetails.movingInsurance) ? 'diesel' as any : 'diesel' as any,
      status: (v.status === 'maintenance' ? 'maintenance' : (v.status === 'inactive' ? 'inactive' : 'active')) as any,
      driverId: v.driverId ? Number(v.driverId) : undefined,
      driverName: undefined,
      currentLocation: v.currentLocation ? v.currentLocation.address : undefined,
      lastMaintenanceDate: v.nextServiceDate || new Date(),
      nextMaintenanceDate: v.nextServiceDate || new Date(),
      totalTrips: v.maintenanceHistory ? v.maintenanceHistory.length * 10 : 0,
      totalKilometers: 0,
      fuelEfficiency: v.fareDetails?.perKmRate ? Math.max(8, 100 / v.fareDetails.perKmRate) : 12,
      registrationDate: v.createdAt || new Date(),
      insuranceExpiryDate: v.documents?.insurance?.expiryDate || new Date(),
      permitExpiryDate: v.documents?.permit?.expiryDate || new Date(),
      availabilityStatus: (v.status === 'in_transit' ? 'on-trip' : (v.status === 'available' ? 'available' : 'unavailable')) as any,
      monthlyRevenue: v.fareDetails?.wholeFare || 0
    };
  }

  // Provide the previous mock trucks when backend is empty
  private getMockTrucks(): Truck[] {
    return [
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
      }
    ];
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
    const rows = this.dataSource.data.map(t => ({
      VehicleNumber: t.vehicleNumber,
      Model: `${t.brand} ${t.model}`,
      Year: t.year,
      CapacityTons: t.capacity,
      FuelType: t.fuelType,
      Status: t.status,
      Driver: t.driverName || '',
      Location: t.currentLocation || '',
      MonthlyRevenue: t.monthlyRevenue
    }));

    // Excel
    try {
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(rows);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Fleet');
      XLSX.writeFile(wb, 'fleet.xlsx');
    } catch (err) {
      console.error('Failed to export fleet XLSX', err);
    }

    // PDF
    try {
      const doc = new jsPDF({ unit: 'pt' });
      const head = [Object.keys(rows[0] || {})];
      const body = rows.map(r => Object.values(r));
      autoTable(doc, { head, body, styles: { fontSize: 8 } });
      doc.save('fleet.pdf');
    } catch (err) {
      console.error('Failed to export fleet PDF', err);
    }
  }

  /**
   * Add new truck
   */
  addNewTruck(): void {
    console.log('Adding new truck...');
    // Very small create flow: open a prompt for vehicle number and create a minimal vehicle record
    const vehicleNumber = prompt('Enter vehicle number (eg: MH-12-AB-1234)');
    if (!vehicleNumber) return;
    const payload: Partial<Vehicle> = {
      vehicleNumber,
      vehicleType: 'truck',
      model: 'New Model',
      manufacturer: 'Unknown',
      year: new Date().getFullYear(),
      capacity: 0,
      ownerId: '0',
      documents: {
        registration: { number: '', expiryDate: new Date() },
        insurance: { policyNumber: '', expiryDate: new Date(), provider: '' },
        permit: { number: '', expiryDate: new Date() },
        fitness: { certificateNumber: '', expiryDate: new Date() },
        pollution: { certificateNumber: '', expiryDate: new Date() }
      },
      status: 'available',
      fareDetails: { perKmRate: 0, wholeFare: 0, sharingFare: 0, gstIncluded: false, movingInsurance: 0 },
      maintenanceHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    } as any;

    this.vehicleService.createVehicle(payload as any).subscribe({ next: (v) => {
      alert('Truck created');
      this.loadTrucks();
    }, error: (err) => { console.error('Failed to create vehicle', err); alert('Failed to create truck'); } });
  }

  // Updated onAddTruck method with proper type annotations
  onAddTruck(): void {
    const dialogRef = this.dialog.open(VehicleDialogComponent, {
      width: '400px',
      data: {} // Pass any default data if needed
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.vehicleService.addTruck(result).subscribe(
          (res: any) => {
            this.trucks.push(res);
            // Optionally show a success message
            console.log('Truck added successfully');
          },
          (error: any) => {
            console.error('Error adding truck:', error);
            alert('Failed to add truck');
          }
        );
      }
    });
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
    const newModel = prompt('Enter new model name', truck.model);
    if (!newModel) return;
    // update via service if originalId available
    if (truck.originalId) {
      this.vehicleService.updateVehicle(truck.originalId, { model: newModel }).subscribe({ next: () => { alert('Updated'); this.loadTrucks(); }, error: (err) => { console.error(err); alert('Update failed'); } });
    } else {
      // fallback: update local dataSource
      const idx = this.dataSource.data.findIndex(t => t.id === truck.id);
      if (idx >= 0) { this.dataSource.data[idx].model = newModel; this.dataSource._updateChangeSubscription(); }
    }
  }

  /**
   * Delete truck
   */
  deleteTruck(truck: Truck): void {
    console.log('Deleting truck:', truck);
    if (!confirm(`Delete truck ${truck.vehicleNumber}?`)) return;
    if (truck.originalId) {
      this.vehicleService.deleteVehicle(truck.originalId).subscribe({ next: (ok) => { if (ok) { alert('Deleted'); this.loadTrucks(); } else { alert('Delete failed'); } }, error: (err) => { console.error(err); alert('Delete failed'); } });
    } else {
      this.dataSource.data = this.dataSource.data.filter(t => t.id !== truck.id);
      this.calculateFleetStats();
    }
  }

  /**
   * Assign driver to truck
   */
  assignDriver(truck: Truck): void {
    console.log('Assigning driver to truck:', truck);
    const driverId = prompt('Enter driver ID to assign');
    if (!driverId) return;
    // This demo just updates the local truck or calls vehicleService
    if (truck.originalId) {
      this.vehicleService.updateVehicle(truck.originalId, { driverId }).subscribe({ next: () => { alert('Driver assigned'); this.loadTrucks(); }, error: (err) => { console.error(err); alert('Assign failed'); } });
    } else {
      const idx = this.dataSource.data.findIndex(t => t.id === truck.id);
      if (idx >= 0) { this.dataSource.data[idx].driverId = Number(driverId); this.dataSource._updateChangeSubscription(); }
    }
  }

  /**
   * Schedule maintenance
   */
  scheduleMaintenance(truck: Truck): void {
    console.log('Scheduling maintenance for:', truck);
    const dateStr = prompt('Enter next maintenance date (YYYY-MM-DD)');
    if (!dateStr) return;
    const next = new Date(dateStr);
    if (truck.originalId) {
      this.vehicleService.updateVehicle(truck.originalId, { nextServiceDate: next }).subscribe({ next: () => { alert('Maintenance scheduled'); this.loadTrucks(); }, error: (err) => { console.error(err); alert('Failed to schedule'); } });
    } else {
      const idx = this.dataSource.data.findIndex(t => t.id === truck.id);
      if (idx >= 0) { this.dataSource.data[idx].nextMaintenanceDate = next; this.dataSource._updateChangeSubscription(); }
    }
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

  /**
   * Export trucks data
   */
  export(mode: string): void {
    if (mode === 'pdf') {
      this.exportPDF();
    } else if (mode === 'excel') {
      this.exportExcel();
    }
  }

  exportPDF(): void {
    const doc = new jsPDF();
    const head = [['ID', 'Name', 'Plate', 'Status']];
    const body = this.dataSource.data.map(truck => [truck.id, truck.model, truck.vehicleNumber, truck.status]);
    autoTable(doc, { head, body, styles: { fontSize: 8 } });
    doc.save('trucks_report.pdf');
  }

  exportExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data);
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, 'trucks_report.xlsx');
  }
}