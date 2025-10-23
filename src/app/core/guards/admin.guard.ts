import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { map } from 'rxjs/operators';

export const AdminGuard: CanMatchFn = () => {
  const adminService = inject(AdminService);
  const router = inject(Router);

  return adminService.isAdmin$.pipe(
    map(isAdmin => {
      if (isAdmin) {
        return true;
      }

      // se não for admin, redireciona para o dashboard
      router.navigate(['/dashboard'], { queryParams: { denied: 'admin' } });
      return false;
    })
  );
};
