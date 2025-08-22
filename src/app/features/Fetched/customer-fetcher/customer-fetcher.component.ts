import { Component, OnInit } from '@angular/core';
import { Customer } from 'src/app/models/customer.model';
import { CustomerService } from '../../customer/customer.service';
import { CustomerCreateDto } from 'src/app/models/customer-create-dto';

// For Excel export
import * as XLSX from 'xlsx';
// For PDF export
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatDialog } from '@angular/material/dialog';
import { DialogMessageComponent } from 'src/app/shared/dialog-message/dialog-message.component';

@Component({
  selector: 'app-customer-fetcher',
  templateUrl: './customer-fetcher.component.html',
  styleUrls: ['./customer-fetcher.component.scss']
})
export class CustomerFetcherComponent implements OnInit {
  customers: Customer[] = [];
  searchValue: string = '';
  private gridApi: any;
  selectedCustomer: any = null;
  isEditMode = false;
  editableCustomer: Customer = {} as Customer;
  editingRowId: string | null = null;
  isAddCustomerModalOpen = false;
  addCustomerTabIndex = 0; // 0 = Personal Info, 1 = Contact Info
  loading = false; // tracks API call state
  

  openAddCustomerModal() {
    this.isAddCustomerModalOpen = true;
    this.addCustomerTabIndex = 0; // always start from "Personal Info"

  }

  closeAddCustomerModal() {
    this.isAddCustomerModalOpen = false;
    this.resetNewCustomer();
  }
// ✅ For adding a customer
  newCustomer: CustomerCreateDto = {
    userId: 0,   // set from selected user dropdown
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    alternatePhone: '',
    dateOfBirth: '',
    password: ''   // ✅ added
  };


  gridOptions = {
    masterDetail: true,  // ✅ This is crucial for the toggle to appear
    columnDefs: [
      {
        headerName: '',  // ✅ Toggle column        cellRenderer: 'agGroupCellRenderer',
        cellRenderer: 'agGroupCellRenderer',  // ✅ purely for toggle
        cellRendererParams: {
          suppressCount: true,
          innerRenderer: (params: any) => {
            console.log('[agGroupCellRenderer.innerRenderer] params:', params);
            return params.value;
          }
        },
        width: 40,
      },
      {
        headerName: 'Actions',
        field: 'actions',
        pinned: 'right' as const, // ✅ keeps it fixed
        cellRenderer: (params: any) => {
          const isEditing = this.editingRowId === params.data.id;
          return `
           
              ${!isEditing ? `<button class="btn btn-sm btn-primary edit-btn" title="Edit"><i class="bi bi-pencil-square"></i></button>` : ''}
              ${isEditing ? `<button class="btn btn-sm btn-success save-btn" title="Save"><i class="bi bi-check-lg"></i></button>` : ''}
              <button class="btn btn-sm btn-danger delete-btn" title="Delete"><i class="bi bi-trash"></i></button>
              <button class="btn btn-sm btn-info view-btn" title="View"><i class="bi bi-eye"></i></button>

          `;
        },
        width: 180
      },
      {
        headerName: 'First Name',
        field: 'firstName',
        editable: true,
      },
      {
        headerName: 'Last Name',
        field: 'lastName',
        editable: true
      },
      {
        headerName: 'Phone Number',
        field: 'phoneNumber',
        editable: true
      },
      {
        headerName: 'Email',
        field: 'email',
        editable: true
      },
      {
        headerName: 'City',
        field: 'profile.address.city',
        editable: true
      },
      {
        headerName: 'Status',
        field: 'accountStatus',
        editable: true
      }
    ],
    
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      editable: false
    },
    isRowMaster: (data: any) => {
      console.log('[isRowMaster] called for row:', data);
      return true;
    }, // ✅ Tells ag-Grid this row can be expanded

