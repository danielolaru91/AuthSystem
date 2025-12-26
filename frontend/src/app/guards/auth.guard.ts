import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  // If user is restored (from appConfig), allow access
  if (auth.user()) {
    return true;
  }

  // Otherwise redirect to login
  return router.createUrlTree(['/login']);
};
