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
  // ...existing code...
  toggleAddAdminPassword(): void {
    this.showAddAdminPassword = !this.showAddAdminPassword;
  }
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
        this.requestDeleteAdmin(admin);
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

  get filteredAdmins(): Admin[] {
    if (!this.searchValue.trim()) {
      return this.admins;
    }
    const value = this.searchValue.trim().toLowerCase();
    return this.admins.filter(admin =>
      admin.firstName.toLowerCase().includes(value) ||
      admin.lastName.toLowerCase().includes(value) ||
      admin.email.toLowerCase().includes(value) ||
      admin.phoneNumber.toLowerCase().includes(value)
    );
  }

  get paginatedAdmins(): Admin[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAdmins.slice(start, start + this.pageSize);
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
        // Sort admins alphabetically by first name
        this.admins.sort((a, b) => a.firstName.localeCompare(b.firstName));
        localStorage.setItem('cachedAdmins', JSON.stringify(this.admins));
        console.log(`✅ Admins fetched from API (${this.admins.length} records):`, this.admins);
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
    this.currentPage = 1;
    console.log('🔍 Quick filter changed:', value);
  }


  startEditAdmin(admin: Admin): void {
    this.editingAdminId = String(admin.id);
    this.editAdminData = { ...admin };
  }

  saveEditAdmin(admin: Admin): void {
    // Phone number validation: input is only 10 digits, prefix +91 for validation and saving
    const phoneDigits = this.editAdminData.phoneNumber;
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneDigits)) {
      this.showToastMessage('Phone number must be exactly 10 digits.');
      return;
    }
    const updatedAdmin = {
      id: admin.id,
      firstName: this.editAdminData.firstName,
      lastName: this.editAdminData.lastName,
      email: this.editAdminData.email,
      phoneNumber: '+91' + phoneDigits
    };
    this.adminService.editAdmin(Number(admin.id), updatedAdmin).subscribe(
      () => {
        this.editingAdminId = null;
        this.editAdminData = {};
        this.showToastMessage('Admin updated successfully!');
        this.fetchAdmins();
      },
      (error: any) => {
        this.showToastMessage('Failed to update admin.');
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
          this.showToastMessage('Admin updated successfully!');
          this.fetchAdmins();
        },
        (error) => {
          this.showToastMessage('Failed to update admin.');
          console.error(error);
        }
      );
    }
  }

  showDeleteConfirmModal: boolean = false;
  adminToDelete: Admin | null = null;
  toastMessage: string = '';
  showToast: boolean = false;

  requestDeleteAdmin(admin: Admin): void {
    this.adminToDelete = admin;
    this.showDeleteConfirmModal = true;
  }

  confirmDeleteAdmin(): void {
    if (!this.adminToDelete) return;
    this.adminService.deleteAdmin(this.adminToDelete.id).subscribe(
      () => {
        this.showDeleteConfirmModal = false;
        this.adminToDelete = null;
        this.showToastMessage('Admin deleted successfully!');
        this.fetchAdmins();
      },
      (error) => {
        this.showDeleteConfirmModal = false;
        this.adminToDelete = null;
        this.showToastMessage('Failed to delete admin.');
        console.error(error);
      }
    );
  }

  cancelDeleteAdmin(): void {
    this.showDeleteConfirmModal = false;
    this.adminToDelete = null;
  }

  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 2500);
  }

  openAddAdminDialog(): void {
  this.showAddAdminModal = true;
  this.showAddAdminPassword = false;
  this.newAdmin = { firstName: '', lastName: '', username: '', email: '', password: '', phoneNumber: '+91' };
  this.newAdmin.password = '';
  }

  closeAddAdminDialog(): void {
  this.showAddAdminModal = false;
  this.showAddAdminPassword = false;
  this.newAdmin = { firstName: '', lastName: '', username: '', email: '', password: '', phoneNumber: '' };
  }

  submitAddAdmin(): void {
    const { username, email, password, phoneNumber, firstName, lastName } = this.newAdmin;
    if (!username || !email || !password || !phoneNumber || !firstName || !lastName) {
      this.showToastMessage('All fields are required!');
      return;
    }
    // Phone number validation: input is only 10 digits, prefix +91 for validation and saving
    const phoneDigits = phoneNumber;
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneDigits)) {
      this.showToastMessage('Phone number must be exactly 10 digits.');
      return;
    }
    const adminToAdd: any = {
      username,
      email,
      password,
      phoneNumber: '+91' + phoneDigits,
      firstName,
      lastName
    };
    this.adminService.addAdmin(adminToAdd).subscribe(
      () => {
        this.showToastMessage('Admin added successfully!');
        this.fetchAdmins();
        // After fetchAdmins, admins will be sorted alphabetically
        this.closeAddAdminDialog();
      },
      (error) => {
        this.showToastMessage('Failed to add admin.');
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
      this.showToastMessage('Please enter new password and confirm password.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.showToastMessage('New password and confirm password do not match.');
      return;
    }
    if (!this.selectedAdminForPassword) return;
    this.adminService.changeAdminPassword(this.selectedAdminForPassword.id, this.newPassword).subscribe(
      () => {
        this.showToastMessage('Password updated successfully!');
        this.closeChangePasswordModal();
      },
      (error: any) => {
        this.showToastMessage('Failed to update password.');
        console.error(error);
      }
    );
  }
}
