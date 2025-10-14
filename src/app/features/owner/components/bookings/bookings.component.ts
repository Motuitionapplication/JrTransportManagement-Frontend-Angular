import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, takeUntil, debounceTime } from 'rxjs';
import { BookingService } from '../../../../services/booking.service';
import { Booking } from '../../../../models/booking.model';

@Component({
  selector: 'app-booking',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit, OnDestroy {
  bookingForm!: FormGroup;
  bookings$: Observable<Booking[]>;
  currentStep = 1;
  totalSteps = 4;
  isLoading = false;
  showSuccessMessage = false;
  currentBooking: Booking | null = null;
  todayDate: string;
  
  // Auto-save properties
  private readonly STORAGE_KEY = 'booking_form_draft';
  private readonly STEP_STORAGE_KEY = 'booking_current_step';
  showDraftRestoreDialog = false;
  hasSavedDraft = false;
  lastSavedTime: Date | null = null;
  autoSaveEnabled = true;
  
  private destroy$ = new Subject<void>();

  // Form step configuration
  steps = [
    { number: 1, title: 'Cargo Details', isActive: true, isCompleted: false },
    { number: 2, title: 'Route & Schedule', isActive: false, isCompleted: false },
    { number: 3, title: 'Customer & Payment', isActive: false, isCompleted: false },
    { number: 4, title: 'Review & Confirm', isActive: false, isCompleted: false }
  ];

  // Dropdown options
  cargoTypes = [
    { value: 'general', label: 'General Cargo' },
    { value: 'fragile', label: 'Fragile Items' },
    { value: 'hazardous', label: 'Hazardous Materials' },
    { value: 'perishable', label: 'Perishable Goods' },
    { value: 'valuable', label: 'Valuable Items' }
  ];

  paymentMethods = [
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'upi', label: 'UPI Payment' },
    { value: 'net_banking', label: 'Net Banking' },
    { value: 'wallet', label: 'Digital Wallet' },
    { value: 'cash', label: 'Cash on Delivery' }
  ];

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService
  ) {
    this.bookings$ = this.bookingService.bookings$;
    this.todayDate = new Date().toISOString().split('T')[0];
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadBookings();
    this.checkForSavedDraft();
    this.setupAutoSave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Auto-save functionality
  private checkForSavedDraft(): void {
    const savedData = localStorage.getItem(this.STORAGE_KEY);
    const savedStep = localStorage.getItem(this.STEP_STORAGE_KEY);
    
    if (savedData && savedStep) {
      this.hasSavedDraft = true;
      this.showDraftRestoreDialog = true;
      
      // Get saved timestamp if available
      const savedDraft = JSON.parse(savedData);
      if (savedDraft.timestamp) {
        this.lastSavedTime = new Date(savedDraft.timestamp);
      }
    }
  }

  private setupAutoSave(): void {
    if (!this.autoSaveEnabled) return;

    // Auto-save form data on value changes (debounced to avoid excessive saves)
    this.bookingForm.valueChanges
      .pipe(
        debounceTime(2000), // Wait 2 seconds after user stops typing
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.saveFormDraft();
      });
  }

  private saveFormDraft(): void {
    if (!this.autoSaveEnabled) return;

    const formData = {
      formValues: this.bookingForm.value,
      currentStep: this.currentStep,
      stepStates: this.steps.map(step => ({
        number: step.number,
        isActive: step.isActive,
        isCompleted: step.isCompleted
      })),
      timestamp: new Date().toISOString()
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(formData));
      localStorage.setItem(this.STEP_STORAGE_KEY, this.currentStep.toString());
      this.lastSavedTime = new Date();
      console.log('Form draft saved automatically');
    } catch (error) {
      console.error('Failed to save form draft:', error);
    }
  }

  public restoreSavedDraft(): void {
    const savedData = localStorage.getItem(this.STORAGE_KEY);
    const savedStep = localStorage.getItem(this.STEP_STORAGE_KEY);

    if (savedData && savedStep) {
      try {
        const draftData = JSON.parse(savedData);
        
        // Restore form values
        this.bookingForm.patchValue(draftData.formValues);
        
        // Restore current step
        this.currentStep = parseInt(savedStep);
        
        // Restore step states
        if (draftData.stepStates) {
          draftData.stepStates.forEach((savedStep: any, index: number) => {
            if (this.steps[index]) {
              this.steps[index].isActive = savedStep.isActive;
              this.steps[index].isCompleted = savedStep.isCompleted;
            }
          });
        }
        
        this.showDraftRestoreDialog = false;
        this.hasSavedDraft = false;
        
        // Show success message
        this.showNotification('Draft restored successfully!', 'success');
        
      } catch (error) {
        console.error('Failed to restore draft:', error);
        this.showNotification('Failed to restore draft', 'error');
      }
    }
  }

  public discardSavedDraft(): void {
    this.clearSavedDraft();
    this.showDraftRestoreDialog = false;
    this.hasSavedDraft = false;
    this.showNotification('Draft discarded', 'info');
  }

  private clearSavedDraft(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STEP_STORAGE_KEY);
    this.lastSavedTime = null;
  }

  // Manual save function


  // Toggle auto-save


  // Notification system


  private initializeForm(): void {
    this.bookingForm = this.fb.group({
      // Cargo Details - Step 1
      cargoDetails: this.fb.group({
        description: ['', [Validators.required, Validators.minLength(10)]],
        type: ['general', Validators.required],
        weight: ['', [Validators.required, Validators.min(0.1)]],
        dimensions: this.fb.group({
          length: ['', [Validators.required, Validators.min(0.1)]],
          width: ['', [Validators.required, Validators.min(0.1)]],
          height: ['', [Validators.required, Validators.min(0.1)]]
        }),
        value: ['', [Validators.required, Validators.min(0)]],
        specialInstructions: [''],
        photos: this.fb.array([])
      }),

      // Pickup Details - Step 2
      pickupDetails: this.fb.group({
        address: this.fb.group({
          street: ['', Validators.required],
          city: ['', Validators.required],
          state: ['', Validators.required],
          pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
          country: ['India', Validators.required]
        }),
        contactPerson: this.fb.group({
          name: ['', Validators.required],
          phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
        }),
        scheduledDate: ['', Validators.required],
        scheduledTime: ['', Validators.required],
        instructions: ['']
      }),

      // Delivery Details - Step 2
      deliveryDetails: this.fb.group({
        address: this.fb.group({
          street: ['', Validators.required],
          city: ['', Validators.required],
          state: ['', Validators.required],
          pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
          country: ['India', Validators.required]
        }),
        contactPerson: this.fb.group({
          name: ['', Validators.required],
          phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
        }),
        scheduledDate: ['', Validators.required],
        scheduledTime: ['', Validators.required],
        instructions: ['']
      }),

      // Customer Details - Step 3
      customerDetails: this.fb.group({
        customerId: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
      }),

      // Payment Details - Step 3
      paymentDetails: this.fb.group({
        method: ['card', Validators.required],
        termsAccepted: [false, Validators.requiredTrue],
        privacyAccepted: [false, Validators.requiredTrue]
      })
    });
  }
