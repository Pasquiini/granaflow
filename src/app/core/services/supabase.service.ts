// core/services/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private _client: SupabaseClient;

  constructor() {
    this._client = createClient(environment.supabase.url, environment.supabase.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'implicit', // garanta que não está 'pkce'
      },
    });
  }

  get client() { return this._client; }

  async sendResetPasswordEmail(email: string, redirectTo?: string) {
    return this._client.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo ?? `${window.location.origin}/reset-password`,
    });
  }

  /** Chame isto no ngOnInit da página /reset-password */
  async handleRecoveryFromUrl(fullUrl: string) {
    const url = new URL(fullUrl);

    // HASH: #access_token=...&type=recovery
    const hash = url.hash.replace(/^#/, '');
    const hs = new URLSearchParams(hash);
    if (hs.get('type') === 'recovery' && hs.get('access_token')) {
      return this._client.auth.exchangeCodeForSession(fullUrl);
    }

    // QUERY: ?code=...&type=recovery
    const qs = url.searchParams;
    if (qs.get('type') === 'recovery' && qs.get('code')) {
      // quando o e-mail veio como ?code=..., use verifyOtp em vez de PKCE
      return this._client.auth.verifyOtp({ type: 'recovery', token_hash: qs.get('code')! });
    }

    // nenhum token → não faça nada
    return { data: null, error: null };
  }

  async updatePassword(newPassword: string) {
    return this._client.auth.updateUser({ password: newPassword });
  }
}
