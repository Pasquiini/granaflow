import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { GoalContribution } from '../models/goal-contribution.model';
import { GoalsService } from './goals.service';
import { Goal } from '../models/goal.model';

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
export type GoalsOverview = {
  kpis: {
    contributedThisMonth: number;
    remainingTotal: number;
    atRiskCount: number;
    avgEtaMonths: number;
  };
  atRisk: Array<{
    id: string;
    title: string;
    status: 'active' | 'done' | 'overdue';
    due_date?: string | null;
    remaining: number;
    needPerMonth?: number | null;
    avgPerMonth?: number | null;
    lastContributionAt?: string | null;
    reason: 'overdue' | 'shortfall' | 'inactive';
  }>;
  suggestions: Array<{ id: string; title: string; suggestion: string }>;
};
@Injectable({ providedIn: 'root' })
export class InsightsService {
  constructor(private supa: SupabaseService, private goals: GoalsService) {}

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

  async goalsOverview(monthISO: string): Promise<GoalsOverview> {
  // 1) metas do usuário
  const metas: Goal[] = await this.goals.list();

  const now = new Date();
  const monthStart = new Date(monthISO);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);
  const last12Start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  // helpers
  const sum = (arr: { amount: number }[]) => arr.reduce((s, x) => s + Number(x.amount || 0), 0);
  const monthsBetween = (a: Date, b: Date) => {
    const d = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
    return Math.max(0, d + (b.getDate() >= a.getDate() ? 0 : -1));
  };

  let contributedThisMonthTotal = 0;
  let remainingTotal = 0;

  type Row = {
    g: Goal;
    contributedThisMonth: number;
    avgPerMonth: number | null;
    needPerMonth: number | null;
    remaining: number;
    lastContributionAt: string | null;
    etaMonths: number | null;
    atRiskReason?: 'overdue' | 'shortfall' | 'inactive';
  };

  const rows: Row[] = [];

  for (const g of metas) {
    const contribs: GoalContribution[] = await this.goals.listContributions(g.id);

    // ordena desc só por segurança
    contribs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const inThisMonth = contribs.filter(c => {
      const d = new Date(c.created_at);
      return d >= monthStart && d <= monthEnd;
    });
    const last12 = contribs.filter(c => new Date(c.created_at) >= last12Start);

    const contributedThisMonth = sum(inThisMonth);
    contributedThisMonthTotal += contributedThisMonth;

    const monthsWindow = Math.max(1, monthsBetween(last12Start, now) + 1);
    const avgPerMonth = last12.length ? sum(last12 as any) / monthsWindow : null;

    const remaining = Math.max(0, Number(g.target_amount) - Number(g.current_amount));
    remainingTotal += remaining;

    let monthsToDue: number | null = null;
    if (g.due_date) {
      const due = new Date(g.due_date);
      monthsToDue = Math.max(0, monthsBetween(now, due));
    }

    const needPerMonth = monthsToDue && monthsToDue > 0 ? remaining / monthsToDue : null;
    const lastContributionAt = contribs.length ? contribs[0].created_at : null;

    // ETA para metas sem prazo, baseado na média
    const etaMonths = !g.due_date && avgPerMonth && avgPerMonth > 0 ? Math.ceil(remaining / avgPerMonth) : null;

    // regras de risco
    let atRiskReason: 'overdue' | 'shortfall' | 'inactive' | undefined;
    const daysSinceLast = lastContributionAt ? Math.floor((now.getTime() - new Date(lastContributionAt).getTime()) / 86400000) : Infinity;

    if (g.status === 'overdue') {
      atRiskReason = 'overdue';
    } else if (needPerMonth && avgPerMonth && needPerMonth > avgPerMonth * 1.2) {
      atRiskReason = 'shortfall'; // média < 80% do necessário
    } else if (daysSinceLast > 30 && remaining > 0) {
      atRiskReason = 'inactive';
    }

    rows.push({
      g, contributedThisMonth, avgPerMonth, needPerMonth,
      remaining, lastContributionAt, etaMonths, atRiskReason
    });
  }

  // KPIs agregados
  const atRiskCount = rows.filter(r => r.atRiskReason).length;
  const etaList = rows.map(r => r.etaMonths).filter((x): x is number => typeof x === 'number');
  const avgEtaMonths = etaList.length ? Math.round(etaList.reduce((s, x) => s + x, 0) / etaList.length) : 0;

  // Metas em risco (card)
  const atRisk = rows
    .filter(r => r.atRiskReason)
    .map(r => ({
      id: r.g.id,
      title: r.g.title,
      status: r.g.status as 'active' | 'done' | 'overdue',
      due_date: r.g.due_date ?? null,
      remaining: r.remaining,
      needPerMonth: r.needPerMonth ?? null,
      avgPerMonth: r.avgPerMonth ?? null,
      lastContributionAt: r.lastContributionAt,
      reason: r.atRiskReason!
    }));

  // Sugestões (texto)
  const suggestions = rows
    .filter(r => r.remaining > 0)
    .map(r => {
      const title = r.g.title;
      const need = r.needPerMonth ?? 0;
      const avg = r.avgPerMonth ?? 0;
      let suggestion = '';

      if (r.g.status === 'overdue') {
        suggestion = `Prazo ultrapassado. Refaça o prazo ou faça um aporte pontual de R$ ${Math.round(r.remaining).toLocaleString('pt-BR')}.`;
      } else if (r.needPerMonth && r.needPerMonth > 0) {
        const gap = Math.max(0, need - avg);
        if (gap > 0) {
          suggestion = `Para cumprir o prazo, precisa de ${need.toLocaleString('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 })}/mês. Hoje sua média é ${avg.toLocaleString('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 })}; falta ${gap.toLocaleString('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 })}/mês.`;
        } else {
          suggestion = `Ritmo OK: necessário ${need.toLocaleString('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 })}/mês e média ${avg.toLocaleString('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 })}/mês.`;
        }
      } else if (r.etaMonths) {
        suggestion = `Sem prazo. Mantendo a média de ${avg.toLocaleString('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 })}/mês, conclui em ~${r.etaMonths} meses.`;
      } else {
        suggestion = `Comece com aportes mensais regulares (ex.: 5–10% da renda) para ganhar tração nesta meta.`;
      }

      return { id: r.g.id, title, suggestion };
    });

  return {
    kpis: {
      contributedThisMonth: contributedThisMonthTotal,
      remainingTotal,
      atRiskCount,
      avgEtaMonths
    },
    atRisk,
    suggestions
  };
}

}
