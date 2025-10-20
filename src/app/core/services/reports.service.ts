import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export type ReportType = 'expense' | 'income' | null;

@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(private supa: SupabaseService) {}

  private range(startISO: string, endISO: string) {
    // normaliza para YYYY-MM-DD e garante end exclusivo
    const s = startISO.slice(0,10);
    let [y,m,d] = endISO.slice(0,10).split('-').map(Number);
    const end = new Date(y, m-1, d);
    end.setDate(end.getDate() + 1); // exclusivo
    const e = end.toISOString().slice(0,10);
    return { s, e };
  }

  async categoryTotals(startISO: string, endISO: string, type: ReportType) {
    const { s, e } = this.range(startISO, endISO);
    const { data, error } = await this.supa.client.rpc('report_category_totals', {
      p_start: s, p_end: e, p_type: type
    });
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      category_id: r.category_id,
      category_name: r.category_name ?? 'Sem categoria',
      total: Number(r.total || 0),
    }));
  }

  async dailyTotals(startISO: string, endISO: string) {
    const { s, e } = this.range(startISO, endISO);
    const { data, error } = await this.supa.client.rpc('report_daily_totals', {
      p_start: s, p_end: e
    });
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      day: r.day, income_total: Number(r.income_total||0), expense_total: Number(r.expense_total||0)
    }));
  }

  async detailed(startISO: string, endISO: string, type: ReportType, categoryId?: string | null) {
    const { s, e } = this.range(startISO, endISO);
    const { data, error } = await this.supa.client.rpc('report_transactions_detailed', {
      p_start: s, p_end: e, p_type: type, p_category: categoryId ?? null
    });
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      id: r.id, occurred_at: r.occurred_at, type: r.type,
      amount: Number(r.amount||0), description: r.description ?? '',
      account_name: r.account_name ?? '-', category_name: r.category_name ?? 'Sem categoria'
    }));
  }
}
