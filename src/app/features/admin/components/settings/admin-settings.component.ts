import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { forkJoin, of } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { AdminService } from 'src/app/admin/admin.service';
import { DriverService } from 'src/app/features/driver/driver.service';
import { CustomerService } from 'src/app/features/customer/customer.service';
import { VehicleService } from 'src/app/services/vehicle.service';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { SettingsService } from '../../services/settings.service';

interface SystemSettings {
  general: {
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    timezone: string;
    currency: string;
    language: string;
  };
  booking: {
    autoAcceptBookings: boolean;
    maxAdvanceBookingDays: number;
    cancellationDeadlineHours: number;
    refundPolicy: string;
    requirePaymentConfirmation: boolean;
  };
  pricing: {
    baseFare: number;
    pricePerKm: number;
    nightChargeMultiplier: number;
    waitingChargePerMinute: number;
    cancellationFee: number;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    bookingConfirmation: boolean;
    paymentReminders: boolean;
    driverUpdates: boolean;
  };
  security: {
    passwordMinLength: number;
    requireTwoFactor: boolean;
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    dataRetentionDays: number;
  };
}

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss'],
})
export class AdminSettingsComponent implements OnInit, AfterViewInit {
  settingsForm!: FormGroup;
  selectedTab = 0;
  isLoading = false;
  hasUnsavedChanges = false;

  // Settings data
  settings: SystemSettings = {
    general: {
      companyName: 'JR Transport Management',
      companyEmail: 'admin@jrtransport.com',
      companyPhone: '+91 98765 43210',
      companyAddress: '123 Business Park, Tech City, India',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      language: 'en',
    },
    booking: {
      autoAcceptBookings: false,
      maxAdvanceBookingDays: 30,
      cancellationDeadlineHours: 2,
      refundPolicy: 'full',
      requirePaymentConfirmation: true,
    },
    pricing: {
      baseFare: 50,
      pricePerKm: 12,
      nightChargeMultiplier: 1.5,
      waitingChargePerMinute: 2,
      cancellationFee: 25,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      bookingConfirmation: true,
      paymentReminders: true,
      driverUpdates: true,
    },
    security: {
      passwordMinLength: 8,
      requireTwoFactor: false,
      sessionTimeoutMinutes: 30,
      maxLoginAttempts: 5,
      dataRetentionDays: 365,
    },
  };

  // Dropdown options
  timezones = [
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' },
  ];

  currencies = [
    { value: 'INR', label: '₹ Indian Rupee (INR)' },
    { value: 'USD', label: '$ US Dollar (USD)' },
    { value: 'EUR', label: '€ Euro (EUR)' },
    { value: 'GBP', label: '£ British Pound (GBP)' },
  ];

