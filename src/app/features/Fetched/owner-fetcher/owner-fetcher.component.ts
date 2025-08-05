import { Component, OnInit } from '@angular/core';
import { OwnerService } from '../../owner/owner.service';
import { DriverService } from '../../driver/driver.service';

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
  // New properties for custom nested rows
  isDriverRow?: boolean;
  parentOwnerId?: string;
  _sNo?: string; // Added for hierarchical S.No.
  // Add a property to identify a header row
  isDriverHeaderRow?: boolean;
}

// Define a constant for the special header row type
const DRIVER_HEADER_ROW_TYPE = 'driver-header';

@Component({
  selector: 'app-owner-fetcher',
  templateUrl: './owner-fetcher.component.html',
  styleUrls: ['./owner-fetcher.component.scss']
})
export class OwnerFetcherComponent implements OnInit {
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

  columnDefs = [
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
      headerName: 'List',
      width: 50,
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
      headerName: 'First Name',
      field: 'firstName',
      editable: (params: any) => !params.data.isDriverHeaderRow, // Not editable for header row
      resizable: true,
      cellRenderer: (params: any) => {
        if (params.data.isDriverHeaderRow) {
          // Display the header text across the first name column
          const div = document.createElement('div');
          div.innerHTML = `<span class="driver-header-text">Drivers for ${params.data.ownerName}</span>`;
          return div;
        }
        return params.value; // Default rendering for other rows
      },
      // Span the header text across multiple columns
      colSpan: (params: any) => {
        if (params.data.isDriverHeaderRow) {
          return 6; // Span across 6 columns (adjust based on your actual column count after S.No. and List)
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
      cellRenderer: (params: any) => {
        if (params.data.isDriverHeaderRow) {
          return ''; // No actions for header row
        }
        const container = document.createElement('div');
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-primary edit-btn';
        editBtn.innerText = 'Edit';
        editBtn.addEventListener('click', () => {
          params.api.startEditingCell({ rowIndex: params.rowIndex, colKey: 'firstName' });
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger delete-btn ms-1';
        deleteBtn.innerText = 'Delete';
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

        container.appendChild(editBtn);
        container.appendChild(deleteBtn);
        return container;
      },
      width: 180,
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
    private driverService: DriverService
  ) {}

  ngOnInit(): void {
    this.fetchOwners();
  }

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
          // --- For Debugging: See what the API is actually returning ---
          console.log('Drivers received from API:', drivers);
          // --- Check this log in your browser console to confirm the ID field name ---

          const ownerIndex = this.ownersForGrid.findIndex(row => row.id === ownerId && !row.isDriverRow && !row.isDriverHeaderRow);
          if (ownerIndex !== -1) {
            
            // ========================= FIX IS HERE =========================
            // The problem was that the driver object from the API likely has its ID
            // in a field like '_id' or 'id' from the DTO, but it needs to be explicitly
            // mapped to the 'id' property of the grid row data.
            const driverRows = drivers.map(driver => ({
              ...driver,
              // The driver object from your API might have its ID in a field named 'id' or '_id'.
              // This line ensures that the 'id' property required by the grid is correctly set.
              id: driver.id || driver._id, // <-- THE CRUCIAL FIX!
              isDriverRow: true,
              parentOwnerId: ownerId,
              status: driver.status || 'Active'
            }));
            // ===============================================================

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
      if (params.data.isDriverRow) {
        return 'driver-row-indent';
      }
      if (params.data.isDriverHeaderRow) {
        return 'driver-header-row'; // Apply class for header row styling
      }
      return '';
    };

    this.gridApi.addEventListener('cellValueChanged', (event: any) => {
      const updatedData = { ...event.node.data, ...event.data };
      console.log('Attempting to update driver/owner. updatedData:', updatedData);

      if (updatedData.isDriverRow) {
        this.driverService.updateDriverDetails(updatedData.id, updatedData).subscribe({
          next: () => this.showMessage('Driver updated successfully.', false),
          error: (error) => {
            console.error('Failed to update driver:', error);
            this.showMessage('Failed to update driver.', true);
          }
        });
      } else if (!updatedData.isDriverHeaderRow) { // Don't try to update header row
        this.ownerService.updateOwnerDetails(updatedData.id, updatedData).subscribe({
          next: () => this.showMessage('Owner updated successfully.', false),
          error: (error) => {
            console.error('Failed to update owner:', error);
            this.showMessage('Failed to update owner.', true);
          }
        });
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
}
