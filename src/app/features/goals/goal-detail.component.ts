import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GoalsService } from '../../core/services/goals.service';
import type { Goal } from '../../core/models/goal.model';
import type { GoalContribution } from '../../core/models/goal-contribution.model';
import { CurrencyMaskDirective } from '../../shared/directives/currency-mask.directive';

@Component({
  standalone: true,
  selector: 'app-goal-detail',
  imports: [CommonModule, FormsModule, CurrencyMaskDirective],
  template: `
  <div class="max-w-3xl mx-auto p-4" *ngIf="goal">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-emerald-700">{{ goal.title }}</h1>
      <span class="text-xs px-2 py-0.5 rounded-full"
        [ngClass]="{
          'bg-green-100 text-green-700 ring-1 ring-green-200': goal.status==='done',
          'bg-amber-100 text-amber-700 ring-1 ring-amber-200': goal.status==='overdue',
          'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200': goal.status==='active'
        }">{{ goal.status }}</span>
    </div>

    <p class="text-sm text-slate-600 mt-1">{{ goal.description }}</p>

    <div class="mt-4">
      <div class="h-2 w-full rounded-lg bg-emerald-100 overflow-hidden">
        <div class="h-2 bg-emerald-500" [style.width.%]="progress(goal)"></div>
      </div>
      <div class="mt-1 text-sm text-slate-700">
        {{ goal.current_amount | currency:'BRL':'symbol-narrow':'1.0-0' }} /
        {{ goal.target_amount | currency:'BRL':'symbol-narrow':'1.0-0' }}
        <span *ngIf="goal.due_date">• até {{ goal.due_date | date:'dd/MM/yyyy' }}</span>
      </div>
    </div>

    <!-- Adicionar contribuição -->
    <form (ngSubmit)="add()" class="mt-5 flex gap-2 items-end">
      <div class="flex-1">
        <label class="text-sm text-slate-600">Adicionar valor</label>
        <input
          currencyMask
          [locale]="'pt-BR'"
          [currency]="'BRL'"
          [(ngModel)]="amount"
          name="amount"
          required
          class="w-full rounded-xl border p-2.5"
          placeholder="R$ 0,00"
        />
      </div>
      <div class="flex-[2]">
        <label class="text-sm text-slate-600">Nota (opcional)</label>
        <input [(ngModel)]="note" name="note"
               class="w-full rounded-xl border p-2.5" placeholder="ex.: transferência 10/10" />
      </div>
      <button class="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm">Adicionar</button>
    </form>

    <h2 class="mt-6 font-semibold text-emerald-700">Histórico</h2>
    <ul class="divide-y">
      <li *ngFor="let c of contributions" class="py-2 flex items-center justify-between">
        <div class="text-sm">
          <div class="font-medium">{{ c.amount | currency:'BRL' }}</div>
          <div class="text-slate-600">{{ c.note || '—' }}</div>
        </div>
        <div class="text-xs text-slate-500">{{ c.created_at | date:'dd/MM/yyyy HH:mm' }}</div>
      </li>
    </ul>
  </div>
  `
})
export class GoalDetailComponent implements OnInit {
  goal!: Goal;
  contributions: GoalContribution[] = [];
  amount: number | null = null;   // agora recebe número da directive
  note = '';

  constructor(private route: ActivatedRoute, private goals: GoalsService) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.goal = await this.goals.get(id);
    this.contributions = await this.goals.listContributions(id);
  }

  progress(g: Goal) {
    return Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
  }

  async add() {
    const id = this.goal.id;
    await this.goals.addContribution(id, this.amount ?? 0, this.note?.trim() || undefined);
    // refresh
    this.goal = await this.goals.get(id);
    this.contributions = await this.goals.listContributions(id);
    this.amount = null;
    this.note = '';
  }
}
