import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './services/auth.service';

export function restoreSession() {
  const http = inject(HttpClient);
  const auth = inject(AuthService);

  return http
    .get<{ id: number; email: string; role: string }>(
      'http://localhost:5121/api/auth/me',
      { withCredentials: true }
    )
    .toPromise()
    .then(user => auth.user.set(user))
    .catch(() => auth.user.set(undefined));
}
