import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

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
  styleUrls: ['./admin-settings.component.scss']
})
export class AdminSettingsComponent implements OnInit {
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
      language: 'en'
    },
    booking: {
      autoAcceptBookings: false,
      maxAdvanceBookingDays: 30,
      cancellationDeadlineHours: 2,
      refundPolicy: 'full',
      requirePaymentConfirmation: true
    },
    pricing: {
      baseFare: 50,
      pricePerKm: 12,
      nightChargeMultiplier: 1.5,
      waitingChargePerMinute: 2,
      cancellationFee: 25
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      bookingConfirmation: true,
      paymentReminders: true,
      driverUpdates: true
    },
    security: {
      passwordMinLength: 8,
      requireTwoFactor: false,
      sessionTimeoutMinutes: 30,
      maxLoginAttempts: 5,
      dataRetentionDays: 365
    }
  };

  // Dropdown options
  timezones = [
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' }
  ];

  currencies = [
    { value: 'INR', label: '₹ Indian Rupee (INR)' },
    { value: 'USD', label: '$ US Dollar (USD)' },
    { value: 'EUR', label: '€ Euro (EUR)' },
    { value: 'GBP', label: '£ British Pound (GBP)' }
  ];

  languages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' }
  ];

  refundPolicies = [
    { value: 'full', label: 'Full Refund' },
    { value: 'partial', label: 'Partial Refund (80%)' },
    { value: 'fee', label: 'Refund minus Processing Fee' },
    { value: 'none', label: 'No Refund' }
  ];

  // Backup and restore options
  backupHistory = [
    {
      id: 1,
      date: new Date('2024-01-15T10:30:00'),
      type: 'Automatic',
      size: '125 MB',
      status: 'Completed'
    },
    {
      id: 2,
      date: new Date('2024-01-10T15:45:00'),
      type: 'Manual',
      size: '118 MB',
      status: 'Completed'
    },
    {
      id: 3,
      date: new Date('2024-01-05T08:15:00'),
      type: 'Automatic',
      size: '112 MB',
      status: 'Completed'
    }
  ];

  // User management data
  adminUsers = [
    {
      id: 1,
      name: 'John Admin',
      email: 'john@jrtransport.com',
      role: 'Super Admin',
      status: 'Active',
      lastLogin: new Date('2024-01-15T14:30:00'),
      permissions: ['all']
    },
    {
      id: 2,
      name: 'Sarah Manager',
      email: 'sarah@jrtransport.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: new Date('2024-01-15T10:20:00'),
      permissions: ['bookings', 'drivers', 'reports']
    },
    {
      id: 3,
      name: 'Mike Support',
      email: 'mike@jrtransport.com',
      role: 'Support',
      status: 'Inactive',
      lastLogin: new Date('2024-01-12T16:45:00'),
      permissions: ['bookings', 'customers']
    }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private initializeForm(): void {
    this.settingsForm = this.fb.group({
      // General Settings
      companyName: [this.settings.general.companyName, [Validators.required]],
      companyEmail: [this.settings.general.companyEmail, [Validators.required, Validators.email]],
      companyPhone: [this.settings.general.companyPhone, [Validators.required]],
      companyAddress: [this.settings.general.companyAddress, [Validators.required]],
      timezone: [this.settings.general.timezone, [Validators.required]],
      currency: [this.settings.general.currency, [Validators.required]],
      language: [this.settings.general.language, [Validators.required]],

      // Booking Settings
      autoAcceptBookings: [this.settings.booking.autoAcceptBookings],
      maxAdvanceBookingDays: [this.settings.booking.maxAdvanceBookingDays, [Validators.required, Validators.min(1)]],
      cancellationDeadlineHours: [this.settings.booking.cancellationDeadlineHours, [Validators.required, Validators.min(0)]],
      refundPolicy: [this.settings.booking.refundPolicy, [Validators.required]],
      requirePaymentConfirmation: [this.settings.booking.requirePaymentConfirmation],

      // Pricing Settings
      baseFare: [this.settings.pricing.baseFare, [Validators.required, Validators.min(0)]],
      pricePerKm: [this.settings.pricing.pricePerKm, [Validators.required, Validators.min(0)]],
      nightChargeMultiplier: [this.settings.pricing.nightChargeMultiplier, [Validators.required, Validators.min(1)]],
      waitingChargePerMinute: [this.settings.pricing.waitingChargePerMinute, [Validators.required, Validators.min(0)]],
      cancellationFee: [this.settings.pricing.cancellationFee, [Validators.required, Validators.min(0)]],

      // Notification Settings
      emailNotifications: [this.settings.notifications.emailNotifications],
      smsNotifications: [this.settings.notifications.smsNotifications],
      pushNotifications: [this.settings.notifications.pushNotifications],
      bookingConfirmation: [this.settings.notifications.bookingConfirmation],
      paymentReminders: [this.settings.notifications.paymentReminders],
      driverUpdates: [this.settings.notifications.driverUpdates],

      // Security Settings
      passwordMinLength: [this.settings.security.passwordMinLength, [Validators.required, Validators.min(6)]],
      requireTwoFactor: [this.settings.security.requireTwoFactor],
      sessionTimeoutMinutes: [this.settings.security.sessionTimeoutMinutes, [Validators.required, Validators.min(5)]],
      maxLoginAttempts: [this.settings.security.maxLoginAttempts, [Validators.required, Validators.min(3)]],
      dataRetentionDays: [this.settings.security.dataRetentionDays, [Validators.required, Validators.min(30)]]
    });

    // Track form changes
    this.settingsForm.valueChanges.subscribe(() => {
      this.hasUnsavedChanges = this.settingsForm.dirty;
    });
  }

  private loadSettings(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  onTabChange(index: number): void {
    this.selectedTab = index;
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      this.isLoading = true;
      
      // Simulate API call
      setTimeout(() => {
        this.isLoading = false;
        this.hasUnsavedChanges = false;
        this.settingsForm.markAsPristine();
        this.showSnackBar('Settings saved successfully!', 'success');
      }, 1500);
    } else {
      this.showSnackBar('Please correct the errors in the form', 'error');
    }
  }

  resetSettings(): void {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      this.settingsForm.reset();
      this.initializeForm();
      this.showSnackBar('Settings reset to default values', 'info');
    }
  }

  // Backup and Restore functions
  createBackup(): void {
    this.isLoading = true;
    // Simulate backup creation
    setTimeout(() => {
      this.isLoading = false;
      const newBackup = {
        id: this.backupHistory.length + 1,
        date: new Date(),
        type: 'Manual',
        size: '130 MB',
        status: 'Completed'
      };
      this.backupHistory.unshift(newBackup);
      this.showSnackBar('Backup created successfully!', 'success');
    }, 2000);
  }

  restoreBackup(backupId: number): void {
    if (confirm('Are you sure you want to restore this backup? This will overwrite current settings.')) {
      this.isLoading = true;
      // Simulate restore operation
      setTimeout(() => {
        this.isLoading = false;
        this.showSnackBar('Backup restored successfully!', 'success');
      }, 2000);
    }
  }

  deleteBackup(backupId: number): void {
    if (confirm('Are you sure you want to delete this backup?')) {
      this.backupHistory = this.backupHistory.filter(b => b.id !== backupId);
      this.showSnackBar('Backup deleted', 'info');
    }
  }

  // User Management functions
  addAdmin(): void {
    // Open dialog to add new admin user
    this.showSnackBar('Add admin functionality to be implemented', 'info');
  }

  editUser(userId: number): void {
    // Open dialog to edit user
    this.showSnackBar('Edit user functionality to be implemented', 'info');
  }

  toggleUserStatus(userId: number): void {
    const user = this.adminUsers.find(u => u.id === userId);
    if (user) {
      user.status = user.status === 'Active' ? 'Inactive' : 'Active';
      this.showSnackBar(`User ${user.status.toLowerCase()}`, 'success');
    }
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminUsers = this.adminUsers.filter(u => u.id !== userId);
      this.showSnackBar('User deleted', 'info');
    }
  }

  // Utility functions
  private showSnackBar(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [`snack-${type}`]
    });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
}