import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService, UserData } from './services/auth.service';

export function restoreSession() {
  const http = inject(HttpClient);
  const auth = inject(AuthService);

  const meUrl = 'http://localhost:5121/api/auth/me';
  const refreshUrl = 'http://localhost:5121/api/auth/refresh';

  return http.get<UserData>(meUrl, { withCredentials: true })
    .toPromise()
    .then(user => {
      auth.user.set(user);
    })
    .catch(() => {
      // Access token expired → try refresh
      return http.post(refreshUrl, {}, { withCredentials: true })
        .toPromise()
        .then(() => {
          // Refresh succeeded → retry /me
          return http.get<UserData>(meUrl, { withCredentials: true })
            .toPromise()
            .then(user => auth.user.set(user))
            .catch(() => auth.user.set(undefined));
        })
        .catch(() => {
          // Refresh failed → user is logged out
          auth.user.set(undefined);
        });
    });
}
