import { Component, signal, inject } from '@angular/core';
import { email, Field, form, required, submit } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface ForgotPasswordModel {
  email: string;
}

@Component({
  selector: 'app-forgot-password',
  imports: [Field, MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule, RouterLink],
  template: `
    <div class="forgot-password-wrapper">
        <mat-card>
            <mat-card-header>
                <mat-card-title>Forgot Password</mat-card-title>
            </mat-card-header>

            <mat-card-content>
                <form>
                    <mat-form-field>
                    <mat-label>Email</mat-label>
                    <input matInput type="email" [field]="forgotPasswordForm.email">
                    @for (err of forgotPasswordForm.email().errors(); track err.kind) {
                    <mat-error>{{ err.message }}</mat-error>
                    }
                    </mat-form-field>
                </form>
            </mat-card-content>

            <mat-card-footer>
                <button matButton="filled" [disabled]="loading()" (click)="onSubmit()">
                    @if(loading()){
                        <mat-spinner diameter="20"></mat-spinner>
                    }@else {
                        Submit
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
    mat-card {
        width: 400px;
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
export class ForgotPassword {
    private router = inject(Router);
    private authService = inject(AuthService);
    private snackBar = inject(MatSnackBar);
    protected loading = signal(false);
    public forgotPasswordModel = signal<ForgotPasswordModel>({email: ''});

    public forgotPasswordForm = form(this.forgotPasswordModel, (schemaPath) => {
        required(schemaPath.email, {message: 'Email is required'});
        email(schemaPath.email, {message: 'Enter a valid email address'});
    });

    public onSubmit() {
        this.forgotPasswordForm().markAsTouched();
        if (!this.forgotPasswordForm().valid()) {
            return;
        }
        this.loading.set(true);
        submit(this.forgotPasswordForm, async () => {
        const credentials = this.forgotPasswordModel();

        this.authService.requestReset(credentials).pipe(
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: () => {
            this.snackBar.open('Password request sent. Please check your email.', 'Close', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['snackbar-success']
            });
            },
            error: (err) => {
            this.snackBar.open(err.error.message, 'Close', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['snackbar-error']
            });
            },
        });
        });
    }
}
