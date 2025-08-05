import { Component, OnInit } from '@angular/core';
import { OwnerService } from '../../owner/owner.service';
import { DriverService } from '../../driver/driver.service';
// import { DriverDTO } from 'src/app/models/driver.dto';

interface OwnerWithDrivers {
  owner: any;
  drivers: any[];
  expanded: boolean;
  loading: boolean;
}
interface DriverWithEdit {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: string;
  isEditing?: boolean;
  editData?: {
    id: string; // Added id to editData
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    status: string;
  };
}

interface DriverDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: string;
}

@Component({
  selector: 'app-owner-fetcher',
  templateUrl: './owner-fetcher.component.html',
  styleUrls: ['./owner-fetcher.component.scss']
})
export class OwnerFetcherComponent implements OnInit {
  ownersWithDrivers: OwnerWithDrivers[] = [];
  ownersForGrid: any[] = [];
  gridApi: any;
  gridColumnApi: any;
  detailCellRendererParams: any;

  columnDefs = [
    {
      headerName: 'S.No.',
      valueGetter: (params: any) => params.node.rowIndex + 1,
      width: 90,
      cellClass: 'text-center'
    },
    { headerName: 'First Name', field: 'firstName', editable: true },
    { headerName: 'Last Name', field: 'lastName', editable: true },
    { headerName: 'Email', field: 'email', editable: true },
    { headerName: 'Phone', field: 'phoneNumber', editable: true },
    {
      headerName: 'City',
      valueGetter: (params: any) => params.data?.address?.city || '-',
      editable: false
    },
    { headerName: 'Status', field: 'accountStatus', editable: true },
    {
      headerName: 'Actions',
      cellRenderer: () => `
        <button class="btn btn-sm btn-primary edit-btn">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn ms-1">Delete</button>
      `,
      width: 180,
      editable: false
    }
  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };
isRowMaster = (dataItem: any): boolean => true;

  constructor(
    private ownerService: OwnerService,
    private driverService:DriverService
  ) {}

  ngOnInit(): void {
    this.fetchOwners();
    this.setupDetailRenderer(); // required for grid expansion
  }

  fetchOwners() {
    this.ownerService.getAllOwners().subscribe((owners) => {
      this.ownersWithDrivers = owners.map(owner => ({
        owner,
        drivers: [],
        expanded: false,
        loading: false
      }));
      this.ownersForGrid = owners;
    });
  }

setupDetailRenderer() {
  const self = this;
  this.detailCellRendererParams = {
    detailGridOptions: {
      columnDefs: [
        { field: 'firstName', headerName: 'First Name', editable: true },
        { field: 'lastName', headerName: 'Last Name', editable: true },
        { field: 'email', headerName: 'Email', editable: true },
        { field: 'phoneNumber', headerName: 'Phone', editable: true },
        { field: 'status', headerName: 'Status', editable: true },
        {
          headerName: 'Actions',
          field: 'actions',
          cellRenderer: function (params: any) {
            return self.driverActionsRenderer(params);
          },
          width: 160
        }
      ],
      defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
        editable: true
      },
      onCellValueChanged: (event: any) => {
        const updatedDriver = event.data;
        self.driverService.updateDriverDetails(updatedDriver.id, updatedDriver).subscribe({
          next: () => console.log('Driver updated successfully.'),
          error: () => alert('Failed to update driver.')
        });
      }
    },
    getDetailRowData: (params: any) => {
      const ownerId = params.data.id;
      self.ownerService.getDriversByOwner(ownerId).subscribe(drivers => {
        params.successCallback(drivers);
      });
    }
  };
}



  onDriverActionClick(event: any, gridApi: any) {
    const driver = event.data;

    if (event.event.target.classList.contains('driver-edit-btn')) {
      gridApi.startEditingCell({
        rowIndex: event.rowIndex,
        colKey: 'firstName'
      });
    }

    if (event.event.target.classList.contains('driver-delete-btn')) {
      if (confirm(`Are you sure you want to delete driver ${driver.firstName} ${driver.lastName}?`)) {
        this.driverService.deleteDriver(driver.id).subscribe({
          next: () => {
            console.log('Driver deleted.');
            gridApi.applyTransaction({ remove: [driver] });
          },
          error: () => console.error('Failed to delete driver.')
        });
      }
    }
  }

  toggleOwnerExpansion(ownerId: string) {
    const ownerWithDrivers = this.ownersWithDrivers.find(item => item.owner.id === ownerId);
    if (!ownerWithDrivers) return;

    ownerWithDrivers.expanded = !ownerWithDrivers.expanded;

    if (ownerWithDrivers.expanded && ownerWithDrivers.drivers.length === 0) {
      ownerWithDrivers.loading = true;
      this.ownerService.getDriversByOwner(ownerWithDrivers.owner.id).subscribe({
        next: (drivers) => {
          ownerWithDrivers.drivers = drivers;
          ownerWithDrivers.loading = false;
        },
        error: () => {
          ownerWithDrivers.loading = false;
        }
      });
    }
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    params.api.sizeColumnsToFit();

    this.gridApi.addEventListener('cellClicked', (event: any) => {
      if (event.event.target.classList.contains('delete-btn')) {
        this.deleteOwner(event.data.id);
      }
      if (event.event.target.classList.contains('edit-btn')) {
        const rowIndex = event.rowIndex;
        this.gridApi.startEditingCell({
          rowIndex: rowIndex,
          colKey: 'firstName'
        });
      }
    });

    this.gridApi.addEventListener('cellValueChanged', (event: any) => {
      const updatedOwner = event.data;
      this.ownerService.updateOwnerDetails(updatedOwner.id, updatedOwner).subscribe({
        next: () => console.log('Owner updated successfully.'),
        error: () => console.error('Failed to update owner.')
      });
    });
  }

  onQuickFilterChanged(event: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.gridApi.setQuickFilter(filterValue);
  }

  deleteOwner(id: string) {
    if (confirm('Are you sure you want to delete this owner?')) {
      this.ownerService.deleteOwner(id).subscribe(() => {
        this.fetchOwners();
      });
    }
  }
