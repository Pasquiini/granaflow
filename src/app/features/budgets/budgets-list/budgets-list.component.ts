import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BudgetsService } from '../../../core/services/budgets.service';
import { CategoriesService } from '../../../core/services/categories.service';
import type { BudgetStatus } from '../../../core/models/budget.model';
import type { Category } from '../../../core/models/category.model';

@Component({
  standalone: true,
  selector: 'app-budgets-list',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="rounded-xl bg-white p-6 shadow">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-brand-primary">Orçamentos</h1>
        <p class="text-sm text-brand-muted">Limites por categoria no mês</p>
      </div>
      <a routerLink="/budgets/new" class="rounded-lg bg-brand-primary px-4 py-2 text-white hover:opacity-95">Novo orçamento</a>
    </div>

    <div class="mt-4 flex items-center gap-2">
      <label class="text-sm text-gray-600">Mês:</label>
      <input type="month" class="rounded-lg border p-2 text-sm" [(ngModel)]="month" (change)="reload()" />
    </div>

    <div class="mt-4 grid gap-3">
      <div *ngFor="let b of list" class="rounded-lg border bg-gray-50 p-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-600">{{ name(b.category_id) }}</div>
            <div class="text-xs text-gray-500">{{ month }}</div>
          </div>
          <a [routerLink]="['/budgets', b.id]" class="text-brand-primary underline text-sm">Editar</a>
        </div>

        <div class="mt-3 h-2 w-full overflow-hidden rounded bg-white">
          <div class="h-full"
               [ngClass]="{
                 'bg-emerald-500': b.progress_ratio < 0.7,
                 'bg-yellow-500': b.progress_ratio >= 0.7 && b.progress_ratio < 1,
                 'bg-red-600': b.progress_ratio >= 1
               }"
               [style.width.%]="progress(b.progress_ratio)">
          </div>
        </div>

        <div class="mt-2 flex items-center justify-between text-sm">
          <div class="text-gray-600">Gasto: <span class="font-medium">R$ {{ b.spent | number:'1.2-2' }}</span></div>
          <div class="text-gray-600">Limite: <span class="font-medium">R$ {{ b.limit_amount | number:'1.2-2' }}</span></div>
        </div>
      </div>

      <div *ngIf="!loading && list.length===0" class="py-8 text-center text-brand-muted">
        Nenhum orçamento para este mês
      </div>
    </div>
  </div>
  `,
})
export class BudgetsListComponent implements OnInit {
  month = new Date().toISOString().slice(0, 7);
  list: BudgetStatus[] = [];
  cats: Category[] = [];
  loading = true;

  constructor(private svc: BudgetsService, private catsSvc: CategoriesService) { }
  async ngOnInit() {
    this.cats = await this.catsSvc.list('expense'); // orçamentos geralmente para despesas
    await this.reload();
  }
  async reload() {
    this.loading = true;
    this.list = await this.svc.listStatusByMonth(this.month);
    this.loading = false;
  }
  name(catId: string) {
    return this.cats.find(c => c.id === catId)?.name ?? 'Categoria';
  }

  progress(p: number) {
    return Math.min(p * 100, 100);
  }
}
