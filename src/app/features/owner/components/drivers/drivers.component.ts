import { Component, OnInit } from '@angular/core';
import { OwnerService } from '../../../owner/owner.service';
import { DriverService } from '../../../driver/driver.service';
import { VehicleService } from '../../../vehicle/vehicle.service';
import { MatDialog } from '@angular/material/dialog';
import { ColDef } from 'ag-grid-community';
import { AssignVehicleComponent } from '../../../form/assign-vehicle/assign-vehicle.component';
import { HttpErrorResponse } from '@angular/common/http';
import { DriverFormComponent } from '../../../form/driver-form/driver-form.component'; 

@Component({
  selector: 'app-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.scss']
})
export class DriversComponent implements OnInit {
  public isLoading = false;
  public driversForGrid: any[] = [];
  public gridApi: any;
  public gridColumnApi: any;
  public ownerId: string = '';
  public searchValue: string = '';

  // Alert and confirmation properties
  public showCustomMessage: boolean = false;
  public customMessage: string = '';
  public customMessageIsError: boolean = false;
  public showCustomConfirm: boolean = false;
  public confirmMessage: string = '';

  columnDefs: ColDef[] = [
    { headerName: 'S.No.', field: '_sNo', width: 100 },
    { headerName: 'First Name', field: 'firstName', width: 150 },
    { headerName: 'Last Name', field: 'lastName', width: 150 },
    { headerName: 'Email', field: 'email', width: 250 },
    { headerName: 'Phone', field: 'phoneNumber', width: 110 },
    { headerName: 'Status', field: 'status', width: 150 },
    {
      headerName: 'Current Vehicle',
      field: 'assignedVehicleInfo',
      width: 400
    },
    {
      headerName: 'Actions',
      colId: 'Actions',
      cellRenderer: (params: any) => {
        const eGui = document.createElement('div');
        eGui.className = 'd-flex gap-1';

        // Assign/Unassign Vehicle button
        if (params.data.assignedVehicleInfo && params.data.assignedVehicleInfo !== "N/A") {
          const removeBtn = document.createElement('button');
          removeBtn.innerHTML = '<i class="bi bi-car-front"></i>';
          removeBtn.className = 'btn btn-sm btn-danger';
          removeBtn.title = 'Remove Vehicle Assignment';
          removeBtn.addEventListener('click', () => this.removeVehicleAssignment(params.data));
          eGui.appendChild(removeBtn);
        } else {
          const assignBtn = document.createElement('button');
          assignBtn.innerHTML = '<i class="bi bi-car-front-fill"></i>';
          assignBtn.className = 'btn btn-sm btn-info';
          assignBtn.title = 'Assign Vehicle';
          assignBtn.addEventListener('click', () => this.openAssignVehicleDialog(params.data));
          eGui.appendChild(assignBtn);
        }

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';
        editBtn.className = 'btn btn-sm btn-primary';
        editBtn.title = 'Edit Driver';
        editBtn.addEventListener('click', () => this.editDriver(params.data));
        eGui.appendChild(editBtn);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.title = 'Delete Driver';
        deleteBtn.addEventListener('click', () => this.deleteDriver(params.data));
        eGui.appendChild(deleteBtn);

        return eGui;
      },
      width: 200,
      pinned: 'right',
      sortable: false,
      filter: false
    }
  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1
  };

  rowClassRules = {
    'inactive-row': (params: any) => params.data.status === 'Inactive'
  };

  constructor(
    private ownerService: OwnerService,
    private driverService: DriverService,
    private vehicleservice: VehicleService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.vehicleservice.getOwnerId().subscribe({
      next: (ownerId) => {
        this.ownerId = ownerId;
        this.fetchDriversForOwner(ownerId);
      },
      error: (err) => {
        this.isLoading = false;
        this.showError('Error fetching owner information');
        console.error('Error fetching owner ID:', err);
      }
    });
  }

