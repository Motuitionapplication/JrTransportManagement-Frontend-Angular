<<<<<<< HEAD
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { VehicleFormComponent } from '../../../form/vehicle-form/vehicle-form.component';
import { VehicleService } from '../../../vehicle/vehicle.service';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';
=======
import { Component, OnInit } from '@angular/core';
>>>>>>> JRT_ANGULAR_01

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit {
<<<<<<< HEAD
  
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
    // {
    //   headerName: 'Year',
    //   field: 'year',
    //   width: 80, // Reduced from 100 to 80
    //   maxWidth: 90, // Add max width
    //   minWidth: 70, // Add min width
    //   flex: 0, // Disable flex for fixed width
    //   type: 'numericColumn',
    //   cellStyle: { textAlign: 'center' } // Center align the year
    // },
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

  // Load vehicles data
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

  // Fetch vehicles by owner
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

  // Load sample data for demonstration
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

  // ENHANCED DELETE FUNCTIONALITY - Replace existing deleteVehicle method
  deleteVehicle(vehicleData: any): void {
    console.log('Delete vehicle requested:', vehicleData);
    
    // Validate vehicle data
    if (!vehicleData || !vehicleData.id) {
      this.showError('Invalid vehicle data. Cannot delete.');
      return;
    }

    // Optional: Check if vehicle can be deleted
    if (vehicleData.status === 'IN_TRANSIT') {
      this.showError('Cannot delete vehicle that is currently in transit. Please wait for the trip to complete.');
      return;
    }

    // Show confirmation dialog with detailed information
    this.confirmMessage = `Are you sure you want to delete the following vehicle?
    
Vehicle Number: ${vehicleData.vehicleNumber}
Type: ${vehicleData.vehicleType || 'N/A'}
Manufacturer: ${vehicleData.manufacturer || 'N/A'}
Model: ${vehicleData.model || 'N/A'}

⚠️ This action cannot be undone and will permanently remove all vehicle data including documents and booking history.`;

    this.showCustomConfirm = true;
    this.pendingAction = () => this.executeDeleteVehicle(vehicleData);
  }

  // ENHANCED Execute Delete with Real API Integration
  private executeDeleteVehicle(vehicleData: any): void {
    console.log('Executing delete for vehicle:', vehicleData);
    
    // Show loading state
    this.isLoading = true;
    if (this.gridApi) {
      this.gridApi.showLoadingOverlay();
    }

    // Call the real API - Replace with actual API call when ready
    this.vehicleService.deleteVehicle(vehicleData.id).subscribe({
      next: (response) => {
        console.log('✅ Vehicle deleted successfully from backend:', response);
        this.isLoading = false;
        
        // Hide loading overlay
        if (this.gridApi) {
          this.gridApi.hideOverlay();
        }
        
        // Show success message with vehicle details
        this.showSuccess(`Vehicle "${vehicleData.vehicleNumber}" has been deleted successfully`);
        
        // Refresh data from backend to ensure consistency
        if (this.ownerId) {
          console.log('Refreshing vehicle list after delete...');
          this.fetchVehiclesByOwner(this.ownerId);
        } else {
          // Fallback: remove from local grid data
          this.removeVehicleFromGrid(vehicleData.id);
        }
      },
      error: (error) => {
        console.error('❌ Error deleting vehicle:', error);
        this.isLoading = false;
        
        // Hide loading overlay
        if (this.gridApi) {
          this.gridApi.hideOverlay();
        }
        
        // Handle different error scenarios with specific messages
        this.handleDeleteError(error, vehicleData);
      }
    });

    // TEMPORARY: For demo purposes, if API is not ready, use local deletion
    // Remove this setTimeout when API is integrated
    /*
    setTimeout(() => {
      console.log('Demo: Deleting vehicle locally');
      this.isLoading = false;
      if (this.gridApi) {
        this.gridApi.hideOverlay();
      }
      this.removeVehicleFromGrid(vehicleData.id);
      this.showSuccess(`Vehicle "${vehicleData.vehicleNumber}" deleted successfully (Demo mode)`);
    }, 1000);
    */
  }

  // Enhanced Error Handling for Delete Operations
  private handleDeleteError(error: any, vehicleData: any): void {
    let errorMessage = 'Failed to delete vehicle. Please try again.';
    let errorTitle = 'Delete Failed';
    
    console.error('Delete error details:', error);
    
    switch (error.status) {
      case 401:
        errorTitle = 'Authentication Required';
        errorMessage = 'Your session has expired. Please log in again to delete vehicles.';
        break;
        
      case 403:
        errorTitle = 'Permission Denied';
        errorMessage = 'You do not have permission to delete this vehicle. Contact your administrator.';
        break;
        
      case 404:
        errorTitle = 'Vehicle Not Found';
        errorMessage = `Vehicle "${vehicleData.vehicleNumber}" not found. It may have been deleted already.`;
        // Remove from local grid since it doesn't exist on server
        this.removeVehicleFromGrid(vehicleData.id);
        break;
        
      case 400:
        errorTitle = 'Cannot Delete';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else {
          errorMessage = 'Cannot delete vehicle. It may have active bookings or assignments.';
        }
        break;
        
      case 409:
        errorTitle = 'Conflict';
        errorMessage = 'Vehicle has dependent records and cannot be deleted. Please remove all bookings first.';
        break;
        
      case 500:
        errorTitle = 'Server Error';
        errorMessage = 'Internal server error occurred. Please try again later or contact support.';
        break;
        
      case 0:
        errorTitle = 'Connection Error';
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        break;
        
      default:
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        break;
    }
    
    // Show detailed error message
    this.showError(`${errorTitle}: ${errorMessage}`);
  }

  // Helper method to remove vehicle from local grid (fallback)
  private removeVehicleFromGrid(vehicleId: string): void {
    console.log('Removing vehicle from local grid:', vehicleId);
    
    const initialCount = this.vehiclesForGrid.length;
    this.vehiclesForGrid = this.vehiclesForGrid.filter(vehicle => vehicle.id !== vehicleId);
    
    if (this.vehiclesForGrid.length < initialCount) {
      console.log('Vehicle removed from local grid');
      
      // Update serial numbers
      this.vehiclesForGrid.forEach((vehicle, index) => {
        vehicle._sNo = index + 1;
      });
      
      // Update grid display
      this.updateGridData();
    } else {
      console.log('Vehicle not found in local grid');
    }
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
  // Validate Registration Number
onValidateRegistrationNumber(): void {
  const regControl = this.vehicleForm.get('documents.registration.number');
  const regNumber = regControl?.value;

  if (!regNumber) {
    this.showError('Enter a registration number before validation.');
    return;
  }

  this.isFormLoading = true;
  this.vehicleService.validateRegistrationNumber(regNumber).subscribe({
    next: (response) => {
      this.isFormLoading = false;
      if (response && response.data?.ownerName) {
        this.showSuccess(`Registration valid: Owned by ${response.data.ownerName}`);
        // Auto-fill vehicle info if available from API
        this.vehicleForm.patchValue({
          basicInfo: {
            manufacturer: response.data.maker || '',
            model: response.data.model || '',
            year: response.data.mfgYear || ''
          }
        });
      } else {
        this.showError('Registration number could not be verified.');
      }
    },
    error: (error) => {
      this.isFormLoading = false;
      this.showError(error.message || 'Vehicle number invalid or not found.');
    }
  });
}

// Validate Insurance Policy Number
onValidateInsurancePolicy(): void {
  const policyControl = this.vehicleForm.get('documents.insurance.number');
  const policyNumber = policyControl?.value;

  if (!policyNumber) {
    this.showError('Enter an insurance policy number before validation.');
    return;
  }

  this.isFormLoading = true;
  this.vehicleService.validateInsurancePolicy(policyNumber).subscribe({
    next: (response) => {
      this.isFormLoading = false;
      if (response && response.valid_till) {
        this.showSuccess(`Policy active till ${response.valid_till}`);
        this.vehicleForm.patchValue({
          documents: { insurance: { expiryDate: response.valid_till } }
        });
      } else {
        this.showError('Insurance policy could not be verified.');
      }
    },
    error: (error) => {
      this.isFormLoading = false;
      this.showError(error.message || 'Invalid insurance policy number.');
    }
  });
}

}
=======

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
>>>>>>> JRT_ANGULAR_01
