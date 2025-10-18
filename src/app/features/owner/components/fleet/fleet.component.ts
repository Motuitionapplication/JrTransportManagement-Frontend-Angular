import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-fleet',
  templateUrl: './fleet.component.html',
  styleUrls: ['./fleet.component.scss']
})
export class FleetComponent implements OnInit {

  fleetData = [
    {
      id: 'FL001',
      name: 'City Transport Fleet',
      totalVehicles: 15,
      activeVehicles: 12,
      maintenanceVehicles: 2,
      inactiveVehicles: 1,
      totalEarnings: 85000,
      monthlyTarget: 100000
    },
    {
      id: 'FL002', 
      name: 'Logistics Fleet',
      totalVehicles: 8,
      activeVehicles: 7,
      maintenanceVehicles: 1,
      inactiveVehicles: 0,
      totalEarnings: 45000,
      monthlyTarget: 60000
    }
  ];

  vehicles = [
    { id: 'V001', plateNumber: 'MH-12-AB-1234', type: 'Truck', status: 'Active', driver: 'John Doe', lastService: '2024-09-15' },
    { id: 'V002', plateNumber: 'MH-12-CD-5678', type: 'Van', status: 'Maintenance', driver: 'Jane Smith', lastService: '2024-08-20' },
    { id: 'V003', plateNumber: 'MH-12-EF-9012', type: 'Truck', status: 'Active', driver: 'Mike Johnson', lastService: '2024-09-10' }
  ];

  constructor() { }

  ngOnInit(): void {
    console.log('Fleet component initialized');
  }

  addNewFleet(): void {
    console.log('Adding new fleet');
  }

  editFleet(fleetId: string): void {
    console.log('Editing fleet:', fleetId);
  }

  deleteFleet(fleetId: string): void {
    console.log('Deleting fleet:', fleetId);
  }

  viewFleetDetails(fleetId: string): void {
    console.log('Viewing fleet details:', fleetId);
  }

  assignVehicleToFleet(vehicleId: string, fleetId: string): void {
    console.log('Assigning vehicle to fleet:', vehicleId, fleetId);
  }

}