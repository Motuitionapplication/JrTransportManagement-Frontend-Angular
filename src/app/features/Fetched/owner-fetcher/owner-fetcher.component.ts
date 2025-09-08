import { Component, OnInit } from '@angular/core';
import { OwnerService } from '../../owner/owner.service';
import { DriverService } from '../../driver/driver.service';
import { ColDef } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import { DriverFormComponent } from '../../form/driver-form/driver-form.component';
import { OwnerFormComponent } from '../../form/owner-form/owner-form.component';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { AssignVehicleComponent } from '../../form/assign-vehicle/assign-vehicle.component';
import { VehicleService } from '../../vehicle/vehicle.service';
import { VehicleDialogComponent } from '../vehicle-dialog/vehicle-dialog.component';
import { ChangeDetectorRef } from '@angular/core';

// Interface and constant definitions remain the same...
interface DriverWithEdit {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: string;
  isEditing?: boolean;
  editData?: any;
  isDriverRow?: boolean;
  parentOwnerId?: string;
  _sNo?: string;
  isDriverHeaderRow?: boolean;
  isNew?: boolean;
}
const DRIVER_HEADER_ROW_TYPE = 'driver-header';

@Component({
  selector: 'app-owner-fetcher',
  templateUrl: './owner-fetcher.component.html',
  styleUrls: ['./owner-fetcher.component.scss']
})
export class OwnerFetcherComponent implements OnInit {
  public modifiedRows: Set<any> = new Set<any>();
  public isLoading = false;
  public editingRows: Set<string> = new Set<string>();
  public originalRowData: Map<string, any> = new Map<string, any>();
  public ownersForGrid: any[] = [];
  public gridApi: any;
  public gridColumnApi: any;
  public expandedOwnerIds: Set<string> = new Set<string>();
  public showCustomMessage: boolean = false;
  public customMessage: string = '';
  public customMessageIsError: boolean = false;
  public showCustomConfirm: boolean = false;
  public confirmMessage: string = '';
  public confirmCallback: (() => void) | null = null;
  public searchValue: string = '';

  // --- NEW: Class rule to style inactive driver rows ---
  public rowClassRules = {
    'inactive-driver-row': (params: any) => {
      return params.data.isDriverRow && params.data.status === 'INACTIVE';
    }
  };

