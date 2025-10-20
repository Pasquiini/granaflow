import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import type { Budget, BudgetStatus } from '../models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetsService {
  constructor(private supa: SupabaseService, private auth: AuthService) {}
  private get uid() { const u = this.auth.user(); if (!u) throw new Error('Sem usuário'); return u.id; }

  private normalizeMonth(monthInput: string) {
    // aceita 'YYYY-MM' ou 'YYYY-MM-01'
    return monthInput.length === 7 ? `${monthInput}-01` : monthInput;
  }

  async listStatusByMonth(month: string): Promise<BudgetStatus[]> {
    const m = this.normalizeMonth(month);
    const { data, error } = await this.supa.client
      .from('budget_status')
      .select('id,category_id,month,limit_amount,spent,progress_ratio')
      .eq('month', m)
      .order('limit_amount', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      ...r,
      limit_amount: Number(r.limit_amount ?? 0),
      spent: Number(r.spent ?? 0),
      progress_ratio: Number(r.progress_ratio ?? 0),
    }));
  }

  async create(input: { category_id: string; month: string; limit_amount: number; }) {
    const { data, error } = await this.supa.client.from('budgets').insert({
      user_id: this.uid,
      category_id: input.category_id,
      month: this.normalizeMonth(input.month),
      limit_amount: Number(input.limit_amount),
    }).select().single();
    if (error) throw error;
    return data as Budget;
  }

  async update(id: string, input: Partial<Pick<Budget, 'category_id' | 'month' | 'limit_amount'>>) {
    const patch: any = { ...input };
    if (patch.month) patch.month = this.normalizeMonth(patch.month);
    if (patch.limit_amount != null) patch.limit_amount = Number(patch.limit_amount);
    const { data, error } = await this.supa.client.from('budgets').update(patch).eq('id', id).select().single();
    if (error) throw error;
    return data as Budget;
  }

  async remove(id: string) {
    const { error } = await this.supa.client.from('budgets').delete().eq('id', id);
    if (error) throw error;
  }

  async get(id: string) {
    const { data, error } = await this.supa.client.from('budgets').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as Budget | null;
  }

  async listAlertsByMonth(month: string): Promise<Array<{
  budget_id: string; category_id: string; month: string;
  limit_amount: number; spent: number; progress_ratio: number; severity: 'near'|'over'|'ok';
}>> {
  const m = this.normalizeMonth(month);
  const { data, error } = await this.supa.client
    .from('budget_alerts')
    .select('budget_id,category_id,month,limit_amount,spent,progress_ratio,severity')
    .eq('month', m)
    .in('severity', ['near','over'])
    .order('severity', { ascending: false }); // over primeiro
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    ...r,
    limit_amount: Number(r.limit_amount ?? 0),
    spent: Number(r.spent ?? 0),
    progress_ratio: Number(r.progress_ratio ?? 0),
  }));
}
}
