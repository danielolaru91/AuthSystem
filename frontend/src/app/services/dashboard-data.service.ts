import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalStateService } from './global-state.service';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

export interface User {
  id: number;
  email: string;
  emailConfirmed: boolean;
  roleId: number;
}

export interface CreateUserDto {
  email: string;
  password: string;
  roleId: number;
}

export interface UpdateUserDto {
  email: string;
  emailConfirmed: boolean;
  roleId: number;
}

export interface Role {
  id: number;
  name: string;
}

export interface Company {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  private readonly api = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly state = inject(GlobalStateService);

  // -----------------------------------------------------
  // INITIAL LOAD (only fetch if not already loaded)
  // -----------------------------------------------------
  ensureLoaded() {
    if (!this.state.usersLoaded()) {
      this.http.get<User[]>(`${this.api}/users`, { withCredentials: true })
        .subscribe(res => this.state.setUsers(res));
    }

    if (!this.state.rolesLoaded()) {
      this.http.get<Role[]>(`${this.api}/roles`, { withCredentials: true })
        .subscribe(res => this.state.setRoles(res));
    }

    if (!this.state.companiesLoaded()) {
      this.http.get<Company[]>(`${this.api}/companies`, { withCredentials: true })
        .subscribe(res => this.state.setCompanies(res));
    }
  }

  // -----------------------------------------------------
  // USERS CRUD (incremental updates)
  // -----------------------------------------------------

  createUser(payload: any) {
    return this.http.post<User>(`${this.api}/users`, payload, { withCredentials: true }).pipe(
      tap((result) => this.state.addUser(result))
    );
  }

  updateUser(id: number, payload: any) {
    return this.http.put<User>(`${this.api}/users/${id}`, payload, { withCredentials: true }).pipe(
      tap(() => this.state.updateUser(id, payload))
    );
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.api}/users/${id}`, { withCredentials: true }).pipe(
      tap(() => this.state.removeUser(id))
    );
  }

  bulkDeleteUsers(ids: number[]) {
    return this.http.post(`${this.api}/users/bulk-delete`, { ids }, { withCredentials: true }).pipe(
      tap(() => ids.forEach(id => this.state.removeUser(id)))
    );
  }

  // -----------------------------------------------------
  // ROLES CRUD (incremental updates)
  // -----------------------------------------------------

  createRole(payload: any) {
    return this.http.post<Role>(`${this.api}/roles`, payload, { withCredentials: true }).pipe(
      tap(() => this.state.addRole(payload))
    );
  }

  updateRole(id: number, payload: any) {
    return this.http.put<Role>(`${this.api}/roles/${id}`, payload, { withCredentials: true }).pipe(
      tap(() => this.state.updateRole(id, payload))
    );
  }

  deleteRole(id: number) {
    return this.http.delete(`${this.api}/roles/${id}`, { withCredentials: true }).pipe(
      tap(() => this.state.removeRole(id))
    );
  }

  // -----------------------------------------------------
  // COMPANIES CRUD (incremental updates)
  // -----------------------------------------------------

  createCompany(payload: any) {
    return this.http.post<Company>(`${this.api}/companies`, payload, { withCredentials: true }).pipe(
      tap((result) => this.state.addCompany(result))
    );
  }

  updateCompany(id: number, payload: any) {
    return this.http.put<Company>(`${this.api}/companies/${id}`, payload, { withCredentials: true }).pipe(
      tap(() => {
        this.state.updateCompany(id, payload)
  })
    );
  }

  deleteCompany(id: number) {
    return this.http.delete(`${this.api}/companies/${id}`, { withCredentials: true }).pipe(
      tap(() => this.state.removeCompany(id))
    );
  }

  bulkDeleteCompanies(ids: number[]) {
    return this.http.post(`${this.api}/companies/bulk-delete`, { ids }, { withCredentials: true }).pipe(
      tap(() => ids.forEach(id => this.state.removeCompany(id)))
    );
  }
}
