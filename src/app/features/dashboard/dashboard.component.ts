import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {}

  navigateToVehicleManagement(): void {
    // Future implementation - Vehicle Management Module
    console.log('Vehicle Management - Coming Soon!');
  }

  navigateToDriverManagement(): void {
    // Future implementation - Driver Management Module
    console.log('Driver Management - Coming Soon!');
  }

  navigateToRouteManagement(): void {
    // Future implementation - Route Management Module
    console.log('Route Management - Coming Soon!');
  }

  navigateToFleetTracking(): void {
    // Future implementation - Fleet Tracking Module
    console.log('Fleet Tracking - Coming Soon!');
  }

  navigateToCustomerManagement(): void {
    // Future implementation - Customer Management Module
    console.log('Customer Management - Coming Soon!');
  }

  // Legacy methods (keeping for now)
  navigateToStudentManagement(): void {
    this.router.navigate(['/students']);
  }

  navigateToTeacherManagement(): void {
    // Future implementation
    console.log('Teacher Management - Coming Soon!');
  }

  navigateToClassManagement(): void {
    // Future implementation
    console.log('Class Management - Coming Soon!');
  }

  navigateToAttendance(): void {
    // Future implementation
    console.log('Attendance - Coming Soon!');
  }
}
