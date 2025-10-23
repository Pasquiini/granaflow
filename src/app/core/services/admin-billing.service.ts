import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { from, map, Observable } from 'rxjs';

export interface AdminPaymentRow {
  id: string;
  user_email: string | null;
  amount_brl: number;      // convertido no RPC (centavos -> R$)
  status: string | null;
  paid_at: string | null;  // data/hora usada para ordenação
  raw: any;                // payload completo opcional
}

export interface AdminPaymentsPage {
  items: AdminPaymentRow[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class AdminBillingService {
  private readonly supabase = inject(SupabaseService);

  list$(opts: { search?: string; status?: string; from?: string; to?: string; limit?: number; offset?: number }) {
    const { search = '', status = '', limit = 20, offset = 0 } = opts;

    return from(
      this.supabase.client.rpc('admin_list_payments', {
        p_search: search || null,
        p_status: status || null,
        p_limit: limit,
        p_offset: offset
      })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        const d = (data ?? {}) as any;
        const items = Array.isArray(d.items) ? d.items as AdminPaymentRow[] : [];
        return {
          items,
          total: Number(d.total ?? 0)
        };
      })
    );
  }
}