  public actionsCellRenderer = (params: any) => {
    // Ignore header rows completely
    if (params.data.isDriverHeaderRow) {
      return '';
    }

    const eGui = document.createElement('div');
    const isEditing = this.editingRows.has(params.data.id);

    // --- 1. Handle INACTIVE drivers first ---
    // If a driver is inactive, show a badge and stop. No other buttons are needed.
    if (params.data.isDriverRow && params.data.status === 'INACTIVE') {
      const statusBadge = document.createElement('span');
      statusBadge.className = 'badge bg-secondary';
      statusBadge.innerText = 'Deactivated';
      eGui.appendChild(statusBadge);
      return eGui;
    }

    // --- 2. Handle Edit/Save/Cancel buttons ---
    // This logic applies to both owners and active drivers.
    if (isEditing) {
      const saveBtn = document.createElement('button');
      saveBtn.innerHTML = '<i class="bi bi-check-lg"></i>';
      saveBtn.className = 'btn btn-sm btn-success me-1';
      saveBtn.title = 'Save Changes';
      saveBtn.addEventListener('click', () => this.onSaveEditingRow(params.data));
      eGui.appendChild(saveBtn);

      const cancelBtn = document.createElement('button');
      cancelBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
      cancelBtn.className = 'btn btn-sm btn-danger me-1';
      cancelBtn.title = 'Cancel Edit';
      cancelBtn.addEventListener('click', () => this.onCancelEdit(params.data));
      eGui.appendChild(cancelBtn);
    } else {
      // If NOT editing, show the standard Edit button
      const editBtn = document.createElement('button');
      editBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';
      editBtn.className = 'btn btn-sm btn-primary me-1';
      editBtn.title = 'Edit';
      editBtn.addEventListener('click', () => this.onStartEdit(params.data, params.api, params.rowIndex));
      eGui.appendChild(editBtn);
    }

    // --- 3. Handle action buttons that appear when NOT editing ---
    if (!isEditing) {
      // For ACTIVE drivers, show Assign/Unassign, Deactivate, and Payment buttons
      if (params.data.isDriverRow) {
        // Assign/Unassign Vehicle button
        if (params.data.assignedVehicleInfo && params.data.assignedVehicleInfo !== "N/A") {
          const removeBtn = document.createElement('button');
          removeBtn.innerHTML = '<i class="bi bi-escape"></i>';
          removeBtn.className = 'btn btn-sm btn-danger me-1';
          removeBtn.title = 'Remove Assignment';
          removeBtn.addEventListener('click', () => this.showConfirmation(
            `Remove vehicle assignment from ${params.data.firstName}?`,
            () => this.removeVehicleAssignment(params.data)
          ));
          eGui.appendChild(removeBtn);
        } else {
          const assignBtn = document.createElement('button');
          assignBtn.innerHTML = '<i class="bi bi-plugin"></i>';
          assignBtn.className = 'btn btn-sm btn-info me-1';
          assignBtn.title = 'Assign Vehicle';
          assignBtn.addEventListener('click', () => this.openAssignVehicleDialog(params.data));
          eGui.appendChild(assignBtn);
        }

        // DEACTIVATE button
        const deactivateBtn = document.createElement('button');
        deactivateBtn.innerHTML = '<i class="bi bi-person-x-fill"></i>';
        deactivateBtn.className = 'btn btn-sm btn-danger me-1';
        deactivateBtn.title = 'Deactivate';
        deactivateBtn.addEventListener('click', () => {
          // --- ADD THIS LINE FOR DEBUGGING ---
          console.log('Deactivate button clicked for driver:', params.data.id);

          this.showConfirmation(
            `Deactivate driver ${params.data.firstName}? They won't be available for trips.`,
            () => this.deactivateDriver(params.data.id)
          );
        });
        eGui.appendChild(deactivateBtn);

        // Payment button
        const paymentBtn = document.createElement('button');
        paymentBtn.innerHTML = '<i class="bi bi-cash-coin"></i>';
        paymentBtn.className = 'btn btn-sm btn-warning me-1';
        paymentBtn.title = 'View Payments';
        paymentBtn.addEventListener('click', () => this.driverrecord(params.data));
        eGui.appendChild(paymentBtn);
      }
      // For OWNERS, show Delete and View Vehicles buttons
      else {
        // DELETE button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.className = 'btn btn-sm btn-danger me-1';
        deleteBtn.title = 'Delete';
        deleteBtn.addEventListener('click', () => this.showConfirmation(
          `Delete owner ${params.data.firstName}? This is permanent.`,
          () => this.deleteOwner(params.data.id)
        ));
        eGui.appendChild(deleteBtn);

        // View Vehicles button
        const vehicleBtn = document.createElement('button');
        vehicleBtn.innerHTML = '<i class="bi bi-truck"></i>';
        vehicleBtn.className = 'btn btn-sm btn-warning me-1';
        vehicleBtn.title = 'View Vehicles';
        vehicleBtn.addEventListener('click', () => this.openVehicleDialog(params.data));
        eGui.appendChild(vehicleBtn);
      }
    }

    return eGui;
  };

  constructor(
    private ownerService: OwnerService,
    private driverService: DriverService,
    private vehicleservice: VehicleService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.fetchOwners();
  }

