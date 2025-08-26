import * as XLSX from 'xlsx';
import { Component, OnInit } from '@angular/core';
import { Admin } from 'src/app/models/admin.model';
import { AdminService } from 'src/app/admin/admin.service';

@Component({
  selector: 'app-admin-fetcher',
  templateUrl: './admin-fetcher.component.html',
  styleUrls: ['./admin-fetcher.component.scss']
})
export class AdminFetcherComponent implements OnInit {
  columnDefs = [
    { headerName: 'First Name', field: 'firstName', editable: true },
    { headerName: 'Last Name', field: 'lastName', editable: true },
    { headerName: 'Email', field: 'email', editable: true },
    { headerName: 'Phone Number', field: 'phoneNumber', editable: true },
    {
      headerName: 'Actions',
      cellRenderer: () => {
        return `
          <button type="button" class="btn btn-sm btn-primary edit-btn me-1" title="Edit">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button type="button" class="btn btn-sm btn-danger delete-btn me-1" title="Delete">
            <i class="bi bi-trash"></i>
          </button>
          <button type="button" class="btn btn-sm btn-warning change-password-btn" title="Change Password">
            <i class="bi bi-key"></i>
          </button>
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

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridApi.addEventListener('cellClicked', (event: any) => {
      const admin = event.data;
      if (!admin) return;
      const target = event.event.target;
      if (target.closest('.edit-btn')) {
        this.startEditAdmin(admin);
      } else if (target.closest('.delete-btn')) {
        this.deleteAdmin(admin.id);
      } else if (target.closest('.change-password-btn')) {
        this.openChangePasswordModal(admin);
      }
    });
  }
  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  get totalPages(): number {
    return Math.ceil(this.admins.length / this.pageSize) || 1;
  }

  get paginatedAdmins(): Admin[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.admins.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  isEditing(admin: Admin): boolean {
    return this.editingAdminId === String(admin.id);
  }
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
  constructor(private adminService: AdminService) {}
  editingAdminId: string | null = null;
  editAdminData: any = {};
  exportAdminsToExcel(): void {
    const exportData = this.admins.map((admin: any) => ({
      'First Name': admin.firstName,
      'Last Name': admin.lastName,
      'Username': admin.username,
      'Email': admin.email,
      'Phone Number': admin.phoneNumber
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Admins');
    XLSX.writeFile(workbook, 'admins.xlsx');
  }
  admins: Admin[] = [];
  searchValue: string = '';
  private gridApi: any;
  showAddAdminModal = false;
  newAdmin = { username: '', email: '', password: '', phoneNumber: '', firstName: '', lastName: '' };
  showAddAdminPassword: boolean = false;
  showChangePasswordModal = false;
  selectedAdminForPassword: Admin | null = null;
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  showCurrentPassword: boolean = false;

  // Removed AG Grid columnDefs and cellRenderer logic

  fetchAdmins(): void {
    console.log('📡 Fetching admins from API...');
    this.adminService.getAllAdmins().subscribe(
      (data) => {
        this.admins = data.map((admin: any) => ({ ...admin }));
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


  startEditAdmin(admin: Admin): void {
    this.editingAdminId = String(admin.id);
    this.editAdminData = { ...admin };
  }

  saveEditAdmin(admin: Admin): void {
    const updatedAdmin = {
      id: admin.id,
      firstName: this.editAdminData.firstName,
      lastName: this.editAdminData.lastName,
      email: this.editAdminData.email,
      phoneNumber: this.editAdminData.phoneNumber
    };
    this.adminService.editAdmin(Number(admin.id), updatedAdmin).subscribe(
      () => {
        this.editingAdminId = null;
        this.editAdminData = {};
        this.fetchAdmins();
      },
      (error: any) => {
        alert('Failed to update admin.');
        console.error(error);
      }
    );
  }

  cancelEditAdmin(): void {
    this.editingAdminId = null;
    this.editAdminData = {};
  }

  editAdmin(admin: Admin): void {
    // Example: Prompt for new first name, last name, and email, then call editAdmin
    const newFirstName = prompt('Edit admin first name:', admin.firstName);
    const newLastName = prompt('Edit admin last name:', admin.lastName);
    const newEmail = prompt('Edit admin email:', admin.email);
    if (newFirstName && newLastName && newEmail) {
      const updatedAdmin = { ...admin, firstName: newFirstName, lastName: newLastName, email: newEmail };
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
  this.newAdmin = { firstName: '', lastName: '', username: '', email: '', password: '', phoneNumber: '' };
  }

  closeAddAdminDialog(): void {
  this.showAddAdminModal = false;
  this.newAdmin = { firstName: '', lastName: '', username: '', email: '', password: '', phoneNumber: '' };
  }

  submitAddAdmin(): void {
    const { username, email, password, phoneNumber, firstName, lastName } = this.newAdmin;
    if (!username || !email || !password || !phoneNumber || !firstName || !lastName) {
      alert('All fields are required!');
      return;
    }
    const adminToAdd: any = {
      username,
      email,
      password,
      phoneNumber,
      firstName,
      lastName
    };
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

  // Fetch current password from backend when opening change password modal
  openChangePasswordModal(admin: Admin): void {
  // No search bar reset needed
    this.selectedAdminForPassword = admin;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.showChangePasswordModal = true;
    // Fetch current password from backend
    this.adminService.getAdminPassword(admin.id).subscribe(
      (response: any) => {
        this.currentPassword = response.message || '';
      },
      (error: any) => {
        this.currentPassword = '';
        console.error('Failed to fetch current password:', error);
      }
    );
  }

  closeChangePasswordModal(): void {
    this.showChangePasswordModal = false;
    this.selectedAdminForPassword = null;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  submitChangePassword(): void {
    if (!this.newPassword || !this.confirmPassword) {
      alert('Please enter new password and confirm password.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }
    if (!this.selectedAdminForPassword) return;
    this.adminService.changeAdminPassword(this.selectedAdminForPassword.id, this.newPassword).subscribe(
      () => {
        alert('Password updated successfully!');
        this.closeChangePasswordModal();
      },
      (error: any) => {
        alert('Failed to update password.');
        console.error(error);
      }
    );
  }
}
