import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule],
  template: `
    <h2 mat-dialog-title>Confirm Action</h2>

    <div mat-dialog-content>
      Are you sure you want to perform this action?
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="close(false)">Cancel</button>
      <button mat-flat-button color="warn" (click)="close(true)">Yes</button>
    </div>
  `
})
export class ConfirmDialog {
  private dialogRef = inject(MatDialogRef<ConfirmDialog>);

  close(result: boolean) {
    this.dialogRef.close(result);
  }
}
