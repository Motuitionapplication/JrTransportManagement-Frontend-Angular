import { Component, OnInit } from '@angular/core';
import { DriverService } from '../../driver.service';
import { AuthService } from 'src/app/services/auth.service';
import { Driver } from 'src/app/models/driver.model';

type TabKey = 'personal' | 'vehicle' | 'work' | 'stats' | 'preferences';

export interface DriverProfile {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    phone: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  driverInfo: {
    licenseNumber: string;
    licenseClass: string;
    licenseExpiry: Date;
    yearsOfExperience: number;
    languagesSpoken: string[];
    specializations: string[];
  };
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    color: string;
    plateNumber: string;
    vin: string;
    registrationExpiry: Date;
    insuranceExpiry: Date;
    capacity: number;
    features: string[];
  };
  workInfo: {
    joinDate: Date;
    employeeId: string;
    workingHours: {
      monday: { start: string; end: string; };
      tuesday: { start: string; end: string; };
      wednesday: { start: string; end: string; };
      thursday: { start: string; end: string; };
      friday: { start: string; end: string; };
      saturday: { start: string; end: string; };
      sunday: { start: string; end: string; };
    };
    preferredAreas: string[];
    maxDistance: number;
  };
  statistics: {
    totalTrips: number;
    totalEarnings: number;
    averageRating: number;
    completionRate: number;
    onTimePercentage: number;
    customerFeedbackCount: number;
    monthsActive: number;
  };
  ratings: {
    overall: number;
    punctuality: number;
    vehicleCondition: number;
    customerService: number;
    navigation: number;
  };
  preferences: {
    notifications: {
      tripRequests: boolean;
      paymentUpdates: boolean;
      scheduleChanges: boolean;
      systemUpdates: boolean;
      promotions: boolean;
    };
    privacy: {
      shareLocation: boolean;
      shareStats: boolean;
      allowRatings: boolean;
    };
    language: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: DriverProfile = {} as DriverProfile;
  editMode = false;
  activeTab: 'personal' | 'vehicle' | 'work' | 'stats' | 'preferences' = 'personal';
  loading = true;
  saving = false;
  
  originalProfile: DriverProfile = {} as DriverProfile;
  
  // Form validation
  formErrors: { [key: string]: string } = {};
  
  // Available options
  languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian'
  ];
  
  specializations = [
    'Airport Transfers', 'Business Travel', 'Medical Transport', 
    'School Runs', 'Long Distance', 'Night Shifts', 'Pet Friendly',
    'Wheelchair Accessible', 'Luxury Service', 'Cargo Transport'
  ];
  
  vehicleFeatures = [
    'Air Conditioning', 'GPS Navigation', 'Wi-Fi', 'Phone Charger',
    'Water Bottles', 'Wheelchair Accessible', 'Pet Friendly', 'Cargo Space',
    'Child Seats', 'Music System', 'Leather Seats', 'Sunroof'
  ];
  
  preferredAreas = [
    'Downtown', 'Airport', 'Business District', 'Residential Areas',
    'Shopping Centers', 'Universities', 'Hospitals', 'Industrial Zone',
    'Suburbs', 'Tourist Areas', 'Transportation Hubs'
  ];

  constructor(
    private driverService: DriverService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();

    if (currentUser?.id != null) {
      // Attempt to pull fresh data from backend; fallback to mock data if unavailable.
      this.driverService.getDriverByUserId(currentUser.id.toString()).subscribe({
        next: (driver) => {
          this.hydrateProfileFromDriver(driver);
          this.loading = false;
        },
        error: (err) => {
          console.warn('Driver profile fetch failed, using mock data instead.', err);
          this.profile = this.generateMockProfile();
          this.originalProfile = JSON.parse(JSON.stringify(this.profile));
          this.loading = false;
        }
      });
    } else {
      // No authenticated user context; use mock data but surface TODO for future guard.
      console.warn('Driver profile: no authenticated user found. Falling back to mock profile.');
      this.profile = this.generateMockProfile();
      this.originalProfile = JSON.parse(JSON.stringify(this.profile));
      this.loading = false;
    }
  }

  /**
   * Minimal mapping from backend driver model to existing profile view model.
   * TODO: replace mock scaffolding with full backend-driven structure once API stabilises.
   */
  private hydrateProfileFromDriver(driver: Driver): void {
    const baseline = this.generateMockProfile();

    baseline.id = driver.id ?? baseline.id;

    const prof = driver.profile;
    if (prof) {
      baseline.personalInfo.firstName = prof.firstName || baseline.personalInfo.firstName;
      baseline.personalInfo.lastName = prof.lastName || baseline.personalInfo.lastName;
      baseline.personalInfo.email = prof.email || baseline.personalInfo.email;
      baseline.personalInfo.phone = prof.phoneNumber || baseline.personalInfo.phone;

      if (prof.address) {
        baseline.personalInfo.address.street = prof.address.street || baseline.personalInfo.address.street;
        baseline.personalInfo.address.city = prof.address.city || baseline.personalInfo.address.city;
        baseline.personalInfo.address.state = prof.address.state || baseline.personalInfo.address.state;
        baseline.personalInfo.address.zipCode = prof.address.pincode || baseline.personalInfo.address.zipCode;
      }

      if (prof.emergencyContact) {
        baseline.personalInfo.emergencyContact.name = prof.emergencyContact.name || baseline.personalInfo.emergencyContact.name;
        baseline.personalInfo.emergencyContact.relationship = prof.emergencyContact.relationship || baseline.personalInfo.emergencyContact.relationship;
        baseline.personalInfo.emergencyContact.phone = prof.emergencyContact.phoneNumber || baseline.personalInfo.emergencyContact.phone;
      }
    }

    const dl = driver.drivingLicense;
    if (dl) {
      baseline.driverInfo.licenseNumber = dl.licenseNumber || baseline.driverInfo.licenseNumber;
      baseline.driverInfo.licenseExpiry = dl.expiryDate ? new Date(dl.expiryDate) : baseline.driverInfo.licenseExpiry;
    }

    const experienceYears = driver.experience?.totalYears;
    if (experienceYears != null) {
      baseline.driverInfo.yearsOfExperience = experienceYears;
    }

    // Vehicle and statistics data remain mock-backed until dedicated endpoints are wired.
    // TODO: hydrate vehicleInfo once driver API exposes assigned vehicle details.

    this.profile = baseline;
    this.originalProfile = JSON.parse(JSON.stringify(this.profile));
  }

  generateMockProfile(): DriverProfile {
    return {
      id: 'driver_001',
      personalInfo: {
        firstName: 'John',
        lastName: 'Smith',
        dateOfBirth: new Date('1985-06-15'),
        phone: '+1 (555) 123-4567',
        email: 'john.smith@email.com',
        address: {
          street: '123 Main Street, Apt 4B',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States'
        },
        emergencyContact: {
          name: 'Jane Smith',
          relationship: 'Spouse',
          phone: '+1 (555) 987-6543'
        }
      },
      driverInfo: {
        licenseNumber: 'D1234567890',
        licenseClass: 'Class C',
        licenseExpiry: new Date('2025-06-15'),
        yearsOfExperience: 8,
        languagesSpoken: ['English', 'Spanish'],
        specializations: ['Airport Transfers', 'Business Travel', 'Long Distance']
      },
      vehicleInfo: {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        color: 'Silver',
        plateNumber: 'ABC-1234',
        vin: '1HGBH41JXMN109186',
        registrationExpiry: new Date('2024-12-31'),
        insuranceExpiry: new Date('2024-08-15'),
        capacity: 4,
        features: ['Air Conditioning', 'GPS Navigation', 'Wi-Fi', 'Phone Charger']
      },
      workInfo: {
        joinDate: new Date('2022-01-15'),
        employeeId: 'EMP001234',
        workingHours: {
          monday: { start: '08:00', end: '18:00' },
          tuesday: { start: '08:00', end: '18:00' },
          wednesday: { start: '08:00', end: '18:00' },
          thursday: { start: '08:00', end: '18:00' },
          friday: { start: '08:00', end: '18:00' },
          saturday: { start: '09:00', end: '15:00' },
          sunday: { start: '', end: '' }
        },
        preferredAreas: ['Downtown', 'Airport', 'Business District'],
        maxDistance: 50
      },
      statistics: {
        totalTrips: 1247,
        totalEarnings: 28750.50,
        averageRating: 4.8,
        completionRate: 98.5,
        onTimePercentage: 94.2,
        customerFeedbackCount: 523,
        monthsActive: 24
      },
      ratings: {
        overall: 4.8,
        punctuality: 4.9,
        vehicleCondition: 4.7,
        customerService: 4.8,
        navigation: 4.6
      },
      preferences: {
        notifications: {
          tripRequests: true,
          paymentUpdates: true,
          scheduleChanges: true,
          systemUpdates: false,
          promotions: false
        },
        privacy: {
          shareLocation: true,
          shareStats: true,
          allowRatings: true
        },
        language: 'English',
        theme: 'light'
      }
    };
  }

  // Tab navigation
  switchTab(tab: TabKey): void {
    if (this.editMode && this.hasUnsavedChanges()) {
      const confirmSwitch = confirm('You have unsaved changes. Do you want to discard them?');
      if (!confirmSwitch) return;
      this.cancelEdit();
    }
    this.activeTab = tab;
  }

  // Edit mode management
  enterEditMode(): void {
    this.editMode = true;
    this.originalProfile = JSON.parse(JSON.stringify(this.profile));
    this.formErrors = {};
  }

  cancelEdit(): void {
    this.profile = JSON.parse(JSON.stringify(this.originalProfile));
    this.editMode = false;
    this.formErrors = {};
  }

  saveProfile(): void {
    if (!this.validateProfile()) {
      return;
    }

    this.saving = true;
    
    // Simulate API call
    setTimeout(() => {
      console.log('Saving profile:', this.profile);
      this.originalProfile = JSON.parse(JSON.stringify(this.profile));
      this.editMode = false;
      this.saving = false;
      this.formErrors = {};
      
      // Show success message
      alert('Profile updated successfully!');
    }, 1500);
  }

  hasUnsavedChanges(): boolean {
    return JSON.stringify(this.profile) !== JSON.stringify(this.originalProfile);
  }

  // Validation
  validateProfile(): boolean {
    this.formErrors = {};
    let isValid = true;

    // Validate personal info
    if (!this.profile.personalInfo.firstName?.trim()) {
      this.formErrors['firstName'] = 'First name is required';
      isValid = false;
    }

    if (!this.profile.personalInfo.lastName?.trim()) {
      this.formErrors['lastName'] = 'Last name is required';
      isValid = false;
    }

    if (!this.profile.personalInfo.email?.trim()) {
      this.formErrors['email'] = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.profile.personalInfo.email)) {
      this.formErrors['email'] = 'Please enter a valid email address';
      isValid = false;
    }

    if (!this.profile.personalInfo.phone?.trim()) {
      this.formErrors['phone'] = 'Phone number is required';
      isValid = false;
    }

    // Validate driver info
    if (!this.profile.driverInfo.licenseNumber?.trim()) {
      this.formErrors['licenseNumber'] = 'License number is required';
      isValid = false;
    }

    if (this.profile.driverInfo.licenseExpiry < new Date()) {
      this.formErrors['licenseExpiry'] = 'License has expired';
      isValid = false;
    }

    // Validate vehicle info
    if (!this.profile.vehicleInfo.plateNumber?.trim()) {
      this.formErrors['plateNumber'] = 'Plate number is required';
      isValid = false;
    }

    if (this.profile.vehicleInfo.registrationExpiry < new Date()) {
      this.formErrors['registrationExpiry'] = 'Vehicle registration has expired';
      isValid = false;
    }

    if (this.profile.vehicleInfo.insuranceExpiry < new Date()) {
      this.formErrors['insuranceExpiry'] = 'Vehicle insurance has expired';
      isValid = false;
    }

    return isValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Utility methods
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getExperienceYears(): number {
    const joinDate = new Date(this.profile.workInfo.joinDate);
    const now = new Date();
    return Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
  }

  getRatingStars(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    
    if (hasHalfStar) {
      stars.push('☆');
    }
    
    while (stars.length < 5) {
      stars.push('☆');
    }
    
    return stars;
  }

  // Array management for multi-select fields
  addLanguage(language: string): void {
    if (language && !this.profile.driverInfo.languagesSpoken.includes(language)) {
      this.profile.driverInfo.languagesSpoken.push(language);
    }
  }

  removeLanguage(language: string): void {
    const index = this.profile.driverInfo.languagesSpoken.indexOf(language);
    if (index > -1) {
      this.profile.driverInfo.languagesSpoken.splice(index, 1);
    }
  }

  addSpecialization(specialization: string): void {
    if (specialization && !this.profile.driverInfo.specializations.includes(specialization)) {
      this.profile.driverInfo.specializations.push(specialization);
    }
  }

  removeSpecialization(specialization: string): void {
    const index = this.profile.driverInfo.specializations.indexOf(specialization);
    if (index > -1) {
      this.profile.driverInfo.specializations.splice(index, 1);
    }
  }

  addVehicleFeature(feature: string): void {
    if (feature && !this.profile.vehicleInfo.features.includes(feature)) {
      this.profile.vehicleInfo.features.push(feature);
    }
  }

  removeVehicleFeature(feature: string): void {
    const index = this.profile.vehicleInfo.features.indexOf(feature);
    if (index > -1) {
      this.profile.vehicleInfo.features.splice(index, 1);
    }
  }

  addPreferredArea(area: string): void {
    if (area && !this.profile.workInfo.preferredAreas.includes(area)) {
      this.profile.workInfo.preferredAreas.push(area);
    }
  }

  removePreferredArea(area: string): void {
    const index = this.profile.workInfo.preferredAreas.indexOf(area);
    if (index > -1) {
      this.profile.workInfo.preferredAreas.splice(index, 1);
    }
  }

  // File upload (for profile picture, documents, etc.)
  uploadProfilePicture(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // TODO: Implement file upload
      console.log('Uploading profile picture:', file);
    }
  }

  // Profile actions
  downloadProfile(): void {
    const dataStr = JSON.stringify(this.profile, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `driver-profile-${this.profile.id}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  exportToPDF(): void {
    // TODO: Implement PDF export
    console.log('Exporting profile to PDF...');
  }

  deleteAccount(): void {
    const confirmDelete = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmDelete) {
      const confirmPassword = prompt('Please enter your password to confirm account deletion:');
      if (confirmPassword) {
        // TODO: Implement account deletion
        console.log('Deleting account...');
      }
    }
  }

  // Preferences management
  updateNotificationPreference(type: keyof typeof this.profile.preferences.notifications, value: boolean): void {
    this.profile.preferences.notifications[type] = value;
  }

  updatePrivacyPreference(type: keyof typeof this.profile.preferences.privacy, value: boolean): void {
    this.profile.preferences.privacy[type] = value;
  }

  changeLanguage(language: string): void {
    this.profile.preferences.language = language;
    // TODO: Implement language change functionality
  }

  changeTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.profile.preferences.theme = theme;
    // TODO: Implement theme change functionality
  }

  // Date update methods
  updateDateOfBirth(event: any): void {
    this.profile.personalInfo.dateOfBirth = new Date(event.target.value);
  }

  updateLicenseExpiry(event: any): void {
    this.profile.driverInfo.licenseExpiry = new Date(event.target.value);
  }

  updateRegistrationExpiry(event: any): void {
    this.profile.vehicleInfo.registrationExpiry = new Date(event.target.value);
  }

  updateInsuranceExpiry(event: any): void {
    this.profile.vehicleInfo.insuranceExpiry = new Date(event.target.value);
  }

  switchTabHelper(tabKey: string): void {
    this.switchTab(tabKey as TabKey);
  }

  // Helper methods for event handling
  onLanguageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target.value) {
      this.addLanguage(target.value);
      target.value = '';
    }
  }

  onSpecializationChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target.value) {
      this.addSpecialization(target.value);
      target.value = '';
    }
  }

  onVehicleFeatureChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target.value) {
      this.addVehicleFeature(target.value);
      target.value = '';
    }
  }

  onPreferredAreaChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target.value) {
      this.addPreferredArea(target.value);
      target.value = '';
    }
  }

  onNotificationChange(key: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateNotificationPreference(key as 'tripRequests' | 'paymentUpdates' | 'scheduleChanges' | 'systemUpdates' | 'promotions', target.checked);
  }

  // Helper for working hours with proper typing
  getWorkingHour(day: string, period: 'start' | 'end'): string {
    const workingHours = this.profile.workInfo.workingHours as any;
    return workingHours[day]?.[period] || '';
  }

  setWorkingHour(day: string, period: 'start' | 'end', value: string): void {
    const workingHours = this.profile.workInfo.workingHours as any;
    if (!workingHours[day]) {
      workingHours[day] = { start: '', end: '' };
    }
    workingHours[day][period] = value;
  }

  // Helper method for working hours input events
  onWorkingHourChange(event: Event, day: string, type: 'start' | 'end'): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.setWorkingHour(day, type, target.value);
    }
  }

  // Helper method for privacy preference changes
  onPrivacyPreferenceChange(event: Event, preference: string): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      // Use any type to avoid complex type assertion issues
      this.updatePrivacyPreference(preference as any, target.checked);
    }
  }

  // Helper method for language selection change
  onLanguageSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.changeLanguage(target.value);
    }
  }

  // Helper method for theme change
  onThemeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.changeTheme(target.value as 'light' | 'dark' | 'auto');
    }
  }
}