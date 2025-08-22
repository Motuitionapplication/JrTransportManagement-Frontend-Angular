
import { Component, OnInit } from '@angular/core';
import { OwnerService } from '../../owner/owner.service';
import { DriverService } from '../../driver/driver.service';
import { forkJoin } from 'rxjs';
import { ColDef, GridOptions } from 'ag-grid-community'; // Import necessary types
import { v4 as uuidv4 } from 'uuid'; // Import a library for generating unique IDs
import { MatDialog } from '@angular/material/dialog';
import { DriverFormComponent } from '../../form/driver-form/driver-form.component';
import { OwnerFormComponent } from '../../form/owner-form/owner-form.component';
import { PaymentService } from '../../payment/payment.service';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { AssignVehicleComponent } from '../../form/assign-vehicle/assign-vehicle.component';
import { VehicleService } from '../../vehicle/vehicle.service';
import { VehicleDialogComponent } from '../vehicle-dialog/vehicle-dialog.component';


// Interface and constant definitions remain the same...
interface DriverWithEdit {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: string;
  isEditing?: boolean;
  editData?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    status: string;
  };
  isDriverRow?: boolean;
  parentOwnerId?: string;
  _sNo?: string;
  isDriverHeaderRow?: boolean;
  isNew?: boolean; // <-- NEW: Flag for newly added rows
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

  ownersForGrid: any[] = [];
  gridApi: any;
  gridColumnApi: any;

  expandedOwnerIds: Set<string> = new Set<string>();

  showCustomMessage: boolean = false;
  customMessage: string = '';
  customMessageIsError: boolean = false;
  showCustomConfirm: boolean = false;
  confirmMessage: string = '';
  confirmCallback: (() => void) | null = null;


  public actionsCellRenderer = (params: any) => {
    if (params.data.isDriverHeaderRow) {
      return '';
    }

    const eGui = document.createElement('div');
    const isModified = this.modifiedRows.has(params.data) || params.data.isNew;
    if (params.data.isDriverRow) {
      if (params.data.assignedVehicleInfo && params.data.assignedVehicleInfo != "N/A") {
        // Render Remove Assignment button
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '<i class="bi bi-escape"></i>';
        removeBtn.className = 'btn btn-sm btn-danger me-1';
        removeBtn.title = 'Remove Assignment';
        removeBtn.addEventListener('click', () => {
          this.showConfirmation(
            `Are you sure you want to remove the vehicle assignment from ${params.data.firstName}?`,
            () => {
              // On Yes, show second confirmation
              this.removeVehicleAssignment(params.data);
            }
          );
        });

        eGui.appendChild(removeBtn);
      } else {
        // Render Assign Vehicle button as before
        const assignBtn = document.createElement('button');
        assignBtn.innerHTML = '<i class="bi bi-plugin"></i>';
        assignBtn.className = 'btn btn-sm btn-primary me-1';
        assignBtn.title = 'Assign Vehicle';
        assignBtn.addEventListener('click', () => {
          this.openAssignVehicleDialog(params.data);
        });
        eGui.appendChild(assignBtn);
      }
    }


    // Edit/Save button
    const editOrSaveBtn = document.createElement('button');
    editOrSaveBtn.innerHTML = isModified
      ? '<i class="bi bi-save"></i>'
      : '<i class="bi bi-pencil-square"></i>';
    editOrSaveBtn.className = isModified
      ? 'btn btn-sm btn-success me-1'
      : 'btn btn-sm btn-primary me-1';
    editOrSaveBtn.title = isModified ? 'Save' : 'Edit';
    editOrSaveBtn.addEventListener('click', () => {
      if (isModified) {
        this.onSaveRow(params.data);
      } else {
        params.api.startEditingCell({ rowIndex: params.rowIndex, colKey: 'firstName' });
      }
    });

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.className = 'btn btn-sm btn-danger me-1';
    deleteBtn.title = 'Delete';
    deleteBtn.addEventListener('click', () => {
      if (params.data.isNew) {
        this.ownersForGrid = this.ownersForGrid.filter(row => row.id !== params.data.id);
        this.updateRowSNo();
        this.gridApi.setRowData(this.ownersForGrid);
        return;
      }
      if (params.data.isDriverRow) {
        this.showConfirmation(
          `Are you sure you want to delete driver ${params.data.firstName} ${params.data.lastName}?`,
          () => this.deleteDriver(params.data.id, params.data.parentOwnerId)
        );
      } else {
        this.showConfirmation(
          `Are you sure you want to delete owner ${params.data.firstName} ${params.data.lastName}?`,
          () => this.deleteOwner(params.data.id)
        );
      }
    });

    // Payment button only for driver rows
    if (params.data && params.data.isDriverRow) {
      const paymentBtn = document.createElement('button');
      paymentBtn.innerHTML = '<i class="bi bi-cash-coin"></i>';
      paymentBtn.className = 'btn btn-sm btn-warning me-1';
      paymentBtn.title = 'View Payments';
      paymentBtn.addEventListener('click', () => {
        this.driverrecord(params.data);
      });

      eGui.appendChild(paymentBtn);
    }
    if (params.data && !params.data.isDriverRow) {
      const vehicleBtn = document.createElement('button');
      vehicleBtn.innerHTML = '<i class="bi bi-truck"></i>';
      vehicleBtn.className = 'btn btn-sm btn-info me-1';
      vehicleBtn.title = 'View Vehicles';
      vehicleBtn.addEventListener('click', () => {
        this.openVehicleDialog(params.data);
      });
      eGui.appendChild(vehicleBtn);
    }

    eGui.appendChild(editOrSaveBtn);
    eGui.appendChild(deleteBtn);

    return eGui;
  };


  columnDefs: ColDef[] = [
    {
      headerName: 'Expand For Driver Info',
      headerClass: 'multiline-header',
      width: 140,
      cellRenderer: (params: any) => {
        if (params.data.isDriverHeaderRow) {
          return ''; // No button for header row
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
      width: 80,
      editable: false,
      sortable: true,
      filter: false,
      resizable: true,
      cellClass: (params: any) => {
        if (params.data.isDriverRow) {
          return 'driver-sno-indent';
        }
        if (params.data.isDriverHeaderRow) {
          return 'driver-header-sno'; // Class for header S.No.
        }
        return '';
      }
    },
    {
      headerName: 'First Name',
      field: 'firstName',
      editable: (params: any) => !params.data.isDriverHeaderRow,
      resizable: true,
      width: 120,
      // === MODIFIED SECTION START: cellRenderer for First Name ===
      cellRenderer: (params: any) => {
        if (params.data.isDriverHeaderRow) {
          const container = document.createElement('div');
          container.style.display = 'flex';
          container.style.justifyContent = 'space-between';
          container.style.alignItems = 'center';
          container.style.width = '80%';

          // Text part
          const text = document.createElement('span');
          text.className = 'driver-header-text';
          text.innerText = `Drivers for ${params.data.ownerName}`;

          // Button part
          const addButton = document.createElement('button');
          addButton.className = 'btn btn-sm btn-outline-success d-flex align-items-center';
          addButton.style.gap = '5px'; // space between icon and text

          // Bootstrap icon + text
          addButton.innerHTML = `<i class="bi-patch-plus-fill"></i> Add`;

          addButton.addEventListener('click', () =>
            this.initiateAddDriver(params.data.parentOwnerId)
          );

          container.appendChild(text);
          container.appendChild(addButton);

          return container;

        }
        return params.value;
      },
      // === MODIFIED SECTION END ===
      colSpan: (params: any) => {
        if (params.data.isDriverHeaderRow) {
          return 6;
        }
        return 1;
      }
    },
    { headerName: 'Last Name', field: 'lastName', editable: true, resizable: true },
    { headerName: 'Email', field: 'email', editable: true, resizable: true },
    { headerName: 'Phone', field: 'phoneNumber', editable: true, resizable: true, width: 150 },

    { headerName: 'Status', field: 'status', editable: true, resizable: true, width: 130 },
    {
      headerName: 'Current Vehicle',
      width: 220,
      editable: false,
      sortable: false, // Optional: sorting might not make sense here
      filter: false,
      valueGetter: (params: any) => {
        // This logic ensures the column is blank for Owner rows
        // and uses the 'assignedVehicleInfo' for driver rows.
        if (params.data.isDriverRow) {
          return params.data.assignedVehicleInfo;
        }
        return ''; // Return empty for non-driver rows
      }
    },
    {
      headerName: 'Actions',
      cellRenderer: this.actionsCellRenderer,
      width: 250,
      editable: false,
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

  constructor(
    private ownerService: OwnerService,
    private driverService: DriverService,
    private paymentservice: PaymentService,
    private vehicleservice: VehicleService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.fetchOwners();
  }
  removeVehicleAssignment(driverData: any): void {
    this.isLoading = true;

    this.driverService.unassignvehicle(driverData.id).subscribe({
      next: () => {
        this.showMessage(`Vehicle unassigned from ${driverData.firstName}.`, false);
        this.refreshDriverData(driverData.parentOwnerId);
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
    // 1. Fetch all vehicles for the driver's owner
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

      console.log('Fetched Owners:', this.ownersForGrid);
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

        const hasHeaderRow = this.ownersForGrid.some(row =>
          row.isDriverHeaderRow && row.parentOwnerId === owner.id
        );

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

          const driversForThisOwner = this.ownersForGrid.filter(row =>
            row.isDriverRow && row.parentOwnerId === owner.id
          );
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
      // Collapse: Remove driver rows AND the header row associated with this owner
      this.ownersForGrid = this.ownersForGrid.filter(row =>
        !(row.isDriverRow && row.parentOwnerId === ownerId) &&
        !(row.isDriverHeaderRow && row.parentOwnerId === ownerId)
      );
      this.expandedOwnerIds.delete(ownerId);
      this.updateRowSNo();
      this.gridApi?.setRowData(this.ownersForGrid);
    } else {
      // Expand: Fetch drivers, insert header, then insert drivers
      this.isLoading = true;
      this.showMessage('Loading drivers...', false);
      this.ownerService.getDriversByOwner(ownerId).subscribe({
        next: (drivers) => {
          const ownerIndex = this.ownersForGrid.findIndex(row => row.id === ownerId && !row.isDriverRow && !row.isDriverHeaderRow);
          if (ownerIndex !== -1) {
            const driverRows = drivers.map(driver => ({
              ...driver,
              id: driver.id || driver._id,
              isDriverRow: true,
              parentOwnerId: ownerId,
              status: driver.status || 'Active'
            }));

            const headerRow = {
              id: `${ownerId}-${DRIVER_HEADER_ROW_TYPE}`,
              isDriverHeaderRow: true,
              parentOwnerId: ownerId,
              ownerName: `${ownerData.firstName} ${ownerData.lastName}`
            };

            this.ownersForGrid.splice(ownerIndex + 1, 0, headerRow, ...driverRows);
            this.expandedOwnerIds.add(ownerId);
            this.updateRowSNo();
            this.gridApi?.setRowData(this.ownersForGrid);
            this.gridApi?.ensureIndexVisible(ownerIndex + driverRows.length + 1);
            this.showMessage('Drivers loaded.', false);
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error(`Error fetching drivers for ownerId ${ownerId}:`, error);
          this.showMessage(`Failed to load drivers for ${ownerData.firstName} ${ownerData.lastName}.`, true);
        }
      });
    }
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    params.api.sizeColumnsToFit();

    this.gridApi.getRowClass = (params: any) => {
      if (params.data.isDriverRow) { return 'driver-row-indent'; }
      if (params.data.isDriverHeaderRow) { return 'driver-header-row'; }
      return '';
    };

    this.gridApi.addEventListener('cellValueChanged', (event: any) => {
      if (!event.data.isNew) {
        this.modifiedRows.add(event.node.data);
      }
      event.api.redrawRows({ rowNodes: [event.node] });
    });
  }

  public onSaveRow(rowData: any) {
    if (rowData.isNew) {
      this.addDriver(rowData);
      return;
    }

    console.log('Attempting to update row:', rowData);
    const updateObservable = rowData.isDriverRow
      ? this.driverService.updateDriverDetails(rowData.id, rowData)
      : !rowData.isDriverHeaderRow ? this.ownerService.updateOwnerDetails(rowData.id, rowData) : null;

    if (!updateObservable) return;

    updateObservable.subscribe({
      next: () => {
        this.showMessage(`${rowData.isDriverRow ? 'Driver' : 'Owner'} updated successfully.`, false);
        this.modifiedRows.delete(rowData);
        const rowNode = this.gridApi.getRowNode(rowData.id);
        if (rowNode) {
          this.gridApi.redrawRows({ rowNodes: [rowNode] });
        }
      },
      error: (error) => {
        console.error('Failed to update row:', error);
        this.showMessage('Failed to save changes.', true);
      }
    });
  }

  initiateAddDriver(ownerId: string) {
    const dialogRef = this.dialog.open(DriverFormComponent, {
      width: '400px',
      // disableClose: true,  
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
    this.ownerService.createDriver(driverData).subscribe({
      next: (savedDriver) => {
        this.showMessage('Driver added successfully!', false);
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
        // Remove owner, drivers, and header row
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

  deleteDriver(driverId: string, parentOwnerId: string) {
    console.log('deleteDriver method called. driverId:', driverId);
    this.driverService.deleteDriver(driverId).subscribe({
      next: () => {
        this.showMessage('Driver deleted successfully.', false);
        this.ownersForGrid = this.ownersForGrid.filter(row => row.id !== driverId || !row.isDriverRow);
        this.updateRowSNo();
        this.gridApi?.setRowData(this.ownersForGrid);
      },
      error: (error) => {
        console.error('Failed to delete driver:', error);
        this.showMessage('Failed to delete driver.', true);
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
    this.gridApi.exportDataAsCsv();
  }


}