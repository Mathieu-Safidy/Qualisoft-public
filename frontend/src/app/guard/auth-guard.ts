import { inject, Inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth-service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService); // ✅ correct
  const router = inject(Router);           // ✅ correct

  if (authService.isLoggedIn()) {
    return true;
  } else {
    router.navigateByUrl('/'); // ✅ simple et sûr
    return false;
  }
};
