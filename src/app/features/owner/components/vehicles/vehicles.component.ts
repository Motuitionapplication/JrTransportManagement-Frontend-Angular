import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VehicleFormComponent } from '../../../form/vehicle-form/vehicle-form.component';
import { VehicleService } from '../../../vehicle/vehicle.service';
import { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit {
  public isLoading = false;
  public vehiclesForGrid: any[] = [];
  public gridApi: any;
  public gridColumnApi: any;
  public ownerId: string | null = null;
  public searchValue: string = '';

  // Custom overlay templates
  public loadingTemplate = `
    <div class="custom-loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  `;

  public noRowsTemplate = `
    <div class="custom-no-rows-overlay">
      <span>No Rows To Show</span>
    </div>
  `;

  // Alert and confirmation properties
  public showCustomMessage: boolean = false;
  public customMessage: string = '';
  public customMessageIsError: boolean = false;
  public showCustomConfirm: boolean = false;
  public confirmMessage: string = '';

  columnDefs: ColDef[] = [
    { 
      headerName: 'S.No.', 
      field: '_sNo', 
      width: 80,
      sortable: false,
      filter: false
    },
    { 
      headerName: 'Vehicle Number', 
      field: 'vehicleNumber', 
      width: 180
    },
    { 
      headerName: 'Type', 
      field: 'vehicleType', 
      width: 120
    },
    { 
      headerName: 'Manufacturer', 
      field: 'manufacturer', 
      width: 150
    },
    { 
      headerName: 'Model', 
      field: 'model', 
      width: 130
    },
    { 
      headerName: 'Year', 
      field: 'year', 
      width: 100
    },
    { 
      headerName: 'Capacity (Tons)', 
      field: 'capacity', 
      width: 160
    },
    { 
      headerName: 'Status', 
      field: 'status', 
      width: 120,
      cellRenderer: (params: any) => {
        const status = params.value || 'AVAILABLE';
        return `<span class="status-badge ${status.toLowerCase()}">${status}</span>`;
      }
    },
    {
      headerName: 'Actions',
      colId: 'Actions',
      width: 150,
      sortable: false,
      filter: false,
      // Use hide property to exclude from export instead of suppressExport
      hide: false,
      cellRenderer: (params: any) => {
        const eGui = document.createElement('div');
        eGui.className = 'action-buttons-container';

        // Assign Vehicle button (Truck icon)
        const assignBtn = document.createElement('button');
        assignBtn.innerHTML = '<i class="fas fa-truck"></i>';
        assignBtn.className = 'action-btn assign-btn';
        assignBtn.title = 'Assign Vehicle';
        assignBtn.addEventListener('click', () => this.assignVehicle(params.data));
        eGui.appendChild(assignBtn);

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.className = 'action-btn edit-btn';
        editBtn.title = 'Edit Vehicle';
        editBtn.addEventListener('click', () => this.editVehicle(params.data));
        eGui.appendChild(editBtn);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.title = 'Delete Vehicle';
        deleteBtn.addEventListener('click', () => this.deleteVehicle(params.data));
        eGui.appendChild(deleteBtn);

        return eGui;
      }
    }
  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: false,
    flex: 1
  };

  constructor(
    private dialog: MatDialog,
    private vehicleService: VehicleService,
  ) { }

  ngOnInit(): void {
    console.log('VehiclesComponent initialized');
    this.isLoading = true;
    this.loadVehicles();
  }

  loadVehicles() {
    // Show loading overlay first
    setTimeout(() => {
      if (this.gridApi) {
        this.gridApi.showLoadingOverlay();
      }
    });

    this.vehicleService.getOwnerId().subscribe({
      next: (id) => {
        this.ownerId = id;
        console.log('Owner ID:', id);
        this.fetchVehiclesByOwner(id);
      },
      error: (err) => {
        console.error('Error getting owner ID:', err);
        this.isLoading = false;
        // Show sample data for demonstration
        this.loadSampleData();
        if (this.gridApi) {
          this.gridApi.hideOverlay();
        }
      }
    });
  }

  // Sample data for demonstration
  loadSampleData() {
    this.vehiclesForGrid = [
      {
        id: '1',
        _sNo: 1,
        vehicleNumber: 'MH 12 AB 1234',
        vehicleType: 'TRUCK',
        manufacturer: 'Tata Motors',
        model: 'Tata LPT 1613',
        year: 2018,
        capacity: 12.5,
        status: 'AVAILABLE'
      },
      {
        id: '2',
        _sNo: 2,
        vehicleNumber: 'MH 14 CD 5678',
        vehicleType: 'TRUCK',
        manufacturer: 'Mahindra',
        model: 'Blazo X 28',
        year: 2020,
        capacity: 16.2,
        status: 'ASSIGNED'
      },
      {
        id: '3',
        _sNo: 3,
        vehicleNumber: 'KA 05 EF 9012',
        vehicleType: 'TRUCK',
        manufacturer: 'Ashok Leyland',
        model: 'Dost Strong',
        year: 2019,
        capacity: 8.5,
        status: 'MAINTENANCE'
      }
    ];
    this.isLoading = false;
  }

  fetchVehiclesByOwner(ownerId: string) {
    this.vehicleService.getvehiclesbyOwner(ownerId).subscribe({
      next: (vehicles) => {
        this.vehiclesForGrid = vehicles.map((vehicle, idx) => ({
          ...vehicle,
          _sNo: idx + 1,
          status: vehicle.status || 'AVAILABLE'
        }));
        console.log('Vehicles list:', this.vehiclesForGrid);
        this.isLoading = false;
        
        // Hide loading overlay
        if (this.gridApi) {
          this.gridApi.hideOverlay();
        }
      },
      error: (err) => {
        console.error('Error fetching vehicles:', err);
        this.isLoading = false;
        // Show sample data as fallback
        this.loadSampleData();
        
        // Hide loading overlay
        if (this.gridApi) {
          this.gridApi.hideOverlay();
        }
      }
    });
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    
    // Show loading overlay when grid is ready
    if (this.isLoading) {
      this.gridApi.showLoadingOverlay();
    }
  }

  // Search functionality
  onQuickFilterChanged() {
    this.gridApi?.setQuickFilter(this.searchValue);
  }

  // Export functionality - CSV Export (Community Edition)
  exportToCSV() {
    if (this.gridApi) {
      // Get column keys excluding Actions column
      const columnKeys = this.columnDefs
        .filter(col => col.colId !== 'Actions' && col.headerName !== 'Actions')
        .map(col => col.field)
        .filter(field => field); // Remove undefined values

      const params = {
        fileName: `vehicles_${new Date().toISOString().split('T')[0]}.csv`,
        skipColumnHeaders: false,
        suppressQuotes: false,
        columnSeparator: ',',
        columnKeys: columnKeys, // Only export specific columns
        processCellCallback: (params: any) => {
          // Format status values for CSV export
          if (params.column.getColId() === 'status') {
            return params.value ? params.value.toUpperCase() : 'AVAILABLE';
          }
          // Format capacity with unit
          if (params.column.getColId() === 'capacity') {
            return params.value ? `${params.value} Tons` : '';
          }
          return params.value;
        },
        processHeaderCallback: (params: any) => {
          // Customize headers for export
          return params.column.getColDef().headerName || params.column.getColId();
        }
      };
      
      this.gridApi.exportDataAsCsv(params);
      this.showSuccess('Vehicle data exported to CSV successfully!');
    } else {
      this.showError('Grid not ready for export. Please try again.');
    }
  }

  openAddVehicleDialog(): void {
    const dialogRef = this.dialog.open(VehicleFormComponent, {
      width: '600px',
      data: { ownerId: this.ownerId }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('New vehicle added:', result);
        this.showSuccess('Vehicle added successfully');
        if (this.ownerId) {
          this.fetchVehiclesByOwner(this.ownerId);
        }
      }
    });
  }

  assignVehicle(vehicleData: any) {
    console.log('Assign vehicle:', vehicleData);
    this.showSuccess('Vehicle assignment feature coming soon!');
  }

  editVehicle(vehicleData: any) {
    const dialogRef = this.dialog.open(VehicleFormComponent, {
      width: '600px',
      data: {
        mode: 'edit',
        vehicle: vehicleData,
        ownerId: this.ownerId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showSuccess('Vehicle updated successfully');
        if (this.ownerId) {
          this.fetchVehiclesByOwner(this.ownerId);
        }
      }
    });
  }

  deleteVehicle(vehicleData: any) {
    this.confirmMessage = `Are you sure you want to delete vehicle "${vehicleData.vehicleNumber}"? This action cannot be undone.`;
    this.showCustomConfirm = true;
    this.pendingAction = () => this.executeDeleteVehicle(vehicleData);
  }

  private executeDeleteVehicle(vehicleData: any) {
    if (this.ownerId) {
      this.vehicleService.deleteVehicle(vehicleData.id).subscribe({
        next: () => {
          console.log('Vehicle deleted successfully');
          this.showSuccess('Vehicle deleted successfully');
          this.fetchVehiclesByOwner(this.ownerId!);
        },
        error: (err) => {
          console.error('Error deleting vehicle', err);
          this.showError('Failed to delete vehicle');
        }
      });
    }
  }

  // Confirmation modal methods
  private pendingAction: (() => void) | null = null;

  onConfirmYes() {
    this.showCustomConfirm = false;
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
  }

  onConfirmNo() {
    this.showCustomConfirm = false;
    this.pendingAction = null;
  }

  // Alert methods
  private showSuccess(message: string) {
    this.customMessage = message;
    this.customMessageIsError = false;
    this.showCustomMessage = true;
    setTimeout(() => {
      this.showCustomMessage = false;
    }, 3000);
  }

  private showError(message: string) {
    this.customMessage = message;
    this.customMessageIsError = true;
    this.showCustomMessage = true;
    setTimeout(() => {
      this.showCustomMessage = false;
    }, 5000);
  }
}
