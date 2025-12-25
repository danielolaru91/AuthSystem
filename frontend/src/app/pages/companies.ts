import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompaniesService, Company } from '../services/companies.service';
import { EditCompanyDialog } from '../components/edit-company-dialog';
import { CreateCompanyDialog } from '../components/create-company-dialog';
import { ConfirmDialog } from '../components/confirm-dialog';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule],
  template: `
    <div class="header">
      <h2>Companies</h2>

      <button mat-mini-fab color="primary" (click)="openCreateDialog()">
        <mat-icon>add</mat-icon>
      </button>
    </div>

    @if(loading()){
      <div>Loading companies...</div>
    }

    @if(!loading()){
      <table mat-table [dataSource]="companies" class="mat-elevation-z2">

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let c">{{ c.name }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let c">
            <button mat-icon-button color="primary" (click)="openEditDialog(c)">
              <mat-icon>edit</mat-icon>
            </button>

            <button mat-icon-button color="warn" (click)="confirmDelete(c)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row; columns: cols"></tr>

      </table>
      @if (!loading() && companies.length === 0) { <div class="no-results">No results found</div> }
    }
  `,
  styles: `
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  `
})
export class Companies implements OnInit {
  private service = inject(CompaniesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  companies: Company[] = [];
  loading = signal(false);

  cols = ['name', 'actions'];

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (data) => {
        this.companies = data;
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreateDialog() {
    const ref = this.dialog.open(CreateCompanyDialog, { width: '400px' });

    ref.afterClosed().subscribe(result => {
      if (!result) return;

      this.service.create(result).subscribe({
        next: () => {
        this.snackBar.open('User created successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
        });
          this.load();
        },
        error: () => {
        this.snackBar.open('Failed to create company!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
        });
        }
      });
    });
  }

  openEditDialog(company: Company) {
    const ref = this.dialog.open(EditCompanyDialog, {
      width: '400px',
      data: { name: company.name }
    });

    ref.afterClosed().subscribe(result => {
      if (!result) return;

      this.service.update(company.id, result).subscribe({
        next: () => {
        this.snackBar.open('Company updated successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
        });
          this.load();
        },
        error: () => {
        this.snackBar.open('Failed to update company!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
        });
        }
      });
    });
  }

  confirmDelete(company: Company) {
    const ref = this.dialog.open(ConfirmDialog, { width: '350px' });

    ref.afterClosed().subscribe(result => {
      if (!result) return;

      this.service.delete(company.id).subscribe({
        next: () => {
        this.snackBar.open('Company deleted successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
        });
          this.load();
        },
        error: () => {
        this.snackBar.open('Failed to delete company!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
        });
        }
      });
    });
  }
}
