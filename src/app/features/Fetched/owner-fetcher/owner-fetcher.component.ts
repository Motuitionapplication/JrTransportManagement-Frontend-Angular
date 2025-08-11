import { Component, OnInit } from '@angular/core';
import { OwnerService } from '../../owner/owner.service';
import { DriverService } from '../../driver/driver.service';
import { forkJoin } from 'rxjs';
import { ColDef, GridOptions } from 'ag-grid-community'; // Import necessary types
import { v4 as uuidv4 } from 'uuid'; // Import a library for generating unique IDs
import { MatDialog } from '@angular/material/dialog';
import { DriverFormComponent } from '../../form/driver-form/driver-form.component';
import { OwnerFormComponent } from '../../form/owner-form/owner-form.component';

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
    // A row is considered "modified" if it's in the set OR if it's a new, unsaved row
    const isModified = this.modifiedRows.has(params.data) || params.data.isNew;

    const editOrSaveBtn = document.createElement('button');
    editOrSaveBtn.innerText = isModified ? 'Save' : 'Edit';

    editOrSaveBtn.className = isModified ? 'btn btn-sm btn-success' : 'btn btn-sm btn-primary';

    editOrSaveBtn.addEventListener('click', () => {
      if (isModified) {
        this.onSaveRow(params.data);
      } else {
        params.api.startEditingCell({ rowIndex: params.rowIndex, colKey: 'firstName' });
      }
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Delete';
    deleteBtn.className = 'btn btn-sm btn-danger ms-1';

    deleteBtn.addEventListener('click', () => {
      // If it's a new, unsaved row, just remove it locally without a confirmation
      if (params.data.isNew) {
        this.ownersForGrid = this.ownersForGrid.filter(row => row.id !== params.data.id);
        this.updateRowSNo();
        this.gridApi.setRowData(this.ownersForGrid);
        return;
      }

      if (params.data.isDriverRow) {
        this.showConfirmation(`Are you sure you want to delete driver ${params.data.firstName} ${params.data.lastName}?`, () => {
          this.deleteDriver(params.data.id, params.data.parentOwnerId);
        });
      } else {
        this.showConfirmation(`Are you sure you want to delete owner ${params.data.firstName} ${params.data.lastName}?`, () => {
          this.deleteOwner(params.data.id);
        });
      }
    });

    eGui.appendChild(editOrSaveBtn);
    eGui.appendChild(deleteBtn);

    return eGui;
  }

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
          addButton.className = 'btn btn-sm btn-outline-success';

          // Optional: Add styling for an icon-only button
          addButton.style.padding = '3px';
          addButton.style.lineHeight = '2';
          const addIcon = document.createElement('img');
          addIcon.src = 'assets/icons/add-driver.png';
          addIcon.alt = 'Add Driver';
          addIcon.style.width = '38px';
          addIcon.style.height = '38px';
          addButton.appendChild(addIcon);

          addButton.addEventListener('click', () => this.initiateAddDriver(params.data.parentOwnerId));
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
    { headerName: 'Phone', field: 'phoneNumber', editable: true, resizable: true },
    {
      headerName: 'City',
      valueGetter: (params: any) => params.data.isDriverRow ? '-' : (params.data?.address?.city || '-'),
      editable: false,
      resizable: true
    },
    { headerName: 'Status', field: 'status', editable: true, resizable: true },
    {
      headerName: 'Actions',
      cellRenderer: this.actionsCellRenderer,
      width: 180,
      editable: false,
      resizable: true,
      sortable: false,
      filter: false
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
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.fetchOwners();
  }

  // fetchOwners, updateRowSNo, and toggleRowExpansion methods remain the same
  fetchOwners() {
    this.ownerService.getAllOwners().subscribe((owners) => {
      this.ownersForGrid = owners.map(owner => ({
        ...owner,
        status: owner.accountStatus
      }));
      this.updateRowSNo();
      this.gridApi?.setRowData(this.ownersForGrid);
      console.log('Fetched Owners:', this.ownersForGrid);
    }, error => {
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
      // The 'result' is the complete owner object from the form
      if (result) {
        // Call your existing ownerService method
        this.ownerService.createowner(result).subscribe({
          next: () => {
            this.showMessage('Owner added successfully!', false);
            // Refresh the grid to show the new owner
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
      this.showMessage('Loading drivers...', false);
      this.ownerService.getDriversByOwner(ownerId).subscribe({
        next: (drivers) => {
          const ownerIndex = this.ownersForGrid.findIndex(row => row.id === ownerId && !row.isDriverRow && !row.isDriverHeaderRow);
          if (ownerIndex !== -1) {
            const driverRows = drivers.map(driver => ({
              ...driver,
              id: driver.id || driver._id, // <-- THE CRUCIAL FIX!
              isDriverRow: true,
              parentOwnerId: ownerId,
              status: driver.status || 'Active'
            }));

            const headerRow = {
              id: `${ownerId}-${DRIVER_HEADER_ROW_TYPE}`, // Unique ID for header
              isDriverHeaderRow: true,
              parentOwnerId: ownerId,
              ownerName: `${ownerData.firstName} ${ownerData.lastName}` // Pass owner name for header text
            };

            // Insert header row, then driver rows right after the owner row
            this.ownersForGrid.splice(ownerIndex + 1, 0, headerRow, ...driverRows);
            this.expandedOwnerIds.add(ownerId);
            this.updateRowSNo();
            this.gridApi?.setRowData(this.ownersForGrid);
            this.gridApi?.ensureIndexVisible(ownerIndex + driverRows.length + 1); // +1 for header row
            this.showMessage('Drivers loaded.', false);
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
      // Don't mark new rows as modified until a cell is changed
      if (!event.data.isNew) {
        this.modifiedRows.add(event.node.data);
      }
      event.api.redrawRows({ rowNodes: [event.node] });
    });
  }

  // === MODIFIED SECTION START: onSaveRow updated to handle new rows ===
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
  // === MODIFIED SECTION END ===

  // === NEW METHOD START: initiateAddDriver ===
  initiateAddDriver(ownerId: string) {
    const dialogRef = this.dialog.open(DriverFormComponent, {
      width: '400px',
      // disableClose: true,  
      data: { ownerId: ownerId }
    });

    dialogRef.afterClosed().subscribe(result => {
      // 3. 'result' is the complete form object from the dialog
      if (result) {
        // 4. We need to manually add the ownerId before sending it to the service
        const payload = {
          ...result, // Contains everything from the form
          ownerId: ownerId // Add the ownerId
        };
        this.addDriver(payload);
      }
    });
  }

  // === NEW METHOD END ===

  // === NEW METHOD START: addDriver ===
  addDriver(driverData: any) {
    this.ownerService.createDriver(driverData).subscribe({
      next: (savedDriver) => {
        this.showMessage('Driver added successfully!', false);
        // Logic to refresh the grid...
      },
      error: (err) => {
        console.error("Error adding driver:", err);
        this.showMessage('Failed to add driver.', true);
      }
    });
  }
  // === NEW METHOD END ===

  // onQuickFilterChanged, deleteOwner, deleteDriver, showMessage, and confirmation methods remain the same
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
}