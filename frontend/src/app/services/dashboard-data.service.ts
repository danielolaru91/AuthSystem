import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalStateService, User, Company } from './global-state.service';
import { environment } from '../../environments/environment';
import { Role } from './roles.service';

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  private readonly _apiUrl = environment.apiUrl;
  private readonly _http = inject(HttpClient);
  private readonly _state = inject(GlobalStateService);

  ensureLoaded() {
    if (!this._state.usersLoaded()) {
      this._http.get<User[]>(`${this._apiUrl}/users`)
        .subscribe(res => this._state.setUsers(res));
    }

    if (!this._state.rolesLoaded()) {
      this._http.get<Role[]>(`${this._apiUrl}/roles`)
        .subscribe(res => this._state.setRoles(res));
    }

    if (!this._state.companiesLoaded()) {
      this._http.get<Company[]>(`${this._apiUrl}/companies`)
        .subscribe(res => this._state.setCompanies(res));
    }
  }

  reloadUsers() { this._http.get<User[]>(`${this._apiUrl}/users`) .subscribe(res => this._state.setUsers(res)); }
  reloadRoles() { this._http.get<Role[]>(`${this._apiUrl}/roles`) .subscribe(res => this._state.setRoles(res)); }
  reloadCompanies() { this._http.get<Company[]>(`${this._apiUrl}/companies`) .subscribe(res => this._state.setCompanies(res)); }
}
