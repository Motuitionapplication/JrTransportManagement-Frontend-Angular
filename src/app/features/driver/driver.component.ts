import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.scss']
})
export class DriverComponent implements OnInit {
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
    console.log('🚛 Driver component initialized');
  }

}
