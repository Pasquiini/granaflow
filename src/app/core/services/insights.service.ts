import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Overview {
  month: string;        // 'YYYY-MM-01'
  prev_month: string;   // 'YYYY-MM-01'
  income_curr: number;
  income_prev: number;
  income_delta: number;
  income_delta_pct: number | null;
  expense_curr: number;
  expense_prev: number;
  expense_delta: number;
  expense_delta_pct: number | null;
  balance_curr: number;
  balance_prev: number;
  balance_delta: number;
  balance_delta_pct: number | null;
}

export interface CategoryDelta {
  category_id: string | null;
  category_name: string;
  expense_curr: number;
  expense_prev: number;
  delta: number;
  delta_pct: number | null;
}

@Injectable({ providedIn: 'root' })
export class InsightsService {
  constructor(private supa: SupabaseService) {}

  /** Normaliza 'YYYY-MM' -> 'YYYY-MM-01' */
  private monthStart(monthISO: string) {
    const s = monthISO.slice(0, 10);
    return monthISO.length === 7 ? `${monthISO}-01` : s;
  }

  /** Overview do mês vs mês anterior */
  async overview(monthISO: string): Promise<Overview> {
    const m = this.monthStart(monthISO);
    const { data, error } = await this.supa.client.rpc('monthly_overview_vs_prev', { p_month: m });
    if (error) throw error;

    const r = (data ?? [])[0] ?? {};
    const num = (x: any) => (x == null ? null : Number(x));

    return {
      month: r.month,
      prev_month: r.prev_month,
      income_curr: Number(r.income_curr ?? 0),
      income_prev: Number(r.income_prev ?? 0),
      income_delta: Number(r.income_delta ?? 0),
      income_delta_pct: num(r.income_delta_pct),
      expense_curr: Number(r.expense_curr ?? 0),
      expense_prev: Number(r.expense_prev ?? 0),
      expense_delta: Number(r.expense_delta ?? 0),
      expense_delta_pct: num(r.expense_delta_pct),
      balance_curr: Number(r.balance_curr ?? 0),
      balance_prev: Number(r.balance_prev ?? 0),
      balance_delta: Number(r.balance_delta ?? 0),
      balance_delta_pct: num(r.balance_delta_pct),
    };
  }

  /** Variação por categoria (despesas) mês vs anterior */
  async categoryDeltas(monthISO: string): Promise<CategoryDelta[]> {
    const m = this.monthStart(monthISO);
    const { data, error } = await this.supa.client.rpc('monthly_category_delta', { p_month: m });
    if (error) throw error;

    return (data ?? []).map((r: any) => ({
      category_id: r.category_id ?? null,
      category_name: r.category_name ?? 'Sem categoria',
      expense_curr: Number(r.expense_curr ?? 0),
      expense_prev: Number(r.expense_prev ?? 0),
      delta: Number(r.delta ?? 0),
      delta_pct: r.delta_pct == null ? null : Number(r.delta_pct),
    }));
  }

  /** Sugestões heurísticas (categorias com aumento relevante, etc.) */
  async suggestions(monthISO: string) {
    const m = this.monthStart(monthISO);
    const { data, error } = await this.supa.client.rpc('monthly_suggestions', { p_month: m });
    if (error) throw error;

    return (data ?? []).map((r: any) => ({
      category_id: r.category_id ?? null,
      category_name: r.category_name ?? 'Sem categoria',
      expense_curr: Number(r.expense_curr ?? 0),
      expense_prev: Number(r.expense_prev ?? 0),
      delta: Number(r.delta ?? 0),
      delta_pct: r.delta_pct == null ? null : Number(r.delta_pct),
      suggestion: String(r.suggestion ?? ''),
    }));
  }

  /** Gera frases curtas e claras a partir do overview + deltas por categoria */
  generateMessages(o: Overview, cats: CategoryDelta[]) {
    const msgs: string[] = [];

    // Saldo
    const balArrow = o.balance_delta >= 0 ? '↑' : '↓';
    const balSign = o.balance_delta >= 0 ? '+' : '';
    msgs.push(
      `Saldo do mês: R$ ${o.balance_curr.toFixed(2)} (${balArrow} ${balSign}${o.balance_delta.toFixed(
        2
      )} vs mês anterior)`
    );

    // Despesas (variação)
    if (o.expense_delta_pct != null) {
      const pct = (o.expense_delta_pct * 100).toFixed(1);
      const arrow = o.expense_delta >= 0 ? '↑' : '↓';
      const sign = o.expense_delta >= 0 ? '+' : '';
      msgs.push(`Despesas ${arrow} ${sign}${o.expense_delta.toFixed(2)} (${pct}%) vs mês anterior.`);
    }

    // Top aumentos / reduções por categoria
    const inc = cats.filter((c) => (c.delta ?? 0) > 0).sort((a, b) => b.delta - a.delta).slice(0, 2);
    const dec = cats.filter((c) => (c.delta ?? 0) < 0).sort((a, b) => a.delta - b.delta).slice(0, 2);

    if (inc.length) {
      msgs.push(`Maiores aumentos: ${inc.map((c) => `${c.category_name} (+R$ ${c.delta.toFixed(2)})`).join(', ')}.`);
    }
    if (dec.length) {
      msgs.push(
        `Maiores reduções: ${dec
          .map((c) => `${c.category_name} (-R$ ${Math.abs(c.delta).toFixed(2)})`)
          .join(', ')}.`
      );
    }

    return msgs;
  }
}
