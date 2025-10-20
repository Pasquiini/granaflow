import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountsService } from '../../../core/services/accounts.service';
import type { Account } from '../../../core/models/account.model';

@Component({
  standalone: true,
  selector: 'app-accounts-list',
  imports: [CommonModule, RouterLink],
  template: `
  <div class="rounded-xl bg-white p-6 shadow">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-brand-primary">Contas</h1>
        <p class="text-sm text-brand-muted">Gerencie suas carteiras e bancos</p>
      </div>
      <a routerLink="/accounts/new"
         class="rounded-lg bg-brand-primary px-4 py-2 text-white hover:opacity-95">Nova conta</a>
    </div>

    <div class="mt-6 overflow-x-auto">
      <table class="min-w-full border-separate border-spacing-y-2">
        <thead>
          <tr class="text-left text-xs uppercase text-gray-500">
            <th class="px-3 py-2">Nome</th>
            <th class="px-3 py-2">Tipo</th>
            <th class="px-3 py-2 text-right">Saldo inicial</th>
            <th class="px-3 py-2 w-24"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let a of accounts" class="rounded-xl bg-gray-50">
            <td class="px-3 py-3 font-medium text-gray-800">{{ a.name }}</td>
<td class="px-3 py-3 text-gray-600">
  <span
    class="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
    [ngClass]="getTypeClasses(a.type)">
    {{ getAccountTypeLabel(a.type) }}
  </span>
</td>
            <td class="px-3 py-3 text-right">R$ {{ a.initial_balance | number:'1.2-2' }}</td>
            <td class="px-3 py-3 text-right">
              <a [routerLink]="['/accounts', a.id]" class="text-brand-primary underline">Editar</a>
            </td>
          </tr>
          <tr *ngIf="!loading && accounts.length === 0">
            <td colspan="4" class="px-3 py-8 text-center text-brand-muted">Nenhuma conta ainda</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `,
})
export class AccountsListComponent implements OnInit {
  accounts: Account[] = [];
  loading = true;

  constructor(private accountsSvc: AccountsService) { }
  async ngOnInit() {
    this.accounts = await this.accountsSvc.list();
    this.loading = false;
  }

  getAccountTypeLabel(type: unknown): string {
  const key = String(type);
  const map: Record<string, string> = {
    bank: 'Banco',
    wallet: 'Carteira',
    credit: 'Crédito',
    investment: 'Investimento',
    other: 'Outro',
    checking: 'Conta Corrente',
    savings: 'Poupança',
    cash: 'Dinheiro',
  };
  return map[key] || '—';
}

  getTypeClasses(type: unknown): Record<string, boolean> {
  const t = String(type);
  return {
    'bg-blue-100 text-blue-700': t === 'bank',
    'bg-emerald-100 text-emerald-700': t === 'wallet',
    'bg-purple-100 text-purple-700': t === 'credit'
  };
}
}