  languages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
  ];

  refundPolicies = [
    { value: 'full', label: 'Full Refund' },
    { value: 'partial', label: 'Partial Refund (80%)' },
    { value: 'fee', label: 'Refund minus Processing Fee' },
    { value: 'none', label: 'No Refund' },
  ];

  // Backup and restore options
  backupHistory: {
    id: number;
    date: Date;
    type: string;
    size: string;
    status: string;
  }[] = [];

  // User management data
  adminUsers = [
    {
      id: 1,
      name: 'John Admin',
      email: 'john@jrtransport.com',
      role: 'Super Admin',
      status: 'Active',
      lastLogin: new Date('2024-01-15T14:30:00'),
      permissions: ['all'],
    },
    {
      id: 2,
      name: 'Sarah Manager',
      email: 'sarah@jrtransport.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: new Date('2024-01-15T10:20:00'),
      permissions: ['bookings', 'drivers', 'reports'],
    },
    {
      id: 3,
      name: 'Mike Support',
      email: 'mike@jrtransport.com',
      role: 'Support',
      status: 'Inactive',
      lastLogin: new Date('2024-01-12T16:45:00'),
      permissions: ['bookings', 'customers'],
    },
  ];

  dataSource = new MatTableDataSource(this.backupHistory);
  displayedColumns: string[] = ['date', 'type', 'size', 'status'];
  searchValue: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private settingsService: SettingsService,
    private vehicleService: VehicleService,
    private driverService: DriverService,
    private customerService: CustomerService,
    private adminService: AdminService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadBackupHistory();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      if (this.paginator._intl) {
        this.paginator._intl.itemsPerPageLabel = 'Items per page';
      }
      if (this.paginator.page) {
        this.paginator.page.subscribe(() => {
          this.dataSource.paginator = this.paginator; // Reassign paginator to ensure proper functionality
          this.changeDetectorRef.detectChanges(); // Trigger change detection on page change
        });
      } else {
        console.error(
          'Paginator page property is undefined. Ensure MatPaginator is properly initialized.'
        );
      }
    } else {
      console.error(
        'Paginator is undefined. Ensure MatPaginator is linked to the dataSource.'
      );
    }
  }

  private initializeForm(): void {
    this.settingsForm = this.fb.group({
      // General Settings
      companyName: [this.settings.general.companyName, [Validators.required]],
      companyEmail: [
        this.settings.general.companyEmail,
        [Validators.required, Validators.email],
      ],
      companyPhone: [this.settings.general.companyPhone, [Validators.required]],
      companyAddress: [
        this.settings.general.companyAddress,
        [Validators.required],
      ],
      timezone: [this.settings.general.timezone, [Validators.required]],
      currency: [this.settings.general.currency, [Validators.required]],
      language: [this.settings.general.language, [Validators.required]],

      // Booking Settings
      autoAcceptBookings: [this.settings.booking.autoAcceptBookings],
      maxAdvanceBookingDays: [
        this.settings.booking.maxAdvanceBookingDays,
        [Validators.required, Validators.min(1)],
      ],
      cancellationDeadlineHours: [
        this.settings.booking.cancellationDeadlineHours,
        [Validators.required, Validators.min(0)],
      ],
      refundPolicy: [this.settings.booking.refundPolicy, [Validators.required]],
      requirePaymentConfirmation: [
        this.settings.booking.requirePaymentConfirmation,
      ],

      // Pricing Settings
      baseFare: [
        this.settings.pricing.baseFare,
        [Validators.required, Validators.min(0)],
      ],
      pricePerKm: [
        this.settings.pricing.pricePerKm,
        [Validators.required, Validators.min(0)],
      ],
      nightChargeMultiplier: [
        this.settings.pricing.nightChargeMultiplier,
        [Validators.required, Validators.min(1)],
      ],
      waitingChargePerMinute: [
        this.settings.pricing.waitingChargePerMinute,
        [Validators.required, Validators.min(0)],
      ],
      cancellationFee: [
        this.settings.pricing.cancellationFee,
        [Validators.required, Validators.min(0)],
      ],

      // Notification Settings
      emailNotifications: [this.settings.notifications.emailNotifications],
      smsNotifications: [this.settings.notifications.smsNotifications],
      pushNotifications: [this.settings.notifications.pushNotifications],
      bookingConfirmation: [this.settings.notifications.bookingConfirmation],
      paymentReminders: [this.settings.notifications.paymentReminders],
      driverUpdates: [this.settings.notifications.driverUpdates],

      // Security Settings
      passwordMinLength: [
        this.settings.security.passwordMinLength,
        [Validators.required, Validators.min(6)],
      ],
      requireTwoFactor: [this.settings.security.requireTwoFactor],
      sessionTimeoutMinutes: [
        this.settings.security.sessionTimeoutMinutes,
        [Validators.required, Validators.min(5)],
      ],
      maxLoginAttempts: [
        this.settings.security.maxLoginAttempts,
        [Validators.required, Validators.min(3)],
      ],
      dataRetentionDays: [
        this.settings.security.dataRetentionDays,
        [Validators.required, Validators.min(30)],
      ],
    });

    // Track form changes
    this.settingsForm.valueChanges.subscribe(() => {
      this.hasUnsavedChanges = this.settingsForm.dirty;
    });
  }

  loadSettings(): void {
    this.settingsService.getSettings().subscribe(
      (settings: { category: string; key: string; value: string }[]) => {
        const groupedSettings: {
          [category: string]: { [key: string]: string };
        } = {};
        settings.forEach((setting) => {
          if (!groupedSettings[setting.category]) {
            groupedSettings[setting.category] = {};
          }
          groupedSettings[setting.category][setting.key] = setting.value;
        });

        console.log('Settings loaded from backend:', groupedSettings); // Debugging log
        this.settingsForm.patchValue(groupedSettings);
      },
      (error) => {
        console.error('Error loading settings:', error); // Log error details
        this.snackBar.open(
          'Failed to load settings. Please try again.',
          'Close',
          { duration: 3000 }
        );
      }
    );
  }

  loadBackupHistory(): void {
    this.settingsService.getBackupHistory().subscribe(
      (history) => {
        // Ensure all dates are parsed as Date objects
        this.backupHistory = history.map((backup) => ({
          ...backup,
          date: new Date(backup.date),
        }));
        this.dataSource = new MatTableDataSource(this.backupHistory); // Reinitialize the data source
        this.dataSource.paginator = this.paginator; // Reassign paginator to the new data source
        this.dataSource.connect().subscribe(() => {
          this.changeDetectorRef.detectChanges(); // Trigger change detection to refresh the UI
        });
      },
      (error) => {
        this.snackBar.open(
          'Failed to load backup history. Please try again.',
          'Close',
          { duration: 3000 }
        );
      }
    );
  }

  // Save settings to the backend
  saveSettings(): void {
    if (this.settingsForm.invalid) {
      this.snackBar.open(
        'Please fix the errors in the form before saving.',
        'Close',
        {
          duration: 3000,
        }
      );
      return;
    }

    this.isLoading = true;

    // Log detailed form values for debugging
    console.log(
      'Detailed form values:',
      JSON.stringify(this.settingsForm.value, null, 2)
    );

    // Explicit mapping of form keys to categories
    const categoryMapping: { [key: string]: string } = {
      companyName: 'general',
      companyEmail: 'general',
      companyPhone: 'general',
      companyAddress: 'general',
      timezone: 'general',
      currency: 'general',
      language: 'general',
      autoAcceptBookings: 'booking',
      maxAdvanceBookingDays: 'booking',
      cancellationDeadlineHours: 'booking',
      refundPolicy: 'booking',
      requirePaymentConfirmation: 'booking',
      baseFare: 'pricing',
      pricePerKm: 'pricing',
      nightChargeMultiplier: 'pricing',
      waitingChargePerMinute: 'pricing',
      cancellationFee: 'pricing',
      emailNotifications: 'notifications',
      smsNotifications: 'notifications',
      pushNotifications: 'notifications',
      bookingConfirmation: 'notifications',
      paymentReminders: 'notifications',
      driverUpdates: 'notifications',
      passwordMinLength: 'security',
      requireTwoFactor: 'security',
      sessionTimeoutMinutes: 'security',
      maxLoginAttempts: 'security',
      dataRetentionDays: 'security',
    };

    // Group fields by category
    const groupedSettings: { [category: string]: { [key: string]: any } } = {
      general: {},
      booking: {},
      pricing: {},
      notifications: {},
      security: {},
    };

    Object.entries(this.settingsForm.value).forEach(([key, value]) => {
      const category = categoryMapping[key];
      if (category) {
        groupedSettings[category][key] = value;
      } else {
        console.warn(`Key "${key}" does not have a mapped category.`);
      }
    });

    // Transform grouped settings into an array of { category, key, value }
    const settingsArray = Object.entries(groupedSettings).flatMap(
      ([category, settings]) =>
        Object.entries(settings).map(([key, value]) => ({
          category,
          key,
          value: value !== null && value !== undefined ? value.toString() : '', // Ensure the value is sent as a single string
        }))
    );

    console.log('Payload being sent to the backend:', settingsArray); // Debugging log

    if (settingsArray.length === 0) {
      this.snackBar.open(
        'No settings to save. Please check your input.',
        'Close',
        {
          duration: 3000,
        }
      );
      this.isLoading = false;
      return;
    }

    this.settingsService.saveSettings(settingsArray).subscribe(
      (updatedSettings: { category: string; key: string; value: string }[]) => {
        this.isLoading = false;
        this.hasUnsavedChanges = false;
        this.snackBar.open('Settings saved successfully.', 'Close', {
          duration: 3000,
        });

        // Update the form with the latest settings
        const groupedSettings: {
          [category: string]: { [key: string]: string };
        } = {};
        updatedSettings.forEach((setting) => {
          if (!groupedSettings[setting.category]) {
            groupedSettings[setting.category] = {};
          }
          groupedSettings[setting.category][setting.key] = setting.value;
        });
        this.settingsForm.patchValue(groupedSettings);
      },
      (error: any) => {
        this.isLoading = false;
        console.error('Error saving settings:', error);
        this.snackBar.open(
          'Failed to save settings. Please try again.',
          'Close',
          {
            duration: 3000,
          }
        );
      }
    );
  }

  onFormChange(): void {
    if (this.settingsForm.dirty) {
      this.hasUnsavedChanges = true;
    }
  }

  // Confirm save settings
  confirmSaveSettings(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Save Changes',
        message:
          'Are you sure you want to save the changes? This action will overwrite the current settings.',
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading = true; // Start loading
        this.saveSettings();
      }
    });
  }

  // Reset settings to default values
  resetSettings(): void {
    this.settingsForm.reset(this.settings);
    this.hasUnsavedChanges = false;
    this.snackBar.open('Settings reset to default values.', 'Close', {
      duration: 3000,
    });
  }

  // Confirm reset settings
  confirmResetSettings(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Reset Settings',
        message:
          'Are you sure you want to reset all settings to their default values? This action cannot be undone.',
        confirmButtonText: 'Reset',
        cancelButtonText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.resetSettings();
      }
    });
  }

  // Handle tab change
  onTabChange(index: number): void {
    this.selectedTab = index;
    console.log(`Switched to tab index: ${index}`);
  }

  // Backup actions
  createBackup(): void {
    const newBackup = {
      date: new Date(),
      type: 'Manual',
      size: '130 MB',
      status: 'Completed',
    };

    this.settingsService
      .createBackup(newBackup)
      .pipe(
        timeout(10000) // Set a timeout of 10 seconds
      )
      .subscribe(
        (savedBackup) => {
          this.loadBackupHistory(); // Refresh backup history after creating a backup
          this.changeDetectorRef.detectChanges(); // Trigger change detection to refresh the UI
          this.snackBar.open('Backup created successfully!', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success'],
          });
        },
        (error) => {
          this.isLoading = false;
          const errorMessage =
            error.name === 'TimeoutError'
              ? 'The backup request timed out. Please try again.'
              : 'Failed to create backup. Please try again.';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error'],
          });
          this.changeDetectorRef.detectChanges(); // Ensure UI updates even on error
        }
      );
  }

  restoreBackup(backupId: number): void {
    this.isLoading = true;
    this.settingsService.restoreBackup(backupId).subscribe(
      () => {
        this.snackBar.open('Backup restored successfully.', 'Close', {
          duration: 3000,
        });
        this.loadBackupHistory(); // Refresh the backup history after restoration
        this.isLoading = false;
      },
      (error) => {
        console.error('Error restoring backup:', error);
        this.snackBar.open(
          'Failed to restore backup. Please try again.',
          'Close',
          { duration: 3000 }
        );
        this.isLoading = false;
      }
    );
  }

  deleteBackup(backupId: number): void {
    this.isLoading = true;
    this.settingsService.deleteBackup(backupId).subscribe(
      () => {
        this.snackBar.open('Backup deleted successfully.', 'Close', {
          duration: 3000,
        });
        this.loadBackupHistory(); // Refresh the backup history after deletion
        this.isLoading = false;
      },
      (error) => {
        console.error('Error deleting backup:', error);
        this.snackBar.open(
          'Failed to delete backup. Please try again.',
          'Close',
          { duration: 3000 }
        );
        this.isLoading = false;
      }
    );
  }

  // Confirm delete backup
  confirmDeleteBackup(backupId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Backup',
        message:
          'Are you sure you want to delete this backup? This action cannot be undone.',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteBackup(backupId);
      }
    });
  }

  // Confirm restore backup
  confirmRestoreBackup(backupId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Restore Backup',
        message:
          'Are you sure you want to restore this backup? This action will overwrite current data.',
        confirmButtonText: 'Restore',
        cancelButtonText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.restoreBackup(backupId);
      }
    });
  }

  // User management actions
  addAdmin(): void {
    this.snackBar.open(
      'Add Admin functionality not implemented yet.',
      'Close',
      { duration: 3000 }
    );
  }

  editUser(userId: number): void {
    this.snackBar.open(`Edit User ID: ${userId}`, 'Close', { duration: 3000 });
  }

  toggleUserStatus(userId: number): void {
    const user = this.adminUsers.find((u) => u.id === userId);
    if (user) {
      user.status = user.status === 'Active' ? 'Inactive' : 'Active';
      this.snackBar.open(`User status updated to: ${user.status}`, 'Close', {
        duration: 3000,
      });
    }
  }

  deleteUser(userId: number): void {
    this.adminUsers = this.adminUsers.filter((user) => user.id !== userId);
    this.snackBar.open('User deleted successfully.', 'Close', {
      duration: 3000,
    });
  }

  // Backup admin page data
  backupAdminPage(): void {
    const adminData = {
      settings: this.settingsForm.value,
      backupHistory: this.backupHistory,
      adminUsers: this.adminUsers,
    };

    const blob = new Blob([JSON.stringify(adminData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.snackBar.open('Admin page backup created successfully!', 'Close', {
      duration: 3000,
    });
  }

  backupAdminPageAsExcel(): void {
    const adminData = [
      { Section: 'Settings', Data: JSON.stringify(this.settingsForm.value) },
      { Section: 'Backup History', Data: JSON.stringify(this.backupHistory) },
      { Section: 'Admin Users', Data: JSON.stringify(this.adminUsers) },
    ];

    const worksheet = XLSX.utils.json_to_sheet(adminData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AdminPageBackup');
    XLSX.writeFile(
      workbook,
      `admin-backup-${new Date().toISOString().split('T')[0]}.xlsx`
    );

    this.snackBar.open(
      'Admin page backup (Excel) created successfully!',
      'Close',
      { duration: 3000 }
    );
  }

  backupEntireAdminPageAsExcel(): void {
    const adminData: Array<{ Section: string; Data: string }> = [];
    this.isLoading = true;

    forkJoin({
      settings: of(this.settingsForm.value),
      backupHistory: of(this.backupHistory),
      adminUsers: this.adminService.getAllAdmins(), // Fetch real-time admin data
      vehicles: this.vehicleService.getAllVehicles(),
      drivers: this.driverService.testConnection(), // Using available method
      customers: this.customerService.getAllCustomers(), // Using correct method name
    }).subscribe((results) => {
      console.log('Fetched Data:', results); // Debugging log to verify fetched data
      adminData.push(
        { Section: 'Settings', Data: JSON.stringify(results.settings) },
        {
          Section: 'Backup History',
          Data: JSON.stringify(results.backupHistory),
        },
        { Section: 'Admin Users', Data: JSON.stringify(results.adminUsers) },
        { Section: 'Vehicles', Data: JSON.stringify(results.vehicles) },
        { Section: 'Drivers', Data: JSON.stringify(results.drivers) },
        { Section: 'Customers', Data: JSON.stringify(results.customers) }
      );

      const worksheet = XLSX.utils.json_to_sheet(adminData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        'EntireAdminPageBackup'
      );
      XLSX.writeFile(
        workbook,
        `entire-admin-backup-${new Date().toISOString().split('T')[0]}.xlsx`
      );

      this.snackBar.open(
        'Entire admin page backup (Excel) created successfully!',
        'Close',
        { duration: 3000 }
      );
    });
  }

  // Utility functions
  private showSnackBar(
    message: string,
    type: 'success' | 'error' | 'info'
  ): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [`snack-${type}`],
    });
  }

  formatDate(date: any): string {
    if (!(date instanceof Date)) {
      console.error('Invalid date:', date); // Debugging log
      return 'Invalid Date';
    }
    return date.toLocaleDateString();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Active':
      case 'Completed':
        return 'success';
      case 'Inactive':
        return 'warn';
      default:
        return 'primary';
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchValue = filterValue.trim().toLowerCase();
    this.dataSource.filter = this.searchValue;
  }

  clearSearch(): void {
    this.searchValue = '';
    this.dataSource.filter = '';
  }
}
