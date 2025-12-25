import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-create-company-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Create Company</h2>

    <form [formGroup]="form" mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Name</mat-label>
        <input matInput formControlName="name" />
      </mat-form-field>
    </form>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="submit()">Create</button>
    </div>
  `,
  styles: `
    .full-width {
      width: 100%;
    }
  `
})
export class CreateCompanyDialog {
  private dialogRef = inject(MatDialogRef<CreateCompanyDialog>);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    name: ['', Validators.required]
  });

  submit() {
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close();
  }
}
