import { Component, OnInit } from '@angular/core';
import { OwnerService } from '../owner/owner.service';

@Component({
  selector: 'app-owner-management',
  template: `
    <div class="p-3">
      <h2 class="fw-bold text-primary mb-3">Owner Management</h2>
      <input
        type="text"
        class="form-control mb-3"
        placeholder="Search owners..."
        (input)="onQuickFilterChanged($event)"
      />
      <ag-grid-angular
        class="ag-theme-alpine"
        style="width: 100%; height: 500px;"
        [rowData]="owners"
        [columnDefs]="columnDefs"
        [defaultColDef]="defaultColDef"
        [pagination]="true"
        [paginationPageSize]="10"
        (gridReady)="onGridReady($event)">
      </ag-grid-angular>
    </div>
  `
})
export class OwnerManagementComponent implements OnInit {
  owners: any[] = [];
  gridApi: any;
  gridColumnApi: any;

  columnDefs = [
    {
      headerName: 'S.No.',
      valueGetter: (params: any) => params.node.rowIndex + 1,
      width: 90,
      suppressMovable: true,
      cellClass: 'text-center'
    },
    { headerName: 'First Name', field: 'firstName', editable: true, valueGetter: (params: any) => params.data?.firstName || '-' },
    { headerName: 'Last Name', field: 'lastName', editable: true, valueGetter: (params: any) => params.data?.lastName || '-' },
    { headerName: 'Email', field: 'email', editable: true, valueGetter: (params: any) => params.data?.email || '-' },
    { headerName: 'Phone Number', field: 'phoneNumber', editable: true, valueGetter: (params: any) => params.data?.phoneNumber || '-' },
    { headerName: 'City', valueGetter: (params: any) => params.data?.address?.city || '-', editable: true },
    { headerName: 'Status', field: 'accountStatus', editable: true },
    { headerName: 'Verification', field: 'verificationStatus', editable: true },
    {
      headerName: 'Actions',
      cellRenderer: (params: any) => `
        <button class="btn btn-sm btn-primary edit-btn">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn ms-1">Delete</button>
      `,
      width: 180
    }
  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  editingRowId: string | null = null;

  constructor(private ownerService: OwnerService) {}

  ngOnInit(): void {
    this.fetchOwners();
  }

  fetchOwners() {
    this.ownerService.getAllOwners().subscribe((data) => {
      this.owners = data;
    });
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    this.gridApi.addEventListener('cellClicked', (event: any) => {
      const owner = event.data;
      if (event.event.target.classList.contains('edit-btn')) {
        this.startEditRow(event.node);
      } else if (event.event.target.classList.contains('delete-btn')) {
        this.deleteOwner(owner.id);
      }
    });

    this.gridApi.addEventListener('cellValueChanged', (event: any) => {
      this.saveOwner(event.data); // Save on any cell change
    });
  }

  onQuickFilterChanged(event: any) {
    const value = event.target.value;
    if (this.gridApi) {
      this.gridApi.setQuickFilter(value);
    }
  }

  startEditRow(node: any) {
    this.gridApi.startEditingCell({
      rowIndex: node.rowIndex,
      colKey: 'firstName'
    });
  }

  saveOwner(owner: any) {
    this.ownerService.updateOwnerDetails(owner.id, owner).subscribe(() => {
      // Optionally show a success message or refresh data
    });
  }

  deleteOwner(id: string) {
    if (confirm('Are you sure you want to delete this owner?')) {
      this.ownerService.deleteOwner(id).subscribe(() => {
        this.fetchOwners();
      });
    }
  }
}