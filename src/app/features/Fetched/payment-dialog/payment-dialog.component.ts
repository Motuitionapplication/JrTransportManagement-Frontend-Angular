import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ColDef, GridApi } from 'ag-grid-community';
import { OwnerService } from '../../owner/owner.service';
import { PaymentService } from '../../payment/payment.service';

@Component({
  selector: 'app-payment-dialog',
  template: `
    <h2 mat-dialog-title>Driver Payment Records</h2>

    <mat-dialog-content style="height: 450px; width: 100%; display: flex; flex-direction: column;">
      <!-- Search Bar -->
      <mat-form-field appearance="outline" style="margin-bottom: 10px;">
        <mat-label>Search Payments</mat-label>
        <input matInput (input)="onSearch($event)" placeholder="Search by any field..." />
      </mat-form-field>

      <!-- ag-Grid -->
      <ag-grid-angular
        class="ag-theme-alpine"
        style="width: 100%; flex: 1;"
        [rowData]="rowData"
        [columnDefs]="columnDefs"
        [defaultColDef]="defaultColDef"
        [pagination]="true"
        [paginationPageSize]="5"
        (gridReady)="onGridReady($event)"
      ></ag-grid-angular>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `
})
export class PaymentDialogComponent implements OnInit {
  rowData: any[] = [];
  private gridApi!: GridApi;

  columnDefs: ColDef[] = [
    { field: 'createdAt', headerName: 'Date', sortable: true, filter: true, valueFormatter: this.formatDate },
    { field: 'paymentId', headerName: 'Payment ID', sortable: true, filter: true },
    { field: 'paymentStatus', headerName: 'Status', sortable: true, filter: true },
    { field: 'totalAmount', headerName: 'Amount', sortable: true, filter: true },
    { field: 'transactionId', headerName: 'Transaction ID', sortable: true, filter: true }
  ];

  defaultColDef: ColDef = {
    flex: 1,
    resizable: true
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private paymentservice: PaymentService,
    private dialogRef: MatDialogRef<PaymentDialogComponent>
  ) {}

  ngOnInit() {
    console.log('Fetching payments for:', this.data.driverId);

    this.paymentservice.getPaymentByDriver(this.data.driverId).subscribe({
      next: (payments) => {
        console.log('Payments received:', payments);
        this.rowData = payments;
      },
      error: (err) => {
        console.error('Error fetching payments', err);
      }
    });
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi.setQuickFilter(value);
  }

  formatDate(params: any) {
    if (!params.value) return '';
    return new Date(params.value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
