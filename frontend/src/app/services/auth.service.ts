import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthModel {
  email: string;
  password: string;
}

export interface UserData {
  id: number;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.apiUrl;

  // ⭐ One signal for all user data
  user = signal<UserData | null>(null);

  register(credentials: AuthModel): Observable<any> {
    return this._http.post(`${this._apiUrl}/auth/register`, credentials);
  }

  login(credentials: { email: string; password: string }) {
    return this._http
      .post<{ success: boolean; role: string, userId: number }>(
        `${this._apiUrl}/auth/login`,
        credentials,
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          this.user.set({
            id: res.userId,
            email: credentials.email,
            role: res.role,
          });
        })
      );
  }

  logout() {
    this.user.set(null);

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
    return this.user()?.role === role;
  }

  updateCurrentUserRole(newRole: string) {
    const current = this.user();
    if (current) {
      this.user.set({ ...current, role: newRole });
    }
  }

  restoreSession(id: number, email: string, role: string) {
    this.user.set({ id, email, role });
  }
}