  fetchDriversForOwner(ownerId: string) {
    this.ownerService.getDriversByOwner(ownerId).subscribe({
      next: (drivers) => {
        this.driversForGrid = drivers.map((driver, idx) => ({
          ...driver,
          _sNo: (idx + 1).toString()
        }));
        this.gridApi?.setRowData(this.driversForGrid);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.showError('Failed to load drivers');
        console.error('Error fetching drivers:', err);
      }
    });
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  // Search functionality
  onQuickFilterChanged(event: any) {
    const value = event.target.value;
    this.gridApi?.setQuickFilter(value);
  }

  // Export functionality
  onExportCSV() {
    this.gridApi?.exportDataAsCsv({
      fileName: `drivers_${new Date().toISOString().split('T')[0]}.csv`
    });
  }

  // Vehicle assignment methods
  removeVehicleAssignment(driverData: any): void {
    this.confirmMessage = `Are you sure you want to remove vehicle assignment for ${driverData.firstName} ${driverData.lastName}?`;
    this.showCustomConfirm = true;
    this.pendingAction = () => this.executeRemoveVehicleAssignment(driverData);
  }
private executeRemoveVehicleAssignment(driverData: any): void {
  this.isLoading = true;
  this.driverService.unassignvehicle(driverData.id).subscribe({
    next: () => {
      this.fetchDriversForOwner(this.ownerId);
      this.showSuccess('Vehicle assignment removed successfully');
      this.isLoading = false;
    },
    error: (error: HttpErrorResponse) => {
      this.isLoading = false;
      this.handleUnassignError(error, driverData);
    }
  });
}

private handleUnassignError(error: HttpErrorResponse, driverData: any): void {
  let errorMessage = 'Failed to remove vehicle assignment';
  
  if (error.status === 400) {
    if (driverData.status === 'ON_TRIP') {
      errorMessage = `Cannot unassign vehicle from ${driverData.firstName} ${driverData.lastName} who is currently on a trip. Please complete the trip first.`;
    } else {
      errorMessage = 'Invalid request. Please try again.';
    }
  } else if (error.status === 404) {
    errorMessage = `Driver ${driverData.firstName} ${driverData.lastName} not found`;
  } else if (error.status === 0) {
    errorMessage = 'Network error. Please check your connection.';
  }
  
  this.showError(errorMessage);
  console.error('Failed to unassign vehicle:', error);
}

  // private executeRemoveVehicleAssignment(driverData: any): void {
  //   this.isLoading = true;
  //   this.driverService.unassignvehicle(driverData.id).subscribe({
  //     next: () => {
  //       this.fetchDriversForOwner(this.ownerId);
  //       this.showSuccess('Vehicle assignment removed successfully');
  //       this.isLoading = false;
  //     },
  //     error: (err) => {
  //       this.isLoading = false;
  //       this.showError('Failed to remove vehicle assignment');
  //       console.error('Failed to unassign vehicle:', err);
  //     }
  //   });
  // }

  openAssignVehicleDialog(driverData: any): void {
    this.vehicleservice.getvehiclesbyOwner(this.ownerId).subscribe({
      next: (vehicles) => {
        const dialogRef = this.dialog.open(AssignVehicleComponent, {
          width: '500px',
          data: {
            driver: driverData,
            vehicles: vehicles
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result?.success) {
            this.fetchDriversForOwner(this.ownerId);
            this.showSuccess('Vehicle assigned successfully');
          }
        });
      },
      error: (err) => {
        this.showError('Failed to fetch available vehicles');
        console.error('Failed to fetch vehicle list for assignment.', err);
      }
    });
  }

  // Driver management methods
initiateAddDriver() {
  const dialogRef = this.dialog.open(DriverFormComponent, {
    width: '600px',
    disableClose: true,
    data: { ownerId: this.ownerId }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.isLoading = true;
      this.createNewDriver(result);
    }
  });
}

private createNewDriver(driverData: any) {
  // Add ownerId to the driver data
  const driverPayload = {
    ...driverData,
    ownerId: this.ownerId
  };

  this.ownerService.createDriver(driverPayload).subscribe({
    next: (newDriver) => {
      this.fetchDriversForOwner(this.ownerId);
      this.showSuccess('Driver added successfully');

      this.isLoading = false;
    },
    error: (error: HttpErrorResponse) => {
      this.isLoading = false;
      this.handleCreateDriverError(error);
    }
  });
}

private handleCreateDriverError(error: HttpErrorResponse) {
  let errorMessage = 'Failed to create driver';
  
  if (error.status === 400) {
    if (error.error && typeof error.error === 'object') {
      // Handle validation errors
      const validationErrors = Object.values(error.error).join(', ');
      errorMessage = `Validation errors: ${validationErrors}`;
    } else if (error.error && typeof error.error === 'string') {
      errorMessage = error.error;
    } else {
      errorMessage = 'Invalid data provided. Please check all fields.';
    }
  } else if (error.status === 409) {
    errorMessage = 'Driver with this email or phone number already exists';
  } else if (error.status === 0) {
    errorMessage = 'Network error. Please check your connection.';
  }
  
  this.showError(errorMessage);
  console.error('Failed to create driver:', error);
}


  editDriver(driverData: any) {
    // Implement edit driver functionality
    console.log('Edit driver:', driverData);
    this.showSuccess('Edit driver functionality coming soon');
  }

  deleteDriver(driverData: any) {
    this.confirmMessage = `Are you sure you want to delete driver ${driverData.firstName} ${driverData.lastName}? This action cannot be undone.`;
    this.showCustomConfirm = true;
    this.pendingAction = () => this.executeDeleteDriver(driverData);
  }

  private executeDeleteDriver(driverData: any) {
    // Implement delete driver API call
    console.log('Delete driver:', driverData);
    this.showSuccess('Delete driver functionality coming soon');
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
