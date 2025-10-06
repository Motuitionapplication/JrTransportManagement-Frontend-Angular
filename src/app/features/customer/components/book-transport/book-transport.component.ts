import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

export interface VehicleOption {
  id?: string;
  type: 'truck' | 'van' | 'pickup' | 'heavy-truck';
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
  pricePerKm: number;
  icon: string;
  features: string[];
  availability?: 'available' | 'busy' | 'unavailable';
  imageUrl?: string;
  dimensions?: string;
}

export interface RouteQuote {
  distance: number;
  estimatedDuration: number;
  basePrice: number;
  additionalCharges: {
    name: string;
    amount: number;
  }[];
  totalPrice: number;
  availableVehicles: VehicleOption[];
  routeType?: string;
  fuelCost?: number;
}

@Component({
  selector: 'app-book-transport',
  templateUrl: './book-transport.component.html',
  styleUrls: ['./book-transport.component.scss']
})
export class BookTransportComponent implements OnInit {
  // Form and steps
  bookingForm: FormGroup;
  currentStep: number = 1;
  totalSteps: number = 4;

  // Data
  vehicleOptions: VehicleOption[] = [];
  selectedVehicle: VehicleOption | null = null;
  selectedVehicleId: string = '';
  routeQuote: RouteQuote | null = null;
  
  // State management
  isLoadingQuote: boolean = false;
  isSubmittingBooking: boolean = false;
  isSubmitting: boolean = false;
  bookingConfirmed: boolean = false;
  confirmationNumber: string = '';
  showHelp: boolean = false;
  isLoadingVehicles: boolean = false;
  availableVehicles: VehicleOption[] = [];
  
