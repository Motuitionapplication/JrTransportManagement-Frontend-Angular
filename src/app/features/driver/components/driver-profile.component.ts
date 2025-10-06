import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-driver-profile',
  template: `
    <div class="component-container">
      <h1>Profile</h1>
      <p>Manage your driver profile and personal information.</p>
      <div class="placeholder-content">
        <p>This section is under development.</p>
      </div>
    </div>
  `,
  styles: [`
    .component-container {
      padding: 1.5rem;
    }
    .placeholder-content {
      background: #f8f9fa;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      margin-top: 1rem;
    }
  `]
})
export class DriverProfileComponent implements OnInit {
  
  constructor() { }
  
  ngOnInit(): void {
    console.log('Driver profile component initialized');
  }
}