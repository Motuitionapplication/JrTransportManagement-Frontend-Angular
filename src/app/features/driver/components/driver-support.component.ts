import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-driver-support',
  template: `
    <div class="component-container">
      <h1>Support</h1>
      <p>Get help and support for your driving activities.</p>
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
export class DriverSupportComponent implements OnInit {
  
  constructor() { }
  
  ngOnInit(): void {
    console.log('Driver support component initialized');
  }
}