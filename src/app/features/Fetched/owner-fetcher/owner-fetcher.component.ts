import { Component, OnInit } from '@angular/core';
import { OwnerService } from '../../owner/owner.service';
import { DriverService } from '../../driver/driver.service';
import { forkJoin } from 'rxjs';
import { ColDef, GridOptions } from 'ag-grid-community'; // Import necessary types

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
    const isModified = this.modifiedRows.has(params.data);

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
      width: 110,
      
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
      sortable: false,
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
      cellRenderer: (params: any) => {
        if (params.data.isDriverHeaderRow) {
          const div = document.createElement('div');
          div.innerHTML = `<span class="driver-header-text">Drivers for ${params.data.ownerName}</span>`;
          return div;
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
      cellRenderer: this.actionsCellRenderer, // Use the new renderer function
      width: 180,
      editable: false,
      resizable: true,
      sortable: false,
      filter: false
    }
  ];
  // === MODIFIED SECTION END ===

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  constructor(
    private ownerService: OwnerService,
    private driverService: DriverService
  ) { }

  ngOnInit(): void {
    this.fetchOwners();
  }

  // ... fetchOwners, updateRowSNo, and toggleRowExpansion methods remain the same ...
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

    // === MODIFIED SECTION START: onGridReady ===
    this.gridApi.addEventListener('cellValueChanged', (event: any) => {
      this.modifiedRows.add(event.node.data);
      // CRITICAL: This refresh tells the actionsCellRenderer to re-run and swap the button
      event.api.redrawRows({ rowNodes: [event.node] });
    });
    // === MODIFIED SECTION END ===
  }

  // === NEW METHOD START: Replaces onSaveChanges with a row-specific save ===
  public onSaveRow(rowData: any) {
    console.log('Attempting to save row:', rowData);

    const updateObservable = rowData.isDriverRow
      ? this.driverService.updateDriverDetails(rowData.id, rowData)
      // Ensure we don't try to save the header row
      : !rowData.isDriverHeaderRow ? this.ownerService.updateOwnerDetails(rowData.id, rowData) : null;

    if (!updateObservable) return;

    updateObservable.subscribe({
      next: () => {
        this.showMessage(`${rowData.isDriverRow ? 'Driver' : 'Owner'} updated successfully.`, false);
        // CRITICAL: Remove the row from the set of modified rows
        this.modifiedRows.delete(rowData);

        // Find the specific row node to refresh its cell
        const rowNode = this.gridApi.getRowNode(rowData.id);
        if (rowNode) {
          // Refresh the row to swap the button back from "Save" to "Edit"
          this.gridApi.redrawRows({ rowNodes: [rowNode] });
        }
      },
      error: (error) => {
        console.error('Failed to update row:', error);
        this.showMessage('Failed to save changes.', true);
      }
    });
  }
  // === NEW METHOD END ===

  // ... onQuickFilterChanged, deleteOwner, deleteDriver, showMessage, and confirmation methods remain the same
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