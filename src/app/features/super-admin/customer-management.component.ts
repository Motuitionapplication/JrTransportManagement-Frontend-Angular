import { Component, OnInit } from '@angular/core';
import { Customer } from '../../models/customer.model';
import { CustomerService } from '../customer/customer.service';

@Component({
  selector: 'app-customer-management',
  template: `
    <div class="p-3">
      <h2 class="fw-bold text-primary mb-3">List Of Customers</h2>
      <ag-grid-angular
        class="ag-theme-alpine"
        style="width: 100%; height: 500px;"
        [rowData]="customers"
        [columnDefs]="columnDefs"
        [defaultColDef]="defaultColDef"
        [pagination]="true"
        [paginationPageSize]="10"
        (gridReady)="onGridReady($event)">
      </ag-grid-angular>
    </div>
  `,
})
export class CustomerManagementComponent implements OnInit {
  customers: Customer[] = [];

  columnDefs = [
    {
      headerName: 'Name',
      valueGetter: (params: any) => {
        const firstName = params.data?.firstName || '';
        const lastName = params.data?.lastName || '';
        return firstName || lastName ? `${firstName} ${lastName}`.trim() : '-';
      }
    },
    {
      headerName: 'Phone Number',
      field: 'phoneNumber',
      valueGetter: (params: any) => params.data?.phoneNumber || '-'
    },
    {
      headerName: 'Email',
      field: 'email',
      valueGetter: (params: any) => params.data?.email || '-'
    },
    {
      headerName: 'City',
      valueGetter: (params: any) => params.data?.address?.city || '-' // will show '-' if address is null
    },
    {
      headerName: 'Status',
      field: 'accountStatus'
    },
    {
      headerName: 'Actions',
      cellRenderer: (params: any) => {
        return `
          <button class="btn btn-sm btn-primary edit-btn">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn ms-1">Delete</button>
        `;
      },
      width: 180
    }
  ];


  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.fetchCustomers();
  }

  fetchCustomers() {
    this.customerService.getAllCustomers().subscribe((data) => {
      this.customers = data;
      console.log("Customers:", this.customers);
    });
  }

  onGridReady(params: any) {
    params.api.addEventListener('cellClicked', (event: any) => {
      const customer = event.data;
      if (event.event.target.classList.contains('edit-btn')) {
        this.editCustomer(customer);
      } else if (event.event.target.classList.contains('delete-btn')) {
        this.deleteCustomer(customer.id);
      }
    });
  }

  editCustomer(customer: Customer) {
    alert(`Edit customer: ${customer.profile.firstName} ${customer.profile.lastName}`);
  }

  deleteCustomer(id: string) {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.deleteCustomer(id).subscribe(() => {
        this.fetchCustomers();
      });
    }
  }
}