  // --- NEW: Deactivate Driver Method ---
  deactivateDriver(driverId: string) {
    this.isLoading = true;

    const driverData = this.ownersForGrid.find(d => d.id === driverId && d.isDriverRow);

    if (!driverData || !driverData.parentOwnerId) {
      this.showMessage('Could not find driver or owner information to perform deactivation.', true);
      this.isLoading = false;
      return;
    }

    this.driverService.deactivateDriver(driverId, driverData.parentOwnerId).subscribe({
      next: (updatedDriver) => {
        this.showMessage('Driver deactivated successfully.', false);

        const ownerData = this.ownersForGrid.find(o => o.id === driverData.parentOwnerId && !o.isDriverRow);

      if (ownerData && this.expandedOwnerIds.has(ownerData.id)) {
     
        this.toggleRowExpansion(ownerData);
      }
        

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to deactivate driver:', error);
        const errorMessage = error.status === 409
          ? 'Cannot deactivate a driver on an active trip.'
          : 'Failed to deactivate driver.';
        this.showMessage(errorMessage, true);
        this.isLoading = false;
      }
    });
  }

  // --- All other existing methods remain here, only deleteDriver is removed ---
  // ... (onStartEdit, onSaveEditingRow, onCancelEdit, onRefreshClick, etc.)

  // NOTE: The old `deleteDriver` method has been removed.

  // The rest of your component's code...
  onStartEdit(rowData: any, api: any, rowIndex: number): void {
    api.startEditingCell({ rowIndex: rowIndex, colKey: 'firstName' });
  }

  onSaveEditingRow(rowData: any): void {
    this.gridApi.stopEditing();
  }

  onCancelEdit(rowData: any): void {
    const originalData = this.originalRowData.get(rowData.id);
    if (originalData) {
      Object.keys(originalData).forEach(key => {
        rowData[key] = originalData[key];
      });
    }
    this.gridApi.stopEditing(true);
    this.editingRows.delete(rowData.id);
    this.modifiedRows.delete(rowData);
    this.originalRowData.delete(rowData.id);
    const rowIndex = this.ownersForGrid.findIndex(row => row.id === rowData.id);
    if (rowIndex !== -1) {
      this.ownersForGrid[rowIndex] = { ...originalData };
      this.ownersForGrid = [...this.ownersForGrid];
      this.gridApi.setRowData(this.ownersForGrid);
    }
  }

