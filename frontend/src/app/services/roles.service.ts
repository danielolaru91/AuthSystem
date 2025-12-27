import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Role {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly _apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  getRoles() {
    return this.http.get<Role[]>(`${this._apiUrl}/roles`);
  }
}
