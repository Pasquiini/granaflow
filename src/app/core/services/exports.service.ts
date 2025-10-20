import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { saveAs } from 'file-saver';

export interface ExportFilters {
  start?: string;        // 'YYYY-MM-DD'
  end?: string;          // 'YYYY-MM-DD'
  account_id?: string | null;
  category_id?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ExportsService {
  constructor(private supa: SupabaseService) {}

  async downloadTransactionsCsv(filters: ExportFilters = {}) {
    const params = {
      p_start: filters.start ?? null,
      p_end: filters.end ?? null,
      p_account: filters.account_id ?? null,
      p_category: filters.category_id ?? null,
    };

    const { data, error } = await this.supa.client.rpc('export_transactions_csv', params);
    if (error) throw error;

    const csv = (data ?? '') as string;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    const stamp = new Date().toISOString().slice(0, 10);
    saveAs(blob, `granaflow-transacoes-${stamp}.csv`);
  }
}
