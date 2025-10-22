import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionsService } from '../../../core/services/transactions.service';
import { AccountsService } from '../../../core/services/accounts.service';
import { CategoriesService } from '../../../core/services/categories.service';
import type { Account } from '../../../core/models/account.model';
import type { Category } from '../../../core/models/category.model';
import type { Transaction, TxnType } from '../../../core/models/transaction.model';
import { CurrencyMaskDirective } from '../../../shared/directives/currency-mask.directive';

@Component({
  standalone: true,
  selector: 'app-transaction-form',
  imports: [CommonModule, FormsModule, CurrencyMaskDirective],
  template: `
    <div class="mx-auto max-w-3xl">
      <div class="rounded-2xl bg-white/80 shadow-xl ring-1 ring-gray-200 backdrop-blur p-6 md:p-8">
        <!-- header -->
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl font-semibold tracking-tight text-brand-primary">
              {{ isEdit ? 'Editar transação' : 'Nova transação' }}
            </h1>
            <p class="text-sm text-brand-muted">
              {{ isEdit ? 'Atualize os dados abaixo' : 'Preencha as informações da transação' }}
            </p>
          </div>
          <div class="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <span class="inline-flex items-center gap-1 rounded-full border px-2 py-1">Atalho:
              <kbd class="rounded border bg-gray-50 px-1">Ctrl</kbd>+
              <kbd class="rounded border bg-gray-50 px-1">S</kbd>
            </span>
          </div>
        </div>

        <form #f="ngForm" class="mt-6 space-y-6" (ngSubmit)="submit()" (keydown.control.s.prevent)="submit()">
          <!-- segmented type -->
          <div>
            <label class="mb-2 block text-sm text-gray-600">Tipo</label>
            <div class="grid grid-cols-3 overflow-hidden rounded-xl border bg-gray-50">
              <button type="button"
                class="px-3 py-2 text-sm transition
                       data-[active=true]:bg-white data-[active=true]:text-brand-primary
                       hover:bg-white"
                [attr.data-active]="type==='expense'"
                (click)="setType('expense')">
                Despesa
              </button>
              <button type="button"
                class="px-3 py-2 text-sm transition
                       data-[active=true]:bg-white data-[active=true]:text-green-600
                       hover:bg-white"
                [attr.data-active]="type==='income'"
                (click)="setType('income')">
                Receita
              </button>
              <button type="button"
                class="px-3 py-2 text-sm transition
                       data-[active=true]:bg-white data-[active=true]:text-indigo-600
                       hover:bg-white"
                [attr.data-active]="type==='transfer'"
                (click)="setType('transfer')">
                Transferência
              </button>
            </div>
          </div>

          <!-- grid -->
          <div class="grid gap-4 md:grid-cols-2">
            <!-- conta origem -->
            <div class="relative">
              <select
                class="peer w-full rounded-xl border bg-transparent px-3 py-3 outline-none
                       focus:ring-4 ring-brand-primary/10"
                [(ngModel)]="account_id" name="account_id" required>
                <option value="" disabled selected>Selecione</option>
                <option *ngFor="let a of accounts" [value]="a.id">{{ a.name }}</option>
              </select>
              <label class="pointer-events-none absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
                Conta
              </label>
              <small *ngIf="f.submitted && !account_id" class="mt-1 block text-xs text-red-600">Obrigatório</small>
            </div>

            <!-- conta destino -->
            <div class="relative" *ngIf="type==='transfer'">
              <select
                class="peer w-full rounded-xl border bg-transparent px-3 py-3 outline-none
                       focus:ring-4 ring-brand-primary/10"
                [(ngModel)]="transfer_account_id" name="transfer_account_id" required>
                <option value="" disabled selected>Selecione</option>
                <option *ngFor="let a of accounts" [value]="a.id">{{ a.name }}</option>
              </select>
              <label class="pointer-events-none absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
                Conta de destino
              </label>
              <small *ngIf="f.submitted && !transfer_account_id" class="mt-1 block text-xs text-red-600">Obrigatório</small>
            </div>

            <!-- categoria -->
            <div class="relative md:col-span-2" *ngIf="type!=='transfer'">
              <select
                class="peer w-full rounded-xl border bg-transparent px-3 py-3 outline-none
                       focus:ring-4 ring-brand-primary/10"
                [(ngModel)]="category_id" name="category_id" required>
                <option value="" disabled selected>Selecione</option>
                <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
              </select>
              <label class="pointer-events-none absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
                Categoria
              </label>
              <small *ngIf="f.submitted && !category_id" class="mt-1 block text-xs text-red-600">Obrigatório</small>
            </div>

            <!-- valor -->
            <div class="relative">
  <input
    type="text"
    currencyMask
    [locale]="'pt-BR'"
    [currency]="'BRL'"
    class="w-full rounded-xl border bg-transparent px-3 py-3 outline-none focus:ring-4 ring-brand-primary/10"
    [(ngModel)]="amount"
    name="amount"
    required
  />
  <label class="pointer-events-none absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
    Valor
  </label>
  <small *ngIf="f?.submitted && (amount === null || amount === undefined)"
         class="mt-1 block text-xs text-red-600">Obrigatório</small>
</div>

            <!-- data -->
            <div class="relative">
              <input type="date"
                class="w-full rounded-xl border bg-transparent px-3 py-3 outline-none
                       focus:ring-4 ring-brand-primary/10"
                [(ngModel)]="occurred_at" name="occurred_at" required />
              <label class="pointer-events-none absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
                Data
              </label>
            </div>

            <!-- descrição -->
            <div class="relative md:col-span-2">
              <input type="text" placeholder=" "
                class="peer w-full rounded-xl border bg-transparent px-3 py-3 outline-none
                       focus:ring-4 ring-brand-primary/10"
                [(ngModel)]="description" name="description" />
              <label
                class="pointer-events-none absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600
                       transition-all">
                Descrição
              </label>
              <p class="mt-1 text-xs text-gray-500">Ex.: Almoço, pagamento, transferência…</p>
            </div>
          </div>

          <!-- errors -->
          <p *ngIf="error" class="text-sm text-red-600">{{ error }}</p>

          <!-- sticky action bar -->
          <div class="-mx-6 -mb-6 md:-mx-8 md:-mb-8 sticky bottom-0">
            <div class="flex items-center gap-3 border-t bg-white/80 p-4 backdrop-blur">
              <button
                class="rounded-xl bg-brand-primary px-4 py-2.5 text-white shadow-sm transition active:scale-[.99] hover:opacity-95">
                {{ isEdit ? 'Salvar' : 'Cadastrar' }}
              </button>

              <button type="button"
                (click)="cancel()"
                class="rounded-xl border px-4 py-2.5 transition hover:bg-gray-50">
                Cancelar
              </button>

              <button *ngIf="isEdit" type="button" (click)="remove()"
                class="ml-auto rounded-xl bg-red-600 px-4 py-2.5 text-white shadow-sm transition hover:opacity-95">
                Excluir
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class TransactionFormComponent implements OnInit {
  isEdit = false;
  id = '';
  type: TxnType = 'expense';
  account_id = '';
  transfer_account_id: string | null = null;
  category_id: string | null = null;
  amount = 0;
  occurred_at = new Date().toISOString().slice(0, 10);
  description = '';
  error = '';

  accounts: Account[] = [];
  categories: Category[] = [];

  constructor(
    private ar: ActivatedRoute,
    private router: Router,
    private svc: TransactionsService,
    private accountsSvc: AccountsService,
    private categoriesSvc: CategoriesService
  ) { }

  async ngOnInit() {
    const qp = this.ar.snapshot.queryParamMap;
    const qpType = qp.get('type') as TxnType | null;
    const qpAmount = qp.get('amount');
    const qpDesc = qp.get('description');
    const qpAccount = qp.get('accountId');
    const qpDate = qp.get('date');

    if (qpType) this.type = qpType;
    if (qpAmount) this.amount = Number(qpAmount);
    if (qpDesc) this.description = qpDesc;
    if (qpAccount) this.account_id = qpAccount;
    if (qpDate) this.occurred_at = qpDate;

    this.accounts = await this.accountsSvc.list();
    await this.onTypeChange();

    this.id = this.ar.snapshot.paramMap.get('id') ?? '';
    this.isEdit = !!this.id;
    if (this.isEdit) {
      const t = await this.svc.get(this.id);
      if (t) {
        this.type = t.type as TxnType;
        this.account_id = t.account_id;
        this.transfer_account_id = t.transfer_account_id ?? null;
        this.category_id = t.category_id ?? null;
        this.amount = Number(t.amount);
        this.occurred_at = t.occurred_at.slice(0, 10);
        this.description = t.description ?? '';
        await this.onTypeChange();
      }
    }
  }

  async onTypeChange() {
    if (this.type === 'transfer') {
      this.categories = [];
      this.category_id = null;
    } else {
      this.categories = await this.categoriesSvc.list(this.type);
    }
  }

  setType(t: TxnType) {
    if (this.type === t) return;
    this.type = t;
    this.onTypeChange();
  }

  async submit() {
    try {
      const payload: any = {
        account_id: this.account_id,
        category_id: this.type === 'transfer' ? null : (this.category_id ?? null),
        type: this.type,
        amount: Number(this.amount),
        occurred_at: this.occurred_at,
        description: this.description || undefined,
        transfer_account_id: this.type === 'transfer' ? (this.transfer_account_id ?? null) : null,
      };

      if (this.isEdit) {
        await this.svc.update(this.id, payload);
      } else {
        await this.svc.create(payload);
      }
      this.router.navigate(['/transactions']);
    } catch (e: any) {
      this.error = e?.message ?? 'Erro ao salvar transação';
    }
  }

  async remove() {
    if (!confirm('Excluir esta transação?')) return;
    try {
      await this.svc.remove(this.id);
      this.router.navigate(['/transactions']);
    } catch (e: any) {
      this.error = e?.message ?? 'Erro ao excluir';
    }
  }

  cancel() {
    this.router.navigate(['/transactions']);
  }
}
