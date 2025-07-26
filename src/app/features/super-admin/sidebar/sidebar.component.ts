import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  collapsed = false;
  userManagementExpanded = false;

  sections = [
    {
      label: 'User Management',
      icon: 'fas fa-users',
      children: [
        { label: 'Admin Management', icon: 'fas fa-user-shield', route: '/super-admin/admin-management' },
        { label: 'Customer Management', icon: 'fas fa-user-friends', route: '/super-admin/customer-management' },
        { label: 'Owner Management', icon: 'fas fa-user-tie', route: '/super-admin/owner-management' },
        { label: 'Driver Management', icon: 'fas fa-id-badge', route: '/super-admin/driver-management' }
      ]
    },
    { label: 'Approval Management', icon: 'fas fa-user-check', route: '/super-admin/approval-management' },
    { label: 'Vehicle Management', icon: 'fas fa-truck', route: '/super-admin/vehicle-management' },
    { label: 'Consignment Management', icon: 'fas fa-box', route: '/super-admin/consignment-management' },
    { label: 'Payment Management', icon: 'fas fa-credit-card', route: '/super-admin/payment-management' },
    { label: 'Fare Management', icon: 'fas fa-money-bill-wave', route: '/super-admin/fare-management' },
    { label: 'Complaint Management', icon: 'fas fa-exclamation-circle', route: '/super-admin/complaint-management' },
    { label: 'Term Management', icon: 'fas fa-file-contract', route: '/super-admin/term-management' },
    { label: 'Wallet Management', icon: 'fas fa-wallet', route: '/super-admin/wallet-management' },
    { label: 'Analytics', icon: 'fas fa-chart-line', route: '/super-admin/analytics' }
  ];

  toggleSidebar() {
    this.collapsed = !this.collapsed;
    console.log('Sidebar collapsed:', this.collapsed);
  }

  toggleUserManagement() {
    this.userManagementExpanded = !this.userManagementExpanded;
  }
}