    detailCellRendererParams: {
      detailGridOptions: {
        columnDefs: [
          { headerName: 'Dummy Field 1', field: 'dummy1' },
          { headerName: 'Dummy Field 2', field: 'dummy2' }
        ],
      },
      getDetailRowData: function (params: any) {
        console.log('[getDetailRowData] called for master row:', params.data);
        // Dummy data; can be dynamic per row
        const detailRows = [
          { dummy1: 'A1', dummy2: 'B1' },
          { dummy1: 'A2', dummy2: 'B2' }
        ];
        console.log('[getDetailRowData] returning detail rows:', detailRows);
        params.successCallback(detailRows);
      }
    },
    
  }

  constructor(private customerService: CustomerService,
        private dialog: MatDialog   // ✅ Inject dialog

  ) {}

  ngOnInit(): void {
    const cachedData = localStorage.getItem('cachedCustomers');
    if (cachedData) {
      this.customers = JSON.parse(cachedData);
      console.log('✅ Loaded customers from localStorage:', this.customers);
    }
  }

  fetchCustomers(): void {
    console.log('📡 Fetching customers from API...');
    this.loading = true; // ✅ start loader
    this.customerService.getAllCustomers().subscribe(
      (data) => {
        this.customers = data;
        localStorage.setItem('cachedCustomers', JSON.stringify(data));
        console.log(`✅ Customers fetched (${data.length} records):`, data);
        this.loading = false; // ✅ stop loader
      },
      (error) => {
        console.error('❌ Error fetching customers:', error);
        this.loading = false; // ✅ stop loader
        this.dialog.open(DialogMessageComponent, {
          data: { title: 'Error ❌', message: 'Failed to fetch customers. Please try again later.' }
        });
      }
    );
  }
  refreshCustomers(): void {
    this.fetchCustomers();
  }

  onQuickFilterChanged(event: any): void {
    this.searchValue = event.target.value;
    if (this.gridApi) {
      this.gridApi.setQuickFilter(this.searchValue);
    }
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;

    this.gridApi.addEventListener('cellClicked', (event: any) => {
      const customer = event.data;
      if (!customer) return;

      if (event.event.target.classList.contains('edit-btn')) {
        this.editingRowId = customer.id;
        const rowIndex = event.rowIndex;
        const firstEditableCol = this.gridApi.getColumnDefs().find((col: any) => col.editable)?.field;
        if (firstEditableCol) {
          this.gridApi.startEditingCell({ rowIndex, colKey: firstEditableCol });
        }
        this.gridApi.refreshCells({ force: true });
      } else if (event.event.target.classList.contains('save-btn')) {
        this.gridApi.stopEditing();
        this.editingRowId = null;
        // Save logic: get updated row data and call update API
        const updatedRow = customer;
        this.customerService.updateCustomer(updatedRow.id, updatedRow).subscribe({
          next: () => {
            console.log('✅ Customer updated via inline save:', updatedRow);
            localStorage.removeItem('cachedCustomers');
            this.fetchCustomers();
          },
          error: (err) => {
            console.error('❌ Failed to update customer via inline save:', err);
            alert('Failed to update customer.');
          }
        });
        this.gridApi.refreshCells({ force: true });
      } else if (event.event.target.classList.contains('delete-btn')) {
        this.deleteCustomer(customer.id);
      } else if (
        event.event.target.classList.contains('view-btn') ||
        event.event.target.closest('.view-btn')
      ) {
        this.viewCustomer(customer);
      }
    });
  }

  viewCustomer(customer: any): void {
    console.log(`👁️ Viewing customer: ${customer?.firstName} ${customer?.lastName}`, customer);
    this.selectedCustomer = customer;
  }

  startEdit(): void {
    this.isEditMode = true;
    this.editableCustomer = JSON.parse(JSON.stringify(this.selectedCustomer));
    this.editableCustomer.profile = this.editableCustomer.profile ?? {
      firstName: '',
      lastName: '',
      fatherName: '',
      email: '',
      phoneNumber: '',
      profilePhoto: '',
      address: {}
    };
    this.editableCustomer.profile.firstName = this.editableCustomer.profile.firstName ?? '';
    this.editableCustomer.profile.lastName = this.editableCustomer.profile.lastName ?? '';
    this.editableCustomer.profile.fatherName = this.editableCustomer.profile.fatherName ?? '';
    this.editableCustomer.profile.email = this.editableCustomer.profile.email ?? '';
    this.editableCustomer.profile.phoneNumber = this.editableCustomer.profile.phoneNumber ?? '';
    this.editableCustomer.profile.profilePhoto = this.editableCustomer.profile.profilePhoto ?? '';
    this.editableCustomer.profile.address = this.editableCustomer.profile.address ?? {};
    this.editableCustomer.profile.address.street = this.editableCustomer.profile.address.street ?? '';
    this.editableCustomer.profile.address.city = this.editableCustomer.profile.address.city ?? '';
    this.editableCustomer.profile.address.state = this.editableCustomer.profile.address.state ?? '';
    this.editableCustomer.profile.address.pincode = this.editableCustomer.profile.address.pincode ?? '';
    this.editableCustomer.profile.address.country = this.editableCustomer.profile.address.country ?? '';
  }

  cancelEdit(): void {
    this.isEditMode = false;
  }

  saveEdit(): void {
    console.log('📝 saveEdit() called');
    if (!this.editableCustomer?.id) {
      console.warn('⚠️ No editableCustomer.id found, aborting saveEdit');
      return;
    }

    console.log('🔍 Checking/initializing editableCustomer.profile');
    this.editableCustomer.profile = this.editableCustomer.profile ?? {
      firstName: '',
      lastName: '',
      fatherName: '',
      email: '',
      phoneNumber: '',
      profilePhoto: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: ''
      }
    };

    console.log('🔍 Checking/initializing editableCustomer.profile.address');
    this.editableCustomer.profile.address = this.editableCustomer.profile.address ?? {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: ''
    };

    console.log('🔄 Saving customer (modal edit):', this.editableCustomer);

    this.customerService.updateCustomer(this.editableCustomer.id, this.editableCustomer).subscribe({
      next: () => {
        console.log('✅ Customer updated:', this.editableCustomer);
        this.isEditMode = false;
        this.selectedCustomer = null;
        this.fetchCustomers();
      },
      error: (err) => {
        console.error('❌ Failed to update customer:', err);
        alert('Update failed.');
      }
    });
  }


  onCellEdit(event: any): void {
    console.log('📝 onCellEdit() called');
    const updated = event.data;
    console.log('🔄 Updated row data:', updated);

    // Update only the fields that are editable and match your model
    const updatedCustomer: Customer = {
      ...updated,
      profile: {
        ...updated.profile,
        firstName: updated?.profile?.firstName,
        lastName: updated?.profile?.lastName,
        phoneNumber: updated?.profile?.phoneNumber,
        email: updated?.profile?.email,
        address: {
          ...updated.profile?.address,
          city: updated?.profile?.address?.city,
        }
      },
      accountStatus: updated?.accountStatus
    };

    console.log('📤 Sending updated customer to API:', updatedCustomer);

    this.customerService.updateCustomer(updatedCustomer.id, updatedCustomer).subscribe({
      next: () => {
        console.log('✅ Customer updated via inline edit:', updatedCustomer);
        localStorage.removeItem('cachedCustomers');
        this.fetchCustomers();
      },
      error: (err) => {
        console.error('❌ Failed to update customer via inline edit:', err);

        // Extract specific error reason if available
        let errorMessage = 'Failed to update customer.';
        if (err.error && err.error.message) {
          errorMessage = `Failed to update customer: ${err.error.message}`;
        } else if (err.status) {
          errorMessage = `Failed to update customer. Status: ${err.status} - ${err.statusText}`;
        }

        alert(errorMessage);
      }
    });

  }


  // ──────────────────────────────
  deleteCustomer(id?: string): void {
    if (!id) {
      this.dialog.open(DialogMessageComponent, {
        data: { title: 'Error ❌', message: 'Invalid customer ID.' }
      });
      return;
    }

    if (confirm('Are you sure you want to delete this customer?')) {
      console.log(`🗑️ Deleting customer with ID: ${id}`);
      this.customerService.deleteCustomer(id).subscribe({
        next: () => {
          console.log(`✅ Customer ${id} deleted successfully.`);
          localStorage.removeItem('cachedCustomers');
          this.fetchCustomers();
          this.dialog.open(DialogMessageComponent, {
            data: { title: 'Deleted 🗑️', message: 'Customer deleted successfully.' }
          });
        },
        error: (err) => {
          console.error('❌ Failed to delete customer:', err);
          this.dialog.open(DialogMessageComponent, {
            data: { title: 'Error ❌', message: 'Failed to delete customer.' }
          });
        }
      });
    }
  }

    // ───────────────────────────────────────────────
  // Add Customer
  addCustomer() {
    console.log('📤 Adding new customer with DTO:', this.newCustomer);
    this.customerService.addCustomer(this.newCustomer).subscribe({
      next: () => {
        this.dialog.open(DialogMessageComponent, {
          data: { title: 'Success ✅', message: 'Customer added successfully!' }
        });
        this.fetchCustomers();
        this.resetNewCustomer();
        this.closeAddCustomerModal();
      },
      error: (err) => {
        console.error('❌ Failed to add customer:', err);
        this.dialog.open(DialogMessageComponent, {
          data: { title: 'Error ❌', message: 'Failed to add customer.' }
        });
      }
    });
  }

  // ───────────────────────────────────────────────
  // Reset form for Add Customer Modal
 resetNewCustomer(): void {
    this.newCustomer = {
      userId: 0,
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      alternatePhone: '',
      dateOfBirth: '',
      password: ''   // ✅ reset password
    };
  }

  // ───────────────────────────────────────────────
  // Open Add Customer Modal
  openAddCustomer() {
    this.resetNewCustomer();
    this.isAddCustomerModalOpen = true;  // open modal
  }


  // ✅ Export to Excel
  exportToExcel() {
    const rowData: any[] = [];
    this.gridApi.forEachNode((node: any) => rowData.push(node.data));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(rowData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    XLSX.writeFile(wb, 'customers.xlsx');
  }

  // ✅ Export to PDF
  exportToPDF() {
    const doc = new jsPDF();
    const rowData: any[] = [];
    this.gridApi.forEachNode((node: any) => rowData.push(node.data));

    // ✅ Fix: Use gridOptions instead of gridApi
    const colHeaders = this.gridOptions.columnDefs.map((col: any) => col.headerName);
    const tableRows = rowData.map((row) =>
      this.gridOptions.columnDefs.map((col: any) => {
        const field = col.field;
        return field ? this.deepGet(row, field) : ''; // fetch nested field like profile.address.city
      })
    );

    autoTable(doc, {
      head: [colHeaders],
      body: tableRows,
    });

    doc.save('customers.pdf');
  }

  // ✅ Helper for nested field access (profile.address.city etc.)
  private deepGet(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }


}
