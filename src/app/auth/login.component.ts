// login.component.ts

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  role: string = 'owner';
  
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      userId: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

 login() {
  if (this.loginForm.valid) {
    this.auth.login(this.role, this.loginForm.value).subscribe({
      next: (res: any) => {
        // --- ADD THESE LOGS ---
        console.log('1. Full API Response:', res); // What did the backend actually send?

        if (res.roles && res.roles.length > 0) {
          const userRole = res.roles[0];
          console.log('2. Extracted Role:', userRole); // Did we get the role correctly?

          localStorage.setItem('token', res.token);
          localStorage.setItem('role', userRole);

          switch (userRole) {
            case 'ROLE_OWNER':
              console.log('3. Navigation Triggered: Attempting to go to /owner'); // Is this line reached?
              this.router.navigate(['/owner']);
              break;
            // ... other case
            // s
            case 'ROLE_DRIVER':
              this.router.navigate(['/driver']);
              break;
            case 'ROLE_CUSTOMER':
              this.router.navigate(['/customer']);
              break;
            case 'ROLE_ADMIN':
              this.router.navigate(['/admin']);
              break;
            case 'ROLE_SUPER_ADMIN':
              this.router.navigate(['/super-admin']);
              break;
            default:
              this.router.navigate(['/login']);

          }
        } else {
          console.error('Login successful, but no role received from backend.');
        }
      },
      error: (err) => {
        // Is the API call failing?
        console.error('API Error:', err);
      }
    });
  }
}
}