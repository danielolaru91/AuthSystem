import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  template: `
    <h2 mat-dialog-title>Create User</h2>

    <form [formGroup]="form" mat-dialog-content>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Password</mat-label>
        <input matInput type="password" formControlName="password" />
      </mat-form-field>

      <mat-checkbox formControlName="emailConfirmed">
        Email Confirmed
      </mat-checkbox>

    </form>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="submit()">
        Create
      </button>
    </div>
  `,
  styles: `
    .full-width {
      width: 100%;
    }
  `
})
export class CreateUserDialog {
  private dialogRef = inject(MatDialogRef<CreateUserDialog>);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    emailConfirmed: [false]
  });

  submit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
