import { Component, OnInit, OnDestroy, computed, signal, effect } from '@angular/core';
import { CommonModule, NgClass, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { AnalyticsService } from '../../../core/services/analytics.service';
import { BudgetsService } from '../../../core/services/budgets.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { Router } from '@angular/router';

// Util BRL rápido p/ tooltips
const brl = (v: number) =>
  (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [CommonModule, FormsModule, BaseChartDirective, NgIf, NgFor, NgClass],
  template: `
    <div class="space-y-5">
      <!-- Header / Controles -->
      <div class="rounded-2xl border border-emerald-200/40 bg-white/70 backdrop-blur-xl p-6 shadow-[0_10px_40px_-20px_rgba(16,185,129,0.35)]">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="text-2xl font-semibold text-brand-primary">Visão Geral</h1>
            <p class="text-sm text-brand-muted">Resumo do mês</p>

            <!-- ALERTAS DE ORÇAMENTO -->
            <div *ngIf="alerts.length" class="mt-4 space-y-2">
              <div
                class="rounded-xl border p-3 transition"
                *ngFor="let a of alerts; trackBy: trackAlert"
                [ngClass]="{
                  'bg-red-50/80 border-red-200': a.severity === 'over',
                  'bg-yellow-50/80 border-yellow-200': a.severity === 'near',
                  'bg-emerald-50/70 border-emerald-200': a.severity === 'ok'
                }"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="text-sm">
                    <span class="inline-flex items-center gap-1 font-medium"
                          [ngClass]="{
                            'text-red-700': a.severity === 'over',
                            'text-yellow-700': a.severity === 'near',
                            'text-emerald-700': a.severity === 'ok'
                          }">
                      <span *ngIf="a.severity==='over'">🚨 Orçamento excedido</span>
                      <span *ngIf="a.severity==='near'">⚠️ Perto do limite</span>
                      <span *ngIf="a.severity==='ok'">✅ Dentro do limite</span>
                    </span>
                    — <span class="text-gray-700">Categoria: {{ categoryName(a.category_id) }}</span>
                  </div>
                  <div class="text-sm text-gray-700">
                    {{ brlNum(a.spent) }} / {{ brlNum(a.limit_amount) }}
                  </div>
                </div>
                <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
                  <div class="h-full rounded-full"
                       [ngClass]="{
                         'bg-gradient-to-r from-red-600 to-red-400': a.severity === 'over',
                         'bg-gradient-to-r from-yellow-500 to-yellow-400': a.severity === 'near',
                         'bg-gradient-to-r from-emerald-600 to-emerald-400': a.severity === 'ok'
                       }"
                       [style.width.%]="progress(a.progress_ratio)"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button class="rounded-xl bg-red-600 px-3 py-2 text-white shadow hover:opacity-95 active:scale-[0.98]" (click)="newExpense()">
              + Nova Despesa
            </button>
            <button class="rounded-xl bg-emerald-600 px-3 py-2 text-white shadow hover:opacity-95 active:scale-[0.98]" (click)="newIncome()">
              + Nova Receita
            </button>

            <label class="ml-3 text-sm text-gray-600">Mês:</label>
            <input
              type="month"
              class="rounded-xl border border-emerald-200/60 p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              [(ngModel)]="monthInput"
              (change)="reload()"
            />
          </div>
        </div>

        <!-- KPIs -->
        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="rounded-2xl border border-emerald-200/40 bg-white/80 p-4 ring-1 ring-white/40">
            <div class="text-sm text-gray-500">Saldo total</div>
            <div class="mt-1 text-2xl font-semibold text-gray-800">
              {{ brl(totalBalance()) }}
            </div>
          </div>
          <div class="rounded-2xl border border-emerald-200/40 bg-white/80 p-4 ring-1 ring-white/40">
            <div class="text-sm text-gray-500">Receitas do mês</div>
            <div class="mt-1 text-2xl font-semibold text-emerald-700">
              {{ brl(income()) }}
            </div>
          </div>
          <div class="rounded-2xl border border-emerald-200/40 bg-white/80 p-4 ring-1 ring-white/40">
            <div class="text-sm text-gray-500">Despesas do mês</div>
            <div class="mt-1 text-2xl font-semibold text-red-700">
              {{ brl(expense()) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid gap-4 lg:grid-cols-2">
        <!-- Pizza por categoria -->
        <div class="rounded-2xl border border-emerald-200/40 bg-white/80 p-6 shadow ring-1 ring-white/40">
          <div class="mb-3 flex items-center justify-between">
            <div class="text-sm font-medium text-gray-700">Despesas por categoria</div>
            <span class="rounded-full bg-emerald-600/10 px-2 py-0.5 text-[11px] text-emerald-700 ring-1 ring-emerald-600/20">
              Mês {{ monthInput }}
            </span>
          </div>

          <ng-container *ngIf="!pieEmpty; else emptyPie">
            <canvas baseChart [data]="pieData" [type]="'doughnut'" [options]="pieOptions"></canvas>
          </ng-container>
          <ng-template #emptyPie>
            <div class="grid place-items-center h-48 text-sm text-gray-500">
              Sem despesas no período
            </div>
          </ng-template>
        </div>

        <!-- Série diária -->
        <div class="rounded-2xl border border-emerald-200/40 bg-white/80 p-6 shadow ring-1 ring-white/40">
          <div class="mb-3 text-sm font-medium text-gray-700">Fluxo diário</div>

          <ng-container *ngIf="!lineEmpty; else emptyLine">
            <canvas baseChart [type]="'line'" [data]="lineData" [options]="lineOptions"></canvas>
          </ng-container>
          <ng-template #emptyLine>
            <div class="grid place-items-center h-48 text-sm text-gray-500">
              Sem movimentações no período
            </div>
          </ng-template>
        </div>
      </div>

      <!-- tabela de saldos por conta -->
      <div class="rounded-2xl border border-emerald-200/40 bg-white/80 p-6 shadow ring-1 ring-white/40">
        <div class="mb-3 text-sm font-medium text-gray-700">Saldos por conta</div>
        <div *ngIf="balances().length; else emptyAccounts" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div *ngFor="let b of balances(); trackBy: trackBalance"
               class="rounded-xl border bg-gray-50/70 p-4 transition hover:shadow-sm">
            <div class="text-sm text-gray-500">{{ b.name }}</div>
            <div class="mt-1 text-xl font-semibold"
                 [class.text-red-700]="b.balance < 0"
                 [class.text-emerald-700]="b.balance >= 0">
              {{ brlNum(b.balance) }}
            </div>

            <!-- AÇÃO RÁPIDA POR CONTA -->
            <div class="mt-2">
              <button
                class="rounded-lg border px-2 py-1 text-xs hover:bg-white"
                (click)="router.navigate(['/transactions/new'], { queryParams: { type: 'expense', accountId: b.id } })">
                + Despesa nesta conta
              </button>
            </div>
          </div>
        </div>
        <ng-template #emptyAccounts>
          <div class="grid place-items-center h-28 text-sm text-gray-500">
            Nenhuma conta cadastrada ainda
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  monthInput = new Date().toISOString().slice(0, 7); // YYYY-MM

  // Loading “leve” para UX (se quiser skeletons, dá pra ligar nele)
  loading = signal(false);
  // expose brl helper to the template
  brl = brl;

  // alertas
  alerts: Array<{
    budget_id: string;
    category_id: string;
    month: string;
    limit_amount: number;
    spent: number;
    progress_ratio: number;
    severity: 'near' | 'over' | 'ok';
  }> = [];

  // categorias
  private categoryMap = new Map<string, string>();
  categoryName = (id: string) => this.categoryMap.get(id) ?? id;

  // cards
  income = signal(0);
  expense = signal(0);
  balances = signal<{ id: string; name: string; balance: number }[]>([]);
  totalBalance = computed(() => this.balances().reduce((s, x) => s + Number(x.balance), 0));

  // flags de empty states
  pieEmpty = false;
  lineEmpty = false;

  // charts
  pieData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [{ data: [], backgroundColor: [] }] };
  pieOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    cutout: '65%',
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.label}: ${brl(Number(ctx.parsed))}`
        }
      }
    }
  };

  lineData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Receitas',
        data: [],
        tension: 0.35,
        borderWidth: 2,
        borderColor: 'rgba(16,185,129,1)',       // emerald-500
        backgroundColor: 'rgba(16,185,129,0.15)', // fill
        fill: 'origin',
        pointRadius: 0,
        pointHoverRadius: 3
      },
      {
        label: 'Despesas',
        data: [],
        tension: 0.35,
        borderWidth: 2,
        borderColor: 'rgba(239,68,68,1)',        // red-500
        backgroundColor: 'rgba(239,68,68,0.12)',
        fill: 'origin',
        pointRadius: 0,
        pointHoverRadius: 3
      }
    ],
  };
  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${brl(Number(ctx.parsed.y))}`
        }
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v: any) => brl(Number(v)) } },
      x: { grid: { display: false } }
    }
  };

  // realtime
  private ch?: RealtimeChannel;

  constructor(
    private analytics: AnalyticsService,
    private budgets: BudgetsService,
    private cats: CategoriesService,
    private supa: SupabaseService,
    public router: Router
  ) {}

  async ngOnInit() {
    await this.reload();

    // realtime listener
    this.ch = this.supa.client
      .channel('rt-transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, async () => {
        await this.reload();
      })
      .subscribe();
  }

  ngOnDestroy() {
    if (this.ch) this.supa.client.removeChannel(this.ch);
  }

  async reload() {
    try {
      this.loading.set(true);
      const monthISO = `${this.monthInput}-01`;

      // categorias
      const catList = await this.cats.list('expense');
      this.categoryMap = new Map(catList.map((c: any) => [c.id, c.name]));
      this.categoryName = (id: string) => this.categoryMap.get(id) ?? id;

      // alertas
      this.alerts = await this.budgets.listAlertsByMonth(this.monthInput);

      // cards
      const mt = await this.analytics.getMonthlyTotals(monthISO);
      this.income.set(Number(mt.income_total || 0));
      this.expense.set(Number(mt.expense_total || 0));

      // saldos
      const b = await this.analytics.getBalances();
      this.balances.set(b.map((x: any) => ({ id: x.account_id, name: x.name, balance: Number(x.balance || 0) })));

      // pizza
      const cats = await this.analytics.getCategoryBreakdown(monthISO);
      const labels = cats.map((c: any) => c.category_name ?? 'Outros');
      const data = cats.map((c: any) => Number(c.expense_total || 0));
      this.pieEmpty = data.every((v: number) => v === 0);
      const palette = [
        'rgba(16,185,129,0.9)','rgba(5,150,105,0.9)','rgba(52,211,153,0.9)',
        'rgba(2,132,199,0.9)','rgba(99,102,241,0.9)','rgba(234,179,8,0.9)',
        'rgba(244,63,94,0.9)','rgba(59,130,246,0.9)'
      ];

      this.pieData = {
        labels: this.pieEmpty ? [] : labels,
        datasets: [{
          data: this.pieEmpty ? [] : data,
          backgroundColor: labels.map((_, i) => palette[i % palette.length]),
          borderWidth: 0
        }],
      };

      // linha
      const series = await this.analytics.getDailySeries(monthISO);
      const inc = series?.income ?? [];
      const exp = series?.expense ?? [];
      const days = series?.days ?? [];
      this.lineEmpty = (inc.every((v: number) => v === 0) && exp.every((v: number) => v === 0)) || !days.length;

      this.lineData = {
        labels: days,
        datasets: [
          { ...this.lineData.datasets[0], data: inc },
          { ...this.lineData.datasets[1], data: exp },
        ],
      };
    } finally {
      this.loading.set(false);
    }
  }

  // ações rápidas
  newExpense() {
    this.router.navigate(['/transactions/new'], { queryParams: { type: 'expense' } });
  }
  newIncome() {
    this.router.navigate(['/transactions/new'], { queryParams: { type: 'income' } });
  }

  progress(p: number) { return Math.min(p * 100, 100); }
  trackAlert = (_: number, a: any) => a.budget_id;
  trackBalance = (_: number, b: { id: string }) => b.id;

  // helpers para template
  brlNum(v: number) { return brl(v); }
}
