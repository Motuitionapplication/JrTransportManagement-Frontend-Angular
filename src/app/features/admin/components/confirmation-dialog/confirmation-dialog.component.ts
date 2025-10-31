import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <h1 mat-dialog-title>{{ data.title }}</h1>
    <div mat-dialog-content>
      <p>{{ data.message }}</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">{{ data.cancelButtonText }}</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">{{ data.confirmButtonText }}</button>
    </div>
  `,
  styles: [
    `
      h1 {
        font-size: 20px;
        margin: 0;
      }
      div[mat-dialog-content] {
        margin: 20px 0;
      }
      div[mat-dialog-actions] {
        display: flex;
        justify-content: flex-end;
      }
    `
  ]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; confirmButtonText: string; cancelButtonText: string }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}