  // Time slots for pickup
  availableTimeSlots: { value: string; label: string }[] = [
    { value: '08:00', label: '8:00 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '17:00', label: '5:00 PM' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.bookingForm = this.createBookingForm();
    this.initializeVehicleOptions();
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private createBookingForm(): FormGroup {
    return this.fb.group({
      // Step 1: Pickup & Dropoff
      pickupAddress: ['', Validators.required],
      pickupLocation: ['', Validators.required],
      pickupDate: ['', Validators.required],
      pickupTime: ['', Validators.required],
      pickupDateTime: ['', Validators.required],
      pickupContactName: ['', Validators.required],
      pickupContactPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      dropoffAddress: ['', Validators.required],
      dropoffLocation: ['', Validators.required],
      dropoffContactName: ['', Validators.required],
      dropoffContactPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      
      // Step 2: Vehicle Selection (handled by selectedVehicle)
      
      // Step 3: Goods Information
      goodsType: ['', Validators.required],
      goodsDescription: ['', Validators.required],
      goodsWeight: ['', [Validators.required, Validators.min(0.1)]],
      goodsValue: ['', [Validators.required, Validators.min(1)]],
      estimatedWeight: ['', [Validators.required, Validators.min(0.1)]],
      
      // Step 4: Customer Information & Confirmation
      customerName: ['', Validators.required],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      contactName: ['', Validators.required],
      contactPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      agreeTerms: [false, Validators.requiredTrue]
    });
  }

  private initializeForm(): void {
    // Set default values or handle form initialization
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.bookingForm.patchValue({
      pickupDate: tomorrow.toISOString().split('T')[0],
      pickupTime: '10:00'
    });
  }

  private initializeVehicleOptions(): void {
    this.vehicleOptions = [
      {
        id: 'truck-1',
        type: 'truck',
        name: 'Small Truck (1-2 Ton)',
        description: 'Perfect for small household moves and deliveries',
        capacity: 2,
        basePrice: 1500,
        pricePerKm: 12,
        icon: 'fas fa-truck',
        features: ['GPS Tracking', 'Insured', '24/7 Support'],
        availability: 'available',
        imageUrl: 'assets/vehicles/small-truck.jpg',
        dimensions: '10ft x 6ft x 6ft'
      },
      {
        id: 'truck-2',
        type: 'truck',
        name: 'Medium Truck (3-5 Ton)',
        description: 'Ideal for medium-sized moves and commercial goods',
        capacity: 5,
        basePrice: 2500,
        pricePerKm: 18,
        icon: 'fas fa-truck',
        features: ['GPS Tracking', 'Insured', '24/7 Support', 'Loading Assistance'],
        availability: 'available',
        imageUrl: 'assets/vehicles/medium-truck.jpg',
        dimensions: '14ft x 8ft x 8ft'
      },
      {
        id: 'truck-3',
        type: 'heavy-truck',
        name: 'Large Truck (7-10 Ton)',
        description: 'Best for large commercial shipments and bulk goods',
        capacity: 10,
        basePrice: 4000,
        pricePerKm: 25,
        icon: 'fas fa-truck',
        features: ['GPS Tracking', 'Insured', '24/7 Support', 'Loading Assistance', 'Express Delivery'],
        availability: 'busy',
        imageUrl: 'assets/vehicles/large-truck.jpg',
        dimensions: '18ft x 8ft x 9ft'
      }
    ];
    this.availableVehicles = this.vehicleOptions;
  }

  // Step navigation
  nextStep(): void {
    if (this.canProceedToNextStep()) {
      this.currentStep++;
      if (this.currentStep === 2) {
        this.getRouteQuote();
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
    }
  }

  // Route and pricing
  getRouteQuote(): void {
    this.isLoadingQuote = true;
    
    // Simulate API call
    setTimeout(() => {
      this.routeQuote = {
        distance: 25.5,
        estimatedDuration: 45,
        basePrice: 1800,
        additionalCharges: [
          { name: 'Fuel Surcharge', amount: 200 },
          { name: 'Toll Charges', amount: 150 }
        ],
        totalPrice: 2150,
        availableVehicles: this.vehicleOptions.filter(v => v.availability === 'available')
      };
      this.isLoadingQuote = false;
    }, 2000);
  }

  selectVehicle(vehicle: VehicleOption): void {
    this.selectedVehicle = vehicle;
    this.selectedVehicleId = vehicle.id || '';
  }

  calculateVehiclePrice(vehicle: VehicleOption): number {
    if (!vehicle || !this.routeQuote) {
      return 0;
    }
    return vehicle.basePrice + (vehicle.pricePerKm * this.routeQuote.distance);
  }

  getAvailabilityClass(availability: string | undefined): string {
    if (!availability) return 'text-muted';
    const availabilityClasses = {
      'available': 'availability-available',
      'busy': 'availability-busy', 
      'unavailable': 'availability-unavailable'
    };
    return availabilityClasses[availability as keyof typeof availabilityClasses] || 'availability-unknown';
  }

  getAvailabilityIcon(availability: string | undefined): string {
    if (!availability) return 'fa-question-circle';
    const availabilityIcons = {
      'available': 'fa-check-circle',
      'busy': 'fa-clock',
      'unavailable': 'fa-times-circle'
    };
    return availabilityIcons[availability as keyof typeof availabilityIcons] || 'fa-question-circle';
  }

  previousStep(): void {
    this.prevStep();
  }

  viewVehicleDetails(vehicle: VehicleOption | null): void {
    if (vehicle) {
      console.log('Viewing vehicle details:', vehicle);
      // Implement vehicle details modal or navigation
    }
  }

  // Booking submission
  submitBooking(): void {
    if (this.bookingForm.valid && this.selectedVehicle) {
      this.isSubmittingBooking = true;
      this.isSubmitting = true;
      
      const bookingData = {
        ...this.bookingForm.value,
        selectedVehicle: this.selectedVehicle,
        routeQuote: this.routeQuote,
        totalAmount: this.calculateTotalAmount()
      };
      
      // Simulate API call
      setTimeout(() => {
        this.confirmationNumber = 'BK' + Date.now().toString().slice(-8);
        this.bookingConfirmed = true;
        this.isSubmittingBooking = false;
        this.isSubmitting = false;
        
        console.log('Booking submitted:', bookingData);
        // Navigate to confirmation page or show success message
      }, 3000);
    }
  }

  // Helper methods
  toggleHelp(): void {
    this.showHelp = !this.showHelp;
  }

  resetForm(): void {
    this.bookingForm.reset();
    this.selectedVehicle = null;
    this.selectedVehicleId = '';
    this.routeQuote = null;
    this.currentStep = 1;
    this.bookingConfirmed = false;
    this.confirmationNumber = '';
    this.initializeForm();
  }

  // Form field helpers - overloaded to handle both parameter orders
  getFieldError(formOrFieldName: FormGroup | string, fieldName?: string): string {
    let form: FormGroup;
    let field: string;
    
    // Handle both parameter orders for backward compatibility
    if (typeof formOrFieldName === 'string') {
      // New signature: getFieldError('fieldName', formGroup?)
      field = formOrFieldName;
      form = (fieldName as any) || this.bookingForm;
    } else {
      // Old signature from HTML: getFieldError(formGroup, 'fieldName')
      form = formOrFieldName;
      field = fieldName || '';
    }
    
    const formField = form.get(field);
    if (formField?.errors && formField.touched) {
      if (formField.errors['required']) {
        return `${this.getFieldLabel(field)} is required`;
      }
      if (formField.errors['min']) {
        return `${this.getFieldLabel(field)} must be greater than 0`;
      }
      if (formField.errors['pattern']) {
        return `Please enter a valid ${this.getFieldLabel(field).toLowerCase()}`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'pickupAddress': 'Pickup Address',
      'pickupLocation': 'Pickup Location',
      'pickupDate': 'Pickup Date',
      'pickupTime': 'Pickup Time',
      'pickupDateTime': 'Pickup Date & Time',
      'pickupContactName': 'Pickup Contact Name',
      'pickupContactPhone': 'Pickup Contact Phone',
      'dropoffAddress': 'Dropoff Address',
      'dropoffLocation': 'Dropoff Location',
      'dropoffContactName': 'Dropoff Contact Name',
      'dropoffContactPhone': 'Dropoff Contact Phone',
      'goodsType': 'Goods Type',
      'goodsDescription': 'Goods Description',
      'goodsWeight': 'Goods Weight',
      'goodsValue': 'Goods Value',
      'estimatedWeight': 'Estimated Weight',
      'customerName': 'Customer Name',
      'customerEmail': 'Customer Email',
      'customerPhone': 'Customer Phone',
      'contactName': 'Contact Name',
      'contactPhone': 'Contact Phone',
      'agreeTerms': 'Terms and Conditions'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookingForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  // Date formatting
  formatDate(date: any): string {
    if (!date) return '';
    if (typeof date === 'string') return date;
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    return String(date);
  }

  // Cost calculations
  calculateInsuranceCost(): number {
    const goodsValue = this.bookingForm.get('goodsValue')?.value || 0;
    return Math.round(goodsValue * 0.02); // 2% insurance
  }

  calculateTax(): number {
    const basePrice = this.routeQuote?.basePrice || 0;
    const insuranceCost = this.calculateInsuranceCost();
    return Math.round((basePrice + insuranceCost) * 0.1); // 10% tax
  }

  calculateTotalAmount(): number {
    const basePrice = this.routeQuote?.basePrice || 0;
    const insuranceCost = this.calculateInsuranceCost();
    const tax = this.calculateTax();
    return basePrice + insuranceCost + tax;
  }

  // Validation methods
  canProceedToNextStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!(this.bookingForm.get('pickupAddress')?.valid && 
                  this.bookingForm.get('dropoffAddress')?.valid);
      case 2:
        return this.selectedVehicle !== null;
      case 3:
        return !!(this.bookingForm.get('goodsType')?.valid && 
                  this.bookingForm.get('goodsWeight')?.valid);
      default:
        return true;
    }
  }

  canSubmitBooking(): boolean {
    return this.bookingForm.valid && 
           this.selectedVehicle !== null && 
           this.bookingForm.get('agreeTerms')?.value === true;
  }

  // Additional helper methods
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getVehicleBadgeClass(vehicleType: string): string {
    const badgeClasses = {
      'truck': 'badge-truck',
      'van': 'badge-van',
      'pickup': 'badge-pickup',
      'heavy-truck': 'badge-heavy-truck'
    };
    return badgeClasses[vehicleType as keyof typeof badgeClasses] || 'badge-default';
  }

  calculateEstimatedPrice(vehicle: VehicleOption | null): number {
    if (!vehicle || !this.routeQuote) {
      return vehicle?.basePrice || 0;
    }
    return vehicle.basePrice + (vehicle.pricePerKm * this.routeQuote.distance);
  }
}