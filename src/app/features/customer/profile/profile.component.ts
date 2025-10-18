import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Customer } from 'src/app/models/customer.model';
import { CustomerService } from '../customer.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  customer!: Customer;
  userId!:string;

  loading = true;
  isLoading = false;
  isEditing = false;
  showPasswordDialog = false;

  toastMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // get from localStorage or route param
    this.userId = localStorage.getItem('userId') || '';

    if (this.userId) {
      this.customerService.getCustomerByUserId(this.userId).subscribe({
        next: (data) => {
          this.customer = data;
          console.log(this.customer.id,this.userId);
          this.initForm(data);
          this.initPasswordForm();
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load profile:', err);
          this.loading = false;
        }
      });
    }
  }

  initForm(customer: Customer) {
    this.profileForm = this.fb.group({
      firstName: [customer.profile.firstName, Validators.required],
      lastName: [customer.profile.lastName, Validators.required],
      email: [customer.profile.email, [Validators.required, Validators.email]],
      phone: [
        customer.profile.phoneNumber,
        [Validators.required, Validators.pattern(/^[0-9]{10}$/)]
      ],
      address: [customer.profile.address?.street || '']
    });
  }

  initPasswordForm() {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  showToast(message: string) {
    this.toastMessage = message;
    setTimeout(() => (this.toastMessage = null), 3000);
  }

  enableEdit() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    this.initForm(this.customer); // reset to original values
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.customer.id) {
      this.isLoading = true;

      // Create a "flat" payload object that matches the structure your Spring backend expects.
      // This resolves the issue of sending nested profile data.
      const apiPayload = {
        firstName: this.profileForm.value.firstName,
        lastName: this.profileForm.value.lastName,
        email: this.profileForm.value.email,
        phoneNumber: this.profileForm.value.phone,
        
        address: this.profileForm.value.address,
        accountStatus: this.customer.accountStatus || 'ACTIVE' 
      }
      this.customerService.updateCustomer(this.customer.id, apiPayload as any).subscribe({
        next: () => {
          this.isLoading = false;
          this.isEditing = false;
          this.showToast('✅ Profile updated successfully!');
          
   
          this.customer.profile.firstName = apiPayload.firstName;
          this.customer.profile.lastName = apiPayload.lastName;
          this.customer.profile.email = apiPayload.email;
          this.customer.profile.phoneNumber = apiPayload.phoneNumber;
          
          if (this.customer.profile.address) {
            this.customer.profile.address.street = apiPayload.address;
          } else {
            this.customer.profile.address = { 
              street: apiPayload.address,
              city: '',
              state: '',
              pincode: '',
              country: '' 
            };
          }
        },
        error: () => {
          this.isLoading = false;
          this.showToast('❌ Failed to update profile.');
        }
      });
    }
  }

  // 🔑 Change password handlers
  openChangePassword() {
    this.showPasswordDialog = true;
  }

  closeChangePassword() {
    this.showPasswordDialog = false;
    this.passwordForm.reset();
  }

  onChangePassword() {
    if (this.passwordForm.invalid) return;

    if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
      this.showToast('⚠️ Passwords do not match!');
      return;
    }

    this.isLoading = true;

    const payload = {
      oldPassword: this.passwordForm.value.oldPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.customerService.updateCustomerPassword(this.customer.id, payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.showPasswordDialog = false;
        this.showToast('✅ Password updated successfully!');
      },
      error: () => {
        this.isLoading = false;
        this.showToast('❌ Failed to update password.');
      }
    });
  }
}

