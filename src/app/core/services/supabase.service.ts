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
        flowType: 'implicit', // ⚡️ importante! evita exigir code_verifier
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

  /** Lida com os dois formatos possíveis: #access_token ou ?code= */
  async handleRecoveryFromUrl(fullUrl: string) {
    const url = new URL(fullUrl);

    // 1️⃣ Caso de recuperação com hash (#access_token=...&type=recovery)
    const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
    const accessToken = hash.get('access_token');
    const type = hash.get('type');

    if (accessToken && type === 'recovery') {
      return this._client.auth.exchangeCodeForSession(fullUrl);
    }

    // 2️⃣ Caso de recuperação com query (?code=...&type=recovery)
    const code = url.searchParams.get('code');
    const queryType = url.searchParams.get('type');
    if (code && queryType === 'recovery') {
      return this._client.auth.verifyOtp({
        type: 'recovery',
        token_hash: code,
      });
    }

    // 3️⃣ Caso nenhum token encontrado
    return { data: null, error: null };
  }

  async updatePassword(newPassword: string) {
    return this._client.auth.updateUser({ password: newPassword });
  }
}
