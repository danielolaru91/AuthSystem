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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormField, MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatFormField,
    MatInputModule
],
  template: `
    <div class="header">
      <h2>Companies</h2>

      <div class="actions">
        <button mat-mini-fab color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
        </button>

        <button
          mat-mini-fab
          color="warn"
          [disabled]="selection.size === 0"
          (click)="confirmBulkDelete()"
        >
          <mat-icon>delete</mat-icon>
        </button>
      </div>
    </div>

<mat-form-field appearance="fill" class="search-field">
  <mat-label>Search companies</mat-label>

  <input
    matInput
    [value]="search()"
    (input)="onSearch($event.target.value)"
  />

  <ng-container matSuffix>
    @if(search()){
    <button
      mat-icon-button
      aria-label="Clear"
      (click)="onSearch('')"
    >
      <mat-icon>close</mat-icon>
    </button>
    }
  </ng-container>
</mat-form-field>



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

        <ng-container matColumnDef="select">
          <th mat-header-cell *matHeaderCellDef class="select-header">
            <div class="select-wrapper">
              <mat-checkbox
                (change)="toggleSelectAll($event.checked)"
                [checked]="isAllSelected()"
                [indeterminate]="isIndeterminate()"
              ></mat-checkbox>

              @if(selection.size > 0) {
                <span class="badge">{{ selection.size }}</span>
              }
            </div>
          </th>

          <td mat-cell *matCellDef="let c">
            <mat-checkbox
              (change)="toggleSelection(c)"
              [checked]="selection.has(c.id)"
            ></mat-checkbox>
          </td>
        </ng-container>

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
        [length]="filteredCompanies().length"
        [pageSize]="10"
        [pageSizeOptions]="[5, 10, 20]"
        showFirstLastButtons
      ></mat-paginator>

      @if (filteredCompanies().length === 0) {
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
    .actions {
      display: flex;
      gap: 10px;
    }
    .search-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 10px 0 20px 0;
      padding: 6px 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      width: 260px;
    }
    .search-bar input {
      border: none;
      outline: none;
      flex: 1;
      font-size: 14px;
    }
    .select-header {
      position: relative;
    }
    .select-wrapper {
      position: relative;
      display: inline-block;
    }
    .badge {
      position: absolute;
      top: 3px;
      right: 3px;
      background: #d32f2f;
      color: white;
      border-radius: 50%;
      padding: 2px 4px;
      font-size: 10px;
      line-height: 1;
      pointer-events: none;
    }
    .actions-right {
      text-align: right;
    }
    .search-field {
  width: 260px;
  flex-shrink: 0;
}

.search-field .mat-mdc-form-field-flex {
  width: 100%;
}

.search-field .mat-mdc-form-field-infix {
  width: 100%;
}

.search-field .mat-mdc-form-field-suffix {
  flex: 0 0 auto;
}

  `
})
export class Companies implements OnInit {
  private service = inject(CompaniesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  companies: Company[] = [];
  filteredCompanies = signal<Company[]>([]);
  displayedCompanies = signal<Company[]>([]);
  loading = signal(false);

  search = signal('');

  selection = new Set<number>();

  cols = ['select', 'name', 'actions'];

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
        this.selection.clear();
        this.loading.set(false);

        this.applyFilter();
        this.applySort();
        this.applyPagination();
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(value: string) {
    this.search.set(value.toLowerCase());
    this.applyFilter();
    this.applySort();
    this.applyPagination();
  }

  applyFilter() {
    const term = this.search();

    if (!term) {
      this.filteredCompanies.set([...this.companies]);
      return;
    }

    this.filteredCompanies.set(
      this.companies.filter(c =>
        c.name.toLowerCase().includes(term)
      )
    );
  }

  applySort() {
    const sort = this.sort();
    if (!sort) return;

    const { active, direction } = sort;

    let data = [...this.filteredCompanies()];

    if (direction) {
      data.sort((a, b) => {
        const valueA = (a as any)[active] ?? '';
        const valueB = (b as any)[active] ?? '';

        return direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });
    }

    this.filteredCompanies.set(data);
  }

  applyPagination() {
    const paginator = this.paginator();
    if (!paginator) return;

    const data = this.filteredCompanies();
    const start = paginator.pageIndex * paginator.pageSize;
    const end = start + paginator.pageSize;

    this.displayedCompanies.set(data.slice(start, end));
  }

  toggleSelection(company: Company) {
    if (this.selection.has(company.id)) {
      this.selection.delete(company.id);
    } else {
      this.selection.add(company.id);
    }
  }

  toggleSelectAll(checked: boolean) {
    const pageItems = this.displayedCompanies();

    if (checked) {
      pageItems.forEach(c => this.selection.add(c.id));
    } else {
      pageItems.forEach(c => this.selection.delete(c.id));
    }
  }

  isAllSelected() {
    const pageItems = this.displayedCompanies();
    return pageItems.length > 0 && pageItems.every(c => this.selection.has(c.id));
  }

  isIndeterminate() {
    const pageItems = this.displayedCompanies();
    const selectedOnPage = pageItems.filter(c => this.selection.has(c.id)).length;

    return selectedOnPage > 0 && selectedOnPage < pageItems.length;
  }

  confirmBulkDelete() {
    const ref = this.dialog.open(ConfirmDialog, { width: '350px' });

    ref.afterClosed().subscribe(result => {
      if (!result) return;
      this.bulkDelete();
    });
  }

  bulkDelete() {
    const ids = Array.from(this.selection);

    this.service.bulkDelete(ids).subscribe({
      next: () => {
        this.snackBar.open('Selected companies deleted!', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });

        this.selection.clear();
        this.load();
      },
      error: () => {
        this.snackBar.open('Failed to delete companies!', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
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
}
