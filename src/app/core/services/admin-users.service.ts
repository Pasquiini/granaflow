import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { from, map, Observable } from 'rxjs';

export interface AdminUserRow {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  phone: string | null;
  confirmed_at: string | null;
  email_confirmed_at: string | null;
}

export interface AdminUsersPage {
  items: AdminUserRow[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly supabase = inject(SupabaseService);

  list$(search = '', limit = 20, offset = 0): Observable<AdminUsersPage> {
    return from(
      this.supabase.client.rpc('admin_list_users', {
        p_search: search || null,
        p_limit: limit,
        p_offset: offset
      })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        const d = (data ?? {}) as any;
        return {
          items: Array.isArray(d.items) ? d.items as AdminUserRow[] : [],
          total: Number(d.total ?? 0)
        };
      })
    );
  }
}
