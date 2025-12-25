import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-edit-company-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Edit Company</h2>

    <form [formGroup]="form" mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Name</mat-label>
        <input matInput formControlName="name" />
      </mat-form-field>
    </form>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="submit()">Save</button>
    </div>
  `,
  styles: `
    .full-width {
      width: 100%;
    }
  `
})
export class EditCompanyDialog {
  private dialogRef = inject(MatDialogRef<EditCompanyDialog>);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    name: ['', Validators.required]
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { name: string }) {
    this.form.patchValue({ name: data.name });
  }

  submit() {
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close();
  }
}
