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
      this.auth.login(this.role, this.loginForm.value).subscribe((res: any) => {
        // Save token and backend role in localStorage
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role); // backend role
        // Redirect based on backend role
        switch (res.role) {
          case 'ROLE_OWNER':
            this.router.navigate(['/owner']);
            break;
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
      });
    }
  }
}