driverActionsRenderer(params: any): HTMLElement {
  const container = document.createElement('div');

  const editBtn = document.createElement('button');
  editBtn.className = 'btn btn-sm btn-primary me-1';
  editBtn.innerText = 'Edit';
  editBtn.addEventListener('click', () => {
    params.api.startEditingCell({ rowIndex: params.rowIndex, colKey: 'firstName' });
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-sm btn-danger';
  deleteBtn.innerText = 'Delete';
  deleteBtn.addEventListener('click', () => {
    if (confirm(`Delete driver ${params.data.firstName} ${params.data.lastName}?`)) {
      this.driverService.deleteDriver(params.data.id).subscribe({
        next: () => {
          params.api.applyTransaction({ remove: [params.data] });
        },
        error: () => alert('Failed to delete driver.')
      });
    }
  });

  container.appendChild(editBtn);
  container.appendChild(deleteBtn);

  return container;
}

// Add these methods to your component class

startEditDriver(driver: DriverWithEdit, event: Event) {
  event.stopPropagation();
  driver.isEditing = true;
  driver.editData = {
    id: driver.id, // Include id in editData
    firstName: driver.firstName,
    lastName: driver.lastName,
    email: driver.email,
    phoneNumber: driver.phoneNumber,
    status: driver.status || 'Active'
  };
}

saveDriver(driver: any, event: Event) {
  event.stopPropagation();
  this.driverService.updateDriverDetails(driver.id, driver.editData).subscribe({
    next: (updatedDriver) => {
      // Update the main driver object with the new values
      Object.assign(driver, updatedDriver);
      driver.isEditing = false;
      delete driver.editData;
    },
    error: () => {
      alert('Failed to update driver');
    }
  });
}

cancelEdit(driver: any, event: Event) {
  event.stopPropagation();
  driver.isEditing = false;
  delete driver.editData; // Remove the edit data object
}

deleteDriver(driver: any, event: Event) {
  event.stopPropagation();
  
  if (confirm(`Are you sure you want to delete driver ${driver.firstName} ${driver.lastName}?`)) {
    this.driverService.deleteDriver(driver.id).subscribe({
      next: () => {
        // Remove the driver from the local array
        const ownerWithDrivers = this.ownersWithDrivers.find(item => 
          item.drivers.some(d => d.id === driver.id)
        );
        
        if (ownerWithDrivers) {
          ownerWithDrivers.drivers = ownerWithDrivers.drivers.filter(d => d.id !== driver.id);
        }
      },
      error: () => alert('Failed to delete driver.')
    });
  }
}
}
