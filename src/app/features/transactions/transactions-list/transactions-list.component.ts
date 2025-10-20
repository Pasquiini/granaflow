import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TransactionsService } from '../../../core/services/transactions.service';
import type { Transaction, TransactionWithRelations } from '../../../core/models/transaction.model';
import { SupabaseService } from '../../../core/services/supabase.service';
import { saveAs } from 'file-saver';

// helper — início do mês
function firstDayOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

@Component({
  standalone: true,
  selector: 'app-transactions-list',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
  <div class="rounded-xl bg-white p-6 shadow">
    <!-- Cabeçalho -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
      <div>
        <h1 class="text-2xl font-semibold text-brand-primary">Transações</h1>
        <p class="text-sm text-brand-muted">Lançamentos do mês</p>
      </div>

      <div class="flex items-center gap-3">
        <button
          (click)="exportCsv()"
          class="rounded-lg bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 transition">
          Exportar CSV
        </button>
        <a routerLink="/transactions/new"
          class="rounded-lg bg-brand-primary px-4 py-2 text-white hover:opacity-95">
          Nova
        </a>
      </div>
    </div>

    <!-- Filtro -->
    <div class="mt-2 flex items-center gap-2">
      <label class="text-sm text-gray-600">Mês:</label>
      <input type="month" class="rounded-lg border p-2 text-sm"
             [(ngModel)]="monthInput" (change)="reload()" />
    </div>

    <!-- Totais -->
    <div class="mt-4 flex flex-wrap gap-4 text-sm">
      <div class="rounded-lg border bg-gray-50 px-3 py-2">
        Receitas:
        <span class="font-semibold text-emerald-700">
          R$ {{ incomeTotal | number:'1.2-2' }}
        </span>
      </div>
      <div class="rounded-lg border bg-gray-50 px-3 py-2">
        Despesas:
        <span class="font-semibold text-red-700">
          R$ {{ expenseTotal | number:'1.2-2' }}
        </span>
      </div>
      <div class="rounded-lg border bg-gray-50 px-3 py-2">
        Saldo mês:
        <span class="font-semibold"
              [class.text-emerald-700]="incomeTotal >= expenseTotal"
              [class.text-red-700]="incomeTotal < expenseTotal">
          R$ {{ (incomeTotal - expenseTotal) | number:'1.2-2' }}
        </span>
      </div>
    </div>

    <!-- Tabela -->
    <div class="mt-4 overflow-x-auto">
      <table class="min-w-full border-separate border-spacing-y-2">
        <thead>
          <tr class="text-left text-xs uppercase text-gray-500">
            <th class="px-3 py-2">Data</th>
            <th class="px-3 py-2">Descrição</th>
            <th class="px-3 py-2">Tipo</th>
            <th class="px-3 py-2">Conta</th>
            <th class="px-3 py-2 text-right">Valor</th>
            <th class="px-3 py-2 w-20"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let t of list" class="rounded-xl bg-gray-50">
            <td class="px-3 py-2">{{ t.occurred_at }}</td>
            <td class="px-3 py-2">{{ t.description || '-' }}</td>
            <td class="px-3 py-2 capitalize">
              {{ t.type === 'income' ? 'Receita' : 'Despesa' }}
            </td>
            <td class="px-3 py-2">{{ t.account?.name | slice:0:8 }}…</td>
            <td class="px-3 py-2 text-right"
                [class.text-red-700]="t.type==='expense'"
                [class.text-emerald-700]="t.type==='income'">
              {{ (t.type==='expense' ? -t.amount : t.amount)
                 | currency:'BRL':'symbol-narrow':'1.2-2' }}
            </td>
            <td class="px-3 py-2 text-right">
              <a [routerLink]="['/transactions', t.id]"
                 class="text-brand-primary underline text-sm">Editar</a>
            </td>
          </tr>

          <tr *ngIf="!loading && list.length === 0">
            <td colspan="6" class="px-3 py-8 text-center text-brand-muted">
              Sem lançamentos neste mês
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `,
})
export class TransactionsListComponent implements OnInit {
  list: TransactionWithRelations[] = [];
  loading = true;
  monthInput = new Date().toISOString().slice(0, 7); // YYYY-MM
  incomeTotal = 0;
  expenseTotal = 0;

  constructor(
    private svc: TransactionsService,
    private supa: SupabaseService
  ) {}

  async ngOnInit() {
    await this.reload();
  }

  async reload() {
    this.loading = true;
    const monthISO = `${this.monthInput}-01`;
    this.list = await this.svc.listByMonth(monthISO);
    this.incomeTotal = this.list
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + Number(t.amount), 0);
    this.expenseTotal = this.list
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount), 0);
    this.loading = false;
  }

  /** Exporta CSV via Supabase RPC */
  async exportCsv() {
    try {
      const [y, m] = this.monthInput.split('-').map(Number);
      const start = new Date(y, m - 1, 1).toISOString().slice(0, 10);
      const end = new Date(y, m, 0).toISOString().slice(0, 10);

      const { data, error } = await this.supa.client.rpc('export_transactions_csv', {
        p_start: start,
        p_end: end,
      });

      if (error) throw error;

      const csv = (data ?? '') as string;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `granaflow-transacoes-${start}.csv`);
    } catch (err: any) {
      console.error('Erro ao exportar CSV:', err.message || err);
      alert('Falha ao exportar CSV. Tente novamente.');
    }
  }
}
