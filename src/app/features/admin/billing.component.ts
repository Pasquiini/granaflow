import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
} from 'rxjs';
import {
  AdminBillingService,
  AdminPaymentRow,
  AdminPaymentsPage,
} from '../../core/services/admin-billing.service';
import { PaymentDetailDialogComponent } from './payment-detail-dialog.component';

@Component({
  selector: 'app-admin-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, PaymentDetailDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="p-6">
      <div class="flex items-end justify-between gap-3 mb-4">
        <div>
          <h1 class="text-2xl font-bold text-emerald-700">Cobranças e Pagamentos</h1>
          <p class="text-slate-600">Transações registradas (public.payments).</p>
        </div>
        <div class="text-sm text-slate-500" *ngIf="vm$ | async as vm">
          {{ vm.total }} registro(s)
        </div>
      </div>

      <!-- filtros -->
      <div class="flex flex-wrap gap-2 mb-4">
        <input
          class="flex-1 min-w-[220px] rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
          type="search"
          placeholder="Buscar por ID ou e-mail..."
          [(ngModel)]="search"
          (ngModelChange)="onSearchChange($event)"
        />

        <select
          class="rounded-lg border border-slate-300 px-2 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
          [(ngModel)]="status"
          (change)="goToPage(1)"
        >
          <option value="">Status: todos</option>
          <option value="approved">approved</option>
          <option value="paid">paid</option>
          <option value="succeeded">succeeded</option>
          <option value="pending">pending</option>
          <option value="failed">failed</option>
          <option value="refunded">refunded</option>
        </select>

        <input
          class="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
          type="date"
          [(ngModel)]="dateFrom"
          (change)="onDateChange()"
          aria-label="Data inicial"
        />
        <input
          class="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
          type="date"
          [(ngModel)]="dateTo"
          (change)="onDateChange()"
          aria-label="Data final"
        />

        <button
          class="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-50"
          (click)="clearDates()"
        >
          Limpar período
        </button>

        <select
          class="ml-auto rounded-lg border border-slate-300 px-2 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
          [(ngModel)]="pageSize"
          (change)="goToPage(1)"
        >
          <option [ngValue]="10">10</option>
          <option [ngValue]="20">20</option>
          <option [ngValue]="50">50</option>
        </select>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-slate-600">
            <tr>
              <th class="text-left px-4 py-2">ID</th>
              <th class="text-left px-4 py-2">E-mail</th>
              <th class="text-right px-4 py-2">Valor</th>
              <th class="text-left px-4 py-2">Status</th>
              <th class="text-left px-4 py-2">Data</th>
              <th class="text-right px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr *ngFor="let p of (vm$ | async)?.items">
              <td class="px-4 py-2 font-mono text-xs text-slate-700">{{ p.id }}</td>
              <td class="px-4 py-2">{{ p.user_email || '—' }}</td>
              <td class="px-4 py-2 text-right">R$ {{ p.amount_brl | number:'1.2-2' }}</td>
              <td class="px-4 py-2">
                <span class="px-2 py-0.5 rounded-full text-xs" [ngClass]="badgeClass(p.status)">
                  {{ p.status || '—' }}
                </span>
              </td>
              <td class="px-4 py-2">{{ p.paid_at ? (p.paid_at | date:'short') : '—' }}</td>
              <td class="px-4 py-2 text-right">
                <button
                  class="px-2 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
                  (click)="openDetail(p)"
                >
                  Ver
                </button>
              </td>
            </tr>

            <tr *ngIf="(vm$ | async)?.items?.length === 0">
              <td colspan="6" class="px-4 py-6 text-center text-slate-500">
                Nenhum pagamento encontrado.
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
            (click)="prevPage()"
            [disabled]="currentPage <= 1"
          >
            Anterior
          </button>
          <button
            class="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            (click)="nextPage(vm.total)"
            [disabled]="currentPage >= totalPages(vm.total, pageSize)"
          >
            Próxima
          </button>
        </div>
      </div>
    </section>

    <!-- modal -->
    <app-payment-detail-dialog
      [open]="detailOpen"
      [payment]="selected"
      (closed)="detailOpen = false; selected = null"
    ></app-payment-detail-dialog>
  `,
})
export class BillingComponent {
  private svc = inject(AdminBillingService);

  // estado local (inputs)
  search = '';
  status = '';
  pageSize = 20;
  currentPage = 1;
  dateFrom = ''; // yyyy-MM-dd
  dateTo = '';   // yyyy-MM-dd

  // subjects reativos
  private search$ = new BehaviorSubject<string>('');
  private status$ = new BehaviorSubject<string>('');
  private paging$ = new BehaviorSubject<{ limit: number; offset: number }>({
    limit: this.pageSize,
    offset: 0,
  });
  private dateFrom$ = new BehaviorSubject<string>('');
  private dateTo$ = new BehaviorSubject<string>('');

  // view model
  vm$ = combineLatest([
    this.search$.pipe(debounceTime(250), distinctUntilChanged(), startWith('')),
    this.status$.pipe(distinctUntilChanged(), startWith('')),
    this.dateFrom$.pipe(distinctUntilChanged(), startWith('')),
    this.dateTo$.pipe(distinctUntilChanged(), startWith('')),
    this.paging$,
  ]).pipe(
    switchMap(([search, status, from, to, { limit, offset }]) =>
      this.svc.list$({ search, status, from, to, limit, offset })
    ),
    map((page: AdminPaymentsPage) => ({
      items: page.items,
      total: page.total,
    }))
  );

  // modal
  selected: AdminPaymentRow | null = null;
  detailOpen = false;
  openDetail(p: AdminPaymentRow) {
    this.selected = p;
    this.detailOpen = true;
  }

  // filtros
  onSearchChange(term: string) {
    this.currentPage = 1;
    this.search$.next(term ?? '');
    this.paging$.next({ limit: this.pageSize, offset: 0 });
  }

  onDateChange() {
    this.currentPage = 1;
    this.dateFrom$.next(this.dateFrom || '');
    this.dateTo$.next(this.dateTo || '');
    this.paging$.next({ limit: this.pageSize, offset: 0 });
  }

  clearDates() {
    this.dateFrom = '';
    this.dateTo = '';
    this.onDateChange();
  }

  // paginação
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

  // badge
  badgeClass(status: string | null) {
    const s = (status || '').toLowerCase();
    if (['approved', 'paid', 'succeeded'].includes(s))
      return 'bg-emerald-100 text-emerald-700';
    if (['pending', 'in_process'].includes(s))
      return 'bg-amber-100 text-amber-700';
    if (['failed', 'canceled', 'refunded', 'chargeback'].includes(s))
      return 'bg-red-100 text-red-700';
    return 'bg-slate-100 text-slate-700';
  }
}
