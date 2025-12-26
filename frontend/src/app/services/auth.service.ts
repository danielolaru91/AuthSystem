import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthModel {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.apiUrl;

  token = signal<string | null>(null);
  role = signal<string | null>(null);
  currentUserEmail = signal<string | null>(null);

  register(credentials: AuthModel): Observable<any> {
    return this._http.post(`${this._apiUrl}/auth/register`, credentials);
  }

  login(credentials: { email: string; password: string }) {
    return this._http
      .post<{ success: boolean; role: string }>(
        `${this._apiUrl}/auth/login`,
        credentials,
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          this.currentUserEmail.set(credentials.email);
          this.role.set(res.role);
        })
      );
  }

  logout() {
    this.token.set(null);
    this.role.set(null);

    return this._http.post(`${this._apiUrl}/auth/logout`, {}, { withCredentials: true });
  }

  requestReset(credentials: { email: string }) {
    return this._http.post(`${this._apiUrl}/auth/request-reset`, credentials);
  }

  resetPassword(data: { token: string; newPassword: string }) {
    return this._http.post(`${this._apiUrl}/auth/reset-password`, data);
  }

  confirmEmail(token: string) {
    return this._http.post(`${this._apiUrl}/auth/confirm-email`, { token });
  }

  hasRole(role: string) {
    return this.role() === role;
  }

  updateCurrentUserRole(newRole: string) {
  this.role.set(newRole);
}

}
