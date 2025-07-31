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

  columnDefs = [
    { 
      headerName: 'Name', 
      valueGetter: (params: any) => {
        const firstName = params.data?.firstName || '';
        const lastName = params.data?.lastName || '';
        return `${firstName} ${lastName}`.trim() || params.data.username || '-';
      }
    },
    { headerName: 'Email', field: 'email', valueGetter: (params: any) => params.data.email || '-' },
    {
      headerName: 'Actions',
      cellRenderer: () => {
        return `
          <button type=\"button\" class=\"btn btn-sm btn-primary edit-btn\">Edit</button>
        `;
      },
      width: 120
    }
  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
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

    this.gridApi.addEventListener('cellClicked', (event: any) => {
      const admin = event.data;
      console.log('📌 Cell clicked. Admin data:', admin);
      if (!admin) return;
      if (event.event.target.classList.contains('edit-btn')) {
        this.editAdmin(admin);
      }
    });
  }

  editAdmin(admin: Admin): void {
    if (!admin.id) {
      alert('Invalid admin ID.');
      return;
    }
    // Example: Prompt for new name/email, then call editAdmin
    const newName = prompt('Edit admin name:', admin.name);
    const newEmail = prompt('Edit admin email:', admin.email);
    if (newName && newEmail) {
      const updatedAdmin = { ...admin, name: newName, email: newEmail };
      this.adminService.editAdmin(Number(admin.id), updatedAdmin).subscribe(
        () => {
          alert('Admin updated successfully!');
          localStorage.removeItem('cachedAdmins');
          this.fetchAdmins();
        },
        (error) => {
          alert('Failed to update admin.');
          console.error(error);
        }
      );
    }
  }
}
