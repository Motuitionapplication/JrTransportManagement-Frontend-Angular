import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { EnvironmentService } from '../../../core/services/environment.service';
import { SignupRequest } from '../../../models/auth.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SignupComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  @ViewChild('submitButton', { static: false }) submitButton!: ElementRef;
  
  signupForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  fieldErrors: { [key: string]: string } = {}; // For field-specific errors
  hidePassword = true;
  hideConfirmPassword = true;
  showScrollHint = false;
  private hasAutoScrolled = false; // Prevent multiple auto-scrolls
  private subscription = new Subscription();

  roleOptions = [
    { value: 'owner', label: 'Owner', icon: 'person' },
    { value: 'driver', label: 'Driver', icon: 'local_shipping' },
    { value: 'customer', label: 'Customer', icon: 'person_outline' },
    { value: 'admin', label: 'Admin', icon: 'admin_panel_settings' },
    { value: 'super_admin', label: 'Super Admin', icon: 'security' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private envService: EnvironmentService,
    private dialogRef: MatDialogRef<SignupComponent>
  ) {
    this.signupForm = this.createSignupForm();
  }

  ngOnInit(): void {
    // Component is ready
    console.log('🔐 Signup component initialized');
    
    // Disable auto-scroll setup to prevent dialog fluctuation
    // this.setupAutoScroll(); // DISABLED
    
    // Setup field-specific error clearing on value change (not on focus)
    this.setupFieldErrorClearing();
    
    // Debug form validation - focus on individual field progression
    this.signupForm.valueChanges.subscribe(() => {
      console.log('Form valid:', this.signupForm.valid);
      console.log('Form errors:', this.getFormValidationSummary());
      
      // Field value updated - no auto-scroll behavior
    });
  }

  private setupFieldErrorClearing(): void {
    // Clear field errors only when user actually changes the field value
    const fieldsToWatch = ['firstName', 'lastName', 'email', 'username', 'phoneNumber', 'password', 'confirmPassword', 'role'];
    
    fieldsToWatch.forEach(fieldName => {
      const control = this.signupForm.get(fieldName);
      if (control) {
        control.valueChanges.subscribe((newValue) => {
          // Clear server-side error for this specific field when user changes the value
          if (this.fieldErrors[fieldName] && newValue !== null && newValue !== undefined) {
            console.log(`🧹 Clearing error for ${fieldName} due to value change`);
            delete this.fieldErrors[fieldName];
          }
        });
      }
    });
  }

  ngAfterViewInit(): void {
    // Keep dialog stable - no auto-scroll behaviors
    this.hasAutoScrolled = false;
    
    // Ensure form starts at the top and stays stable
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = 0;
      this.scrollContainer.nativeElement.style.scrollBehavior = 'auto';
    }
    
    // Check if content is scrollable but don't trigger auto-scrolling
    setTimeout(() => {
      this.checkScrollable();
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private setupAutoScroll(): void {
    // Delay auto-scroll setup to prevent initial load scrolling
    setTimeout(() => {
      // Auto-scroll when specific fields are filled (but not during initial load)
      const fieldsToWatch = ['firstName', 'lastName', 'email', 'username', 'password', 'confirmPassword', 'role'];
      
      fieldsToWatch.forEach((fieldName, index) => {
        const control = this.signupForm.get(fieldName);
        if (control) {
          control.valueChanges.subscribe((value) => {
            // Only auto-scroll if component has been fully loaded and user has interacted
            if (value && value.length > 2 && this.hasAutoScrolled === false) {
              // Mark that user has started interacting to enable future auto-scrolls
              this.hasAutoScrolled = true;
            }
            
            if (value && value.length > 2 && this.hasAutoScrolled) { 
              setTimeout(() => {
                this.scrollToNextField(fieldName);
              }, 300); // Small delay to ensure UI is updated
            }
          });
        }
      });
    }, 1000); // Wait 1 second before setting up auto-scroll to prevent initial load issues
  }

  // Scroll to next field in the progression  
  private scrollToNextField(fieldName: string): void {
    const fieldElement = document.getElementById(fieldName);
    if (fieldElement && this.scrollContainer) {
      const containerElement = this.scrollContainer.nativeElement;
      
      // Calculate scroll position to show the next field with more space
      const fieldTop = fieldElement.offsetTop;
      const containerHeight = containerElement.clientHeight;
      
      // Scroll further to show more fields below - show field in top 20% instead of 30%
      const scrollPosition = fieldTop - (containerHeight * 0.2); // Show field in top 20% of visible area
      
      // Add extra padding to scroll even more
      const extraScroll = 80; // Additional pixels to scroll down
      
      containerElement.scrollTo({
        top: Math.max(0, scrollPosition + extraScroll),
        behavior: 'smooth'
      });
      
      console.log(`📍 Scrolled further to show field: ${fieldName} with extra padding`);
    }
  }

  // Check if we should auto-scroll (when most required fields are filled)
  private shouldAutoScroll(): boolean {
    const formValue = this.signupForm.value;
    const requiredFieldsFilled = [
      formValue.firstName && formValue.firstName.length >= 2,
      formValue.lastName && formValue.lastName.length >= 2,
      formValue.email && formValue.email.includes('@'),
      formValue.username && formValue.username.length >= 3,
      formValue.password && formValue.password.length >= 6,
      formValue.confirmPassword && formValue.confirmPassword.length >= 6
    ];
    
    // Auto-scroll when at least 5 out of 6 required fields are filled
    const filledCount = requiredFieldsFilled.filter(Boolean).length;
    return filledCount >= 5;
  }

  // Auto-scroll to submit button when form is valid
  private scrollToSubmitButton(): void {
    setTimeout(() => {
      if (this.submitButton && this.scrollContainer) {
        const submitElement = this.submitButton.nativeElement;
        const containerElement = this.scrollContainer.nativeElement;
        
        // Method 1: Scroll to bottom to ensure submit button is fully visible
        const maxScroll = containerElement.scrollHeight - containerElement.clientHeight;
        const aggressiveScroll = maxScroll * 0.9; // Scroll to 90% of maximum
        
        containerElement.scrollTo({
          top: aggressiveScroll,
          behavior: 'smooth'
        });
        
        console.log(`📍 Aggressive scroll to submit button area: ${aggressiveScroll}px`);
        
        // Method 2: Alternative approach - ensure submit button is in center of view
        setTimeout(() => {
          const submitTop = submitElement.offsetTop;
          const containerHeight = containerElement.clientHeight;
          const centerPosition = submitTop - (containerHeight * 0.3); // Show submit button in top 30%
          
          containerElement.scrollTo({
            top: Math.max(0, centerPosition),
            behavior: 'smooth'
          });
        }, 100);
      } else {
        // Fallback: scroll to bottom using querySelector
        const container = document.querySelector('.card-body') as HTMLElement;
        if (container) {
          const maxScroll = container.scrollHeight - container.clientHeight;
          container.scrollTo({
            top: maxScroll,
            behavior: 'smooth'
          });
        }
      }
    }, 150); // Slightly longer delay
  }

  // Auto-scroll to success message - DISABLED since success message is now in footer
  private scrollToSuccessMessage(): void {
    // Success message is now in the footer section which is always visible
    // No need to scroll as it's already at the bottom and visible to user
    // Commenting out scroll behavior to prevent dialog instability
    
    /* DISABLED - Success message now in footer, always visible
    setTimeout(() => {
      const successElement = document.getElementById('successMessage');
      if (successElement && this.scrollContainer) {
        const containerElement = this.scrollContainer.nativeElement;
        
        // Scroll to bottom to show success message
        const scrollTop = containerElement.scrollHeight - containerElement.clientHeight;
        
        containerElement.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
        
        // Alternative: scroll success message into view
        successElement.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }
    }, 100);
    */
  }

  private checkScrollable(): void {
    if (this.scrollContainer) {
      const element = this.scrollContainer.nativeElement;
      const isScrollable = element.scrollHeight > element.clientHeight;
      this.showScrollHint = isScrollable;
      
      if (isScrollable) {
        // Hide scroll hint after user starts scrolling or after 3 seconds
        element.addEventListener('scroll', () => {
          this.showScrollHint = false;
        }, { once: true });
        
        setTimeout(() => {
          this.showScrollHint = false;
        }, 3000);
      }
    }
  }

  private createSignupForm(): FormGroup {
    const form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: [''],  // Simplified - make it truly optional
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['owner', [Validators.required]],
      vehicleNumber: [''], // Only used for owner/driver
      agreeTerms: [false, [this.checkboxRequiredValidator.bind(this)]]  // Using custom validator
    });

    // Add password match validation
    form.get('confirmPassword')?.setValidators([
      Validators.required,
      this.matchPasswordValidator.bind(this)
    ]);

    // Watch for password changes to revalidate confirm password
    form.get('password')?.valueChanges.subscribe(() => {
      form.get('confirmPassword')?.updateValueAndValidity();
    });

    // Watch for checkbox changes
    form.get('agreeTerms')?.valueChanges.subscribe((value) => {
      console.log('Checkbox value changed to:', value);
    });

    // Clear field errors when user starts typing and check for auto-scroll
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.valueChanges.subscribe((value) => {
        if (this.fieldErrors[key]) {
          delete this.fieldErrors[key];
        }
        
        // Check if all visible fields are filled to trigger auto-scroll
        this.checkVisibleFieldsAndScroll();
      });
    });

    // Log form creation
    console.log('Form created with values:', form.value);
    console.log('Form valid at creation:', form.valid);

    return form;
  }

  private matchPasswordValidator(control: AbstractControl) {
    const password = this.signupForm?.get('password')?.value;
    const confirmPassword = control.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private testConnection(): void {
    this.subscription.add(
      this.authService.testAuthEndpoint().subscribe({
        next: (response: any) => {
          console.log('✅ Auth endpoint test successful:', response.message);
        },
        error: (error: any) => {
          console.error('❌ Auth endpoint test failed:', error);
          this.errorMessage = 'Unable to connect to authentication server. Please try again later.';
        }
      })
    );
  }

  // Main submit method called by form
  onSubmit(): void {
    console.log('🚀 Form submitted');
    this.onSubmitWithRetry();
  }
  private async wakeUpServer(): Promise<void> {
    try {
      console.log('🔄 Attempting to wake up server...');
      const response = await fetch(`${this.envService.getApiUrl()}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log('✅ Server is awake');
      } else {
        console.log('⚠️ Server responded but may be starting up');
      }
    } catch (error) {
      console.log('⚠️ Server is waking up, will retry signup');
    }
  }

  // Add helper method to show server status
  private showServerWakeupMessage(): void {
    this.errorMessage = '☕ Server is waking up... This may take 30-60 seconds on the first request. Please wait...';
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
    // DON'T clear fieldErrors - let them persist until user changes field values
    // this.fieldErrors = {}; // REMOVED - field errors should persist
  }

  // Enhanced submit with server wakeup
  async onSubmitWithRetry(): Promise<void> {
    console.log('🚀 Submit with retry attempted');
    
    if (!this.isLoading) {
      if (!this.signupForm.valid) {
        console.log('❌ Form is invalid, showing errors:');
        this.checkFormStatus();
        Object.keys(this.signupForm.controls).forEach(key => {
          this.signupForm.get(key)?.markAsTouched();
        });
        this.scrollToFirstInvalidField();
        return;
      }
      
      this.isLoading = true;
      this.clearMessages();
      this.showServerWakeupMessage();

      // Try to wake up server first
      await this.wakeUpServer();
      
      // Small delay to let server fully wake up
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      this.errorMessage = 'Creating your account...';
      
      // Now attempt the actual signup
      this.performSignup();
    }
  }

  private performSignup(): void {
    // Map frontend role to backend role format
    const roleMap: { [key: string]: string } = {
      owner: 'ROLE_OWNER',
      driver: 'ROLE_DRIVER',
      customer: 'ROLE_CUSTOMER',
      admin: 'ROLE_ADMIN',
      super_admin: 'ROLE_SUPER_ADMIN'
    };
    const selectedRole = this.signupForm.value.role;
    const backendRole = roleMap[selectedRole] || selectedRole;
    const signupData: SignupRequest = {
      username: this.signupForm.value.username.trim(),
      email: this.signupForm.value.email.trim().toLowerCase(),
      firstName: this.signupForm.value.firstName.trim(),
      lastName: this.signupForm.value.lastName.trim(),
      password: this.signupForm.value.password,
      phoneNumber: this.signupForm.value.phoneNumber?.trim() || undefined,
      role: [backendRole], // Always sends backend role format
      vehicleNumber: (selectedRole === 'owner' || selectedRole === 'driver') ? this.signupForm.value.vehicleNumber?.trim() : undefined
    };

    console.log('📤 Sending signup data:', signupData);

    this.subscription.add(
      this.authService.signup(signupData).subscribe({
        next: (response: any) => {
          console.log('✅ Signup successful:', response);
          this.isLoading = false;
          this.successMessage = response.message || 'Account created successfully! You can now sign in.';
          this.scrollToSuccessMessage();
          setTimeout(() => {
            this.dialogRef.close({ success: true, message: this.successMessage });
          }, 3000);
        },
        error: (error: any) => {
          console.error('❌ Signup failed:', error);
          this.isLoading = false;
          
          // Handle different types of errors
          if (error.status === 0) {
            // Network error or CORS issue
            this.errorMessage = 'Unable to connect to server. The server may be starting up or there may be a network issue. Please try again in a moment.';
          } else if (error.status === 504) {
            // Gateway timeout - server is probably sleeping
            this.errorMessage = 'Server is starting up (this may take 30-60 seconds on first request). Please try again in a moment.';
          } else if (error.status === 400 && error.error?.field) {
            // Field-specific error
            this.fieldErrors[error.error.field] = error.error.message || 'Invalid value';
            this.errorMessage = ''; // Don't show general error
            this.scrollToFieldError(error.error.field);
          } else if (error.status === 400 && error.error?.message?.toLowerCase().includes('username')) {
            // Username conflict error
            this.fieldErrors['username'] = error.error.message || 'Username already taken';
            this.errorMessage = ''; // Don't show general error
            this.scrollToFieldError('username');
          } else if (error.status === 400 && error.error?.message?.toLowerCase().includes('email')) {
            // Email conflict error
            this.fieldErrors['email'] = error.error.message || 'Email already registered';
            this.errorMessage = ''; // Don't show general error
            this.scrollToFieldError('email');
          } else if (error.status === 400) {
            // General validation error
            this.errorMessage = error.error?.message || 'Registration failed. Please check your information.';
          } else if (error.status === 500) {
            // Server error
            this.errorMessage = 'Server error occurred. Please try again later.';
          } else {
            // Unknown error
            this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          }
        }
      })
    );
  }

  getPasswordStrength(): string {
    const password = this.signupForm.get('password')?.value || '';
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'medium';
    if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) return 'strong';
    return 'medium';
  }

  getPasswordStrengthColor(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return '#f44336';
      case 'medium': return '#ff9800';
      case 'strong': return '#4caf50';
      default: return '#ddd';
    }
  }

  getPasswordStrengthIcon(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak':
        return 'warning';
      case 'medium':
        return 'info';
      case 'strong':
        return 'check_circle';
      default:
        return 'help';
    }
  }

  switchToLogin(): void {
    this.dialogRef.close({ action: 'switch-to-login' });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // Form validation helpers
  getFieldError(fieldName: string): string {
    // Check for server-side field errors first
    if (this.fieldErrors[fieldName]) {
      return this.fieldErrors[fieldName];
    }
    
    // Then check for client-side validation errors
    const field = this.signupForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['pattern'] || field.errors['invalidPhone']) {
        if (fieldName === 'username') {
          return 'Username can only contain letters, numbers, and underscores';
        }
        if (fieldName === 'phoneNumber') {
          return 'Please enter a valid phone number (10-15 digits)';
        }
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
      if (field.errors['checkboxRequired']) {
        return '';
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      username: 'Username',
      email: 'Email',
      firstName: 'First Name',
      lastName: 'Last Name',
      phoneNumber: 'Phone Number',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      role: 'Role'
    };
    return displayNames[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    // Show as invalid if there's a server error OR client validation error
    return !!(this.fieldErrors[fieldName] || (field?.errors && field.touched));
  }

  // Debug method to check form validity
  checkFormValidity(): void {
    console.log('🔍 Form Validity Debug:');
    console.log('Form Valid:', this.signupForm.valid);
    console.log('Form Errors:', this.signupForm.errors);
    
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      if (control && control.errors) {
        console.log(`❌ ${key}:`, control.errors);
      } else {
        console.log(`✅ ${key}: valid`);
      }
    });
  }

  // Get form debug info for template
  get formDebugInfo(): string {
    if (this.signupForm.valid) {
      return 'Form is valid ✅';
    }
    
    const invalidFields = Object.keys(this.signupForm.controls)
      .filter(key => this.signupForm.get(key)?.errors)
      .map(key => {
        const errors = this.signupForm.get(key)?.errors;
        return `${key}: ${Object.keys(errors || {}).join(', ')}`;
      });
    
    return `Invalid fields: ${invalidFields.join(' | ')}`;
  }

  // Custom validator for checkbox that must be checked
  private checkboxRequiredValidator(control: AbstractControl) {
    const value = control.value;
    console.log('Checkbox validator called with value:', value, 'Type:', typeof value);
    
    // Accept true, 'true', or any truthy value
    if (value === true || value === 'true' || (value && value !== false && value !== 'false')) {
      console.log('Checkbox validation PASSED');
      return null; // Valid
    }
    
    console.log('Checkbox validation FAILED');
    return { checkboxRequired: true }; // Invalid
  }

  private optionalPhoneValidator(control: AbstractControl) {
    const value = control.value;
    if (!value || value.trim() === '') {
      return null; // Valid if empty
    }
    
    const phonePattern = /^[0-9]{10,15}$/;
    return phonePattern.test(value) ? null : { invalidPhone: true };
  }

  getFormValidationSummary(): string {
    if (this.signupForm.valid) {
      return 'All fields are valid ✓';
    }
    
    const errors: string[] = [];
    
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      if (control && control.invalid) {
        const controlErrors = control.errors;
        if (controlErrors) {
          const errorKeys = Object.keys(controlErrors);
          errors.push(`${key}: ${errorKeys.join(', ')} (value: ${control.value})`);
        }
      }
    });
    
    return errors.length > 0 ? errors.join(' | ') : 'No errors found';
  }

  // Helper method to check specific field validity
  isFieldValid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return field ? field.valid : false;
  }

  // Helper method to get field errors
  getFieldErrors(fieldName: string): any {
    const field = this.signupForm.get(fieldName);
    return field ? field.errors : null;
  }

  // Debug method to manually trigger form validation check
  checkFormStatus(): void {
    console.log('=== FORM STATUS DEBUG ===');
    console.log('Form valid:', this.signupForm.valid);
    console.log('Form value:', this.signupForm.value);
    console.log('Form errors:', this.signupForm.errors);
    
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      if (control) {
        console.log(`${key}:`, {
          value: control.value,
          valid: control.valid,
          errors: control.errors,
          touched: control.touched,
          dirty: control.dirty
        });
      }
    });
    console.log('========================');
  }

  // Method to test form manually
  testFormManually(): void {
    console.log('=== MANUAL FORM TEST ===');
    console.log('All form values:', this.signupForm.value);
    console.log('Form valid:', this.signupForm.valid);
    console.log('Form invalid:', this.signupForm.invalid);
    
    // Check each field individually
    const fields = ['firstName', 'lastName', 'email', 'username', 'password', 'confirmPassword', 'role', 'agreeTerms'];
    fields.forEach(fieldName => {
      const field = this.signupForm.get(fieldName);
      if (field) {
        console.log(`${fieldName}:`, {
          value: field.value,
          valid: field.valid,
          errors: field.errors,
          validators: field.validator ? 'Has validators' : 'No validators'
        });
      }
    });
    
    // Test checkbox specifically
    const agreeTerms = this.signupForm.get('agreeTerms');
    if (agreeTerms) {
      console.log('Checkbox test result:', this.checkboxRequiredValidator(agreeTerms));
    }
    
    console.log('=========================');
  }

  // Auto-scroll to the first invalid field
  private scrollToFirstInvalidField(): void {
    console.log('🔄 scrollToFirstInvalidField called');
    
    // Define field order to check for validation
    const fieldOrder = ['firstName', 'lastName', 'email', 'username', 'phoneNumber', 'password', 'confirmPassword', 'role', 'agreeTerms'];
    
    for (const fieldName of fieldOrder) {
      const field = this.signupForm.get(fieldName);
      if (field && field.invalid && field.touched) {
        console.log(`📍 Found first invalid field: ${fieldName}`);
        this.scrollToFieldError(fieldName);
        return;
      }
    }
    
    // If no invalid touched field found, find first invalid field regardless of touched state
    for (const fieldName of fieldOrder) {
      const field = this.signupForm.get(fieldName);
      if (field && field.invalid) {
        console.log(`📍 Found first invalid field (not touched): ${fieldName}`);
        // Mark as touched to show error
        field.markAsTouched();
        this.scrollToFieldError(fieldName);
        return;
      }
    }
    
    console.log('❌ No invalid fields found to scroll to');
  }

  // Check if all visible fields are filled and auto-scroll to show hidden fields
  private checkVisibleFieldsAndScroll(): void {
    // Only auto-scroll once
    if (this.hasAutoScrolled) return;
    
    // Define which fields are typically visible on initial load (above the fold)
    const visibleFields = ['firstName', 'lastName', 'email', 'username'];
    
    // Check if all visible fields have meaningful values
    const allVisibleFieldsFilled = visibleFields.every(fieldName => {
      const control = this.signupForm.get(fieldName);
      return control && control.value && control.value.toString().trim().length > 0;
    });
    
    if (allVisibleFieldsFilled && this.scrollContainer) {
      console.log('📱 All visible fields filled - auto-scrolling to reveal hidden fields');
      this.hasAutoScrolled = true; // Mark as scrolled
      
      setTimeout(() => {
        const containerElement = this.scrollContainer.nativeElement;
        
        // Scroll down to reveal the password and lower fields
        const scrollPosition = 280; // Enough to show password fields
        
        containerElement.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
        
        console.log('📍 Auto-scrolled to reveal hidden fields below');
      }, 500); // Short delay after user finishes typing
    }
  }

  // Auto-scroll to field with error
  private scrollToFieldError(fieldName: string): void {
    setTimeout(() => {
      const fieldElement = document.getElementById(fieldName) as HTMLInputElement;
      if (fieldElement && this.scrollContainer) {
        const containerElement = this.scrollContainer.nativeElement;
        
        // Scroll the field into view with smooth animation
        fieldElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
        
        // Alternative method using container scroll for better control
        const fieldRect = fieldElement.getBoundingClientRect();
        const containerRect = containerElement.getBoundingClientRect();
        
        // Calculate position to center the field in the viewport
        const fieldTop = fieldElement.offsetTop;
        const containerHeight = containerElement.clientHeight;
        const scrollTop = fieldTop - (containerHeight / 2) + (fieldElement.offsetHeight / 2);
        
        containerElement.scrollTo({
          top: Math.max(0, scrollTop),
          behavior: 'smooth'
        });
        
        // Focus the field for better accessibility
        setTimeout(() => {
          fieldElement.focus();
        }, 500); // Wait for scroll animation to complete
        
        // Add a subtle highlight effect to draw attention
        fieldElement.style.transition = 'box-shadow 0.3s ease';
        fieldElement.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.25)';
        
        // Remove highlight after 2 seconds
        setTimeout(() => {
          fieldElement.style.boxShadow = '';
        }, 2000);
      }
    }, 100); // Small delay to ensure DOM is updated and error is rendered
  }

  // Real-time field validation with immediate feedback
  validateFieldAndScroll(fieldName: string): void {
    const field = this.signupForm.get(fieldName);
    if (!field) return;

    // Mark field as touched to show validation state
    field.markAsTouched();
    
    // Check if field is invalid after user interaction
    if (field.invalid) {
      setTimeout(() => {
        console.log(`⚠️ Field ${fieldName} is invalid, scrolling to show error`);
        this.scrollToFieldError(fieldName);
      }, 300); // Small delay to let user finish typing
    }
  }

  // Enhanced scroll to field with better visual feedback
  private scrollToFieldWithFeedback(fieldName: string): void {
    const fieldElement = document.getElementById(fieldName) as HTMLInputElement;
    if (fieldElement && this.scrollContainer) {
      const containerElement = this.scrollContainer.nativeElement;
      
      // Scroll the field into view
      fieldElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
      
      // Focus the field for better UX
      setTimeout(() => {
        fieldElement.focus();
        
        // Add visual feedback
        fieldElement.style.transition = 'all 0.3s ease';
        fieldElement.style.borderColor = '#dc3545';
        fieldElement.style.boxShadow = '0 0 0 0.2rem rgba(220, 53, 69, 0.25)';
        
        // Remove visual feedback after 3 seconds
        setTimeout(() => {
          fieldElement.style.borderColor = '';
          fieldElement.style.boxShadow = '';
        }, 3000);
      }, 500);
    }
  }

  // Add method to handle Enter key press
  onFieldEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission
      
      // Check if we should auto-scroll when Enter is pressed
      if (this.signupForm.valid || this.shouldAutoScroll()) {
        this.scrollToSubmitButton();
      }
    }
  }

  // Enhanced method to handle form submission on Enter in the last field
  onLastFieldEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      
      // If form is valid, submit it
      if (this.signupForm.valid) {
        this.onSubmit();
      } else {
        // If not valid, just scroll to submit button to show validation errors
        this.scrollToSubmitButton();
      }
    }
  }

  // Handle field blur events for validation only - NO auto-scrolling
  onFieldBlur(fieldName: string): void {
    const field = this.signupForm.get(fieldName);
    if (field) {
      field.markAsTouched();
      // Just mark as touched for validation display - no scrolling
    }
  }

  // Handle field focus - DISABLED auto-scroll to prevent fluctuation
  onFieldFocus(fieldName: string): void {
    // DO NOT clear field errors on focus - let them persist until user changes the field
    // This ensures server-side errors like "email already exists" remain visible
    // until the user actually modifies the field value
  }

  private isLastVisibleField(fieldName: string): boolean {
    if (!this.scrollContainer) return false;
    
    const containerElement = this.scrollContainer.nativeElement;
    const containerHeight = containerElement.clientHeight;
    const scrollTop = containerElement.scrollTop;
    const visibleBottom = scrollTop + containerHeight;
    
    // Find the field element
    const fieldElement = containerElement.querySelector(`[formControlName="${fieldName}"]`) as HTMLElement;
    if (!fieldElement) return false;
    
    const fieldTop = fieldElement.offsetTop;
    const fieldHeight = fieldElement.offsetHeight;
    const fieldBottom = fieldTop + fieldHeight;
    
    // Check if this field is in the bottom 30% of visible area
    const bottomThreshold = visibleBottom - (containerHeight * 0.3);
    
    return fieldBottom >= bottomThreshold;
  }

  private scrollToRevealNext(): void {
    if (!this.scrollContainer) return;
    
    const containerElement = this.scrollContainer.nativeElement;
    const currentScrollTop = containerElement.scrollTop;
    const scrollIncrement = 250; // Scroll down 250px to reveal next fields
    
    containerElement.scrollTo({
      top: currentScrollTop + scrollIncrement,
      behavior: 'smooth'
    });
    
    console.log('� User reached bottom field - revealing next section');
  }
}
