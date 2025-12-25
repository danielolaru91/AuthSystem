import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  template: `
  <mat-sidenav-container class="layout-container">

    <mat-sidenav mode="side" opened class="sidenav">
      <mat-nav-list>
        <a mat-list-item routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          <mat-icon matListItemIcon>home</mat-icon>
          <span matListItemTitle>Home</span>
        </a>

        <a mat-list-item routerLink="/dashboard/users" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          <mat-icon matListItemIcon>group</mat-icon>
          <span matListItemTitle>Users</span>
        </a>

        <a mat-list-item routerLink="/dashboard/companies" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          <mat-icon matListItemIcon>business_center</mat-icon>
          <span matListItemTitle>Companies</span>
        </a>
      </mat-nav-list>
    </mat-sidenav>

    <mat-sidenav-content>

      <mat-toolbar color="primary">
        <span>Auth System</span>
        <span class="spacer"></span>
        <button class="logout" mat-button (click)="logout()">Logout</button>
      </mat-toolbar>

      <div class="page-content">
        <router-outlet></router-outlet>
      </div>

    </mat-sidenav-content>

  </mat-sidenav-container>
  `,
  styles: `
.layout-container {
  height: 100vh;
  background: #f5f5f5; /* Light background for content area */
}

.sidenav {
  width: 220px;
  background: #ffffff; /* White sidenav surface */
  border-right: 1px solid rgba(0,0,0,0.12); /* Subtle divider */
}

mat-toolbar {
  position: sticky;
  top: 0;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15); /* Elevation */
}

.page-content {
  padding: 24px;
}

.active {
  background: rgba(0,0,0,0.08);
}

.logout {
  margin-left: auto;
}

  `
})
export class Dashboard {
  private authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigateByUrl('/login');
    });
  }
}
