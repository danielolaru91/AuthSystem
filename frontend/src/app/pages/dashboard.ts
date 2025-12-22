import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule],
  template: `
  <div class="dashboard-wrapper">
    <p>Dashboard Page, available to logged in users only</p>
    <button matButton="filled" (click)="logout()">Logout</button>
  </div>
  `,
  styles: `
    .dashboard-wrapper {
      display:flex; 
      justify-content:center; 
      align-items:center; 
      flex-direction: column;
    }
  `
})
export class Dashboard {
    private authService = inject(AuthService);
    private router = inject(Router);
    public logout(): void {
        this.authService.logout().subscribe(() => {
            this.router.navigateByUrl('/login');
        });
    }
}
