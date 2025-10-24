import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
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

// ======= NOVOS (Metas) =======
import { GoalsService } from '../../../core/services/goals.service';
import type { Goal, GoalStatus } from '../../../core/models/goal.model';
import { CurrencyMaskDirective } from '../../../shared/directives/currency-mask.directive';

// Util BRL rápido p/ tooltips
const brl = (v: number) =>
  (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [CommonModule, FormsModule, BaseChartDirective, NgIf, NgFor, NgClass, CurrencyMaskDirective], // + CurrencyMaskDirective
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

      <!-- ====== METAS (NOVO BLOCO) ====== -->
   <div class="rounded-2xl border border-emerald-200/40 bg-white/80 p-6 shadow ring-1 ring-white/40">
  <!-- Cabeçalho -->
  <div class="mb-4 flex flex-wrap items-center gap-3">
    <h2 class="text-sm font-semibold text-emerald-900">Metas</h2>
    <div class="ml-auto flex flex-wrap items-center gap-2">
      <button
        class="rounded-lg border border-emerald-200 bg-white/70 px-3 py-1.5 text-xs text-emerald-800 hover:bg-white"
        (click)="router.navigate(['/goals'])">
        Ver todas
      </button>
      <button
        class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:opacity-95"
        (click)="router.navigate(['/goals/new'])">
        Nova meta
      </button>
    </div>
  </div>

  <ng-container *ngIf="goals().length; else emptyGoals">
    <!-- Grid responsiva: 1 / 2 / 3 colunas -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article
        *ngFor="let g of goals(); trackBy: trackBalance"
        class="flex h-full flex-col rounded-xl border border-emerald-200/50 bg-white/90 p-4 transition-shadow hover:shadow-sm">

        <!-- Título + Badge -->
        <div class="flex items-start gap-3">
          <h3 class="min-w-0 flex-1 truncate text-base font-semibold leading-tight text-emerald-900" [title]="g.title">
            {{ g.title }}
          </h3>

          <span
            class="shrink-0 rounded-full px-2 py-0.5 text-[11px] ring-1"
            [ngClass]="{
              'bg-green-50 text-green-700 ring-green-200': g.status === 'done',
              'bg-amber-50 text-amber-700 ring-amber-200': g.status === 'overdue',
              'bg-emerald-50 text-emerald-700 ring-emerald-200': g.status === 'active'
            }">
            {{ statusPt(g.status) }}
          </span>
        </div>

        <!-- Linha de valores -->
        <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-700">
          <span class="inline-block h-2.5 w-2.5 rounded-full"
                [ngClass]="{
                  'bg-green-500': g.status === 'done',
                  'bg-amber-500': g.status === 'overdue',
                  'bg-emerald-500': g.status === 'active'
                }">
          </span>

          <span class="font-medium text-emerald-900">
            {{ (g.current_amount || 0) | currency:'BRL':'symbol-narrow':'1.0-0' }}
          </span>
          <span class="text-gray-500">/ {{ g.target_amount | currency:'BRL':'symbol-narrow':'1.0-0' }}</span>

          <span *ngIf="g.due_date" class="text-xs text-gray-500">• até {{ g.due_date | date:'dd/MM/yyyy' }}</span>

          <span class="ml-auto text-xs text-emerald-700"
                *ngIf="progressGoal(g) as p">{{ p | number:'1.0-0' }}%</span>
        </div>

        <!-- Barra de progresso -->
        <div class="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-emerald-100/70"
             role="progressbar"
             [attr.aria-valuenow]="progressGoal(g) || 0" aria-valuemin="0" aria-valuemax="100">
          <div
            class="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-[width] duration-300"
            [style.width.%]="Math.max(progressGoal(g) || 0, (g.current_amount>0 ? 3 : 0))">
          </div>
        </div>

        <div class="mt-1 text-[11px] text-gray-500">Lançamento rápido nesta meta</div>
      </article>
    </div>
  </ng-container>

  <ng-template #emptyGoals>
    <div class="grid h-28 place-items-center text-sm text-gray-500">
      Nenhuma meta ainda.
      <button class="ml-1 underline" (click)="router.navigate(['/goals/new'])">Criar agora</button>
    </div>
  </ng-template>
