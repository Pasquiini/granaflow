import { Injectable, signal, effect, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import type { Session, User } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _session = signal<Session | null>(null);
  private _ready = signal(false); // <-- novo
  readonly isReady = computed(() => this._ready());
  readonly session = computed(() => this._session());
  readonly user = computed<User | null>(() => this._session()?.user ?? null);
  readonly isLoggedIn = computed(() => !!this.user());

  constructor(private readonly supa: SupabaseService) {
    this.init();
  }

  private async init() {
    // 1️⃣ tenta restaurar sessão
    const { data } = await this.supa.client.auth.getSession();
    this._session.set(data.session ?? null);

    // 2️⃣ escuta futuras mudanças
    this.supa.client.auth.onAuthStateChange((_event, session) => {
      this._session.set(session ?? null);
    });

    // 3️⃣ agora está pronto
    this._ready.set(true);
  }

  async signInWithPassword(email: string, password: string) {
    const { data, error } = await this.supa.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
  }

async signUp(email: string, password: string, fullName?: string) {
  const redirectTo = `${window.location.origin}/auth/callback`;

  const { data, error } = await this.supa.client.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName ?? null },
      emailRedirectTo: redirectTo, // 🔹 URL de redirecionamento pós-confirmação
    },
  });

  if (error) throw error;

  // (opcional) guardar e-mail pra usar no "reenviar"
  localStorage.setItem('pendingEmail', email);

  return data.user;
}

  async signOut() {
    const { error } = await this.supa.client.auth.signOut();
    if (error) throw error;
  }
}
