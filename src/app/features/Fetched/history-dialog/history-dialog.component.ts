import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { finalize } from 'rxjs';
import { OwnerService } from '../../owner/owner.service';
interface AssignmentHistoryDto {
  vehicleNumber: string;
  vehicleModel: string;
  driverFirstName: string;
  driverLastName: string;
  driverPhoneNumber: string;
  assignmentStartDate: string;
  assignmentEndDate: string;
}

@Component({
  selector: 'app-history-dialog',
  templateUrl: './history-dialog.component.html',
  styleUrls: ['./history-dialog.component.scss'], // Link to the new SCSS
})
export class HistoryDialogComponent implements OnInit {
  // State management properties
  public assignmentHistory: AssignmentHistoryDto[] = [];
  public isLoading = true;
  public error: string | null = null;
  
  // AG Grid properties
  private gridApi!: GridApi;
  public defaultColDef: ColDef = { sortable: true, filter: true, resizable: true };
   public columnDefs: ColDef[] = [
    { 
      headerName: 'Vehicle Number', 
      field: 'vehicleNumber', 
      minWidth: 170
    },
    { 
      headerName: 'Vehicle Model', 
      field: 'vehicleModel', 
      minWidth: 150
    },
    {
      headerName: 'Driver Name',
      valueGetter: params => `${params.data.driverFirstName} ${params.data.driverLastName}`,
      minWidth: 180
    },
    { 
      headerName: 'Driver Phone', 
      field: 'driverPhoneNumber', 
      minWidth: 160
    },
    { 
      headerName: 'Start Date', 
      field: 'assignmentStartDate', 
      minWidth: 150
    },
    { 
      headerName: 'End Date', 
      field: 'assignmentEndDate', 
      minWidth: 150
    },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { ownerId: string },
    private ownerService: OwnerService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.error = null;

    this.ownerService.getAssignmentHistoryForOwner(this.data.ownerId)
      .pipe(
        // Use finalize to ensure isLoading is set to false whether it succeeds or fails
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data) => {
          this.assignmentHistory = data;
        },
        error: () => {
          this.error = 'An error occurred while fetching the history.';
        }
      });
  }

  // Store Grid API for searching
  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
  }

  // Filter grid data based on search input
  onQuickFilterChanged(event: any): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.gridApi.setQuickFilter(searchValue);
  }
}