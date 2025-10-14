import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

export interface CustomerProfile {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    profilePicture?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault?: boolean;
  };
  preferences: {
    language: string;
    currency: string;
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    bookingDefaults: {
      preferredVehicleType?: string;
      defaultPickupAddress?: string;
      defaultDropoffAddress?: string;
    };
  };
  accountInfo: {
    memberSince: Date;
    totalBookings: number;
    totalSpent: number;
    loyaltyPoints: number;
    accountStatus: 'active' | 'inactive' | 'suspended';
    verificationStatus: {
      email: boolean;
      phone: boolean;
      identity: boolean;
    };
  };
}

export interface AddressInfo {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
  trustedDevices: TrustedDevice[];
}

export interface TrustedDevice {
  id: string;
  deviceName: string;
  deviceType: string;
  lastUsed: Date;
  ipAddress: string;
  location?: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  // Forms
  personalInfoForm!: FormGroup;
  addressForm!: FormGroup;
  preferencesForm!: FormGroup;
  securityForm!: FormGroup;
  passwordForm!: FormGroup;
  
  // Data
  customerProfile: CustomerProfile | null = null;
  addresses: AddressInfo[] = [];
  securitySettings: SecuritySettings | null = null;
  
  // UI State
  activeTab: string = 'personal';
  isEditing: boolean = false;
  showAddressModal: boolean = false;
  showSecurityModal: boolean = false;
  selectedAddress: AddressInfo | null = null;
  profilePicturePreview: string | null = null;
  
  // Loading states
  isLoading: boolean = false;
  isSaving: boolean = false;
  isUploadingPicture: boolean = false;

