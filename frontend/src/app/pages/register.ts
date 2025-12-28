import { Component, signal, inject } from '@angular/core';
import { email, Field, form, required, submit } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthModel, AuthService } from '../services/auth.service';
import { finalize } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [Field, MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule, MatSnackBarModule, MatProgressSpinnerModule, RouterLink],
  template: `
    <div class="register-wrapper">
        <mat-card>
            <mat-card-header>
                <mat-card-title>Register</mat-card-title>
            </mat-card-header>

            <mat-card-content>
                <form>
                    <mat-form-field>
                    <mat-label>Email</mat-label>
                    <input matInput type="email" [field]="registerForm.email">
                    @for (err of registerForm.email().errors(); track err.kind) {
                    <mat-error>{{ err.message }}</mat-error>
                    }
                    </mat-form-field>

                    <mat-form-field>
                    <mat-label>Password</mat-label>
                    <input matInput type="password" [field]="registerForm.password" autocomplete="password">
                    @for (err of registerForm.password().errors(); track err.kind) {
                    <mat-error>{{ err.message }}</mat-error>
                    }
                    </mat-form-field>
                </form>
            </mat-card-content>

            <mat-card-footer>
                <button matButton="filled" [disabled]="loading()" (click)="onSubmit($event)">
                    @if(loading()){
                        <mat-spinner diameter="20"></mat-spinner>
                    }@else {
                        Sign Up
                    }
                </button>
                <button matButton routerLink="/login">
                    Login
                </button>
            </mat-card-footer>
        </mat-card>
    </div>
  `,
  styles: `
    .register-wrapper {
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
    mat-card-footer {\
        padding-top: 6px;
        display: flex;
        button:nth-child(2){
            margin-left: auto;
        }
    }
  `
})
export class Register {
    protected loading = signal(false);
    private authService = inject(AuthService);
    private snackBar = inject(MatSnackBar);
    public registerModel = signal<AuthModel>({
        email: '',
        password: '',
    });

    public registerForm = form(this.registerModel, (schemaPath) => {
        required(schemaPath.email, {message: 'Email is required'});
        email(schemaPath.email, {message: 'Enter a valid email address'});
        required(schemaPath.password, {message: 'Password is required'});
    });

    public onSubmit(event: Event) {
        this.registerForm().markAsTouched();
        if (!this.registerForm().valid()) {
            return;
        }
        this.loading.set(true);
        submit(this.registerForm, async () => {
        const credentials = this.registerModel();

        this.authService.register(credentials).pipe(finalize(() => this.loading.set(false))).subscribe({
            next: (response) => {
            this.snackBar.open(response.message, 'Close', {
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