  columnDefs: ColDef[] = [
    {
      headerName: 'Expand For Driver Info',
      headerClass: 'multiline-header',
      width: 105,
      cellRenderer: (params: any) => {
        if (params.data.isDriverHeaderRow) {
          return '';
        }
        if (!params.data.isDriverRow) {
          const isExpanded = this.expandedOwnerIds.has(params.data.id);
          const button = document.createElement('button');
          button.className = 'btn btn-sm btn-outline-secondary p-0 px-1';
          button.innerHTML = isExpanded ? '&#9660;' : '&#9658;';
          button.style.border = 'none';
          button.style.backgroundColor = 'transparent';
          button.style.fontSize = '1.2em';
          button.style.lineHeight = '1';
          button.style.cursor = 'pointer';
          button.addEventListener('click', () => this.toggleRowExpansion(params.data));
          return button;
        }
        return '';
      },
      editable: false,
      sortable: false,
      filter: false,
      resizable: true
    },
    {
      headerName: 'S.No.',
      field: '_sNo',
      width: 65,
      editable: false,
      sortable: true,
      filter: false,
      resizable: true,
      cellClass: (params: any) => {
        if (params.data.isDriverRow) {
          return 'driver-sno-indent';
        }
        if (params.data.isDriverHeaderRow) {
          return 'driver-header-sno';
        }
        return '';
      }
    },
    {
      headerName: 'First Name',
      field: 'firstName',
      editable: (params: any) => !params.data.isDriverHeaderRow,
      resizable: true,
      width: 110,
      cellRenderer: (params: any) => {
        if (params.data.isDriverHeaderRow) {
          const container = document.createElement('div');
          container.style.display = 'flex';
          container.style.justifyContent = 'space-between';
          container.style.alignItems = 'center';
          container.style.width = '80%';
          const text = document.createElement('span');
          text.className = 'driver-header-text';
          text.innerText = `Drivers for ${params.data.ownerName}`;
          const addButton = document.createElement('button');
          addButton.className = 'btn btn-sm btn-outline-success d-flex align-items-center';
          addButton.style.gap = '5px';
          addButton.innerHTML = `<i class="bi-patch-plus-fill"></i> Add`;
          addButton.addEventListener('click', () => this.initiateAddDriver(params.data.parentOwnerId));
          container.appendChild(text);
          container.appendChild(addButton);
          return container;
        }
        return params.value;
      },
      colSpan: (params: any) => {
        if (params.data.isDriverHeaderRow) {
          return 6;
        }
        return 1;
      }
    },
    { headerName: 'Last Name', field: 'lastName', editable: true, resizable: true, width: 110 },
    { headerName: 'Email', field: 'email', editable: true, resizable: true, width: 120 },
    { headerName: 'Phone', field: 'phoneNumber', editable: true, resizable: true, width: 110 },
    { headerName: 'Status', field: 'status', editable: false, resizable: true, width: 80 },
    {
      headerName: 'Current Vehicle',
      width: 120,
      editable: false,
      sortable: false,
      filter: false,
      valueGetter: (params: any) => {
        if (params.data.isDriverRow) {
          return params.data.assignedVehicleInfo;
        }
        return '';
      }
    },
    {
      headerName: 'Actions',
      colId: 'Actions',
      cellRenderer: this.actionsCellRenderer,
      width: 190,
      editable: false,
      pinned: 'right',
      resizable: true,
      sortable: false,
      filter: false
    },
    {
      headerName: 'City',
      valueGetter: (params: any) => params.data.isDriverRow ? '-' : (params.data?.address?.city || '-'),
      editable: false,
      resizable: true
    }
  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  removeVehicleAssignment(driverData: any): void {
    this.isLoading = true;
    this.driverService.unassignvehicle(driverData.id).subscribe({
      next: () => {
        this.ownerService.clearDriversCacheForOwner(driverData.parentOwnerId);
        this.showMessage(`Vehicle unassigned from ${driverData.firstName}.`, false);
        const index = this.ownersForGrid.findIndex(row => row.id === driverData.id && row.isDriverRow);
        if (index !== -1) {
          this.ownersForGrid[index] = {
            ...this.ownersForGrid[index],
            assignedVehicleInfo: "N/A",
            status: "AVAILABLE"
          };
          this.ownersForGrid = [...this.ownersForGrid];
          this.gridApi.setRowData(this.ownersForGrid);
          this.cdr.markForCheck();
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.showMessage('Failed to unassign vehicle.', true);
        console.error(err);
      }
    });
  }

  onRefreshClick(): void {
    this.fetchOwners();
  }

  openAssignVehicleDialog(driverData: any): void {
    const ownerId = driverData.parentOwnerId;
    if (!ownerId) {
      this.showMessage('Could not identify the owner for this driver.', true);
      return;
    }
    this.vehicleservice.getvehiclesbyOwner(ownerId).subscribe({
      next: (vehicles) => {
        const dialogRef = this.dialog.open(AssignVehicleComponent, {
          width: '500px',
          data: {
            driver: driverData,
            vehicles: vehicles
          },
          autoFocus: true,
          restoreFocus: true
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result?.success) {
            this.ownerService.clearDriversCacheForOwner(ownerId);
            this.showMessage(`Vehicle successfully assigned to ${driverData.firstName}.`, false);
            this.refreshDriverData(ownerId);
          }
        });
      },
      error: (err) => {
        this.showMessage('Failed to fetch vehicle list for assignment.', true);
        console.error(err);
      }
    });
  }

  refreshDriverData(ownerId: string): void {
    this.ownerService.getDriversByOwner(ownerId).subscribe({
      next: (drivers) => {
        const allRows = this.gridApi.getRenderedNodes().map((node: any) => node.data);
        const oldDriverRows = allRows.filter((row: any) => row.isDriverRow && row.parentOwnerId === ownerId);
        const ownerRow = allRows.find((row: any) => row.id === ownerId && !row.isDriverRow);
        const ownerSNo = ownerRow ? ownerRow._sNo : '';
        const updatedDriverRows = drivers.map((driver, index) => ({
          ...driver,
          isDriverRow: true,
          parentOwnerId: ownerId,
          _sNo: `${ownerSNo}.${index + 1}`
        }));
        this.gridApi.applyTransaction({
          remove: oldDriverRows,
          add: updatedDriverRows,
        });
      },
      error: (err) => {
        this.showMessage('Could not refresh driver data.', true);
        console.error('Failed to refresh driver data:', err);
      }
    });
  }

  openVehicleDialog(ownerData: any): void {
    this.dialog.open(VehicleDialogComponent, {
      width: '800px',
      data: { ownerId: ownerData.id }
    });
  }

  driverrecord(driverData: any) {
    console.log('Opening payment dialog for driver:', driverData);
    this.dialog.open(PaymentDialogComponent, {
      width: '800px',
      data: { driverId: driverData.id }
    });
  }

  fetchOwners() {
    this.isLoading = true;
    this.ownerService.getAllOwners().subscribe((owners) => {
      this.ownersForGrid = owners.map(owner => ({
        ...owner,
        status: owner.accountStatus
      }));
      this.updateRowSNo();
      this.gridApi?.setRowData(this.ownersForGrid);
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      console.error('Error fetching owners:', error);
      this.showMessage('Failed to load owners.', true);
    });
  }

  private updateRowSNo() {
    let ownerIndex = 0;
    const newOwnersForGrid: any[] = [];
    const originalOwnerOrder = this.ownersForGrid.filter(row => !row.isDriverRow && !row.isDriverHeaderRow).map(owner => owner.id);
    originalOwnerOrder.forEach(ownerId => {
      const owner = this.ownersForGrid.find(row => row.id === ownerId && !row.isDriverRow && !row.isDriverHeaderRow);
      if (owner) {
        ownerIndex++;
        owner._sNo = ownerIndex.toString();
        newOwnersForGrid.push(owner);
        const hasHeaderRow = this.ownersForGrid.some(row => row.isDriverHeaderRow && row.parentOwnerId === owner.id);
        if (this.expandedOwnerIds.has(owner.id)) {
          if (!hasHeaderRow) {
            newOwnersForGrid.push({
              id: `${owner.id}-${DRIVER_HEADER_ROW_TYPE}`,
              isDriverHeaderRow: true,
              parentOwnerId: owner.id,
              ownerName: `${owner.firstName} ${owner.lastName}`
            });
          } else {
            const existingHeader = this.ownersForGrid.find(row => row.isDriverHeaderRow && row.parentOwnerId === owner.id);
            if (existingHeader) {
              newOwnersForGrid.push(existingHeader);
            }
          }
          const driversForThisOwner = this.ownersForGrid.filter(row => row.isDriverRow && row.parentOwnerId === owner.id);
          driversForThisOwner.forEach((driver, driverIdx) => {
            driver._sNo = `${ownerIndex}.${driverIdx + 1}`;
            newOwnersForGrid.push(driver);
          });
        }
      }
    });
    this.ownersForGrid = newOwnersForGrid;
  }

  initiateAddOwner(): void {
    const dialogRef = this.dialog.open(OwnerFormComponent, {
      width: '600px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ownerService.createowner(result).subscribe({
          next: () => {
            this.showMessage('Owner added successfully!', false);
            this.fetchOwners();
          },
          error: (err) => {
            console.error("Error adding owner:", err);
            this.showMessage('Failed to add owner. Please check the details.', true);
          }
        });
      }
    });
  }

  toggleRowExpansion(ownerData: any) {
    const ownerId = ownerData.id;
    const isExpanded = this.expandedOwnerIds.has(ownerId);
    if (isExpanded) {
      this.ownersForGrid = this.ownersForGrid.filter(row =>
        !(row.isDriverRow && row.parentOwnerId === ownerId) &&
        !(row.isDriverHeaderRow && row.parentOwnerId === ownerId)
      );
      this.expandedOwnerIds.delete(ownerId);
      this.updateRowSNo();
      this.gridApi?.setRowData(this.ownersForGrid);
    } else {
      this.isLoading = true;
      this.showMessage('Loading drivers...', false);
      this.ownerService.getDriversByOwner(ownerId).subscribe({
        next: (drivers) => {
          const ownerIndex = this.ownersForGrid.findIndex(row => row.id === ownerId && !row.isDriverRow && !row.isDriverHeaderRow);
          if (ownerIndex === -1) {
            this.isLoading = false;
            return;
          }
          const headerRow = {
            id: `${ownerId}-${DRIVER_HEADER_ROW_TYPE}`,
            isDriverHeaderRow: true,
            parentOwnerId: ownerId,
            ownerName: `${ownerData.firstName} ${ownerData.lastName}`
          };
          if (drivers && drivers.length > 0) {
            const driverRows = drivers.map(driver => ({
              ...driver,
              id: driver.id || driver._id,
              isDriverRow: true,
              parentOwnerId: ownerId,
              status: driver.status || 'Active'
            }));
            this.ownersForGrid.splice(ownerIndex + 1, 0, headerRow, ...driverRows);
            this.showMessage('Drivers loaded.', false);
          } else {
            this.ownersForGrid.splice(ownerIndex + 1, 0, headerRow);
            this.showMessage(`No drivers found for ${ownerData.firstName}. You can add one now.`, false);
          }
          this.expandedOwnerIds.add(ownerId);
          this.updateRowSNo();
          this.gridApi?.setRowData(this.ownersForGrid);
          this.isLoading = false;
        },
        error: (error) => {
          console.error(`Could not fetch drivers for ownerId ${ownerId}, treating as no drivers. Error:`, error);
          const ownerIndex = this.ownersForGrid.findIndex(row => row.id === ownerId && !row.isDriverRow && !row.isDriverHeaderRow);
          if (ownerIndex !== -1) {
            const headerRow = {
              id: `${ownerId}-${DRIVER_HEADER_ROW_TYPE}`,
              isDriverHeaderRow: true,
              parentOwnerId: ownerId,
              ownerName: `${ownerData.firstName} ${ownerData.lastName}`
            };
            this.ownersForGrid.splice(ownerIndex + 1, 0, headerRow);
            this.expandedOwnerIds.add(ownerId);
            this.updateRowSNo();
            this.gridApi?.setRowData(this.ownersForGrid);
            this.showMessage(`No drivers found for ${ownerData.firstName}. You can add one now.`, false);
          }
          this.isLoading = false;
        }
      });
    }
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.getRowClass = (params: any) => {
      if (params.data.isDriverRow) { return 'driver-row-indent'; }
      if (params.data.isDriverHeaderRow) { return 'driver-header-row'; }
      return '';
    };
    this.gridApi.addEventListener('rowEditingStopped', (event: any) => {
      const originalData = this.originalRowData.get(event.data.id);
      const hasChanges = this.hasDataChanged(originalData, event.data);
      if (!hasChanges) {
        this.exitEditMode(event.data);
        return;
      }
      this.isLoading = true;
      this.onSaveRow(event.data);
    });
    this.gridApi.addEventListener('cellEditingStarted', (event: any) => {
      if (!this.editingRows.has(event.data.id)) {
        this.editingRows.add(event.data.id);
        this.originalRowData.set(event.data.id, { ...event.data });
        this.gridApi.refreshCells({
          rowNodes: [event.node],
          columns: ['Actions']
        });
      }
    });
    this.gridApi.addEventListener('cellValueChanged', (event: any) => {
      if (this.editingRows.has(event.data.id)) {
        this.modifiedRows.add(event.node.data);
      }
    });
  }

  private hasDataChanged(original: any, current: any): boolean {
    if (!original) return true;
    const fieldsToCompare = ['firstName', 'lastName', 'email', 'phoneNumber', 'status'];
    return fieldsToCompare.some(field => original[field] !== current[field]);
  }

  private exitEditMode(rowData: any): void {
    this.editingRows.delete(rowData.id);
    this.modifiedRows.delete(rowData);
    this.originalRowData.delete(rowData.id);
    this.gridApi.applyTransaction({ update: [rowData] });
  }

  public onSaveRow(rowData: any) {
    if (rowData.isNew) {
      this.addDriver(rowData);
      return;
    }
    const updateObservable = rowData.isDriverRow
      ? this.driverService.updateDriverDetails(rowData.id, rowData)
      : !rowData.isDriverHeaderRow ? this.ownerService.updateOwnerDetails(rowData.id, rowData) : null;
    if (!updateObservable) {
      this.isLoading = false;
      this.exitEditMode(rowData);
      return;
    }
    updateObservable.subscribe({
      next: () => {
        if (rowData.isDriverRow && rowData.parentOwnerId) {
          this.ownerService.clearDriversCacheForOwner(rowData.parentOwnerId);
        }
        this.showMessage(`${rowData.isDriverRow ? 'Driver' : 'Owner'} updated successfully.`, false);
        this.isLoading = false;
        this.exitEditMode(rowData);
      },
      error: (error) => {
        console.error('Failed to update row:', error);
        this.showMessage('Failed to save changes.', true);
        this.isLoading = false;
        this.exitEditMode(rowData);
      }
    });
  }

  initiateAddDriver(ownerId: string) {
    const dialogRef = this.dialog.open(DriverFormComponent, {
      width: '400px',
      data: { ownerId: ownerId }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const payload = {
          ...result,
          ownerId: ownerId
        };
        this.addDriver(payload);
      }
    });
  }

  addDriver(driverData: any) {
    this.isLoading = true;
    this.ownerService.createDriver(driverData).subscribe({
      next: (savedDriver) => {
        this.showMessage('Driver added successfully!', false);
         const ownerData = this.ownersForGrid.find(o => o.id === driverData.ownerId && !o.isDriverRow);

 
      if (ownerData && this.expandedOwnerIds.has(ownerData.id)) {
        
        this.toggleRowExpansion(ownerData);
      }
      
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error adding driver:", err);
        this.showMessage('Failed to add driver.', true);
      }
    });
  }

  onQuickFilterChanged(event: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.gridApi.setQuickFilter(filterValue);
  }

  deleteOwner(id: string) {
    this.ownerService.deleteOwner(id).subscribe({
      next: () => {
        this.showMessage('Owner deleted successfully.', false);
        this.ownersForGrid = this.ownersForGrid.filter(row =>
          row.id !== id &&
          !(row.isDriverRow && row.parentOwnerId === id) &&
          !(row.isDriverHeaderRow && row.parentOwnerId === id)
        );
        this.expandedOwnerIds.delete(id);
        this.updateRowSNo();
        this.gridApi?.setRowData(this.ownersForGrid);
      },
      error: (error) => {
        console.error('Failed to delete owner:', error);
        this.showMessage('Failed to delete owner.', true);
      }
    });
  }

  showMessage(message: string, isError: boolean = false) {
    this.customMessage = message;
    this.customMessageIsError = isError;
    this.showCustomMessage = true;
    setTimeout(() => {
      this.showCustomMessage = false;
    }, 3000);
  }

  showConfirmation(message: string, callback: () => void) {
    this.confirmMessage = message;
    this.confirmCallback = callback;
    this.showCustomConfirm = true;
  }

  onConfirmYes() {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.showCustomConfirm = false;
    this.confirmCallback = null;
  }

  onConfirmNo() {
    this.showCustomConfirm = false;
    this.confirmCallback = null;
  }

  onExportCSV(): void {
    this.gridApi.exportDataAsCsv({
      fileName: `Owner_Management.csv`
    });
  }
}

