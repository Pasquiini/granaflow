import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryDelta, InsightsService } from '../../../core/services/insights.service';

@Component({
  standalone: true,
  selector: 'app-insights-page',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="space-y-4">
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

      <!-- Mensagens -->
      <ul class="mt-4 space-y-2">
        <li *ngFor="let m of messages" class="rounded-lg border bg-gray-50 px-3 py-2 text-sm">
          {{ m }}
        </li>
        <li *ngIf="!messages.length" class="rounded-lg border bg-gray-50 px-3 py-4 text-center text-brand-muted">
          Sem insights por enquanto.
        </li>
      </ul>
    </div>

    <!-- Top aumentos / reduções -->
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-xl bg-white p-6 shadow">
        <div class="mb-2 text-sm font-medium text-gray-700">Maiores aumentos por categoria</div>
        <div class="space-y-2">
          <div *ngFor="let c of topIncreases" class="rounded border bg-rose-50 p-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="font-medium text-rose-700">{{ c.category_name }}</span>
              <span class="text-rose-700">+R$ {{ c.delta | number:'1.2-2' }}</span>
            </div>
            <div class="text-xs text-gray-600">Atual: R$ {{ c.expense_curr | number:'1.2-2' }} · Mês anterior: R$ {{ c.expense_prev | number:'1.2-2' }}</div>
          </div>
          <div *ngIf="!topIncreases.length" class="rounded border bg-gray-50 p-4 text-center text-brand-muted">Sem aumentos relevantes</div>
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
            <div class="text-xs text-gray-600">Atual: R$ {{ c.expense_curr | number:'1.2-2' }} · Mês anterior: R$ {{ c.expense_prev | number:'1.2-2' }}</div>
          </div>
          <div *ngIf="!topDecreases.length" class="rounded border bg-gray-50 p-4 text-center text-brand-muted">Sem reduções relevantes</div>
        </div>
      </div>
    </div>

    <!-- Sugestões -->
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
  </div>
  `,
})
export class InsightsPageComponent implements OnInit {
  month = new Date().toISOString().slice(0,7); // YYYY-MM
  messages: string[] = [];
  topIncreases: CategoryDelta[] = [];
  topDecreases: CategoryDelta[] = [];
  suggestions: Array<{category_name:string; suggestion:string; delta:number; expense_curr:number; expense_prev:number}> = [];

  constructor(private insights: InsightsService) {}

  async ngOnInit() { await this.reload(); }

  async reload() {
    const monthISO = `${this.month}-01`;
    const overview = await this.insights.overview(monthISO);
    const cats = await this.insights.categoryDeltas(monthISO);
    this.messages = this.insights.generateMessages(overview, cats);

    this.topIncreases = cats.filter(c => (c.delta ?? 0) > 0).sort((a,b)=>b.delta-a.delta).slice(0,5);
    this.topDecreases = cats.filter(c => (c.delta ?? 0) < 0).sort((a,b)=>a.delta-b.delta).slice(0,5);

    // sugestões
    const sug = await this.insights.suggestions(monthISO);
    this.suggestions = sug.filter((s:any) => s.suggestion && s.suggestion !== 'Sem mudança relevante.')
      .map((s:any) => ({ category_name: s.category_name, suggestion: s.suggestion, delta: s.delta, expense_curr: s.expense_curr, expense_prev: s.expense_prev }));
  }

  abs(value: number): number {
    return Math.abs(value);
  }
}
