import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-confirm-email',
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <div class="container">
      <mat-card>
        <h2>Email Confirmation</h2>

        @if(loading()){
          <p>Confirming your email, please wait…</p>
        }

        @if(success()){
          <p>Your email has been confirmed successfully.</p>
          <button mat-raised-button color="primary" (click)="goToLogin()">Go to Login</button>
        }

        @if(error()){
          <p class="error">{{ error() }}</p>
          <button mat-raised-button color="primary" (click)="goToLogin()">Back to Login</button>
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      justify-content: center;
      margin-top: 80px;
    }
    mat-card {
      padding: 24px;
      width: 400px;
      text-align: center;
    }
    .error {
      color: #d32f2f;
      font-weight: 500;
    }
  `]
})
export class ConfirmEmail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  loading = signal(true);
  success = signal(false);
  error = signal<string | null>(null);

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.loading.set(false);
      this.error.set('Invalid confirmation link.');
      return;
    }

    this.auth.confirmEmail(token).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Email confirmation failed.');
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
