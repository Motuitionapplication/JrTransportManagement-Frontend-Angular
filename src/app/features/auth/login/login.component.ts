import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../models/auth.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialogRef: MatDialogRef<LoginComponent>,
    private router: Router
  ) {
    this.loginForm = this.createLoginForm();
  }

  ngOnInit(): void {
    // Component is ready - no need to test connection initially
    console.log('🔐 Login component initialized');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private createLoginForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private testConnection(): void {
    this.subscription.add(
      this.authService.testAuthEndpoint().subscribe({
        next: (response) => {
          console.log('✅ Auth endpoint test successful:', response.message);
        },
        error: (error) => {
          console.error('❌ Auth endpoint test failed:', error);
          this.errorMessage = 'Unable to connect to authentication server. Please try again later.';
        }
      })
    );
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      const credentials: LoginRequest = {
        username: this.loginForm.value.username.trim(),
        password: this.loginForm.value.password
      };

      this.subscription.add(
        this.authService.login(credentials).subscribe({
          next: (response) => {
            console.log('✅ Login successful:', response);
            // Role-based redirect (handles ROLE_ prefix)
            const role = Array.isArray(response?.roles) && response.roles.length > 0 ? response.roles[0] : null;
            let route = '';
            switch (role) {
              case 'ROLE_OWNER':
                route = '/owner';
                break;
              case 'ROLE_CUSTOMER':
                route = '/customer';
                break;
              case 'ROLE_DRIVER':
                route = '/driver';
                break;
              case 'ROLE_ADMIN':
                route = '/admin';
                break;
              case 'ROLE_SUPER_ADMIN':
                route = '/super-admin';
                break;
              default:
                route = '/unauthorized'; // Fallback for unknown/undefined roles
            }
            this.router.navigate([route]);
            this.dialogRef.close({ success: true, user: response });
          },
          error: (error) => {
            console.error('❌ Login failed:', error);
            this.isLoading = false;
            if (error.status === 401) {
              this.errorMessage = 'Invalid username or password. Please try again.';
              if (!this.errorMessage.includes('Admin')) {
                this.errorMessage += ' If this is your first time, you can create an admin account for testing.';
              }
            } else if (error.status === 0) {
              this.errorMessage = 'Unable to connect to server. Please check if the Spring Boot backend is running on localhost:8080.';
            } else {
              this.errorMessage = error.error?.message || 'Login failed. Please try again.';
            }
          }
        })
      );
    }
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  // Quick login methods for testing
  loginAsAdmin(): void {
    this.loginForm.patchValue({
      username: 'admin',
      password: 'admin123'
    });
  }

  createAdminAccount(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.subscription.add(
      this.authService.createAdmin().subscribe({
        next: (response) => {
          console.log('✅ Admin account created:', response);
          this.isLoading = false;
          this.errorMessage = '';
          // Auto-fill admin credentials
          this.loginAsAdmin();
        },
        error: (error) => {
          console.error('❌ Admin creation failed:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to create admin account.';
        }
      })
    );
  }

  // Form validation helpers
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }
}
