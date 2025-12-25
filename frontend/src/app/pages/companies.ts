import { Component, OnInit, inject, signal, viewChild, effect } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompaniesService, Company } from '../services/companies.service';
import { EditCompanyDialog } from '../components/edit-company-dialog';
import { CreateCompanyDialog } from '../components/create-company-dialog';
import { ConfirmDialog } from '../components/confirm-dialog';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule,
    MatPaginatorModule
  ],
  template: `
    <div class="header">
      <h2>Companies</h2>

      <button mat-mini-fab color="primary" (click)="openCreateDialog()">
        <mat-icon>add</mat-icon>
      </button>
    </div>

    @if (loading()) {
      <div>Loading companies...</div>
    }

    @if (!loading()) {
      <table
        mat-table
        [dataSource]="displayedCompanies()"
        matSort
        #sort="matSort"
        class="mat-elevation-z2"
      >

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
          <td mat-cell *matCellDef="let c">{{ c.name }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef class="actions-right">Actions</th>
          <td mat-cell *matCellDef="let c" class="actions-right">
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

      <mat-paginator
        #paginator
        [length]="companies.length"
        [pageSize]="10"
        [pageSizeOptions]="[5, 10, 20]"
        showFirstLastButtons
      ></mat-paginator>

      @if (companies.length === 0) {
        <div class="no-results">No results found</div>
      }
    }
  `,
  styles: `
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .actions-right {
      text-align: right;
    }
  `
})
export class Companies implements OnInit {
  private service = inject(CompaniesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  companies: Company[] = [];
  displayedCompanies = signal<Company[]>([]);
  loading = signal(false);

  cols = ['name', 'actions'];

  sort = viewChild(MatSort);
  paginator = viewChild(MatPaginator);

  constructor() {
    effect(() => {
      const sort = this.sort();
      if (!sort) return;

      sort.sortChange.subscribe(() => {
        this.applySort();
        this.applyPagination();
      });
    });

    effect(() => {
      const paginator = this.paginator();
      if (!paginator) return;

      this.applyPagination();

      paginator.page.subscribe(() => {
        this.applyPagination();
      });
    });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);

    this.service.getAll().subscribe({
      next: (data) => {
        this.companies = data;
        this.loading.set(false);

        this.applySort();
        this.applyPagination();
      },
      error: () => this.loading.set(false)
    });
  }

  applySort() {
    const sort = this.sort();
    if (!sort) return;

    const { active, direction } = sort;

    if (!direction) {
      this.companies = [...this.companies];
      return;
    }

    this.companies = [...this.companies].sort((a, b) => {
      const valueA = (a as any)[active] ?? '';
      const valueB = (b as any)[active] ?? '';

      return direction === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });
  }

  applyPagination() {
    const paginator = this.paginator();
    if (!paginator) return;

    const start = paginator.pageIndex * paginator.pageSize;
    const end = start + paginator.pageSize;

    this.displayedCompanies.set(this.companies.slice(start, end));
  }

  openCreateDialog() {
    const ref = this.dialog.open(CreateCompanyDialog, { width: '400px' });

    ref.afterClosed().subscribe(result => {
      if (!result) return;

      this.service.create(result).subscribe({
        next: () => {
          this.snackBar.open('Company created successfully!', 'Close', {
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
