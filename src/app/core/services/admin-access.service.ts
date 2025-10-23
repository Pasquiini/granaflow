import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { from, map, Observable } from 'rxjs';

export interface AdminRow {
  email: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AdminAccessService {
  private readonly supabase = inject(SupabaseService);

  list$(): Observable<AdminRow[]> {
    return from(this.supabase.client.rpc('admin_list_admins')).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        const items = (data?.items ?? []) as AdminRow[];
        return items;
      })
    );
  }

  add$(email: string): Observable<{ ok: boolean; email: string }> {
    return from(this.supabase.client.rpc('admin_add_admin', { p_email: email })).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as { ok: boolean; email: string };
      })
    );
  }

  remove$(email: string): Observable<{ ok: boolean; email: string }> {
    return from(this.supabase.client.rpc('admin_remove_admin', { p_email: email })).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as { ok: boolean; email: string };
      })
    );
  }
}
