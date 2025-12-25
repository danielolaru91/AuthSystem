import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UsersService, User } from '../services/users.service';
import { CreateUserDialog } from '../components/create-user-dialog';
import { ConfirmDialog } from '../components/confirm-dialog';
import { EditUserDialog } from '../components/edit-user-dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-users',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="header">
      <h2>Users</h2>

      <button mat-mini-fab color="primary" (click)="openCreateDialog()">
        <mat-icon>add</mat-icon>
      </button>
    </div>

    @if(loading()){
      <div>Loading users...</div>
    }

    @if(!loading()){
      <table
        mat-table
        [dataSource]="users"
        matSort
        class="mat-elevation-z2"
      >

        <!-- Email Column -->
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
          <td mat-cell *matCellDef="let user">{{ user.email }}</td>
        </ng-container>

        <!-- Email Confirmed Column -->
        <ng-container matColumnDef="emailConfirmed">
          <th mat-header-cell *matHeaderCellDef>Email Confirmed</th>
          <td mat-cell *matCellDef="let user">
            {{ user.emailConfirmed ? 'Yes' : 'No' }}
          </td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let user">
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
    }
  `,
  styles: `
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    table {
      width: 100%;
      margin-top: 20px;
    }
  `
})
export class Users implements OnInit {
  private usersService = inject(UsersService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['email', 'emailConfirmed', 'actions'];

  users: User[] = [];
  loading = signal(false);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);

    this.usersService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

    openCreateDialog() {
    const dialogRef = this.dialog.open(CreateUserDialog, {
        width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result) {
        this.usersService.create(result).subscribe({
            next: () => {
            this.snackBar.open('User created successfully!', 'Close', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['snackbar-success']
            });
            this.loadUsers();
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
        }
    });
    }

  openEditDialog(user: User) {
    const dialogRef = this.dialog.open(EditUserDialog, {
      width: '400px',
      data: { email: user.email, emailConfirmed: user.emailConfirmed }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.usersService.update(user.id, result).subscribe({
        next: () => {
            this.snackBar.open('User updated successfully!', 'Close', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['snackbar-success']
            });
            this.loadUsers();
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
      }
    });
  }

  confirmDelete(user: User) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '350px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteUser(user.id);
      }
    });
  }

    deleteUser(id: number) {
    this.usersService.delete(id).subscribe({
        next: () => {
        this.snackBar.open('User deleted successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
        });
        this.loadUsers();
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

}
