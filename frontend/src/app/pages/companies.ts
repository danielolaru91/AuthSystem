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
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardDataService } from '../services/dashboard-data.service';
import { GlobalStateService } from '../services/global-state.service';

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
    MatInputModule,
    MatToolbarModule,
    MatProgressSpinnerModule
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

    <mat-toolbar class="table-toolbar" color="transparent">
    <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
    <mat-label>Search companies</mat-label>

    <input
        matInput
        [value]="search()"
        (input)="onSearch($event.target.value)"
    />

    <ng-container matSuffix>
        @if (search()) {
        <button mat-icon-button (click)="onSearch('')" class="close-button">
            <mat-icon>close</mat-icon>
        </button>
        }
    </ng-container>
    </mat-form-field>


      <span class="spacer"></span>

      <mat-paginator
        #paginator
        [length]="filteredCompanies().length"
        [pageSize]="10"
        [pageSizeOptions]="[5, 10, 20]"
        showFirstLastButtons
      ></mat-paginator>
    </mat-toolbar>

    @if (loading()) {
    <div style="display:flex; height:100%; place-content:center;">
      <mat-spinner diameter="40"></mat-spinner>
    </div>
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
    .table-toolbar {
      display: flex;
      align-items: center;
      padding: 0;
      margin-bottom: 10px;
      background: var(--mat-sys-surface);
    }
    .search-field {
      width: 260px;
      flex-shrink: 0;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .table-toolbar .mat-mdc-paginator {
      padding: 0;
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
    .close-button {
        margin-right: 5px;
    }
  `
})
export class Companies implements OnInit {
  private service = inject(CompaniesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private dashboardData = inject(DashboardDataService);
  private globalState = inject(GlobalStateService);

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
      const companies = this.globalState.companies(); 
      if (companies.length > 0) { 
        this.companies = companies;
        this.loading.set(false); 
        this.applyFilter();
        this.applyPagination();
      } 
    });
  }

  ngOnInit() {
    this.dashboardData.ensureLoaded();
  }

  ngAfterViewInit() {
    // SORT
    this.sort()?.sortChange.subscribe(() => {
      this.applyPagination();
    });

    // PAGINATION
    this.paginator()?.page.subscribe(() => {
      this.applyPagination();
    });

    // INITIAL TABLE SETUP
    this.applyFilter();
    this.applyPagination();
  }

  onSearch(value: string) {
    this.search.set(value.toLowerCase());
    this.applyFilter();
    this.paginator()?.firstPage();
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

  applyPagination() {
    const paginator = this.paginator();
    const sort = this.sort();
    if (!paginator) return;

    const fullData = [...this.filteredCompanies()];

    // 1️⃣ PAGINATE FIRST
    const start = paginator.pageIndex * paginator.pageSize;
    const end = start + paginator.pageSize;

    let pageData = fullData.slice(start, end);

    // 2️⃣ SORT ONLY THE CURRENT PAGE
    if (sort && sort.direction && pageData.length > 1) {
      const { active, direction } = sort;

      pageData.sort((a, b) => {
        const valueA = (a as any)[active] ?? '';
        const valueB = (b as any)[active] ?? '';

        return direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });
    }

    // 3️⃣ DISPLAY
    this.displayedCompanies.set(pageData);
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
    this.dashboardData.bulkDeleteCompanies(ids).subscribe({
      next: () => {
        this.snackBar.open('Selected companies deleted!', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });
        this.selection.clear();
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
      this.dashboardData.deleteCompany(company.id).subscribe({
        next: () => {
          this.snackBar.open('Company deleted successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });
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
      this.dashboardData.createCompany(result).subscribe({
        next: () => {
          this.snackBar.open('Company created successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });
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
      this.dashboardData.updateCompany(company.id, result).subscribe({
        next: () => {
          this.snackBar.open('Company updated successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });
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
