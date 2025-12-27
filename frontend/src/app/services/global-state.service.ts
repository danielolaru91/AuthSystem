import { Injectable, signal, computed } from '@angular/core';
import { Role } from './roles.service';

export interface User {
  id: number;
  email: string;
  emailConfirmed: boolean;
  roleId: number;
}

export interface Company {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class GlobalStateService {

  // -----------------------------------------------------
  // RAW DATA SIGNALS
  // -----------------------------------------------------
  private readonly _users = signal<User[]>([]);
  private readonly _companies = signal<Company[]>([]);
  private readonly _roles = signal<Role[]>([]);

  // Loaded flags
  private readonly _loaded = signal({
    users: false,
    roles: false,
    companies: false
  });

  // -----------------------------------------------------
  // PUBLIC READONLY SIGNALS
  // -----------------------------------------------------
  users = this._users.asReadonly();
  companies = this._companies.asReadonly();
  roles = this._roles.asReadonly();

  usersLoaded = computed(() => this._loaded().users);
  rolesLoaded = computed(() => this._loaded().roles);
  companiesLoaded = computed(() => this._loaded().companies);

  // -----------------------------------------------------
  // COMPUTED SIGNALS
  // -----------------------------------------------------

  confirmedUsers = computed(() =>
    this._users().filter(u => u.emailConfirmed).length
  );

  unconfirmedUsers = computed(() =>
    this._users().filter(u => !u.emailConfirmed).length
  );

  usersByRole = computed(() => {
    const map: Record<string, number> = {};
    const roles = this._roles();
    const users = this._users();

    users.forEach(user => {
      const role = roles.find(r => r.id === user.roleId);
      const roleName = role ? role.name : 'Unknown';
      map[roleName] = (map[roleName] || 0) + 1;
    });

    return map;
  });

  totalCompanies = computed(() => this._companies().length);

  // -----------------------------------------------------
  // INITIAL LOAD SETTERS
  // -----------------------------------------------------

  setUsers(users: User[]) {
    this._users.set(users);
    this._loaded.update(l => ({ ...l, users: true }));
  }

  setCompanies(companies: Company[]) {
    this._companies.set(companies);
    this._loaded.update(l => ({ ...l, companies: true }));
  }

  setRoles(roles: Role[]) {
    this._roles.set(roles);
    this._loaded.update(l => ({ ...l, roles: true }));
  }

  // -----------------------------------------------------
  // INCREMENTAL MUTATORS — USERS
  // -----------------------------------------------------

  addUser(user: User) {
    this._users.update(list => [...list, user]);
  }

  updateUser(id: number, patch: Partial<User>) {
    this._users.update(list =>
      list.map(u => (u.id === id ? { ...u, ...patch } : u))
    );
  }

  removeUser(id: number) {
    this._users.update(list => list.filter(u => u.id !== id));
  }

  // -----------------------------------------------------
  // INCREMENTAL MUTATORS — COMPANIES
  // -----------------------------------------------------

  addCompany(company: Company) {
    this._companies.update(list => [...list, company]);
  }

  updateCompany(id: number, patch: Partial<Company>) {
    this._companies.update(list =>
      list.map(c => (c.id === id ? { ...c, ...patch } : c))
    );
  }

  removeCompany(id: number) {
    this._companies.update(list => list.filter(c => c.id !== id));
  }

  // -----------------------------------------------------
  // INCREMENTAL MUTATORS — ROLES
  // -----------------------------------------------------

  addRole(role: Role) {
    this._roles.update(list => [...list, role]);
  }

  updateRole(id: number, patch: Partial<Role>) {
    this._roles.update(list =>
      list.map(r => (r.id === id ? { ...r, ...patch } : r))
    );
  }

  removeRole(id: number) {
    this._roles.update(list => list.filter(r => r.id !== id));
  }
}
