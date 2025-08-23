import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Vehicle, VehicleService } from '../../vehicle/vehicle.service'; // Adjust path
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
// Corrected the relative path to go up to 'features' then down to 'form'
import { VehicleFormComponent } from '../../form/vehicle-form/vehicle-form.component'; 

@Component({
  selector: 'app-vehicle-dialog',
  templateUrl: './vehicle-dialog.component.html',
  styleUrls: ['./vehicle-dialog.component.scss']
})
export class VehicleDialogComponent implements OnInit {
  public vehicles: Vehicle[] = [];
  public isLoading = true;
  public error: string | null = null;
  public ownerId: string;

  private gridApi!: GridApi;

  public columnDefs: ColDef[] = [
    {
    headerName: 'S. No.',
    valueGetter: (params) =>  {return params.node && params.node.rowIndex != null ? params.node.rowIndex + 1 : '';}
,
    width: 80,
    sortable: false,
    filter: false,
    resizable: true,
  },
    { headerName: 'Vehicle Number', field: 'vehicleNumber', sortable: true, filter: true },
    { headerName: 'Manufacturer', field: 'manufacturer', sortable: true, filter: true },
    { headerName: 'Model', field: 'model', sortable: true, filter: true },
    { headerName: 'Type', field: 'vehicleType', sortable: true, filter: true },
    { headerName: 'Capacity', field: 'capacity', sortable: true, filter: 'agNumberColumnFilter' },
    { headerName: 'Status', field: 'status', sortable: true, filter: true },
    {
      headerName: 'Insurance Expiry',
      field: 'insuranceExpiryDate',
      sortable: true,
      filter: 'agDateColumnFilter',
      valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString() : ''
    }
  ];

  public defaultColDef: ColDef = {
    resizable: true,
    flex: 1,
  };

  constructor(
    private vehicleService: VehicleService,
    private dialog: MatDialog, // Inject MatDialog to open other dialogs
    @Inject(MAT_DIALOG_DATA) public data: { ownerId: string }
  ) {
    this.ownerId = data.ownerId;
  }

  ngOnInit(): void {
    if (this.ownerId) {
      this.loadVehicles();
    } else {
      this.error = "Owner ID was not provided.";
      this.isLoading = false;
    }
  }

  loadVehicles(): void {
    this.isLoading = true;
    this.error = null;
    this.vehicleService.getvehiclesbyOwner(this.ownerId).subscribe({
      next: (vehicleData) => {
        this.vehicles = vehicleData;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching vehicles:', err);
        this.error = 'Failed to load vehicles. Please try again later.';
        this.isLoading = false;
      }
    });
  }
  onQuickFilterChanged(event: any) {
  const filterValue = event.target.value;
  this.gridApi.setQuickFilter(filterValue);
}

  /**
   * Opens the VehicleFormComponent to add a new vehicle.
   */
  openAddVehicleForm(): void {
    const dialogRef = this.dialog.open(VehicleFormComponent, {
      width: '700px',
      data: { ownerId: this.ownerId } // Pass the ownerId to the form
    });

    dialogRef.afterClosed().subscribe(result => {
      // If the form was submitted and a new vehicle was returned
      if (result) {
        // Add the new vehicle to the grid without a full reload
        this.gridApi.applyTransaction({ add: [result] });
      }
    });
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }
}
