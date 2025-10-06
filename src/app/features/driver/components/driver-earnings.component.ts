import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-driver-earnings',
  template: `
    <div class="component-container">
      <h1>Earnings</h1>
      <p>View your earnings, payments, and financial summary.</p>
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
export class DriverEarningsComponent implements OnInit {
  
  constructor() { }
  
  ngOnInit(): void {
    console.log('Driver earnings component initialized');
  }
}