import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GoalsService } from '../../core/services/goals.service';
import { CurrencyMaskDirective } from '../../shared/directives/currency-mask.directive';

@Component({
  standalone: true,
  selector: 'app-goal-form',
  imports: [CommonModule, FormsModule, CurrencyMaskDirective],
  template: `
  <div class="max-w-xl mx-auto p-4">
    <h1 class="text-2xl font-semibold text-emerald-700 mb-4">Nova meta</h1>
    <form (ngSubmit)="save()" class="space-y-3">
      <div>
        <label class="text-sm text-slate-600">Título</label>
        <input [(ngModel)]="title" name="title" required
          class="w-full rounded-xl border p-2.5" placeholder="Ex.: Reserva de emergência" />
      </div>

      <div>
        <label class="text-sm text-slate-600">Descrição</label>
        <textarea [(ngModel)]="description" name="description" rows="3"
          class="w-full rounded-xl border p-2.5" placeholder="Detalhes..."></textarea>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-sm text-slate-600">Valor alvo</label>
          <input
            currencyMask
            [locale]="'pt-BR'"
            [currency]="'BRL'"
            [(ngModel)]="target_amount"
            name="target_amount"
            required
            class="w-full rounded-xl border p-2.5"
            placeholder="R$ 0,00"
          />
        </div>
        <div>
          <label class="text-sm text-slate-600">Prazo (opcional)</label>
          <input [(ngModel)]="due_date" name="due_date" type="date"
            class="w-full rounded-xl border p-2.5" />
        </div>
      </div>

      <div>
        <label class="text-sm text-slate-600">Categoria (opcional)</label>
        <input [(ngModel)]="category" name="category"
          class="w-full rounded-xl border p-2.5" placeholder="Viagem, Reserva..." />
      </div>

      <div class="flex gap-2 pt-2">
        <button class="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm">Salvar</button>
        <button type="button" (click)="cancel()" class="rounded-xl border px-4 py-2 text-sm">Cancelar</button>
      </div>
    </form>
  </div>
  `
})
export class GoalFormComponent {
  title = '';
  description = '';
  category = '';
  target_amount: number | null = null;   // agora o ngModel recebe número da directive
  due_date?: string;

  constructor(private goals: GoalsService, private router: Router) {}

  async save() {
    const payload = {
      title: this.title.trim(),
      description: this.description?.trim() || null,
      category: this.category?.trim() || null,
      target_amount: this.target_amount ?? 0,  // já é number
      due_date: this.due_date || null,
    };
    const g = await this.goals.create(payload as any);
    this.router.navigate(['/goals', g.id]);
  }
  cancel() { history.back(); }
}
