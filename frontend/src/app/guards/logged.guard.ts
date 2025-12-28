import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const loggedGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  // If user is restored (from appConfig), redirect to dashboard
  if (auth.user()) {
    return router.createUrlTree(['/dashboard']);
  }

  // Otherwise allow access
  return true;
};
