import { Component, OnInit } from '@angular/core';
import { Customer } from '../../models/customer.model';
import { CustomerService } from '../customer/customer.service';

@Component({
  selector: 'app-customer-management',
  template: `
  <app-customer-fetcher></app-customer-fetcher>
  `,
})
export class CustomerManagementComponent{
  
}

