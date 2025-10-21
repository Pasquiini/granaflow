import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private _client: SupabaseClient;

  constructor() {
    this._client = createClient(environment.supabase.url, environment.supabase.anonKey);
  }

  get client() {
    return this._client;
  }

   async sendResetPasswordEmail(email: string, redirectTo?: string) {
    return this._client.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo ?? `${window.location.origin}/reset-password`,
    });
  }

  /** Chame isso na página reset-password logo ao entrar */
  async exchangeCodeFromUrl(fullUrl: string) {
    // Ignora se não houver "code" na URL (Supabase usa ?code=...&type=recovery)
    const hasCode = /[?&]code=/.test(fullUrl) || /[#]access_token=/.test(fullUrl);
    if (!hasCode) return { data: null, error: null };
    return this._client.auth.exchangeCodeForSession(fullUrl);
  }

  async updatePassword(newPassword: string) {
    return this._client.auth.updateUser({ password: newPassword });
  }
}
