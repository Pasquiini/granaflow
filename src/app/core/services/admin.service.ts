import { Injectable } from '@angular/core';
import { from, map } from 'rxjs';
import { SupabaseService } from './supabase.service'; // ajuste o caminho se necessário

@Injectable({ providedIn: 'root' })
export class AdminService {
  /** e-mails com permissão de admin */
  private adminEmails = new Set<string>(['carlosed20091@gmail.com']);

  constructor(private supabase: SupabaseService) {}

  /** retorna um Observable<boolean> dizendo se o usuário atual é admin */
  get isAdmin$() {
    return from(this.supabase.client.auth.getUser()).pipe(
      map(({ data }) => {
        const email = data.user?.email?.toLowerCase?.() ?? '';
        if (!email) return false;

        // ✅ 1. checa lista hardcoded
        if (this.adminEmails.has(email)) return true;

        // ✅ 2. checa roles no app_metadata (forma segura)
        const meta = data.user?.app_metadata as Record<string, any> | undefined;
        const roles = (meta?.['roles'] ?? []) as string[];

        return Array.isArray(roles) && roles.map(r => r.toLowerCase()).includes('admin');
      })
    );
  }
}
