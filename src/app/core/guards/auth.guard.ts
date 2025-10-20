import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Aguarda o Supabase inicializar a sessão
  while (!auth.isReady()) {
    await new Promise(r => setTimeout(r, 50));
  }

  // Se o usuário não está logado, redireciona
  if (!auth.isLoggedIn()) {
    const redirectUrl = encodeURIComponent(window.location.pathname);
    router.navigateByUrl(`/login?redirect=${redirectUrl}`);
    return false;
  }

  return true;
};
