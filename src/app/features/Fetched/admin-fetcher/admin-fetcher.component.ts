import { Component, OnInit } from '@angular/core';
import { Admin } from 'src/app/models/admin.model';
import { AdminService } from 'src/app/admin/admin.service';

@Component({
  selector: 'app-admin-fetcher',
  templateUrl: './admin-fetcher.component.html',
  styleUrls: ['./admin-fetcher.component.scss']
})
export class AdminFetcherComponent implements OnInit {
  admins: Admin[] = [];
  searchValue: string = '';
  private gridApi: any;
  showAddAdminModal = false;
  newAdmin = { username: '', email: '', password: '' };

  columnDefs = [
    { 
      headerName: 'Name', 
      field: 'name',
      editable: true,
      valueGetter: (params: any) => {
        const firstName = params.data?.firstName || '';
        const lastName = params.data?.lastName || '';
        return `${firstName} ${lastName}`.trim() || params.data.username || params.data.name || '-';
      }
    },
    { headerName: 'Email', field: 'email', editable: true, valueGetter: (params: any) => params.data.email || '-' },
    {
      headerName: 'Actions',
      pinned: 'right' as const,
      cellRenderer: (params: any) => {
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
    resizable: true,
    editable: true
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    const cachedData = localStorage.getItem('cachedAdmins');
    if (cachedData) {
      this.admins = JSON.parse(cachedData);
      console.log('✅ Loaded admins from localStorage:', this.admins);
    } else {
      console.log('ℹ️ No cached data found in localStorage.');
    }
    this.fetchAdmins();
  }

  fetchAdmins(): void {
    console.log('📡 Fetching admins from API...');
    this.adminService.getAllAdmins().subscribe(
      (data) => {
        this.admins = data;
        localStorage.setItem('cachedAdmins', JSON.stringify(data));
        console.log(`✅ Admins fetched from API (${data.length} records):`, data);
      },
      (error) => {
        console.error('❌ Error fetching admins:', error);
        alert('Failed to fetch admins. Please try again later.');
      }
    );
  }

  refreshAdmins(): void {
    console.log('🔄 Refreshing admin list...');
    this.fetchAdmins();
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
    console.log('✅ AG Grid is ready. Total rows loaded:', this.admins.length);
    this.gridApi.addEventListener('cellEditingStopped', (event: any) => {
      const admin = event.data;
      if (!admin) return;
      // Only send id, name, and email fields
      const updatedAdmin = {
        id: admin.id,
        name: admin.name,
        email: admin.email
      };
      this.adminService.editAdmin(Number(admin.id), updatedAdmin).subscribe(
        () => {
          this.fetchAdmins();
        },
        (error) => {
          alert('Failed to update admin.');
          console.error(error);
        }
      );
    });
    this.gridApi.addEventListener('cellClicked', (event: any) => {
      const admin = event.data;
      if (!admin) return;
      if (event.event.target.classList.contains('edit-btn')) {
        // Optionally start editing the first editable cell
        this.gridApi.startEditingCell({ rowIndex: event.rowIndex, colKey: 'name' });
      } else if (event.event.target.classList.contains('delete-btn')) {
        this.deleteAdmin(admin.id);
      }
    });
  }

  editAdmin(admin: Admin): void {
    // Example: Prompt for new name/email, then call editAdmin
    const newName = prompt('Edit admin name:', admin.name);
    const newEmail = prompt('Edit admin email:', admin.email);
    if (newName && newEmail) {
      const updatedAdmin = { ...admin, name: newName, email: newEmail };
      this.adminService.editAdmin(Number(admin.id), updatedAdmin).subscribe(
        () => {
          alert('Admin updated successfully!');
          this.fetchAdmins();
        },
        (error) => {
          alert('Failed to update admin.');
          console.error(error);
        }
      );
    }
  }

  deleteAdmin(id: string | number): void {
    if (confirm('Are you sure you want to delete this admin?')) {
      this.adminService.deleteAdmin(id).subscribe(
        () => {
          alert('Admin deleted successfully!');
          this.fetchAdmins();
        },
        (error) => {
          alert('Failed to delete admin.');
          console.error(error);
        }
      );
    }
  }

  openAddAdminDialog(): void {
    this.showAddAdminModal = true;
    this.newAdmin = { username: '', email: '', password: '' };
  }

  closeAddAdminDialog(): void {
    this.showAddAdminModal = false;
  }

  submitAddAdmin(): void {
    const { username, email, password } = this.newAdmin;
    if (!username || !email || !password) {
      alert('All fields are required!');
      return;
    }
    // You may want to adjust the Admin model to include username and password
    const adminToAdd: any = { name: username, email, password };
    this.adminService.addAdmin(adminToAdd).subscribe(
      () => {
        alert('Admin added successfully!');
        this.fetchAdmins();
        this.closeAddAdminDialog();
      },
      (error) => {
        alert('Failed to add admin.');
        console.error(error);
      }
    );
  }
}
