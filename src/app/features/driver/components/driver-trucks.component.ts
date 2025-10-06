import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-driver-trucks',
  template: `
    <div class="component-container">
      <h1>My Trucks</h1>
      <p>Manage your assigned trucks and vehicle information.</p>
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
export class DriverTrucksComponent implements OnInit {
  
  constructor() { }
  
  ngOnInit(): void {
    console.log('Driver trucks component initialized');
  }
}