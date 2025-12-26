import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly _apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  roles = signal<{ id: number; name: string }[]>([]);

  rolesLoaded = signal(false);

  constructor() {
    this.loadRoles();
  }

  private loadRoles() {
    this.http
      .get<{ id: number; name: string }[]>(`${this._apiUrl}/roles`)
      .subscribe({
        next: (r) => {
          this.roles.set(r);
          this.rolesLoaded.set(true);
        },
        error: () => {
          this.roles.set([]);
          this.rolesLoaded.set(true);
        }
      });
  }

  getRoles() {
    return this.http.get<{ id: number; name: string }[]>(`${this._apiUrl}/roles`);
  }
}
