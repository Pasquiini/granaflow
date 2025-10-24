import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GoalsService } from '../../core/services/goals.service';
import type { Goal } from '../../core/models/goal.model';

@Component({
  standalone: true,
  selector: 'app-goals-list',
  imports: [CommonModule, RouterLink],
  template: `
  <div class="max-w-4xl mx-auto p-4">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold text-emerald-700">Metas</h1>
      <a routerLink="/goals/new"
         class="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm shadow hover:bg-emerald-700">
        Nova meta
      </a>
    </div>

    <div class="grid sm:grid-cols-2 gap-3" *ngIf="!loading">
      <article *ngFor="let g of goals"
        class="rounded-2xl border border-emerald-200/60 bg-white/70 p-4 shadow-sm">
        <!-- Tornamos o card clicável, mas bloqueamos cliques nos botões com $event.stopPropagation() -->
        <a [routerLink]="['/goals', g.id]" class="block">
          <div class="flex items-start justify-between">
            <h2 class="font-semibold text-emerald-800 truncate">{{ g.title }}</h2>

            <span class="text-xs px-2 py-0.5 rounded-full"
              [ngClass]="{
                'bg-green-100 text-green-700 ring-1 ring-green-200': g.status==='done',
                'bg-amber-100 text-amber-700 ring-1 ring-amber-200': g.status==='overdue',
                'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200': g.status==='active',
                'bg-slate-100 text-slate-700 ring-1 ring-slate-200': g.status==='paused'
              }">{{ g.status }}</span>
          </div>

          <p class="text-sm text-slate-600 mt-1 line-clamp-2">{{ g.description }}</p>

          <div class="mt-3">
            <div class="h-2 w-full rounded-lg bg-emerald-100 overflow-hidden">
              <div class="h-2"
                   [ngClass]="g.status==='paused' ? 'bg-slate-300' : 'bg-emerald-500'"
                   [style.width.%]="progress(g)"></div>
            </div>
            <div class="mt-1 text-xs text-slate-600">
              {{ g.current_amount | currency:'BRL':'symbol-narrow':'1.0-0' }} /
              {{ g.target_amount | currency:'BRL':'symbol-narrow':'1.0-0' }}
              <span *ngIf="g.due_date">• até {{ g.due_date | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>
        </a>

        <!-- Ações -->
        <div class="mt-3 flex items-center gap-2">
          <button
            class="rounded-lg border px-3 py-1 text-sm"
            [class.opacity-60]="isBusy(g.id)"
            [disabled]="isBusy(g.id)"
            (click)="onTogglePause(g, $event)">
            <span *ngIf="g.status !== 'paused'; else retomarTpl">Pausar</span>
            <ng-template #retomarTpl>Retomar</ng-template>
          </button>

          <button
            class="rounded-lg border border-rose-300 text-rose-700 px-3 py-1 text-sm hover:bg-rose-50"
            [class.opacity-60]="isBusy(g.id)"
            [disabled]="isBusy(g.id)"
            (click)="onDelete(g, $event)">
            Excluir
          </button>

          <span class="text-xs text-slate-500 ml-auto" *ngIf="isBusy(g.id)">processando…</span>
        </div>
      </article>
    </div>

    <p *ngIf="!loading && goals.length === 0" class="text-sm text-slate-600 mt-8">
      Sem metas ainda. Que tal criar a primeira?
    </p>
  </div>
  `
})
export class GoalsListComponent implements OnInit {
  goals: Goal[] = [];
  loading = true;

  private busy = new Set<string>();

  constructor(private goalsSvc: GoalsService) {}

  async ngOnInit() {
    try {
      this.goals = await this.goalsSvc.list();
    } finally {
      this.loading = false;
    }
  }

  progress(g: Goal) {
    return Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
  }

  isBusy(id: string) {
    return this.busy.has(id);
  }

  async onTogglePause(g: Goal, ev: MouseEvent) {
    ev.stopPropagation();
    ev.preventDefault();

    this.busy.add(g.id);
    const original = g.status;

    try {
      if (g.status === 'paused') {
        await this.goalsSvc.setStatus(g.id, 'active');
        g.status = 'active';
      } else {
        await this.goalsSvc.setStatus(g.id, 'paused');
        g.status = 'paused';
      }
    } catch (e) {
      g.status = original;
      console.error(e);
      alert('Não foi possível atualizar o status da meta.');
    } finally {
      this.busy.delete(g.id);
    }
  }

  async onDelete(g: Goal, ev: MouseEvent) {
    ev.stopPropagation();
    ev.preventDefault();

    if (!confirm(`Excluir a meta "${g.title}"? Esta ação não poderá ser desfeita.`)) return;

    this.busy.add(g.id);
    const idx = this.goals.findIndex(x => x.id === g.id);
    const removed = this.goals.splice(idx, 1)[0];

    try {
      await this.goalsSvc.delete(g.id);
    } catch (e) {
      this.goals.splice(idx, 0, removed);
      console.error(e);
      alert('Não foi possível excluir a meta.');
    } finally {
      this.busy.delete(g.id);
    }
  }
}
