import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';
import { CommonModule } from '@angular/common';

function getHashParams(): Record<string, string> {
  const h = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const p = new URLSearchParams(h);
  const obj: Record<string, string> = {};
  p.forEach((v, k) => (obj[k] = v));
  return obj;
}

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.css'],
  imports: [
    CommonModule
  ]
})
export class AuthCallbackComponent implements OnInit {
  status: 'loading' | 'ok' | 'expired' | 'error' = 'loading';
  message = 'Finalizando autenticação…';

  constructor(private supa: SupabaseService, private router: Router) {}

  async ngOnInit() {
    const params = getHashParams();
    const error = params['error'];
    const errorCode = params['error_code'];

    if (errorCode === 'otp_expired') {
      this.status = 'expired';
      this.message = 'O link de confirmação expirou ou já foi usado.';
      return;
    }
    if (error) {
      this.status = 'error';
      this.message = 'Não foi possível confirmar sua conta.';
      return;
    }

    // Links de confirmação trazem access_token e refresh_token no hash.
    const access_token = params['access_token'];
    const refresh_token = params['refresh_token'];

    if (access_token && refresh_token) {
      try {
        await this.supa.client.auth.setSession({ access_token, refresh_token });
        this.status = 'ok';
        // redireciona pra onde você quiser
        this.router.navigateByUrl('/');
      } catch (e) {
        console.error(e);
        this.status = 'error';
        this.message = 'Houve um problema ao salvar sua sessão.';
      }
    } else {
      // nenhum token e sem erro explícito → trate como erro genérico
      this.status = 'error';
      this.message = 'Link inválido de confirmação.';
    }
  }

  async resend() {
    const email = window.localStorage.getItem('pendingEmail') || prompt('Informe seu e-mail para reenviar:') || '';
    if (!email) return;
    await this.supa.client.auth.resend({ type: 'signup', email });
    this.message = 'Enviamos um novo e-mail de confirmação.';
  }
}
