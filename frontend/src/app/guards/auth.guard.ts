import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const http = inject(HttpClient);
  const router = inject(Router);
  const authService = inject(AuthService);

return http
  .get<{ authenticated: boolean; email: string; role: string }>(
    'http://localhost:5121/api/auth/me',
    { withCredentials: true }
  )
  .pipe(
    map((user) => {
      authService.role.set(user.role);
      authService.currentUserEmail.set(user.email);
      return true;
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );

};
