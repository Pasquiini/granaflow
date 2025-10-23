import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUsersService, AdminUsersPage } from '../../core/services/admin-users.service';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="p-6">
      <div class="flex items-end justify-between gap-3 mb-4">
        <div>
          <h1 class="text-2xl font-bold text-emerald-700">Gerenciamento de Usuários</h1>
          <p class="text-slate-600">Lista de usuários do sistema (auth.users).</p>
        </div>
        <div class="text-sm text-slate-500" *ngIf="vm$ | async as vm">
          {{ vm.total }} usuário(s)
        </div>
      </div>

      <div class="flex gap-2 mb-4">
        <input
          class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
          type="search" placeholder="Buscar por e-mail..."
          [(ngModel)]="search"
          (ngModelChange)="onSearchChange($event)"
        />
        <select
          class="rounded-lg border border-slate-300 px-2 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
          [(ngModel)]="pageSize" (change)="goToPage(1)">
          <option [ngValue]="10">10</option>
          <option [ngValue]="20">20</option>
          <option [ngValue]="50">50</option>
        </select>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-slate-600">
            <tr>
              <th class="text-left px-4 py-2">E-mail</th>
              <th class="text-left px-4 py-2">Criado em</th>
              <th class="text-left px-4 py-2">Último acesso</th>
              <th class="text-left px-4 py-2">Confirmado</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr *ngFor="let u of (vm$ | async)?.items">
              <td class="px-4 py-2">{{ u.email }}</td>
              <td class="px-4 py-2">{{ u.created_at | date:'short' }}</td>
              <td class="px-4 py-2">{{ u.last_sign_in_at ? (u.last_sign_in_at | date:'short') : '—' }}</td>
              <td class="px-4 py-2">
                <span class="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs" *ngIf="u.email_confirmed_at; else n">
                  confirmado
                </span>
                <ng-template #n>
                  <span class="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full text-xs">pendente</span>
                </ng-template>
              </td>
            </tr>

            <!-- vazio -->
            <tr *ngIf="(vm$ | async)?.items?.length === 0">
              <td class="px-4 py-6 text-center text-slate-500" colspan="4">
                Nenhum usuário encontrado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- paginação -->
      <div class="flex items-center justify-between mt-3 text-sm" *ngIf="vm$ | async as vm">
        <div class="text-slate-600">
          Página {{ currentPage }} de {{ totalPages(vm.total, pageSize) }}
        </div>
        <div class="flex gap-2">
          <button
            class="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            (click)="prevPage()" [disabled]="currentPage <= 1">Anterior</button>
          <button
            class="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            (click)="nextPage(vm.total)" [disabled]="currentPage >= totalPages(vm.total, pageSize)">Próxima</button>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  private svc = inject(AdminUsersService);

  // estado local
  search = '';
  pageSize = 20;
  currentPage = 1;

  // subjects reativos
  private search$ = new BehaviorSubject<string>('');
  private paging$ = new BehaviorSubject<{limit: number; offset: number}>({ limit: this.pageSize, offset: 0 });

  // VM combinando busca + paginação
  vm$ = combineLatest([
    this.search$.pipe(debounceTime(250), distinctUntilChanged(), startWith('')),
    this.paging$
  ]).pipe(
    switchMap(([search, { limit, offset }]) =>
      this.svc.list$(search, limit, offset)
    ),
    map((page: AdminUsersPage) => ({
      items: page.items,
      total: page.total
    }))
  );

  onSearchChange(term: string) {
    this.currentPage = 1;
    this.search$.next(term ?? '');
    this.paging$.next({ limit: this.pageSize, offset: 0 });
  }

  totalPages(total: number, size: number) {
    return Math.max(1, Math.ceil((total || 0) / (size || 1)));
    }

  goToPage(n: number) {
    this.currentPage = Math.max(1, n);
    const offset = (this.currentPage - 1) * this.pageSize;
    this.paging$.next({ limit: this.pageSize, offset });
  }

  prevPage() {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(total: number) {
    if (this.currentPage < this.totalPages(total, this.pageSize)) {
      this.goToPage(this.currentPage + 1);
    }
  }
}
