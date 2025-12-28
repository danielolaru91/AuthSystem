import {
  Component,
  OnInit,
  inject,
  signal,
  viewChild,
  effect
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateUserDialog } from '../components/create-user-dialog';
import { ConfirmDialog } from '../components/confirm-dialog';
import { EditUserDialog } from '../components/edit-user-dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { CanRoleDirective } from '../directives/canRole.directive';
import { AuthService } from '../services/auth.service';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { GlobalStateService } from '../services/global-state.service';
import { DashboardDataService, User } from '../services/dashboard-data.service';

@Component({
  selector: 'app-users',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinner,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatCheckboxModule,
    CanRoleDirective
  ],
  template: `
    <div class="header">
      <h2>Users</h2>

      <div class="actions">
        <button *canRole="'SuperAdmin'" mat-mini-fab color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
        </button>

        <button
          *canRole="'SuperAdmin'"
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
        <mat-label>Search users</mat-label>

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
        [length]="filteredUsers().length"
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
        [dataSource]="displayedUsers()"
        matSort
        #sort="matSort"
        class="mat-elevation-z2"
      >

        <!-- Select Column -->
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

          <td mat-cell *matCellDef="let user">
            <mat-checkbox
              (change)="toggleSelection(user)"
              [checked]="selection.has(user.id)"
            ></mat-checkbox>
          </td>
        </ng-container>

        <!-- Email Column -->
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
          <td mat-cell *matCellDef="let user">{{ user.email }}</td>
        </ng-container>

        <!-- Email Confirmed Column -->
        <ng-container matColumnDef="emailConfirmed">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Email Confirmed</th>
          <td mat-cell *matCellDef="let user">
            {{ user.emailConfirmed ? 'Yes' : 'No' }}
          </td>
        </ng-container>

        <!-- Role Column -->
        <ng-container matColumnDef="role">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Role</th>
          <td mat-cell *matCellDef="let user">
            {{ mapRole(user.roleId) }}
          </td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef class="actions-right">Actions</th>
          <td mat-cell *matCellDef="let user" class="actions-right">
            <button mat-icon-button color="primary" (click)="openEditDialog(user)">
              <mat-icon>edit</mat-icon>
            </button>

            <button mat-icon-button color="warn" (click)="confirmDelete(user)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

      </table>

      @if (filteredUsers().length === 0) {
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
    .actions-right {
      text-align: right;
    }
    .close-button {
      margin-right: 5px;
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
    .no-results {
      padding: 20px;
      text-align: center;
      opacity: 0.7;
    }
  `
})
export class Users implements OnInit {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  private dashboardData = inject(DashboardDataService);
  private globalState = inject(GlobalStateService);

  displayedColumns = ['select', 'email', 'emailConfirmed', 'role', 'actions'];

  users: User[] = [];

  filteredUsers = signal<User[]>([]);
  displayedUsers = signal<User[]>([]);
  search = signal('');
  loading = signal(false);

  selection = new Set<number>();

  sort = viewChild(MatSort);
  paginator = viewChild(MatPaginator);

  constructor() {
    effect(() => { 
      const users = this.globalState.users(); 
      if (users.length > 0) { 
        this.users = users;
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
    const term = this.search().trim().toLowerCase();

    if (!term) {
      this.filteredUsers.set([...this.users]);
      return;
    }

    this.filteredUsers.set(
      this.users.filter(u => {
        const email = u.email.toLowerCase();
        const role = this.mapRole(u.roleId).toLowerCase();
        const confirmed = u.emailConfirmed ? 'yes' : 'no';

        return (
          email.includes(term) ||
          role.includes(term) ||
          confirmed.includes(term)
        );
      })
    );
  }

  applyPagination() {
    const paginator = this.paginator();
    const sort = this.sort();
    if (!paginator) return;

    let fullData = [...this.filteredUsers()];

    // ✅ APPLY PAGINATION
    const start = paginator.pageIndex * paginator.pageSize;
    const end = start + paginator.pageSize;

    let pageData = fullData.slice(start, end);

    // ✅ APPLY SORT HERE
    if (sort && sort.direction) {
      const { active, direction } = sort;

      pageData.sort((a, b) => {
        let valueA: string | number = '';
        let valueB: string | number = '';

        switch (active) {
          case 'email':
            valueA = a.email.toLowerCase();
            valueB = b.email.toLowerCase();
            break;

          case 'role':
            valueA = this.mapRole(a.roleId).toLowerCase();
            valueB = this.mapRole(b.roleId).toLowerCase();
            break;

          case 'emailConfirmed':
            valueA = a.emailConfirmed ? 1 : 0;
            valueB = b.emailConfirmed ? 1 : 0;
            break;
        }

        return direction === 'asc'
          ? valueA > valueB ? 1 : -1
          : valueA < valueB ? 1 : -1;
      });
    }

    this.displayedUsers.set(pageData);
  }


  toggleSelection(user: User) {
    if (this.selection.has(user.id)) {
      this.selection.delete(user.id);
    } else {
      this.selection.add(user.id);
    }
  }

  toggleSelectAll(checked: boolean) {
    const pageItems = this.displayedUsers();
    if (checked) {
      pageItems.forEach(u => this.selection.add(u.id));
    } else {
      pageItems.forEach(u => this.selection.delete(u.id));
    }
  }

  isAllSelected() {
    const pageItems = this.displayedUsers();
    return pageItems.length > 0 && pageItems.every(u => this.selection.has(u.id));
  }

  isIndeterminate() {
    const pageItems = this.displayedUsers();
    const selectedOnPage = pageItems.filter(u => this.selection.has(u.id)).length;
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

    this.dashboardData.bulkDeleteUsers(ids).subscribe({
      next: () => {
        this.snackBar.open('Selected users deleted!', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });

        this.selection.clear();
      },
      error: () => {
        this.snackBar.open('Failed to delete users!', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateUserDialog, { width: '400px' });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.dashboardData.createUser(result).subscribe({
        next: () => {
          this.snackBar.open('User created successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Failed to create user', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      });
    });
  }

  openEditDialog(user: User) {
    const dialogRef = this.dialog.open(EditUserDialog, {
      width: '400px',
      data: { email: user.email, emailConfirmed: user.emailConfirmed, roleId: user.roleId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.dashboardData.updateUser(user.id, result).subscribe({
        next: (response: any) => {
          this.snackBar.open('User updated successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });

          if (response.updatedOwnAccount) {
            this.authService.updateCurrentUserRole(response.role);
          }
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Failed to update user', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      });
    });
  }

  confirmDelete(user: User) {
    const dialogRef = this.dialog.open(ConfirmDialog, { width: '350px' });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.deleteUser(user.id);
    });
  }

  deleteUser(id: number) {
    this.dashboardData.deleteUser(id).subscribe({
      next: () => {
        this.snackBar.open('User deleted successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to delete user', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  mapRole(roleId: number): string {
    const role = this.globalState.roles().find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
  }
}