// Add these methods to your BookingsComponent class

// Manual clear draft function
public clearDraftManually(): void {
  if (confirm('Are you sure you want to clear the saved draft? This action cannot be undone.')) {
    this.clearSavedDraft();
    this.hasSavedDraft = false;
    this.showNotification('Draft cleared successfully', 'info');
  }
}

// Enhanced toggle auto-save with better state management
public toggleAutoSave(): void {
  this.autoSaveEnabled = !this.autoSaveEnabled;
  
  if (this.autoSaveEnabled) {
    this.setupAutoSave();
    // Save current state when enabling auto-save
    if (this.bookingForm.dirty) {
      this.saveFormDraft();
    }
    this.showNotification('Auto-save enabled - Your progress will be saved automatically', 'success');
  } else {
    this.showNotification('Auto-save disabled - Use "Save Now" button to save manually', 'info');
  }
}

// Enhanced manual save with better feedback
public saveFormManually(): void {
  if (this.bookingForm.value) {
    this.saveFormDraft();
    this.showNotification('Form saved successfully!', 'success');
  } else {
    this.showNotification('No data to save', 'info');
  }
}

// Check if form has any data to save
public hasFormData(): boolean {
  const formValue = this.bookingForm.value;
  return Object.keys(formValue).some(key => {
    const value = formValue[key];
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== '' && v !== null && v !== undefined);
    }
    return value !== '' && value !== null && value !== undefined;
  });
}

