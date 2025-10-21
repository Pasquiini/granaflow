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
        // força fluxo de SPA; evita exigir PKCE em reset por e-mail
        flowType: 'implicit',
      },
    });
  }

  get client() {
    return this._client;
  }

  async sendResetPasswordEmail(email: string, redirectTo?: string) {
    return this._client.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo ?? `${window.location.origin}/reset-password`,
    });
  }

  /**
   * Chame no ngOnInit() da página /reset-password passando window.location.href
   * Lida com: 1) #access_token... (hash)  2) ?code=...&type=recovery (query)
   */
  async handleRecoveryFromUrl(fullUrl: string) {
    const url = new URL(fullUrl);

    // 1) Caso com HASH: #access_token=...&type=recovery
    const hash = url.hash.replace(/^#/, '');
    const h = new URLSearchParams(hash);
    const accessToken = h.get('access_token');
    const hashType = h.get('type');
    if (accessToken && hashType === 'recovery') {
      return this._client.auth.exchangeCodeForSession(fullUrl);
    }

    // 2) Caso com QUERY: ?code=...&type=recovery
    const code = url.searchParams.get('code');
    const qType = url.searchParams.get('type');
    if (code && qType === 'recovery') {
      // Fallback quando veio como code (sem code_verifier)
      return this._client.auth.verifyOtp({ type: 'recovery', token_hash: code });
    }

    return { data: null, error: null };
  }

  async updatePassword(newPassword: string) {
    return this._client.auth.updateUser({ password: newPassword });
  }
}
