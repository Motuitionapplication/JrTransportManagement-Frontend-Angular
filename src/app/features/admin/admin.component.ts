import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
toggleSidebar() {
throw new Error('Method not implemented.');
}
sidebarCollapsed: any;
setActiveSection(arg0: string) {
throw new Error('Method not implemented.');
}
activeSection: any;

  constructor() { }

  ngOnInit(): void {
    console.log('Admin component initialized');
  }

}
