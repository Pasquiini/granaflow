import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountsService } from '../../../core/services/accounts.service';
import type { Account, AccountType } from '../../../core/models/account.model';
import { CurrencyMaskDirective } from '../../../shared/directives/currency-mask.directive';

@Component({
  standalone: true,
  selector: 'app-account-form',
  imports: [CommonModule, FormsModule, CurrencyMaskDirective],
  template: `
  <div class="rounded-xl bg-white p-6 shadow">
    <h1 class="text-2xl font-semibold text-brand-primary">
      {{ isEdit ? 'Editar conta' : 'Nova conta' }}
    </h1>
    <p class="text-sm text-brand-muted">Defina nome, tipo e saldo inicial</p>

    <form class="mt-6 max-w-lg space-y-4" (ngSubmit)="submit()">
      <div>
        <label class="text-sm text-gray-600">Nome</label>
        <input class="mt-1 w-full rounded-lg border p-2" [(ngModel)]="name" name="name" required />
      </div>

      <div>
        <label class="text-sm text-gray-600">Tipo</label>
        <select class="mt-1 w-full rounded-lg border p-2" [(ngModel)]="type" name="type" required>
          <option value="cash">Dinheiro</option>
          <option value="checking">Conta corrente</option>
          <option value="savings">Poupança</option>
          <option value="credit">Cartão de crédito</option>
        </select>
      </div>

      <div>
        <label class="text-sm text-gray-600">Saldo inicial</label>
        <input
          class="mt-1 w-full rounded-lg border p-2"
          type="text"
          name="initial_balance"
          [(ngModel)]="initial_balance"
          currencyMask
          [locale]="'pt-BR'"
          [currency]="'BRL'"
          [allowNegative]="type === 'credit'"
        />
      </div>

      <div class="flex items-center gap-3">
        <button class="rounded-lg bg-brand-primary px-4 py-2 text-white hover:opacity-95">
          {{ isEdit ? 'Salvar' : 'Criar' }}
        </button>
        <button type="button" (click)="cancel()" class="rounded-lg border px-4 py-2 hover:bg-gray-50">Cancelar</button>
        <button *ngIf="isEdit" type="button" (click)="remove()" class="ml-auto rounded-lg bg-red-600 px-4 py-2 text-white hover:opacity-95">Excluir</button>
      </div>

      <p *ngIf="error" class="text-sm text-red-600 mt-2">{{ error }}</p>
    </form>
  </div>
  `,
})
export class AccountFormComponent implements OnInit {
  isEdit = false;
  id = '';
  name = '';
  type: AccountType = 'checking';
  initial_balance = 0;
  error = '';

  constructor(private ar: ActivatedRoute, private router: Router, private accounts: AccountsService) {}

  async ngOnInit() {
    this.id = this.ar.snapshot.paramMap.get('id') ?? '';
    this.isEdit = !!this.id;
    if (this.isEdit) {
      const acc = await this.accounts.get(this.id);
      if (acc) {
        this.name = acc.name;
        this.type = acc.type;
        this.initial_balance = Number(acc.initial_balance);
      }
    }
  }

  async submit() {
    try {
      if (this.isEdit) {
        await this.accounts.update(this.id, {
          name: this.name,
          type: this.type,
          initial_balance: Number(this.initial_balance),
        });
      } else {
        await this.accounts.create({
          name: this.name,
          type: this.type,
          initial_balance: Number(this.initial_balance),
        });
      }
      this.router.navigate(['/accounts']);
    } catch (e: any) {
      this.error = e.message ?? 'Erro ao salvar conta';
    }
  }

  cancel() { this.router.navigate(['/accounts']); }

  async remove() {
    if (!confirm('Excluir esta conta?')) return;
    try {
      await this.accounts.remove(this.id);
      this.router.navigate(['/accounts']);
    } catch (e: any) {
      this.error = e.message ?? 'Erro ao excluir';
    }
  }
}
