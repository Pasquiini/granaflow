import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoryDelta, InsightsService } from '../../../core/services/insights.service';

// ===== Tipos locais para o retorno de metas no InsightsService
type GoalKpis = {
  contributedThisMonth: number;
  remainingTotal: number;
  atRiskCount: number;
  avgEtaMonths: number;
};

type GoalRiskItem = {
  id: string;
  title: string;
  status: 'active' | 'done' | 'overdue';
  due_date?: string | null;
  remaining: number;
  needPerMonth?: number | null;
  avgPerMonth?: number | null;
  lastContributionAt?: string | null;
  reason: 'overdue' | 'shortfall' | 'inactive';
};

type GoalSuggestion = { id: string; title: string; suggestion: string };

@Component({
  standalone: true,
  selector: 'app-insights-page',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="space-y-4">
    <!-- Cabeçalho -->
    <div class="rounded-xl bg-white p-6 shadow">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold text-brand-primary">Resumo Inteligente</h1>
          <p class="text-sm text-brand-muted">Insights do mês com comparativos</p>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">Mês:</label>
          <input type="month" class="rounded-lg border p-2 text-sm" [(ngModel)]="month" (change)="reload()" />
        </div>
      </div>

      <!-- Mensagens gerais -->
      <ul class="mt-4 space-y-2">
        <li *ngFor="let m of messages" class="rounded-lg border bg-gray-50 px-3 py-2 text-sm">
          {{ m }}
        </li>
        <li *ngIf="!messages.length" class="rounded-lg border bg-gray-50 px-3 py-4 text-center text-brand-muted">
          Sem insights por enquanto.
        </li>
      </ul>
    </div>

    <!-- Aumentos / Reduções por categoria -->
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-xl bg-white p-6 shadow">
        <div class="mb-2 text-sm font-medium text-gray-700">Maiores aumentos por categoria</div>
        <div class="space-y-2">
          <div *ngFor="let c of topIncreases" class="rounded border bg-rose-50 p-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="font-medium text-rose-700">{{ c.category_name }}</span>
              <span class="text-rose-700">+R$ {{ c.delta | number:'1.2-2' }}</span>
            </div>
            <div class="text-xs text-gray-600">
              Atual: R$ {{ c.expense_curr | number:'1.2-2' }} · Mês anterior: R$ {{ c.expense_prev | number:'1.2-2' }}
            </div>
          </div>
          <div *ngIf="!topIncreases.length" class="rounded border bg-gray-50 p-4 text-center text-brand-muted">
            Sem aumentos relevantes
          </div>
        </div>
      </div>

      <div class="rounded-xl bg-white p-6 shadow">
        <div class="mb-2 text-sm font-medium text-gray-700">Maiores reduções por categoria</div>
        <div class="space-y-2">
          <div *ngFor="let c of topDecreases" class="rounded border bg-emerald-50 p-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="font-medium text-emerald-700">{{ c.category_name }}</span>
              <span class="text-emerald-700">-R$ {{ abs(c.delta) | number:'1.2-2' }}</span>
            </div>
            <div class="text-xs text-gray-600">
              Atual: R$ {{ c.expense_curr | number:'1.2-2' }} · Mês anterior: R$ {{ c.expense_prev | number:'1.2-2' }}
            </div>
          </div>
          <div *ngIf="!topDecreases.length" class="rounded border bg-gray-50 p-4 text-center text-brand-muted">
            Sem reduções relevantes
          </div>
        </div>
      </div>
    </div>

    <!-- Sugestões por categoria -->
    <div class="rounded-xl bg-white p-6 shadow">
      <div class="mb-2 text-sm font-medium text-gray-700">Sugestões</div>
      <ul class="space-y-2">
        <li *ngFor="let s of suggestions" class="rounded-lg border bg-gray-50 px-3 py-2 text-sm">
          <span class="font-medium">{{ s.category_name }}:</span> {{ s.suggestion }}
          <span class="text-xs text-gray-600"> (Δ R$ {{ s.delta | number:'1.2-2' }})</span>
        </li>
        <li *ngIf="!suggestions.length" class="rounded-lg border bg-gray-50 px-3 py-4 text-center text-brand-muted">
          Sem sugestões no momento.
        </li>
      </ul>
    </div>

    <!-- ===== Metas: KPIs, Riscos e Sugestões ===== -->
    <div class="rounded-xl bg-white p-6 shadow space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-sm font-medium text-gray-700">Metas — Resumo</div>
          <p class="text-xs text-gray-500">Aportes, risco e projeções</p>
        </div>
        <a class="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50" [routerLink]="['/goals']">Ver metas</a>
      </div>

      <!-- KPIs de metas -->
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg border bg-gray-50 p-4">
          <div class="text-xs text-gray-500">Contribuído no mês</div>
          <div class="mt-1 text-lg font-semibold text-emerald-700">
            {{ goalsKpis.contributedThisMonth | currency:'BRL':'symbol-narrow':'1.0-0' }}
          </div>
        </div>
        <div class="rounded-lg border bg-gray-50 p-4">
          <div class="text-xs text-gray-500">Valor restante total</div>
          <div class="mt-1 text-lg font-semibold text-gray-800">
            {{ goalsKpis.remainingTotal | currency:'BRL':'symbol-narrow':'1.0-0' }}
          </div>
        </div>
        <div class="rounded-lg border bg-gray-50 p-4">
          <div class="text-xs text-gray-500">Metas em risco</div>
          <div class="mt-1 text-lg font-semibold" [class.text-rose-700]="goalsKpis.atRiskCount>0">
            {{ goalsKpis.atRiskCount }}
          </div>
        </div>
        <div class="rounded-lg border bg-gray-50 p-4">
          <div class="text-xs text-gray-500">ETA médio (sem prazo)</div>
          <div class="mt-1 text-lg font-semibold text-gray-800">
            {{ goalsKpis.avgEtaMonths }} meses
          </div>
        </div>
      </div>

      <!-- Metas em risco -->
      <div>
        <div class="mb-2 text-sm font-medium text-gray-700">Metas em risco</div>
        <div class="space-y-2">
          <div
            *ngFor="let r of goalsAtRisk"
            class="rounded border p-3 text-sm"
            [ngClass]="{
              'bg-rose-50 border-rose-200': r.reason==='overdue',
              'bg-amber-50 border-amber-200': r.reason==='shortfall',
              'bg-gray-50 border-gray-200': r.reason==='inactive'
            }">
            <div class="flex items-center justify-between">
              <div class="font-medium">{{ r.title }}</div>
              <span class="text-[11px] px-2 py-0.5 rounded-full ring-1"
                    [ngClass]="{
                      'bg-rose-100 text-rose-700 ring-rose-200': r.reason==='overdue',
                      'bg-amber-100 text-amber-700 ring-amber-200': r.reason==='shortfall',
                      'bg-gray-100 text-gray-700 ring-gray-200': r.reason==='inactive'
                    }">
                {{ r.reason === 'overdue' ? 'atrasada' : r.reason === 'shortfall' ? 'abaixo do ritmo' : 'sem aporte' }}
              </span>
            </div>
            <div class="mt-1 text-xs text-gray-600">
              Restante: {{ r.remaining | currency:'BRL':'symbol-narrow':'1.0-0' }}
              <span *ngIf="r.due_date">• prazo: {{ r.due_date | date:'dd/MM/yyyy' }}</span>
              <span *ngIf="r.needPerMonth">• necessário/mês: {{ r.needPerMonth | currency:'BRL':'symbol-narrow':'1.0-0' }}</span>
              <span *ngIf="r.avgPerMonth">• média/mês: {{ r.avgPerMonth | currency:'BRL':'symbol-narrow':'1.0-0' }}</span>
              <span *ngIf="r.lastContributionAt">• último aporte: {{ r.lastContributionAt | date:'dd/MM' }}</span>
            </div>
          </div>

          <div *ngIf="!goalsAtRisk.length" class="rounded border bg-emerald-50 p-4 text-center text-sm text-emerald-700">
            Nenhuma meta em risco no momento. 🎯
          </div>
        </div>
      </div>

      <!-- Sugestões específicas de metas -->
      <div>
        <div class="mb-2 text-sm font-medium text-gray-700">Sugestões para metas</div>
        <ul class="space-y-2">
          <li *ngFor="let s of goalSuggestions" class="rounded border bg-gray-50 px-3 py-2 text-sm">
            <span class="font-medium">{{ s.title }}:</span> {{ s.suggestion }}
          </li>
          <li *ngIf="!goalSuggestions.length" class="rounded border bg-gray-50 p-4 text-center text-brand-muted">
            Sem sugestões específicas agora.
          </li>
        </ul>
      </div>
    </div>
  </div>
  `,
})
export class InsightsPageComponent implements OnInit {
  month = new Date().toISOString().slice(0,7); // YYYY-MM

  // existentes
  messages: string[] = [];
  topIncreases: CategoryDelta[] = [];
  topDecreases: CategoryDelta[] = [];
  suggestions: Array<{category_name:string; suggestion:string; delta:number; expense_curr:number; expense_prev:number}> = [];

  // metas
  goalsKpis: GoalKpis = { contributedThisMonth: 0, remainingTotal: 0, atRiskCount: 0, avgEtaMonths: 0 };
  goalsAtRisk: GoalRiskItem[] = [];
  goalSuggestions: GoalSuggestion[] = [];

  constructor(private insights: InsightsService) {}

  async ngOnInit() { await this.reload(); }

  async reload() {
    const monthISO = `${this.month}-01`;

    // --- Insights gerais
    const overview = await this.insights.overview(monthISO);
    const cats = await this.insights.categoryDeltas(monthISO);
    this.messages = this.insights.generateMessages(overview, cats);
    this.topIncreases = cats.filter(c => (c.delta ?? 0) > 0).sort((a,b)=>b.delta-a.delta).slice(0,5);
    this.topDecreases = cats.filter(c => (c.delta ?? 0) < 0).sort((a,b)=>a.delta-b.delta).slice(0,5);
    const sug = await this.insights.suggestions(monthISO);
    this.suggestions = sug.filter((s:any) => s.suggestion && s.suggestion !== 'Sem mudança relevante.')
      .map((s:any) => ({ category_name: s.category_name, suggestion: s.suggestion, delta: s.delta, expense_curr: s.expense_curr, expense_prev: s.expense_prev }));

    // --- Insights de metas (via service)
    const goals = await this.insights.goalsOverview(monthISO);
    if (goals) {
      this.goalsKpis = goals.kpis;
      this.goalsAtRisk = goals.atRisk;
      this.goalSuggestions = goals.suggestions;
    } else {
      // fallback (zera)
      this.goalsKpis = { contributedThisMonth: 0, remainingTotal: 0, atRiskCount: 0, avgEtaMonths: 0 };
      this.goalsAtRisk = [];
      this.goalSuggestions = [];
    }
  }

  abs(value: number): number {
    return Math.abs(value);
  }
}
