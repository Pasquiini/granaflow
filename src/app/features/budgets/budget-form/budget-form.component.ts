import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BudgetsService } from '../../../core/services/budgets.service';
import { CategoriesService } from '../../../core/services/categories.service';
import type { Budget } from '../../../core/models/budget.model';
import type { Category } from '../../../core/models/category.model';

@Component({
  standalone: true,
  selector: 'app-budget-form',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="rounded-xl bg-white p-6 shadow max-w-xl">
    <h1 class="text-2xl font-semibold text-brand-primary">{{ isEdit ? 'Editar' : 'Novo' }} orçamento</h1>
    <p class="text-sm text-brand-muted">Defina o limite mensal para a categoria</p>

    <form class="mt-6 space-y-4" (ngSubmit)="submit()">
      <div>
        <label class="text-sm text-gray-600">Categoria (Despesa)</label>
        <select class="mt-1 w-full rounded-lg border p-2" [(ngModel)]="category_id" name="category_id" required>
          <option *ngFor="let c of cats" [value]="c.id">{{ c.name }}</option>
        </select>
      </div>

      <div>
        <label class="text-sm text-gray-600">Mês</label>
        <input type="month" class="mt-1 w-full rounded-lg border p-2" [(ngModel)]="month" name="month" required />
      </div>

      <div>
        <label class="text-sm text-gray-600">Limite (R$)</label>
        <input type="number" step="0.01" class="mt-1 w-full rounded-lg border p-2" [(ngModel)]="limit_amount" name="limit_amount" required />
      </div>

      <div class="flex items-center gap-3">
        <button class="rounded-lg bg-brand-primary px-4 py-2 text-white hover:opacity-95">
          {{ isEdit ? 'Salvar' : 'Criar' }}
        </button>
        <button type="button" (click)="cancel()" class="rounded-lg border px-4 py-2 hover:bg-gray-50">Cancelar</button>
        <button *ngIf="isEdit" type="button" (click)="remove()" class="ml-auto rounded-lg bg-red-600 px-4 py-2 text-white hover:opacity-95">Excluir</button>
      </div>

      <p *ngIf="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
    </form>
  </div>
  `,
})
export class BudgetFormComponent implements OnInit {
  isEdit = false;
  id = '';
  category_id = '';
  month = new Date().toISOString().slice(0,7);
  limit_amount = 0;
  error = '';
  cats: Category[] = [];

  constructor(private ar: ActivatedRoute, private router: Router, private svc: BudgetsService, private catsSvc: CategoriesService) {}

  async ngOnInit() {
    this.cats = await this.catsSvc.list('expense');
    this.id = this.ar.snapshot.paramMap.get('id') ?? '';
    this.isEdit = !!this.id;
    if (this.isEdit) {
      const b = await this.svc.get(this.id);
      if (b) {
        this.category_id = b.category_id;
        this.month = b.month.slice(0,7);
        this.limit_amount = Number(b.limit_amount);
      }
    }
  }

  async submit() {
    try {
      if (this.isEdit) {
        await this.svc.update(this.id, {
          category_id: this.category_id,
          month: `${this.month}-01`,
          limit_amount: this.limit_amount
        });
      } else {
        await this.svc.create({
          category_id: this.category_id,
          month: `${this.month}-01`,
          limit_amount: this.limit_amount
        });
      }
      this.router.navigate(['/budgets']);
    } catch (e: any) {
      this.error = e.message ?? 'Erro ao salvar orçamento';
    }
  }

  cancel() { this.router.navigate(['/budgets']); }

  async remove() {
    if (!confirm('Excluir este orçamento?')) return;
    try { await this.svc.remove(this.id); this.router.navigate(['/budgets']); }
    catch (e: any) { this.error = e.message ?? 'Erro ao excluir'; }
  }
}