</div>

<!-- ====== FIM METAS ====== -->

      <!-- ====== FIM METAS ====== -->

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
  styles: [
    `.goal-quick-form,
.note-input,
.btn-fixed {
  all: unset; /* remove tudo */
}`
  ]
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  protected Math = Math; // Make Math available to the template
  monthInput = new Date().toISOString().slice(0, 7); // YYYY-MM

  // Loading “leve”
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
          label: ctx => `${ctx.dataset.label}: ${brl(Number((ctx.parsed as any).y))}`
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
  private chGoals?: RealtimeChannel; // metas

  // ====== ESTADO DE METAS ======
  goals = signal<Goal[]>([]);
  goalsLoading = signal(false);
  quick: Record<string, { amount: number | null; note: string }> = {};

  constructor(
    private analytics: AnalyticsService,
    private budgets: BudgetsService,
    private cats: CategoriesService,
    private supa: SupabaseService,
    private goalsSvc: GoalsService,         // + GoalsService
    public router: Router
  ) { }

  async ngOnInit() {
    await this.reload();

    // realtime listener transações
    this.ch = this.supa.client
      .channel('rt-transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, async () => {
        await this.reload();
      })
      .subscribe();

    // realtime metas + contribuições
    this.chGoals = this.supa.client
      .channel('rt-goals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, async () => {
        await this.loadGoals();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goal_contributions' }, async () => {
        await this.loadGoals();
      })
      .subscribe();
  }

  ngOnDestroy() {
    if (this.ch) this.supa.client.removeChannel(this.ch);
    if (this.chGoals) this.supa.client.removeChannel(this.chGoals);
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
        'rgba(16,185,129,0.9)', 'rgba(5,150,105,0.9)', 'rgba(52,211,153,0.9)',
        'rgba(2,132,199,0.9)', 'rgba(99,102,241,0.9)', 'rgba(234,179,8,0.9)',
        'rgba(244,63,94,0.9)', 'rgba(59,130,246,0.9)'
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

      // metas
      await this.loadGoals();
    } finally {
      this.loading.set(false);
    }
  }

  // ==== METAS ====
  async loadGoals() {
    try {
      this.goalsLoading.set(true);
      const list = await this.goalsSvc.list();
      // top 3 por % de progresso
      const ranked = [...list].sort((a, b) => {
        const pa = Number(a.current_amount) / Math.max(1, Number(a.target_amount));
        const pb = Number(b.current_amount) / Math.max(1, Number(b.target_amount));
        return pb - pa;
      });
      const top3 = ranked.slice(0, 3);
      this.goals.set(top3);

      // inicializa formulários rápidos
      const map: Record<string, { amount: number | null; note: string }> = {};
      for (const g of top3) map[g.id] = { amount: null, note: '' };
      this.quick = map;
    } finally {
      this.goalsLoading.set(false);
    }
  }

  async addQuick(g: Goal) {
    const form = this.quick[g.id];
    const amount = form?.amount ?? 0;
    if (!amount || amount <= 0) return;

    await this.goalsSvc.addContribution(g.id, amount, form?.note?.trim() || undefined);
    await this.loadGoals();
    this.quick[g.id] = { amount: null, note: '' };
  }

  progressGoal(g: Goal) {
    return Math.min(100, Math.round((Number(g.current_amount) / Math.max(1, Number(g.target_amount))) * 100));
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

  statusPt(status: GoalStatus): string {
    switch (status) {
      case 'active': return 'Ativa';
      case 'paused': return 'Pausada';
      case 'done': return 'Concluída';
      case 'overdue': return 'Atrasada';
    }
  }
}
