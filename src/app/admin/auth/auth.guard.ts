import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const session = await auth.getSession();

  if (!session) {
    await router.navigate(['/admin/login']);
    return false;
  }

  const allowed = await auth.isAdminWhitelisted();
  if (!allowed) {
    await auth.signOut();
    await router.navigate(['/admin/login'], { queryParams: { error: 'unauthorized' } });
    return false;
  }

  return true;
};
