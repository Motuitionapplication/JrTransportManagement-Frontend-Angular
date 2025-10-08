import { Component, OnInit } from '@angular/core';
import { OwnerService } from '../../../owner/owner.service';
import { DriverService } from '../../../driver/driver.service';
import { VehicleService } from '../../../vehicle/vehicle.service';
import { MatDialog } from '@angular/material/dialog';
import { ColDef } from 'ag-grid-community';
// import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';
import { AssignVehicleComponent } from '../../../form/assign-vehicle/assign-vehicle.component';

@Component({
  selector: 'app-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.scss']
})

export class DriversComponent implements OnInit {
  public isLoading = false;
  public driversForGrid: any[] = [];
  public gridApi: any;
  public gridColumnApi: any;
  public ownerId: string = '';

  columnDefs: ColDef[] = [
    { headerName: 'S.No.', field: '_sNo', width: 100 },
    { headerName: 'First Name', field: 'firstName', width: 150 },
    { headerName: 'Last Name', field: 'lastName', width: 150},
    { headerName: 'Email', field: 'email', width: 250 },
    { headerName: 'Phone', field: 'phoneNumber', width: 110 },
    { headerName: 'Status', field: 'status', width: 150 },
    {
      headerName: 'Current Vehicle',
      field: 'assignedVehicleInfo',
      width: 400
    },
    {
      headerName: 'Actions',
      colId: 'Actions',
      cellRenderer: (params: any) => {
        const eGui = document.createElement('div');
        // Assign/Unassign Vehicle button
        if (params.data.assignedVehicleInfo && params.data.assignedVehicleInfo !== "N/A") {
          const removeBtn = document.createElement('button');
          removeBtn.innerHTML = '<i class="bi bi-escape"></i>';
          removeBtn.className = 'btn btn-sm btn-danger me-1';
          removeBtn.title = 'Remove Assignment';
          removeBtn.addEventListener('click', () => this.removeVehicleAssignment(params.data));
          eGui.appendChild(removeBtn);
        } else {
          const assignBtn = document.createElement('button');
          assignBtn.innerHTML = '<i class="bi bi-plugin"></i>';
          assignBtn.className = 'btn btn-sm btn-info me-1';
          assignBtn.title = 'Assign Vehicle';
          assignBtn.addEventListener('click', () => this.openAssignVehicleDialog(params.data));
          eGui.appendChild(assignBtn);
        }
        // Payment button
        // const paymentBtn = document.createElement('button');
        // paymentBtn.innerHTML = '<i class="bi bi-cash-coin"></i>';
        // paymentBtn.className = 'btn btn-sm btn-warning me-1';
        // paymentBtn.title = 'View Payments';
        // paymentBtn.addEventListener('click', () => this.driverrecord(params.data));
        // eGui.appendChild(paymentBtn);
        // return eGui;
      },
      width: 190,
      pinned: 'right'
    }
  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  constructor(
    private ownerService: OwnerService,
    private driverService: DriverService,
    private vehicleservice: VehicleService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.vehicleservice.getOwnerId().subscribe({
      next: (ownerId) => {
        this.ownerId = ownerId;
        this.fetchDriversForOwner(ownerId);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching owner ID:', err);
      }
    });
  }

  fetchDriversForOwner(ownerId: string) {
    this.ownerService.getDriversByOwner(ownerId).subscribe({
      next: (drivers) => {
        this.driversForGrid = drivers.map((driver, idx) => ({
          ...driver,
          _sNo: (idx + 1).toString()
        }));
        this.gridApi?.setRowData(this.driversForGrid);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching drivers:', err);
      }
    });
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  removeVehicleAssignment(driverData: any): void {
    this.isLoading = true;
    this.driverService.unassignvehicle(driverData.id).subscribe({
      next: () => {
        this.fetchDriversForOwner(this.ownerId);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to unassign vehicle:', err);
      }
    });
  }

  openAssignVehicleDialog(driverData: any): void {
    this.vehicleservice.getvehiclesbyOwner(this.ownerId).subscribe({
      next: (vehicles) => {
        const dialogRef = this.dialog.open(AssignVehicleComponent, {
          width: '500px',
          data: {
            driver: driverData,
            vehicles: vehicles
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result?.success) {
            this.fetchDriversForOwner(this.ownerId);
          }
        });
      },
      error: (err) => {
        console.error('Failed to fetch vehicle list for assignment.', err);
      }
    });
  }

  // driverrecord(driverData: any) {
  //   this.dialog.open(PaymentDialogComponent, {
  //     width: '800px',
  //     data: { driverId: driverData.id }
  //   });
  // }

  // Add these properties
  public showCustomMessage: boolean = false;
  public customMessage: string = '';
  public customMessageIsError: boolean = false;
  public showCustomConfirm: boolean = false;
  public confirmMessage: string = '';

  // Add these methods
  onConfirmNo() {
    this.showCustomConfirm = false;
  }

  onConfirmYes() {
    // Add your confirmation logic here
    this.showCustomConfirm = false;
  }

  public searchValue: string = '';

  onQuickFilterChanged(event: any) {
    const value = event.target.value;
    this.gridApi?.setQuickFilter(value);
  }

  onExportCSV() {
    this.gridApi?.exportDataAsCsv();
  }
}