// ...existing code...
// (Move SidebarComponent to the bottom of the file)
import { Component } from '@angular/core';

@Component({
    selector: 'app-sidebar',
    template: `
        <nav class="sidebar">
            <ul>
                <li><a routerLink="/super-admin/user-management">User Management</a></li>
                <li><a routerLink="/super-admin/approval-management">Approval Management</a></li>
                <li><a routerLink="/super-admin/vehicle-management">Vehicle Management</a></li>
                <li><a routerLink="/super-admin/consignment-management">Consignment Management</a></li>
                <li><a routerLink="/super-admin/payment-management">Payment Management</a></li>
                <li><a routerLink="/super-admin/fare-management">Fare Management</a></li>
                <li><a routerLink="/super-admin/complaint-management">Complaint Management</a></li>
                <li><a routerLink="/super-admin/term-management">Term Management</a></li>
                <li><a routerLink="/super-admin/wallet-management">Wallet Management</a></li>
                <li><a routerLink="/super-admin/analytics">Analytics</a></li>
            </ul>
        </nav>
    `,
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {}