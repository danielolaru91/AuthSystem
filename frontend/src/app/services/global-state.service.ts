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

  // Raw data signals
  private readonly _users = signal<User[]>([]);
  private readonly _companies = signal<Company[]>([]);
  private readonly _roles = signal<Role[]>([]);

  // Loaded flags 
  private readonly _usersLoaded = signal(false); 
  private readonly _rolesLoaded = signal(false); 
  private readonly _companiesLoaded = signal(false);

  // Public readonly signals
  users = this._users.asReadonly();
  companies = this._companies.asReadonly();
  roles = this._roles.asReadonly();

  usersLoaded = this._usersLoaded.asReadonly(); 
  rolesLoaded = this._rolesLoaded.asReadonly(); 
  companiesLoaded = this._companiesLoaded.asReadonly();

  // --- COMPUTED SIGNALS ---

  confirmedUsers = computed(() =>
    this._users().filter(u => u.emailConfirmed).length
  );

  unconfirmedUsers = computed(() =>
    this._users().filter(u => !u.emailConfirmed).length
  );

usersByRole = computed(() => {
  const map: Record<string, number> = {};
  const roles = this._roles();       // list of { id, name }
  const users = this._users();       // list of { role: roleId }

  users.forEach(user => {
    const role = roles.find(r => r.id === user.roleId);
    const roleName = role ? role.name : 'Unknown';

    map[roleName] = (map[roleName] || 0) + 1;
  });

  return map;
});


  totalCompanies = computed(() => this._companies().length);

  // --- MUTATORS (called after API calls) ---

  setUsers(users: User[]) {
    this._users.set(users);
    this._usersLoaded.set(true);
  }

  setCompanies(companies: Company[]) {
    this._companies.set(companies);
    this._companiesLoaded.set(true);
  }

  setRoles(roles: Role[]) {
    this._roles.set(roles);
    this._rolesLoaded.set(true);
  }
}
