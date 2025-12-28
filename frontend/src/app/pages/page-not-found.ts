import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  imports: [MatCardModule, MatButtonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-not-found-wrapper">
        <mat-card>
            <mat-card-header>
                <mat-card-title>404 Page Not Found</mat-card-title>
            </mat-card-header>

            <mat-card-footer>
                <button matButton routerLink="/login">
                    Back Home
                </button>
            </mat-card-footer>
        </mat-card>
    </div>
  `,
  styles: `
    .page-not-found-wrapper {
        display: flex;
        justify-content: center;
        align-items: center; 
        height: 100%; 
        padding: 20px;
    }
    mat-card-header,
    mat-card-footer {
        padding: 16px;
    }
    mat-card-footer {
        padding-top: 6px;
        display: flex;
        button {
            width: 100%;
        }
    }
  `
})
export class PageNotFound {}
