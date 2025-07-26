import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-page',
  templateUrl: './loading-page.component.html',
  styleUrls: ['./loading-page.component.scss']
})
export class LoadingPageComponent {
  features = [
    { name: 'Vehicle Owner Login', route: '/vehicle-owner/login' },
    { name: 'Driver Login', route: '/driver/login' },
    { name: 'Customer Login', route: '/customer/login' },
    { name: 'Booking Management', route: '/booking' },
    { name: 'Wallet', route: '/wallet' },
    { name: 'Complaints', route: '/complaints' },
    { name: 'Reviews', route: '/reviews' },
    { name: 'Vehicle Tracking', route: '/vehicle/tracking' },
    { name: 'Driver Management', route: '/driver/manage' },
    { name: 'Payment Status', route: '/payment/status' },
    { name: 'Fare Management', route: '/fare' },
    { name: 'Goods & Transit', route: '/goods-transit' },
    { name: 'Terms & Conditions', route: '/terms' }
  ];
}