  constructor(private formBuilder: FormBuilder) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadCustomerProfile();
    this.loadAddresses();
    this.loadSecuritySettings();
  }

  // Initialize all forms
  private initializeForms(): void {
    this.personalInfoForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, this.phoneValidator]],
      dateOfBirth: [''],
      gender: ['']
    });

    this.addressForm = this.formBuilder.group({
      label: ['', [Validators.required]],
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required, this.zipCodeValidator]],
      country: ['USA', [Validators.required]],
      type: ['home', [Validators.required]],
      isDefault: [false]
    });

    this.preferencesForm = this.formBuilder.group({
      language: ['en', [Validators.required]],
      currency: ['USD', [Validators.required]],
      timezone: ['America/New_York', [Validators.required]],
      emailNotifications: [true],
      smsNotifications: [true],
      pushNotifications: [true],
      preferredVehicleType: [''],
      defaultPickupAddress: [''],
      defaultDropoffAddress: ['']
    });

    this.securityForm = this.formBuilder.group({
      twoFactorEnabled: [false],
      loginAlerts: [true],
      sessionTimeout: [30, [Validators.required, Validators.min(5), Validators.max(120)]]
    });

    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.strongPasswordValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Load customer profile
  loadCustomerProfile(): void {
    this.isLoading = true;
    // Mock data - replace with actual API call
    setTimeout(() => {
      this.customerProfile = {
        id: 'CUST-001',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          dateOfBirth: new Date('1990-05-15'),
          gender: 'male',
          profilePicture: '/assets/avatars/default-avatar.png'
        },
        address: {
          street: '123 Main Street',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          country: 'USA',
          isDefault: true
        },
        preferences: {
          language: 'en',
          currency: 'USD',
          timezone: 'America/New_York',
          notifications: {
            email: true,
            sms: true,
            push: true
          },
          bookingDefaults: {
            preferredVehicleType: 'truck-medium',
            defaultPickupAddress: '123 Main Street, Springfield, IL 62701',
            defaultDropoffAddress: ''
          }
        },
        accountInfo: {
          memberSince: new Date('2023-01-15'),
          totalBookings: 24,
          totalSpent: 2450.00,
          loyaltyPoints: 1250,
          accountStatus: 'active',
          verificationStatus: {
            email: true,
            phone: true,
            identity: false
          }
        }
      };
      this.populateFormsWithProfile();
      this.isLoading = false;
    }, 1000);
  }

  // Populate forms with profile data
  private populateFormsWithProfile(): void {
    if (this.customerProfile) {
      const profile = this.customerProfile;
      
      this.personalInfoForm.patchValue({
        firstName: profile.personalInfo.firstName,
        lastName: profile.personalInfo.lastName,
        email: profile.personalInfo.email,
        phone: profile.personalInfo.phone,
        dateOfBirth: profile.personalInfo.dateOfBirth ? 
          new Date(profile.personalInfo.dateOfBirth).toISOString().split('T')[0] : '',
        gender: profile.personalInfo.gender || ''
      });

      this.preferencesForm.patchValue({
        language: profile.preferences.language,
        currency: profile.preferences.currency,
        timezone: profile.preferences.timezone,
        emailNotifications: profile.preferences.notifications.email,
        smsNotifications: profile.preferences.notifications.sms,
        pushNotifications: profile.preferences.notifications.push,
        preferredVehicleType: profile.preferences.bookingDefaults.preferredVehicleType || '',
        defaultPickupAddress: profile.preferences.bookingDefaults.defaultPickupAddress || '',
        defaultDropoffAddress: profile.preferences.bookingDefaults.defaultDropoffAddress || ''
      });
    }
  }

  // Load addresses
  loadAddresses(): void {
    // Mock data - replace with actual API call
    this.addresses = [
      {
        id: 'ADDR-001',
        label: 'Home',
        street: '123 Main Street',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        country: 'USA',
        isDefault: true,
        type: 'home'
      },
      {
        id: 'ADDR-002',
        label: 'Office',
        street: '456 Business Ave',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62702',
        country: 'USA',
        isDefault: false,
        type: 'work'
      }
    ];
  }

  // Load security settings
  loadSecuritySettings(): void {
    // Mock data - replace with actual API call
    this.securitySettings = {
      twoFactorEnabled: false,
      loginAlerts: true,
      sessionTimeout: 30,
      trustedDevices: [
        {
          id: 'DEV-001',
          deviceName: 'iPhone 13',
          deviceType: 'Mobile',
          lastUsed: new Date(),
          ipAddress: '192.168.1.100',
          location: 'Springfield, IL'
        },
        {
          id: 'DEV-002',
          deviceName: 'Chrome on Windows',
          deviceType: 'Desktop',
          lastUsed: new Date(Date.now() - 86400000),
          ipAddress: '192.168.1.101',
          location: 'Springfield, IL'
        }
      ]
    };

    if (this.securitySettings) {
      this.securityForm.patchValue({
        twoFactorEnabled: this.securitySettings.twoFactorEnabled,
        loginAlerts: this.securitySettings.loginAlerts,
        sessionTimeout: this.securitySettings.sessionTimeout
      });
    }
  }

  // Tab management
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Edit mode management
  enableEditMode(): void {
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.populateFormsWithProfile();
  }

  // Save personal information
  savePersonalInfo(): void {
    if (this.personalInfoForm.valid) {
      this.isSaving = true;
      const formValue = this.personalInfoForm.value;
      
      console.log('Saving personal info:', formValue);
      
      // Mock API call
      setTimeout(() => {
        if (this.customerProfile) {
          this.customerProfile.personalInfo = {
            ...this.customerProfile.personalInfo,
            firstName: formValue.firstName,
            lastName: formValue.lastName,
            email: formValue.email,
            phone: formValue.phone,
            dateOfBirth: formValue.dateOfBirth ? new Date(formValue.dateOfBirth) : undefined,
            gender: formValue.gender || undefined
          };
        }
        this.isSaving = false;
        this.isEditing = false;
        alert('Personal information updated successfully!');
      }, 1500);
    } else {
      this.markFormGroupTouched(this.personalInfoForm);
    }
  }

  // Save preferences
  savePreferences(): void {
    if (this.preferencesForm.valid) {
      this.isSaving = true;
      const formValue = this.preferencesForm.value;
      
      console.log('Saving preferences:', formValue);
      
      // Mock API call
      setTimeout(() => {
        if (this.customerProfile) {
          this.customerProfile.preferences = {
            language: formValue.language,
            currency: formValue.currency,
            timezone: formValue.timezone,
            notifications: {
              email: formValue.emailNotifications,
              sms: formValue.smsNotifications,
              push: formValue.pushNotifications
            },
            bookingDefaults: {
              preferredVehicleType: formValue.preferredVehicleType,
              defaultPickupAddress: formValue.defaultPickupAddress,
              defaultDropoffAddress: formValue.defaultDropoffAddress
            }
          };
        }
        this.isSaving = false;
        alert('Preferences updated successfully!');
      }, 1500);
    } else {
      this.markFormGroupTouched(this.preferencesForm);
    }
  }

  // Address management
  addAddress(): void {
    this.selectedAddress = null;
    this.addressForm.reset({
      country: 'USA',
      type: 'home',
      isDefault: false
    });
    this.showAddressModal = true;
  }

  editAddress(address: AddressInfo): void {
    this.selectedAddress = address;
    this.addressForm.patchValue(address);
    this.showAddressModal = true;
  }

  saveAddress(): void {
    if (this.addressForm.valid) {
      const formValue = this.addressForm.value;
      
      if (this.selectedAddress) {
        // Update existing address
        const index = this.addresses.findIndex(a => a.id === this.selectedAddress!.id);
        if (index !== -1) {
          this.addresses[index] = { ...this.selectedAddress, ...formValue };
        }
      } else {
        // Add new address
        const newAddress: AddressInfo = {
          id: 'ADDR-' + Date.now(),
          ...formValue
        };
        this.addresses.push(newAddress);
      }
      
      // If this address is set as default, remove default from others
      if (formValue.isDefault) {
        this.addresses.forEach(addr => {
          if (addr.id !== this.selectedAddress?.id) {
            addr.isDefault = false;
          }
        });
      }
      
      this.closeAddressModal();
      console.log('Address saved:', formValue);
    } else {
      this.markFormGroupTouched(this.addressForm);
    }
  }

  deleteAddress(addressId: string): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.addresses = this.addresses.filter(a => a.id !== addressId);
      console.log('Address deleted:', addressId);
    }
  }

  setDefaultAddress(addressId: string): void {
    this.addresses.forEach(addr => {
      addr.isDefault = addr.id === addressId;
    });
    console.log('Default address updated:', addressId);
  }

  closeAddressModal(): void {
    this.showAddressModal = false;
    this.selectedAddress = null;
    this.addressForm.reset();
  }

  // Security settings
  saveSecuritySettings(): void {
    if (this.securityForm.valid) {
      this.isSaving = true;
      const formValue = this.securityForm.value;
      
      console.log('Saving security settings:', formValue);
      
      // Mock API call
      setTimeout(() => {
        if (this.securitySettings) {
          this.securitySettings = {
            ...this.securitySettings,
            twoFactorEnabled: formValue.twoFactorEnabled,
            loginAlerts: formValue.loginAlerts,
            sessionTimeout: formValue.sessionTimeout
          };
        }
        this.isSaving = false;
        alert('Security settings updated successfully!');
      }, 1500);
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.isSaving = true;
      const formValue = this.passwordForm.value;
      
      console.log('Changing password...');
      
      // Mock API call
      setTimeout(() => {
        this.isSaving = false;
        this.passwordForm.reset();
        alert('Password changed successfully!');
      }, 1500);
    } else {
      this.markFormGroupTouched(this.passwordForm);
    }
  }

  removeTrustedDevice(deviceId: string): void {
    if (confirm('Remove this trusted device?')) {
      if (this.securitySettings) {
        this.securitySettings.trustedDevices = 
          this.securitySettings.trustedDevices.filter(d => d.id !== deviceId);
      }
      console.log('Trusted device removed:', deviceId);
    }
  }

  // Profile picture management
  onProfilePictureSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB.');
        return;
      }
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePicturePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      
      // Upload file
      this.uploadProfilePicture(file);
    }
  }

  private uploadProfilePicture(file: File): void {
    this.isUploadingPicture = true;
    
    // Mock upload process
    setTimeout(() => {
      if (this.customerProfile && this.profilePicturePreview) {
        this.customerProfile.personalInfo.profilePicture = this.profilePicturePreview;
      }
      this.isUploadingPicture = false;
      this.profilePicturePreview = null;
      alert('Profile picture updated successfully!');
    }, 2000);
  }

  // Validators
  private phoneValidator(control: AbstractControl): { [key: string]: any } | null {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(control.value) ? null : { 'invalidPhone': true };
  }

  private zipCodeValidator(control: AbstractControl): { [key: string]: any } | null {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(control.value) ? null : { 'invalidZipCode': true };
  }

  private strongPasswordValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.value;
    if (!password) return null;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const isValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial;
    return isValid ? null : { 'weakPassword': true };
  }

  private passwordMatchValidator(group: AbstractControl): { [key: string]: any } | null {
    const newPassword = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');
    
    if (!newPassword || !confirmPassword) return null;
    
    return newPassword.value === confirmPassword.value ? null : { 'passwordMismatch': true };
  }

  // Utility methods
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Invalid email format';
      if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength}`;
      if (field.errors['invalidPhone']) return 'Invalid phone number format';
      if (field.errors['invalidZipCode']) return 'Invalid zip code format';
      if (field.errors['weakPassword']) return 'Password must contain uppercase, lowercase, number, and special character';
      if (field.errors['passwordMismatch']) return 'Passwords do not match';
      if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
      if (field.errors['max']) return `Maximum value is ${field.errors['max'].max}`;
    }
    return '';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getVerificationIcon(isVerified: boolean): string {
    return isVerified ? 'fas fa-check-circle text-success' : 'fas fa-times-circle text-danger';
  }

  getAccountStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'badge bg-success';
      case 'inactive': return 'badge bg-warning';
      case 'suspended': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }
}