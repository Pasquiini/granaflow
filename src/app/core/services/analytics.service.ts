import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface MonthlyTotals {
  month: string;           // YYYY-MM-01
  income_total: number;
  expense_total: number;
}
export interface AccountBalance {
  account_id: string; name: string; type: string; balance: number;
}
export interface CategorySlice {
  category_id: string | null;
  category_name: string | null;
  expense_total: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private supa: SupabaseService, private auth: AuthService) {}
  private get uid() { const u = this.auth.user(); if (!u) throw new Error('Sem usuário'); return u.id; }

  private monthStartEnd(monthISO: string) {
    const [y, m] = monthISO.split('-').map(Number); // 'YYYY-MM-01'
    const start = `${y}-${String(m).padStart(2,'0')}-01`;
    const endY = m === 12 ? y+1 : y;
    const endM = m === 12 ? 1 : m+1;
    const end = `${endY}-${String(endM).padStart(2,'0')}-01`;
    return { start, end };
  }

  async getMonthlyTotals(monthISO: string): Promise<MonthlyTotals> {
    const { start, end } = this.monthStartEnd(monthISO);
    const { data, error } = await this.supa.client
      .from('transactions')
      .select('type,amount,occurred_at')
      .gte('occurred_at', start).lt('occurred_at', end);
    if (error) throw error;
    const income = data?.filter((d:any)=>d.type==='income').reduce((s:any,x:any)=>s+Number(x.amount),0) ?? 0;
    const expense = data?.filter((d:any)=>d.type==='expense').reduce((s:any,x:any)=>s+Number(x.amount),0) ?? 0;
    return { month: start, income_total: income, expense_total: expense };
  }

  async getBalances(): Promise<AccountBalance[]> {
    const { data, error } = await this.supa.client.from('account_balances').select('account_id,name,type,balance');
    if (error) throw error;
    return data as AccountBalance[];
  }

  async getCategoryBreakdown(monthISO: string): Promise<CategorySlice[]> {
    const { start, end } = this.monthStartEnd(monthISO);
    const { data, error } = await this.supa.client
      .from('monthly_category_totals')
      .select('category_id,category_name,expense_total,month')
      .gte('month', start).lt('month', end);
    if (error) throw error;
    // inclui "Outros" se desejar agregar nulos:
    const rows = (data ?? []) as any[];
    return rows.map(r => ({
      category_id: r.category_id ?? null,
      category_name: r.category_name ?? 'Outros',
      expense_total: Number(r.expense_total ?? 0)
    }));
  }

  async getDailySeries(monthISO: string): Promise<{ days: string[]; income: number[]; expense: number[]; }> {
    const { start, end } = this.monthStartEnd(monthISO);
    const { data, error } = await this.supa.client
      .from('daily_totals')
      .select('day,income_total,expense_total')
      .gte('day', start).lt('day', end).order('day', { ascending: true });
    if (error) throw error;
    const days: string[] = [];
    const income: number[] = [];
    const expense: number[] = [];
    for (const r of (data ?? [])) {
      days.push(String(r.day));
      income.push(Number(r.income_total ?? 0));
      expense.push(Number(r.expense_total ?? 0));
    }
    return { days, income, expense };
  }
}
