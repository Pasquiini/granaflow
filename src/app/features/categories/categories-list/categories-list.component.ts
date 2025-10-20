import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoriesService } from '../../../core/services/categories.service';
import type { Category, CategoryKind } from '../../../core/models/category.model';

@Component({
  standalone: true,
  selector: 'app-categories-list',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
  <div class="rounded-xl bg-white p-6 shadow">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-brand-primary">Categorias</h1>
        <p class="text-sm text-brand-muted">Organize despesas e receitas</p>
      </div>
      <a routerLink="/categories/new" class="rounded-lg bg-brand-primary px-4 py-2 text-white hover:opacity-95">Nova categoria</a>
    </div>

    <div class="mt-4 flex items-center gap-2">
      <label class="text-sm text-gray-600">Tipo:</label>
      <select class="rounded-lg border p-2 text-sm" [(ngModel)]="filterKind" (ngModelChange)="load()">
        <option value="">Todas</option>
        <option value="expense">Despesas</option>
        <option value="income">Receitas</option>
      </select>
    </div>

    <div class="mt-4 grid gap-2">
      <div *ngFor="let c of categories"
           class="flex items-center justify-between rounded-lg border bg-gray-50 px-3 py-2">
        <div>
          <div class="font-medium text-gray-800">{{ c.name }}</div>
          <div class="text-xs text-gray-500">{{ c.kind }}</div>
        </div>
        <a [routerLink]="['/categories', c.id]" class="text-brand-primary underline text-sm">Editar</a>
      </div>

      <div *ngIf="!loading && categories.length===0" class="py-8 text-center text-brand-muted">
        Nenhuma categoria
      </div>
    </div>
  </div>
  `,
})
export class CategoriesListComponent implements OnInit {
  categories: Category[] = [];
  loading = true;
  filterKind: '' | CategoryKind = '';

  constructor(private svc: CategoriesService) {}
  async ngOnInit() { await this.load(); }

  async load() {
    this.loading = true;
    this.categories = await this.svc.list(this.filterKind || undefined);
    this.loading = false;
  }
}
