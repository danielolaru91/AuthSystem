import { Component, inject, signal } from '@angular/core';
import { Field, form, required, minLength } from '@angular/forms/signals';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';

export interface ResetPasswordModel {
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-reset-password',
  imports: [
    Field,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink
  ],
  template: `
    <div class="forgot-password-wrapper">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Reset Password</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form>
            <mat-form-field>
              <mat-label>New Password</mat-label>
              <input matInput type="password" [field]="resetForm.newPassword">
              @for (err of resetForm.newPassword().errors(); track err.kind) {
                <mat-error>{{ err.message }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field>
              <mat-label>Confirm Password</mat-label>
              <input matInput type="password" [field]="resetForm.confirmPassword">
              @for (err of resetForm.confirmPassword().errors(); track err.kind) {
                <mat-error>{{ err.message }}</mat-error>
              }
            </mat-form-field>
          </form>
        </mat-card-content>

        <mat-card-footer>
          <button matButton="filled" [disabled]="loading()" (click)="onSubmit()">
            @if(loading()){
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              Reset Password
            }
          </button>

          <button matButton routerLink="/login">
            Back to Login
          </button>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: `
    .forgot-password-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      padding: 20px;
    }
    mat-form-field {
      width: 100%;
    }
    mat-card-header,
    mat-card-footer {
      padding: 16px;
    }
    mat-card-footer {
    padding-top: 6px;
      display: flex;
      button:nth-child(2){
        margin-left: auto;
      }
    }
  `
})
export class ResetPasswordComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  protected loading = signal(false);
  private token = this.route.snapshot.queryParamMap.get('token') ?? '';

  public resetModel = signal<ResetPasswordModel>({
    newPassword: '',
    confirmPassword: ''
  });

public resetForm = form(this.resetModel, (schema) => {
  required(schema.newPassword, { message: 'Password is required' });
  minLength(schema.newPassword, 6, { message: 'Password must be at least 6 characters' });

  required(schema.confirmPassword, { message: 'Confirm your password' });
});


  public onSubmit() {
    this.resetForm().markAsTouched();
    if (!this.resetForm().valid()) { return; }
    const { newPassword, confirmPassword } = this.resetModel();

    if (newPassword !== confirmPassword) {
        this.snackBar.open('Passwords do not match!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
          return;
    }

    this.loading.set(true);

    this.authService.resetPassword({ token: this.token, newPassword })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.snackBar.open('Password reset successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });

          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.snackBar.open(err.error.message || 'Reset failed', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      });
  }
}
