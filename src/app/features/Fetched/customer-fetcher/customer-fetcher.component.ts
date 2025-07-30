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
  searchValue: string = '';
  private gridApi: any;

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
      valueGetter: (params: any) => params.data.phoneNumber || '-'
    },
    {
      headerName: 'Email',
      field: 'email',
      valueGetter: (params: any) => params.data.email || '-'
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
      console.log('✅ Loaded customers from localStorage:', this.customers);
    } else {
      console.log('ℹ️ No cached data found in localStorage.');
    }

    this.fetchCustomers(); // Always fetch latest in background
  }

  fetchCustomers(): void {
    console.log('📡 Fetching customers from API...');
    this.customerService.getAllCustomers().subscribe(
      (data) => {
        this.customers = data;
        localStorage.setItem('cachedCustomers', JSON.stringify(data));
        console.log(`✅ Customers fetched from API (${data.length} records):`, data);
      },
      (error) => {
        console.error('❌ Error fetching customers:', error);
        alert('Failed to fetch customers. Please try again later.');
      }
    );
  }

  refreshCustomers(): void {
    console.log('🔄 Refreshing customer list...');
    this.fetchCustomers();
  }

  onQuickFilterChanged(event: any): void {
    const value = event.target.value;
    this.searchValue = value;
    console.log('🔍 Quick filter changed:', value);
    if (this.gridApi) {
      this.gridApi.setQuickFilter(value);
    }
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
    console.log('✅ AG Grid is ready. Total rows loaded:', this.customers.length);

    this.gridApi.addEventListener('cellClicked', (event: any) => {
      const customer = event.data;
      console.log('📌 Cell clicked. Customer data:', customer);

      if (!customer) return;

      if (event.event.target.classList.contains('edit-btn')) {
        this.editCustomer(customer);
      } else if (event.event.target.classList.contains('delete-btn')) {
        this.deleteCustomer(customer.id);
      }
    });
  }

  editCustomer(customer: Customer): void {
    console.log(`✏️ Edit customer: ${customer.profile?.firstName} ${customer.profile?.lastName}`, customer);
    alert(`Edit customer: ${customer.profile?.firstName} ${customer.profile?.lastName}`);
  }

  deleteCustomer(id?: string): void {
    if (!id) {
      console.warn('⚠️ Invalid customer ID for deletion.');
      return alert('Invalid customer ID.');
    }

    if (confirm('Are you sure you want to delete this customer?')) {
      console.log(`🗑️ Deleting customer with ID: ${id}`);
      this.customerService.deleteCustomer(id).subscribe(() => {
        console.log(`✅ Customer ${id} deleted successfully.`);
        localStorage.removeItem('cachedCustomers');
        this.fetchCustomers();
      });
    }
  }
}