// Enhanced notification system with better UX
private showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
  // Create a simple notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${this.getNotificationIcon(type)}"></i>
      <span>${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  // Style the notification
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    max-width: 500px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-left: 4px solid ${this.getNotificationColor(type)};
    animation: slideInRight 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

private getNotificationIcon(type: string): string {
  switch (type) {
    case 'success': return 'fa-check-circle';
    case 'error': return 'fa-exclamation-circle';
    case 'warning': return 'fa-exclamation-triangle';
    case 'info': return 'fa-info-circle';
    default: return 'fa-info-circle';
  }
}

private getNotificationColor(type: string): string {
  switch (type) {
    case 'success': return '#28a745';
    case 'error': return '#dc3545';
    case 'warning': return '#ffc107';
    case 'info': return '#17a2b8';
    default: return '#17a2b8';
  }
}

  private loadBookings(): void {
    // Bookings are loaded via the service observable
  }

  // Step Navigation (Enhanced with auto-save)
  public nextStep(): void {
    if (this.isCurrentStepValid()) {
      this.steps[this.currentStep - 1].isCompleted = true;
      this.steps[this.currentStep - 1].isActive = false;
      
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.steps[this.currentStep - 1].isActive = true;
        
        // Save progress when moving to next step
        this.saveFormDraft();
      }
    }
  }

  public previousStep(): void {
    if (this.currentStep > 1) {
      this.steps[this.currentStep - 1].isActive = false;
      this.currentStep--;
      this.steps[this.currentStep - 1].isActive = true;
      this.steps[this.currentStep - 1].isCompleted = false;
      
      // Save progress when moving to previous step
      this.saveFormDraft();
    }
  }

  public goToStep(stepNumber: number): void {
    if (stepNumber <= this.currentStep || this.steps[stepNumber - 2]?.isCompleted) {
      this.steps[this.currentStep - 1].isActive = false;
      this.currentStep = stepNumber;
      this.steps[this.currentStep - 1].isActive = true;
      
      // Save progress when jumping to step
      this.saveFormDraft();
    }
  }

  public isCurrentStepValid(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.bookingForm.get('cargoDetails')?.valid || false;
      case 2:
        return (this.bookingForm.get('pickupDetails')?.valid && 
                this.bookingForm.get('deliveryDetails')?.valid) || false;
      case 3:
        return (this.bookingForm.get('customerDetails')?.valid && 
                this.bookingForm.get('paymentDetails')?.valid) || false;
      case 4:
        return this.bookingForm.valid;
      default:
        return false;
    }
  }

  // Form Submission (Enhanced with draft cleanup)
  public onSubmit(): void {
    if (this.bookingForm.valid) {
      this.isLoading = true;
      const formData = this.bookingForm.value;
      
      const bookingData = this.transformFormDataToBooking(formData);
      
      this.bookingService.createBooking(bookingData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (booking) => {
            this.currentBooking = booking;
            this.showSuccessMessage = true;
            this.isLoading = false;
            
            // Clear saved draft after successful submission
            this.clearSavedDraft();
            
            this.resetForm();
          },
          error: (error) => {
            console.error('Error creating booking:', error);
            this.isLoading = false;
          }
        });
    }
  }

  private transformFormDataToBooking(formData: any): Omit<Booking, 'id' | 'bookingNumber' | 'createdAt' | 'updatedAt'> {
    const estimatedFare = this.calculateEstimatedFare();
    const routeDetails = this.calculateRouteDetails(
      formData.pickupDetails.address,
      formData.deliveryDetails.address
    );
    
    return {
      customerId: formData.customerDetails.customerId,
      vehicleId: '',
      ownerId: '',
      driverId: '',
      
      cargo: {
        description: formData.cargoDetails.description,
        type: formData.cargoDetails.type,
        weight: formData.cargoDetails.weight,
        dimensions: formData.cargoDetails.dimensions,
        value: formData.cargoDetails.value,
        specialInstructions: formData.cargoDetails.specialInstructions,
        photos: formData.cargoDetails.photos || []
      },
      
      pickup: {
        address: formData.pickupDetails.address,
        contactPerson: formData.pickupDetails.contactPerson,
        scheduledDate: new Date(`${formData.pickupDetails.scheduledDate}T${formData.pickupDetails.scheduledTime}`),
        scheduledTime: formData.pickupDetails.scheduledTime,
        instructions: formData.pickupDetails.instructions
      },
      
      delivery: {
        address: formData.deliveryDetails.address,
        contactPerson: formData.deliveryDetails.contactPerson,
        scheduledDate: new Date(`${formData.deliveryDetails.scheduledDate}T${formData.deliveryDetails.scheduledTime}`),
        scheduledTime: formData.deliveryDetails.scheduledTime,
        instructions: formData.deliveryDetails.instructions
      },

      route: routeDetails,
      
      pricing: {
        baseFare: estimatedFare * 0.7,
        perKmRate: 10,
        gstAmount: estimatedFare * 0.15,
        serviceCharge: estimatedFare * 0.1,
        insuranceCharge: estimatedFare * 0.05,
        tollCharges: routeDetails.tollCharges,
        totalAmount: estimatedFare + (routeDetails.tollCharges || 0),
        finalAmount: estimatedFare + (routeDetails.tollCharges || 0)
      },
      
      payment: {
        method: formData.paymentDetails.method,
        status: 'pending',
        paidAmount: 0
      },
      
      status: 'pending',
      
      tracking: {
        statusHistory: [],
        currentLocation: undefined
      },

      communications: [],

      termsAccepted: {
        customer: formData.paymentDetails.termsAccepted && formData.paymentDetails.privacyAccepted,
        customerAcceptedAt: new Date(),
        owner: undefined,
        ownerAcceptedAt: undefined
      },

      insurance: {
        provider: formData.cargoDetails.value > 10000 ? 'HDFC ERGO' : '',
        policyNumber: '',
        coverageAmount: formData.cargoDetails.value,
        premium: estimatedFare * 0.02
      },
      
      adminApproval: {
        isApproved: false,
        approvedBy: undefined,
        approvedAt: undefined
      }
    };
  }

  // Route calculation helper methods
  private calculateRouteDetails(pickupAddress: any, deliveryAddress: any) {
    const estimatedDistance = this.calculateDistanceBetweenCities(
      pickupAddress.city, 
      deliveryAddress.city
    );
    
    const estimatedDuration = estimatedDistance * 60;
    
    return {
      totalDistance: estimatedDistance,
      estimatedDuration: estimatedDuration,
      routePoints: [],
      tollCharges: estimatedDistance > 100 ? 500 : 0
    };
  }

  private calculateDistanceBetweenCities(fromCity: string, toCity: string): number {
    const cityDistances: { [key: string]: number } = {
      [`${fromCity.toLowerCase()}-${toCity.toLowerCase()}`]: 100,
      [`${toCity.toLowerCase()}-${fromCity.toLowerCase()}`]: 100
    };
    
    return cityDistances[`${fromCity.toLowerCase()}-${toCity.toLowerCase()}`] || 100;
  }

  // Utility Methods
  public calculateEstimatedFare(): number {
    const cargoWeight = this.bookingForm.get('cargoDetails.weight')?.value || 0;
    const estimatedDistance = 100;
    
    if (cargoWeight && estimatedDistance) {
      const fareData = this.bookingService.calculateFare(estimatedDistance, 'TRUCK', 10);
      return fareData.totalAmount;
    }
    return 0;
  }

  public formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  public resetForm(): void {
    this.bookingForm.reset();
    this.currentStep = 1;
    this.steps.forEach((step, index) => {
      step.isActive = index === 0;
      step.isCompleted = false;
    });
    
    // Clear any saved draft when resetting
    this.clearSavedDraft();
  }

  public closeSuccessMessage(): void {
    this.showSuccessMessage = false;
    this.currentBooking = null;
  }

  // Form Helper Methods
  public getFormControl(path: string) {
    return this.bookingForm.get(path);
  }

  public isFieldInvalid(path: string): boolean {
    const control = this.getFormControl(path);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  public getFieldError(path: string): string {
    const control = this.getFormControl(path);
    if (control?.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['email']) return 'Please enter a valid email';
      if (control.errors['pattern']) return 'Please enter a valid format';
      if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}`;
      if (control.errors['minlength']) return `Minimum length is ${control.errors['minlength'].requiredLength}`;
    }
    return '';
  }

  // Get formatted last saved time
  public getLastSavedTimeFormatted(): string {
    if (!this.lastSavedTime) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - this.lastSavedTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    return this.lastSavedTime.toLocaleDateString();
  }
}
