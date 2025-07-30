import { Component, OnInit } from '@angular/core';
import { Customer } from 'src/app/models/customer.model';
import { CustomerService } from '../../customer/customer.service';

@Component({
  selector: 'app-customer-fetcher',
  templateUrl: './customer-fetcher.component.html',
  styleUrls: ['./customer-fetcher.component.scss']
})
export class CustomerFetcherComponent implements OnInit {
  customers: Customer[] = [];

  columnDefs = [
    {
      headerName: 'Name',
      valueGetter: (params: any) => {
        const firstName = params.data?.profile?.firstName || '';
        const lastName = params.data?.profile?.lastName || '';
        return `${firstName} ${lastName}`.trim() || '-';
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
      valueGetter: (params: any) => params.data?.address?.city || '-'
    },
    {
      headerName: 'Status',
      field: 'accountStatus'
    },
    {
      headerName: 'Actions',
      cellRenderer: () => {
        return `
          <button type="button" class="btn btn-sm btn-primary edit-btn">Edit</button>
          <button type="button" class="btn btn-sm btn-danger delete-btn ms-1">Delete</button>
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
    const cachedData = localStorage.getItem('cachedCustomers');

    if (cachedData) {
      this.customers = JSON.parse(cachedData);
      console.log('Loaded customers from localStorage.');
    } else {
      this.fetchCustomers();
    }
  }

  fetchCustomers() {
    this.customerService.getAllCustomers().subscribe((data) => {
      this.customers = data;
      localStorage.setItem('cachedCustomers', JSON.stringify(data));
      console.log('Fetched customers from API and cached.');
    });
  }

  refreshCustomers() {
    // Manual refresh logic if needed
    this.fetchCustomers();
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
        // Remove cache on delete to refetch updated list
        localStorage.removeItem('cachedCustomers');
        this.fetchCustomers();
      });
    }
  }
}
