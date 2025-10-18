import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { VehicleFormComponent } from '../../../form/vehicle-form/vehicle-form.component';
import { VehicleService } from '../../../vehicle/vehicle.service';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit {
  
  // Grid properties
  public isLoading = false;
  public vehiclesForGrid: any[] = [];
  public gridApi!: GridApi;
  public gridColumnApi!: ColumnApi;
  public ownerId: string | null = 'default-owner-123'; // Set default owner ID
  public searchValue: string = '';
  
  // Grid options
  public gridOptions: any = {};
  
  // Progressive Form Properties
  public showAddVehicleForm = false;
  public vehicleForm!: FormGroup;
  public currentStep = 1;
  public totalSteps = 3;
  public isFormLoading = false;
  public formError: string | null = null;

  // Form options
  public vehicleTypes = ['TRUCK', 'VAN', 'TRAILER', 'CONTAINER', 'PICKUP'];
  public statusOptions = ['AVAILABLE', 'IN_TRANSIT', 'MAINTENANCE', 'INACTIVE'];
  
  // Custom overlay templates
  public loadingTemplate = `
    <div class="custom-loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  `;
  
  public noRowsTemplate = `
    <div class="custom-no-rows-overlay">
      No vehicles found
    </div>
  `;

  // Alert and confirmation properties
  public showCustomMessage: boolean = false;
  public customMessage: string = '';
  public customMessageIsError: boolean = false;
  public showCustomConfirm: boolean = false;
  public confirmMessage: string = '';
  private pendingAction: (() => void) | null = null;

  // Column definitions
  columnDefs: ColDef[] = [
{
    headerName: 'S.No.',
    field: '_sNo',
    width: 80,
    sortable: false,
    filter: false,
    pinned: 'left',
    flex: 0 // Don't flex
  },
  {
    headerName: 'Vehicle Number',
    field: 'vehicleNumber',
    width: 180,
    pinned: 'left',
    flex: 0 // Don't flex
  },
  {
    headerName: 'Type',
    field: 'vehicleType',
    width: 120,
    flex: 0 // Don't flex
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
    width: 80,        // Reduced from 100 to 80
    maxWidth: 90,     // Add max width
    minWidth: 70,     // Add min width
    flex: 0,          // Disable flex for fixed width
    type: 'numericColumn',
    cellStyle: { textAlign: 'center' } // Center align the year
  },
  {
    headerName: 'Capacity (Tons)',
    field: 'capacity',
    width: 160,
    type: 'numericColumn',
    valueFormatter: (params: any) => {
      return params.value ? `${params.value} Tons` : '';
    }
  },
    {
      headerName: 'Status',
      field: 'status',
      width: 120,
      cellRenderer: (params: any) => {
        const status = params.value || 'AVAILABLE';
        let statusClass = '';
        
        switch (status.toUpperCase()) {
          case 'AVAILABLE':
            statusClass = 'available';
            break;
          case 'ASSIGNED':
          case 'IN_TRANSIT':
            statusClass = 'assigned';
            break;
          case 'MAINTENANCE':
            statusClass = 'maintenance';
            break;
          default:
            statusClass = 'available';
        }
        
        return `<span class="status-badge ${statusClass}">${status}</span>`;
      }
    },
    {
      headerName: 'Actions',
      colId: 'Actions',
      width: 150,
      sortable: false,
      filter: false,
      pinned: 'right',
      cellRenderer: (params: any) => {
        const eGui = document.createElement('div');
        eGui.className = 'action-buttons-container';

        // Assign Vehicle button
        const assignBtn = document.createElement('button');
        assignBtn.innerHTML = '<i class="fas fa-truck-moving"></i>';
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

  // Default column definition
  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100
  };

  constructor(
    private dialog: MatDialog,
    private vehicleService: VehicleService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.initializeGridOptions();
    this.initializeVehicleForm();
  }

  ngOnInit(): void {
    console.log('VehiclesComponent initialized');
    this.isLoading = true;
    this.loadVehicles();
  }

  // Initialize grid options
  private initializeGridOptions(): void {
    this.gridOptions = {
      columnDefs: this.columnDefs,
      defaultColDef: this.defaultColDef,
      rowData: this.vehiclesForGrid,
      animateRows: true,
      rowSelection: 'single',
      pagination: true,
      paginationPageSize: 20,
      suppressCellSelection: true,
      enableRangeSelection: false,
      onGridReady: (params: any) => this.onGridReady(params),
      getRowId: (params: any) => params.data.id || params.node.rowIndex.toString()
    };
  }

  // Initialize Vehicle Form
  private initializeVehicleForm(): void {
    this.vehicleForm = this.fb.group({
      // Step 1: Basic Vehicle Information
      basicInfo: this.fb.group({
        vehicleNumber: ['', [Validators.required, Validators.pattern('^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$')]],
        vehicleType: ['', Validators.required],
        manufacturer: ['', Validators.required],
        model: ['', Validators.required],
        year: ['', [Validators.required, Validators.min(1990), Validators.max(new Date().getFullYear())]],
        capacity: ['', [Validators.required, Validators.min(0)]],
        status: ['AVAILABLE', Validators.required]
      }),

      // Step 2: Documents
      documents: this.fb.group({
        registration: this.fb.group({
          number: ['', Validators.required],
          expiryDate: ['', Validators.required],
          documentUrl: ['']
        }),
        insurance: this.fb.group({
          number: ['', Validators.required],
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
          number: ['', Validators.required],
          expiryDate: ['', Validators.required],
          documentUrl: ['']
        }),
        pollution: this.fb.group({
          number: ['', Validators.required],
          expiryDate: ['', Validators.required],
          documentUrl: ['']
        })
      }),

      // Step 3: Fare & Additional Details
      fareAndDetails: this.fb.group({
        fareDetails: this.fb.group({
          perKmRate: ['', [Validators.required, Validators.min(0)]],
          wholeFare: ['', [Validators.required, Validators.min(0)]],
          sharingFare: ['', [Validators.required, Validators.min(0)]],
          gstIncluded: [true],
          movingInsurance: ['', Validators.min(0)]
        }),
        location: this.fb.group({
          currentLatitude: [''],
          currentLongitude: [''],
          currentAddress: ['']
        }),
        nextServiceDate: [''],
        isActive: [true]
      })
    });
  }

  // FIXED: Load vehicles data
  loadVehicles(): void {
    console.log('Loading vehicles...');
    
    // Try to get owner ID first, but fallback to sample data if it fails
    if (this.vehicleService.getOwnerId) {
      this.vehicleService.getOwnerId().subscribe({
        next: (id) => {
          this.ownerId = id;
          console.log('Owner ID retrieved:', id);
          this.fetchVehiclesByOwner(id);
        },
        error: (err) => {
          console.error('Error getting owner ID:', err);
          this.ownerId = 'default-owner-123';
          this.fetchVehiclesByOwner(this.ownerId);
        }
      });
    } else {
      // If getOwnerId method doesn't exist, try to fetch with default owner or load sample data
      console.log('getOwnerId method not available, trying with default owner...');
      this.ownerId = 'default-owner-123';
      this.fetchVehiclesByOwner(this.ownerId);
    }
  }

  // FIXED: Fetch vehicles by owner
  fetchVehiclesByOwner(ownerId: string): void {
    console.log('Fetching vehicles for owner:', ownerId);
    
    this.vehicleService.getvehiclesbyOwner(ownerId).subscribe({
      next: (vehicles) => {
        console.log('Raw vehicles data received:', vehicles);
        
        if (vehicles && Array.isArray(vehicles) && vehicles.length > 0) {
          this.vehiclesForGrid = vehicles.map((vehicle, idx) => ({
            ...vehicle,
            _sNo: idx + 1,
            status: vehicle.status || 'AVAILABLE',
            capacity: parseFloat(vehicle.capacity) || 0
          }));
          
          console.log('Processed vehicles for grid:', this.vehiclesForGrid);
          this.isLoading = false;
          this.updateGridData();
        } else {
          console.log('No vehicles found, loading sample data');
          this.loadSampleData();
        }
      },
      error: (err) => {
        console.error('Error fetching vehicles:', err);
        console.log('API call failed, loading sample data');
        this.loadSampleData();
      }
    });
  }

  // IMPROVED: Load sample data for demonstration
  loadSampleData(): void {
    console.log('Loading sample data...');
    
    this.vehiclesForGrid = [
      {
        id: 'sample_1',
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
        id: 'sample_2',
        _sNo: 2,
        vehicleNumber: 'MH 14 CD 5678',
        vehicleType: 'TRUCK',
        manufacturer: 'Mahindra',
        model: 'Blazo X 28',
        year: 2020,
        capacity: 16.2,
        status: 'IN_TRANSIT'
      },
      {
        id: 'sample_3',
        _sNo: 3,
        vehicleNumber: 'KA 05 EF 9012',
        vehicleType: 'TRUCK',
        manufacturer: 'Ashok Leyland',
        model: 'Dost Strong',
        year: 2019,
        capacity: 8.5,
        status: 'MAINTENANCE'
      },
      {
        id: 'sample_4',
        _sNo: 4,
        vehicleNumber: 'DL 8C A 4567',
        vehicleType: 'VAN',
        manufacturer: 'Force Motors',
        model: 'Traveller',
        year: 2021,
        capacity: 3.5,
        status: 'AVAILABLE'
      },
      {
        id: 'sample_5',
        _sNo: 5,
        vehicleNumber: 'GJ 01 HH 8901',
        vehicleType: 'CONTAINER',
        manufacturer: 'Volvo',
        model: 'FH16',
        year: 2022,
        capacity: 25.0,
        status: 'AVAILABLE'
      }
    ];
    
    this.isLoading = false;
    this.updateGridData();
    console.log('Sample data loaded:', this.vehiclesForGrid);
  }

  // Update grid data
  private updateGridData(): void {
    console.log('Updating grid data...');
    
    if (this.gridApi) {
      console.log('Grid API available, setting row data:', this.vehiclesForGrid);
      this.gridApi.setRowData(this.vehiclesForGrid);
      
      if (this.vehiclesForGrid.length === 0) {
        this.gridApi.showNoRowsOverlay();
      } else {
        this.gridApi.hideOverlay();
      }
      
      // Auto-size columns
      setTimeout(() => {
        if (this.gridApi) {
          this.gridApi.sizeColumnsToFit();
        }
      }, 100);
    } else {
      console.log('Grid API not available yet');
    }
    
    // Force change detection
    this.cdr.detectChanges();
  }

  // Grid ready event handler
  onGridReady(params: any): void {
    console.log('Grid ready event fired');
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    
    // Set data if already loaded
    if (this.vehiclesForGrid.length > 0) {
      console.log('Setting initial data to grid:', this.vehiclesForGrid.length, 'vehicles');
      this.gridApi.setRowData(this.vehiclesForGrid);
      this.gridApi.hideOverlay();
    } else if (this.isLoading) {
      this.gridApi.showLoadingOverlay();
    } else {
      this.gridApi.showNoRowsOverlay();
    }
    
    // Auto-size columns
    this.gridApi.sizeColumnsToFit();
    console.log('Grid ready completed');
  }

  // Search functionality
  onQuickFilterChanged(): void {
    if (this.gridApi) {
      this.gridApi.setQuickFilter(this.searchValue);
    }
  }

  // Export to CSV functionality
  exportToCSV(): void {
    if (!this.gridApi) {
      this.showError('Grid not ready for export. Please try again.');
      return;
    }

    try {
      const columnKeys = this.columnDefs
        .filter(col => col.colId !== 'Actions' && col.headerName !== 'Actions')
        .map(col => col.field)
        .filter((field): field is string => field !== undefined);

      const params = {
        fileName: `vehicles_${new Date().toISOString().split('T')[0]}.csv`,
        skipColumnHeaders: false,
        suppressQuotes: false,
        columnSeparator: ',',
        columnKeys: columnKeys,
        processCellCallback: (params: any) => {
          if (params.column.getColId() === 'status') {
            return params.value ? params.value.toUpperCase() : 'AVAILABLE';
          }
          if (params.column.getColId() === 'capacity') {
            return params.value ? `${params.value}` : '';
          }
          return params.value;
        },
        processHeaderCallback: (params: any) => {
          return params.column.getColDef().headerName || params.column.getColId();
        }
      };

      this.gridApi.exportDataAsCsv(params);
      this.showSuccess('Vehicle data exported to CSV successfully!');
    } catch (error) {
      console.error('Export error:', error);
      this.showError('Failed to export data. Please try again.');
    }
  }

  // Progressive Form Methods
  openAddVehicleForm(): void {
    this.showAddVehicleForm = true;
    this.currentStep = 1;
    this.vehicleForm.reset();
    this.vehicleForm.patchValue({
      basicInfo: { status: 'AVAILABLE' },
      fareAndDetails: { 
        fareDetails: { gstIncluded: true },
        isActive: true 
      }
    });
    this.formError = null;
  }

  closeAddVehicleForm(): void {
    this.showAddVehicleForm = false;
    this.currentStep = 1;
    this.vehicleForm.reset();
    this.formError = null;
  }

  nextStep(): void {
    if (this.isCurrentStepValid()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    } else {
      this.markCurrentStepGroupAsTouched();
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isCurrentStepValid(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.vehicleForm.get('basicInfo')?.valid || false;
      case 2:
        return this.vehicleForm.get('documents')?.valid || false;
      case 3:
        return this.vehicleForm.get('fareAndDetails')?.valid || false;
      default:
        return false;
    }
  }

  markCurrentStepGroupAsTouched(): void {
    switch (this.currentStep) {
      case 1:
        this.vehicleForm.get('basicInfo')?.markAllAsTouched();
        break;
      case 2:
        this.vehicleForm.get('documents')?.markAllAsTouched();
        break;
      case 3:
        this.vehicleForm.get('fareAndDetails')?.markAllAsTouched();
        break;
    }
  }

onSubmitVehicleForm(): void {
  if (this.vehicleForm.valid) {
    this.isFormLoading = true;
    this.formError = null;

    // Prepare payload
    const formValue = this.vehicleForm.value;
    const vehiclePayload = {
      ...formValue.basicInfo,
      ...formValue.documents,
      ...formValue.fareAndDetails,
      owner: { id: this.ownerId }
    };

    console.log('Vehicle payload:', vehiclePayload);

    // ENABLE THIS - Replace the setTimeout with actual API call:
    this.vehicleService.saveVehicle(vehiclePayload).subscribe({
      next: (response) => {
        this.isFormLoading = false;
        this.showSuccess('Vehicle added successfully!');
        this.closeAddVehicleForm();
        if (this.ownerId) {
          this.fetchVehiclesByOwner(this.ownerId);
        }
      },
      error: (error) => {
        this.isFormLoading = false;
        this.formError = 'Failed to add vehicle. Please try again.';
        console.error('Error adding vehicle:', error);
      }
    });
  } else {
    this.markCurrentStepGroupAsTouched();
  }
}

  // Update existing method to use progressive form
  openAddVehicleDialog(): void {
    this.openAddVehicleForm();
  }

  // Vehicle actions
  assignVehicle(vehicleData: any): void {
    console.log('Assign vehicle:', vehicleData);
    this.showSuccess('Vehicle assignment feature coming soon!');
  }

  editVehicle(vehicleData: any): void {
    console.log('Edit vehicle:', vehicleData);
    this.showSuccess('Vehicle edit feature coming soon!');
  }

  deleteVehicle(vehicleData: any): void {
    this.confirmMessage = `Are you sure you want to delete vehicle "${vehicleData.vehicleNumber}"? This action cannot be undone.`;
    this.showCustomConfirm = true;
    this.pendingAction = () => this.executeDeleteVehicle(vehicleData);
  }

  private executeDeleteVehicle(vehicleData: any): void {
    console.log('Deleting vehicle:', vehicleData);
    
    // Remove from sample data
    this.vehiclesForGrid = this.vehiclesForGrid.filter(vehicle => vehicle.id !== vehicleData.id);
    
    // Update serial numbers
    this.vehiclesForGrid.forEach((vehicle, index) => {
      vehicle._sNo = index + 1;
    });
    
    this.updateGridData();
    this.showSuccess('Vehicle deleted successfully');
  }

  // Confirmation modal methods
  onConfirmYes(): void {
    this.showCustomConfirm = false;
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
  }

  onConfirmNo(): void {
    this.showCustomConfirm = false;
    this.pendingAction = null;
  }

  // Alert methods
  private showSuccess(message: string): void {
    this.customMessage = message;
    this.customMessageIsError = false;
    this.showCustomMessage = true;
    setTimeout(() => {
      this.showCustomMessage = false;
    }, 3000);
  }

  private showError(message: string): void {
    this.customMessage = message;
    this.customMessageIsError = true;
    this.showCustomMessage = true;
    setTimeout(() => {
      this.showCustomMessage = false;
    }, 5000);
  }

  // Refresh vehicles data
  refreshData(): void {
    this.isLoading = true;
    if (this.gridApi) {
      this.gridApi.showLoadingOverlay();
    }
    this.loadVehicles();
  }
}
