import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { email, Field, form, required, submit } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthModel, AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  imports: [Field, MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-wrapper">
        <mat-card>
            <mat-card-header>
                <mat-card-title>Login</mat-card-title>
            </mat-card-header>

            <mat-card-content>
                <form>
                    <mat-form-field>
                    <mat-label>Email</mat-label>
                    <input matInput type="email" [field]="loginForm.email">
                    @for (err of loginForm.email().errors(); track err.kind) {
                    <mat-error>{{ err.message }}</mat-error>
                    }
                    </mat-form-field>

                    <mat-form-field>
                    <mat-label>Password</mat-label>
                    <input matInput type="password" [field]="loginForm.password" autocomplete="password">
                    @for (err of loginForm.password().errors(); track err.kind) {
                    <mat-error>{{ err.message }}</mat-error>
                    }
                    </mat-form-field>
                </form>
            </mat-card-content>

            <mat-card-footer>
                <button matButton="filled" [disabled]="loginForm().invalid() || loading()" (click)="onSubmit()">
                    @if(loading()){
                        <mat-spinner diameter="20"></mat-spinner>
                    }@else {
                        Log In
                    }
                </button>
            </mat-card-footer>
        </mat-card>
    </div>
  `,
  styles: `
    .login-wrapper {
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
        padding-top: 0;
    }
  `
})
export class Login {
    private router = inject(Router);
    private authService = inject(AuthService);
    private snackBar = inject(MatSnackBar);
    protected loading = signal(false);
    public loginModel = signal<AuthModel>({
        email: '',
        password: '',
    });

    public loginForm = form(this.loginModel, (schemaPath) => {
        required(schemaPath.email, {message: 'Email is required'});
        email(schemaPath.email, {message: 'Enter a valid email address'});
        required(schemaPath.password, {message: 'Password is required'});
    });

    public onSubmit() {
        this.loading.set(true);
        submit(this.loginForm, async () => {
        const credentials = this.loginModel();

        this.authService.login(credentials).pipe(
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: () => {
            this.router.navigateByUrl('/dashboard');
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
