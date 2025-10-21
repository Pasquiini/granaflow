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
        // ⚠️ desligado para não processar hash automaticamente
        detectSessionInUrl: false,
        // SPA flow (não exige code_verifier)
        flowType: 'implicit',
      },
    });
  }

  get client() {
    return this._client;
  }

  sendResetPasswordEmail(email: string, redirectTo?: string) {
    return this._client.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo ?? `${window.location.origin}/reset-password`,
    });
  }

  /**
   * Trata 2 formatos:
   * 1) #access_token=...&refresh_token=...&type=recovery  -> setSession()
   * 2) ?code=...&type=recovery                             -> verifyOtp()
   */
  async handleRecoveryFromUrl(fullUrl: string) {
    const url = new URL(fullUrl);

    // --- HASH: #access_token ... (recomendado pelo Supabase)
    const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
    const typeHash = hash.get('type');
    const accessToken = hash.get('access_token');
    const refreshToken = hash.get('refresh_token');

    if (typeHash === 'recovery' && accessToken && refreshToken) {
      // ✅ monta a sessão diretamente, sem PKCE
      return this._client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }

    // --- QUERY: ?code=... (alguns templates mandam assim)
    const qs = url.searchParams;
    const typeQuery = qs.get('type');
    const code = qs.get('code');

    if (typeQuery === 'recovery' && code) {
      // ✅ fluxo alternativo sem code_verifier
      return this._client.auth.verifyOtp({ type: 'recovery', token_hash: code });
    }

    // Nada a fazer
    return { data: null, error: null };
  }

  updatePassword(newPassword: string) {
    return this._client.auth.updateUser({ password: newPassword });
  }
}
