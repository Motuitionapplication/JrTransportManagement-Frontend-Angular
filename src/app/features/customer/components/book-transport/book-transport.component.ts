import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingRequest } from 'src/app/models/BookingRequest';


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
  
  // Date management
  minDate: string = '';
  
  // Goods types
  goodsTypes: string[] = [
    'Furniture',
    'Electronics',
    'Household Items',
    'Office Equipment',
    'Construction Materials',
    'Food & Beverages',
    'Textiles & Clothing',
    'Machinery',
    'Raw Materials',
    'Other'
  ];

  // Payment methods
  paymentMethods = [
    { value: 'credit_card', label: 'Credit Card', icon: 'fa-credit-card' },
    { value: 'debit_card', label: 'Debit Card', icon: 'fa-credit-card' },
    { value: 'upi', label: 'UPI Payment', icon: 'fa-mobile-alt' },
    { value: 'net_banking', label: 'Net Banking', icon: 'fa-university' },
    { value: 'cash', label: 'Cash on Delivery', icon: 'fa-money-bill-wave' }
  ];
  
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
    this.setMinDate();
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private createBookingForm(): FormGroup {
    return this.fb.group({
      // Step 1: Route Details
      pickupLocation: ['', [Validators.required, Validators.minLength(3)]],
      dropoffLocation: ['', [Validators.required, Validators.minLength(3)]],
      pickupDate: ['', [Validators.required]],
      pickupTime: ['', [Validators.required]],
      
      // Step 2: Goods Details
      goodsType: ['', [Validators.required]],
      goodsWeight: ['', [Validators.required, Validators.min(1)]],
      goodsDescription: ['', [Validators.required, Validators.minLength(10)]],
      specialHandling: [false],
      fragile: [false],
      perishable: [false],
      
      // Step 3: Vehicle Selection
      selectedVehicleType: ['', [Validators.required]],
      
      // Step 4: Contact & Payment
      contactName: ['', [Validators.required, Validators.minLength(3)]],
      contactPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      contactEmail: ['', [Validators.required, Validators.email]],
      additionalNotes: [''],
      paymentMethod: ['', [Validators.required]],
      agreeToTerms: [false, [Validators.requiredTrue]]
    });
  }

  private initializeForm(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.bookingForm.patchValue({
      pickupDate: tomorrow.toISOString().split('T')[0],
      pickupTime: '10:00'
    });
  }

  private setMinDate(): void {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  private initializeVehicleOptions(): void {
    this.vehicleOptions = [
      {
        id: 'truck-1',
        type: 'truck',
        name: 'Small Truck (1-2 Ton)',
        description: 'Perfect for small household moves and deliveries',
        capacity: 2000,
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
        capacity: 5000,
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
        capacity: 10000,
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
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        
        // Load available vehicles when entering step 3
        if (this.currentStep === 3 && !this.routeQuote) {
          this.loadAvailableVehicles();
        }
      }
    } else {
      // Mark current step fields as touched to show validation errors
      this.markStepFieldsAsTouched(this.currentStep);
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  previousStep(): void {
    this.prevStep();
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      // Validate all previous steps before jumping
      let canJump = true;
      for (let i = 1; i < step; i++) {
        if (!this.isStepValid(i)) {
          canJump = false;
          break;
        }
      }
      
      if (canJump) {
        this.currentStep = step;
      }
    }
  }

  // Route and pricing
  getRouteQuote(): void {
    const pickup = this.bookingForm.get('pickupLocation')?.value;
    const dropoff = this.bookingForm.get('dropoffLocation')?.value;
    
    if (!pickup || !dropoff) return;
    
    this.isLoadingQuote = true;
    
    // Simulate API call - replace with actual service call
    setTimeout(() => {
      const distance = Math.floor(Math.random() * 300) + 50; // 50-350 km
      const basePrice = distance * 8; // $8 per km base rate
      
      this.routeQuote = {
        distance: distance,
        estimatedDuration: Math.floor(distance / 60), // Assume 60 km/h average
        basePrice: basePrice,
        additionalCharges: [
          { name: 'Fuel Surcharge', amount: basePrice * 0.1 },
          { name: 'Toll Charges', amount: 50 }
        ],
        totalPrice: basePrice + (basePrice * 0.1) + 50,
        availableVehicles: this.vehicleOptions,
        routeType: 'Highway',
        fuelCost: basePrice * 0.1
      };
      
      this.availableVehicles = this.vehicleOptions;
      this.isLoadingQuote = false;
    }, 1500);
  }

  loadAvailableVehicles(): void {
    this.isLoadingVehicles = true;
    
    // Simulate loading vehicles based on route and goods details
    setTimeout(() => {
      const weight = this.bookingForm.get('goodsWeight')?.value || 0;
      
      // Filter vehicles based on weight capacity
      this.availableVehicles = this.vehicleOptions.filter(
        vehicle => vehicle.capacity >= weight
      ).map(vehicle => ({
        ...vehicle,
        availability: Math.random() > 0.3 ? 'available' : 'busy'
      }));
      
      this.isLoadingVehicles = false;
    }, 1000);
  }

  selectVehicle(vehicle: VehicleOption): void {
    this.selectedVehicle = vehicle;
    this.selectedVehicleId = vehicle.id || vehicle.type;
    this.bookingForm.patchValue({
      selectedVehicleType: vehicle.type
    });
  }

  calculateVehiclePrice(vehicle: VehicleOption): number {
    if (!this.routeQuote) return vehicle.basePrice;
    
    const distancePrice = vehicle.pricePerKm * this.routeQuote.distance;
    return vehicle.basePrice + distancePrice;
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

  // Booking submission
  submitBooking(): void {
    if (this.bookingForm.valid && this.selectedVehicle) {
      this.isSubmittingBooking = true;
      this.isSubmitting = true;
      
      // Prepare booking payload following the BookingRequest model
      const bookingPayload: BookingRequest = {
        // Route Details
        pickupLocation: this.bookingForm.get('pickupLocation')?.value,
        dropoffLocation: this.bookingForm.get('dropoffLocation')?.value,
        pickupDate: this.bookingForm.get('pickupDate')?.value,
        pickupTime: this.bookingForm.get('pickupTime')?.value,
        
        // Goods Details
        goodsType: this.bookingForm.get('goodsType')?.value,
        goodsWeight: Number(this.bookingForm.get('goodsWeight')?.value),
        goodsDescription: this.bookingForm.get('goodsDescription')?.value,
        specialHandling: this.bookingForm.get('specialHandling')?.value || false,
        fragile: this.bookingForm.get('fragile')?.value || false,
        perishable: this.bookingForm.get('perishable')?.value || false,
        
        // Vehicle Selection
        selectedVehicleType: this.selectedVehicle.type,
        vehicleId: this.selectedVehicle.id,
        vehicleName: this.selectedVehicle.name,
        vehicleCapacity: this.selectedVehicle.capacity,
        
        // Contact & Payment
        contactName: this.bookingForm.get('contactName')?.value,
        contactPhone: this.bookingForm.get('contactPhone')?.value,
        contactEmail: this.bookingForm.get('contactEmail')?.value,
        additionalNotes: this.bookingForm.get('additionalNotes')?.value || '',
        paymentMethod: this.bookingForm.get('paymentMethod')?.value,
        
        // Pricing Information
        basePrice: this.selectedVehicle ? this.calculateVehiclePrice(this.selectedVehicle) : 0,
        insuranceCost: this.calculateInsuranceCost(),
        taxAmount: this.calculateTax(),
        totalAmount: this.calculateTotalAmount(),
        estimatedDistance: this.routeQuote?.distance,
        estimatedDuration: this.routeQuote?.estimatedDuration,
        
        // Payment Status (initially pending)
        paymentStatus: 'PENDING'
      };
      
      console.log('Booking Payload:', bookingPayload);
      
      // TODO: Replace with actual service call
      // this.bookingService.createBooking(customerId, bookingPayload).subscribe(
      //   response => {
      //     // Integrate Razorpay here
      //     this.initiateRazorpayPayment(response);
      //   },
      //   error => {
      //     console.error('Booking failed:', error);
      //     this.isSubmittingBooking = false;
      //     this.isSubmitting = false;
      //   }
      // );
      
      // Simulate API call for now
      setTimeout(() => {
        this.confirmationNumber = 'BK' + Date.now().toString().slice(-8);
        this.bookingConfirmed = true;
        this.isSubmittingBooking = false;
        this.isSubmitting = false;
      }, 2000);
    } else {
      this.markStepFieldsAsTouched(4);
    }
  }

  // New method to navigate to bookings
  navigateToBookings(): void {
    this.router.navigate(['/customer/bookings']);
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
      if (formField.errors['minlength']) {
        return `${this.getFieldLabel(field)} must be at least ${formField.errors['minlength'].requiredLength} characters`;
      }
      if (formField.errors['min']) {
        return `${this.getFieldLabel(field)} must be greater than 0`;
      }
      if (formField.errors['pattern']) {
        return `Please enter a valid ${this.getFieldLabel(field).toLowerCase()}`;
      }
      if (formField.errors['email']) {
        return `Please enter a valid email address`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'pickupLocation': 'Pickup Location',
      'dropoffLocation': 'Dropoff Location',
      'pickupDate': 'Pickup Date',
      'pickupTime': 'Pickup Time',
      'goodsType': 'Goods Type',
      'goodsDescription': 'Goods Description',
      'goodsWeight': 'Goods Weight',
      'selectedVehicleType': 'Vehicle Type',
      'contactName': 'Contact Name',
      'contactEmail': 'Email Address',
      'contactPhone': 'Phone Number',
      'paymentMethod': 'Payment Method',
      'agreeToTerms': 'Terms and Conditions'
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
    const basePrice = this.routeQuote?.basePrice || 0;
    return Math.round(basePrice * 0.05);
  }

  calculateTax(): number {
    const basePrice = this.routeQuote?.basePrice || 0;
    const insuranceCost = this.calculateInsuranceCost();
    return Math.round((basePrice + insuranceCost) * 0.18);
  }

  calculateTotalAmount(): number {
    if (!this.routeQuote || !this.selectedVehicle) return 0;
    
    const vehiclePrice = this.calculateVehiclePrice(this.selectedVehicle);
    const insuranceCost = this.calculateInsuranceCost();
    const tax = this.calculateTax();
    
    return vehiclePrice + insuranceCost + tax;
  }

  // Validation methods
  canProceedToNextStep(): boolean {
    return this.isStepValid(this.currentStep);
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return this.bookingForm.get('pickupLocation')?.valid === true &&
               this.bookingForm.get('dropoffLocation')?.valid === true &&
               this.bookingForm.get('pickupDate')?.valid === true &&
               this.bookingForm.get('pickupTime')?.valid === true;
      
      case 2:
        return this.bookingForm.get('goodsType')?.valid === true &&
               this.bookingForm.get('goodsWeight')?.valid === true &&
               this.bookingForm.get('goodsDescription')?.valid === true;
      
      case 3:
        return this.bookingForm.get('selectedVehicleType')?.valid === true;
      
      case 4:
        return this.bookingForm.get('contactName')?.valid === true &&
               this.bookingForm.get('contactPhone')?.valid === true &&
               this.bookingForm.get('contactEmail')?.valid === true &&
               this.bookingForm.get('paymentMethod')?.valid === true &&
               this.bookingForm.get('agreeToTerms')?.value === true;
      
      default:
        return false;
    }
  }

  markStepFieldsAsTouched(step: number): void {
    let fields: string[] = [];
    
    switch (step) {
      case 1:
        fields = ['pickupLocation', 'dropoffLocation', 'pickupDate', 'pickupTime'];
        break;
      case 2:
        fields = ['goodsType', 'goodsWeight', 'goodsDescription'];
        break;
      case 3:
        fields = ['selectedVehicleType'];
        break;
      case 4:
        fields = ['contactName', 'contactPhone', 'contactEmail', 'paymentMethod', 'agreeToTerms'];
        break;
    }
    
    fields.forEach(field => {
      this.bookingForm.get(field)?.markAsTouched();
    });
  }
}