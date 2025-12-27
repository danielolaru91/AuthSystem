import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { Inject } from '@angular/core';
import { GlobalStateService } from '../services/global-state.service';

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>Edit User</h2>

    <form [formGroup]="form">
      <div mat-dialog-content>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Role</mat-label>
          <mat-select formControlName="roleId">
            @for(r of roles(); track r.id){
            <mat-option [value]="r.id">
              {{ r.name }}
            </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-checkbox formControlName="emailConfirmed">
          Email Confirmed
        </mat-checkbox>

      </div>
    </form>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="submit()">
        Save
      </button>
    </div>
  `,
  styles: `
    .full-width {
      width: 100%;
    }
  `
})
export class EditUserDialog {
  private dialogRef = inject(MatDialogRef<EditUserDialog>);
  private fb = inject(FormBuilder);
  protected roles = inject(GlobalStateService).roles;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    emailConfirmed: [false],
    roleId: [3, Validators.required]
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { email: string; emailConfirmed: boolean; roleId: number }
  ) {
    this.form.patchValue({
      email: data.email,
      emailConfirmed: data.emailConfirmed,
      roleId: data.roleId
    });
  }

  submit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
