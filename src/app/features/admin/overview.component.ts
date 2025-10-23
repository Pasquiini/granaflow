import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, map, catchError, of } from 'rxjs';
import {
  AdminMetricsService,
  OverviewMetrics,
} from '../../core/services/admin-metrics.service';

type VM = {
  data: OverviewMetrics | null;
  loading: boolean;
  error: string | null;
  spark: { users: string; pro: string; mrr: string };
  growth: { users: number; pro: number; mrr: number };
  bars: { label: string; ratio: number; value: number }[];
  maxRevenue: number;
};

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="p-6">
      <div class="flex items-end justify-between mb-5">
        <div>
          <h1 class="text-2xl font-bold text-emerald-700">Painel do Administrador</h1>
          <p class="text-slate-600">
            Visão geral do sistema e indicadores principais.
          </p>
        </div>
      </div>

      <ng-container *ngIf="vm$ | async as vm">
        <div
          *ngIf="vm.loading"
          class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900/80 mb-6"
        >
          Carregando métricas...
        </div>

        <div
          *ngIf="vm.error"
          class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 mb-6"
        >
          {{ vm.error }}
        </div>

        <!-- Cards -->
        <div class="grid md:grid-cols-3 gap-4 mb-6" *ngIf="vm.data">
          <!-- Usuários ativos -->
          <div class="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-medium text-slate-500">Usuários ativos</h2>
                <p class="text-3xl font-bold text-emerald-700 mt-1">
                  {{ vm.data.activeUsers | number }}
                </p>
              </div>
              <span
                class="text-xs px-2 py-1 rounded-full"
                [ngClass]="
                  vm.growth.users >= 0
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                "
              >
                {{ vm.growth.users >= 0 ? '▲' : '▼' }}
                {{ vm.growth.users | number : '1.0-1' }}%
              </span>
            </div>

            <svg viewBox="0 0 140 36" class="w-full h-9 mt-3">
              <path
                [attr.d]="vm.spark.users"
                fill="none"
                stroke="currentColor"
                class="text-emerald-500"
                stroke-width="2"
              />
            </svg>
          </div>

          <!-- Assinaturas PRO -->
          <div class="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-medium text-slate-500">Assinaturas PRO</h2>
                <p class="text-3xl font-bold text-emerald-700 mt-1">
                  {{ vm.data.proSubscriptions | number }}
                </p>
              </div>
              <span
                class="text-xs px-2 py-1 rounded-full"
                [ngClass]="
                  vm.growth.pro >= 0
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                "
              >
                {{ vm.growth.pro >= 0 ? '▲' : '▼' }}
                {{ vm.growth.pro | number : '1.0-1' }}%
              </span>
            </div>

            <svg viewBox="0 0 140 36" class="w-full h-9 mt-3">
              <path
                [attr.d]="vm.spark.pro"
                fill="none"
                stroke="currentColor"
                class="text-emerald-500"
                stroke-width="2"
              />
            </svg>
          </div>

          <!-- Receita mensal -->
          <div class="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-medium text-slate-500">Receita mensal</h2>
                <p class="text-3xl font-bold text-emerald-700 mt-1">
                  R$ {{ vm.data.mrr | number : '1.0-0' }}
                </p>
              </div>
              <span
                class="text-xs px-2 py-1 rounded-full"
                [ngClass]="
                  vm.growth.mrr >= 0
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                "
              >
                {{ vm.growth.mrr >= 0 ? '▲' : '▼' }}
                {{ vm.growth.mrr | number : '1.0-1' }}%
              </span>
            </div>

            <svg viewBox="0 0 140 36" class="w-full h-9 mt-3">
              <path
                [attr.d]="vm.spark.mrr"
                fill="none"
                stroke="currentColor"
                class="text-emerald-500"
                stroke-width="2"
              />
            </svg>
          </div>
        </div>

        <!-- Receita por mês -->
        <div
          class="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm"
          *ngIf="vm.data"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-semibold text-emerald-800">Receita por mês</h3>
            <div class="text-sm text-slate-500">
              Máx: R$ {{ vm.maxRevenue | number : '1.0-0' }}
            </div>
          </div>

          <div class="mt-3">
            <div class="grid grid-cols-12 gap-2 items-end h-40">
              <ng-container *ngFor="let b of vm.bars">
                <div class="flex flex-col items-center justify-end">
                  <div
                    class="w-full rounded-t-md bg-emerald-500/80"
                    [style.height.%]="Math.max(2, b.ratio * 100)"
                    title="R$ {{ b.value | number : '1.0-0' }}"
                  ></div>
                  <div class="text-[11px] text-slate-500 mt-1">{{ b.label }}</div>
                </div>
              </ng-container>
            </div>
          </div>
        </div>
      </ng-container>
    </section>
  `,
})
export class OverviewComponent {
  private readonly svc = inject(AdminMetricsService);

  // expose Math to the template (template expressions access component members)
  readonly Math = Math;

  vm$: Observable<VM> = this.svc
    .getOverview$()
    .pipe(
      map((data) => this.toVM(data)),
      catchError((err) =>
        of({
          data: null,
          loading: false,
          error:
            'Não foi possível carregar as métricas. ' +
            (err?.message || ''),
          spark: { users: '', pro: '', mrr: '' },
          growth: { users: 0, pro: 0, mrr: 0 },
          bars: [],
          maxRevenue: 0,
        } as VM)
      )
    );

  private toVM(data: OverviewMetrics): VM {
    const spark = {
      users: this.sparkPath(data.trends.users),
      pro: this.sparkPath(data.trends.pro),
      mrr: this.sparkPath(data.trends.mrr),
    };

    const growth = {
      users: this.svc.growthPct(data.trends.users),
      pro: this.svc.growthPct(data.trends.pro),
      mrr: this.svc.growthPct(data.trends.mrr),
    };

    const maxRevenue = Math.max(...data.revenueByMonth.map((p) => p.value), 0);
    const bars = data.revenueByMonth.map((p) => ({
      label: p.label,
      value: p.value,
      ratio: maxRevenue ? p.value / maxRevenue : 0,
    }));

    return {
      data,
      loading: false,
      error: null,
      spark,
      growth,
      bars,
      maxRevenue,
    };
  }

  private sparkPath(series: number[], width = 140, height = 36, pad = 2): string {
    if (!series?.length) return '';
    const w = width - pad * 2;
    const h = height - pad * 2;
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const stepX = series.length > 1 ? w / (series.length - 1) : w;

    return series
      .map((v, i) => {
        const x = pad + i * stepX;
        const y = pad + (h - ((v - min) / range) * h);
        return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }
}
