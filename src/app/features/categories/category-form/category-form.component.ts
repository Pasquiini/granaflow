import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriesService } from '../../../core/services/categories.service';
import type { Category, CategoryKind } from '../../../core/models/category.model';

@Component({
  standalone: true,
  selector: 'app-category-form',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="rounded-xl bg-white p-6 shadow max-w-xl">
    <h1 class="text-2xl font-semibold text-brand-primary">{{ isEdit ? 'Editar' : 'Nova' }} categoria</h1>
    <p class="text-sm text-brand-muted">Defina nome e tipo</p>

    <form class="mt-6 space-y-4" (ngSubmit)="submit()">
      <div>
        <label class="text-sm text-gray-600">Nome</label>
        <input class="mt-1 w-full rounded-lg border p-2" [(ngModel)]="name" name="name" required />
      </div>

      <div>
        <label class="text-sm text-gray-600">Tipo</label>
        <select class="mt-1 w-full rounded-lg border p-2" [(ngModel)]="kind" name="kind" required>
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </select>
      </div>

      <div class="flex items-center gap-3">
        <button class="rounded-lg bg-brand-primary px-4 py-2 text-white hover:opacity-95">{{ isEdit ? 'Salvar' : 'Criar' }}</button>
        <button type="button" (click)="cancel()" class="rounded-lg border px-4 py-2 hover:bg-gray-50">Cancelar</button>
        <button *ngIf="isEdit" type="button" (click)="remove()" class="ml-auto rounded-lg bg-red-600 px-4 py-2 text-white hover:opacity-95">Excluir</button>
      </div>

      <p *ngIf="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
    </form>
  </div>
  `,
})
export class CategoryFormComponent implements OnInit {
  isEdit = false;
  id = '';
  name = '';
  kind: CategoryKind = 'expense';
  error = '';

  constructor(private ar: ActivatedRoute, private router: Router, private svc: CategoriesService) {}

  async ngOnInit() {
    this.id = this.ar.snapshot.paramMap.get('id') ?? '';
    this.isEdit = !!this.id;
    if (this.isEdit) {
      const c = await this.svc.get(this.id);
      if (c) { this.name = c.name; this.kind = c.kind; }
    }
  }

  async submit() {
    try {
      if (this.isEdit) await this.svc.update(this.id, { name: this.name, kind: this.kind });
      else await this.svc.create({ name: this.name, kind: this.kind });
      this.router.navigate(['/categories']);
    } catch (e: any) { this.error = e.message ?? 'Erro ao salvar'; }
  }

  cancel() { this.router.navigate(['/categories']); }

  async remove() {
    if (!confirm('Excluir esta categoria?')) return;
    try { await this.svc.remove(this.id); this.router.navigate(['/categories']); }
    catch (e: any) { this.error = e.message ?? 'Erro ao excluir'; }
  }
}
