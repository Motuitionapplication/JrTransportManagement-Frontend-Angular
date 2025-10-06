import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.scss']
})
export class DriverComponent implements OnInit {

sidebarCollapsed: boolean = false;
activeSection: string = 'profile';
servicesOpen: boolean = false;

toggleSidebar() {
  this.sidebarCollapsed = !this.sidebarCollapsed;
}

setActiveSection(section: string) {
  this.activeSection = section;
}

  constructor() { }

  ngOnInit(): void {
    console.log('🚛 Driver component initialized');
  }

}
