import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  menuItems = [
    { label: 'Dashboard', route: 'dashboard', icon: '📊' },
    { label: 'Vehicles', route: 'vehicles', icon: '🚗' },
    { label: 'Drivers', route: 'drivers', icon: '👨‍✈️' },
    { label: 'Bookings', route: 'bookings', icon: '📅' },
    { label: 'Earnings', route: 'earnings', icon: '💰' },
    { label: 'Maintenance', route: 'maintenance', icon: '🛠️' },
    { label: 'Tracking', route: 'tracking', icon: '📍' },
    { label: 'Analytics', route: 'analytics', icon: '📈' },
    { label: 'Notifications', route: 'notifications', icon: '🔔' }
  ];
}
