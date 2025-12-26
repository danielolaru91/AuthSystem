import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(required: string | string[]): CanActivateFn {
  return () => {

    const auth = inject(AuthService);
    const router = inject(Router);

    const allowedRoles = Array.isArray(required) ? required : [required];
    const currentRole = auth.role();
    if (currentRole && allowedRoles.includes(currentRole)) {
        
      return true;
    }

    router.navigate(['/unauthorized']);
    return false;
  };
}
