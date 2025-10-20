import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionsService } from '../../../core/services/transactions.service';
import { AccountsService } from '../../../core/services/accounts.service';
import { CategoriesService } from '../../../core/services/categories.service';
import type { Account } from '../../../core/models/account.model';
import type { Category } from '../../../core/models/category.model';
import type { Transaction } from '../../../core/models/transaction.model';
import { TxnType } from '../../../core/models/transaction.model';

@Component({
  standalone: true,
  selector: 'app-transaction-form',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rounded-xl bg-white p-6 shadow max-w-2xl mx-auto">
      <h1 class="text-2xl font-semibold text-brand-primary">
        {{ isEdit ? 'Editar transação' : 'Nova transação' }}
      </h1>
      <p class="text-sm text-brand-muted">
        {{ isEdit ? 'Atualize os dados abaixo' : 'Preencha as informações da transação' }}
      </p>

      <form class="mt-6 space-y-4" (ngSubmit)="submit()">
        <!-- tipo -->
        <div>
          <label class="text-sm text-gray-600">Tipo</label>
          <select
            class="mt-1 w-full rounded-lg border p-2"
            [(ngModel)]="type"
            name="type"
            required
            (change)="onTypeChange()"
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
            <option value="transfer">Transferência</option>
          </select>
        </div>

        <!-- conta origem -->
        <div>
          <label class="text-sm text-gray-600">Conta</label>
          <select
            class="mt-1 w-full rounded-lg border p-2"
            [(ngModel)]="account_id"
            name="account_id"
            required
          >
            <option *ngFor="let a of accounts" [value]="a.id">{{ a.name }}</option>
          </select>
        </div>

        <!-- conta destino (transfer) -->
        <div *ngIf="type==='transfer'">
          <label class="text-sm text-gray-600">Conta de destino</label>
          <select
            class="mt-1 w-full rounded-lg border p-2"
            [(ngModel)]="transfer_account_id"
            name="transfer_account_id"
            required
          >
            <option *ngFor="let a of accounts" [value]="a.id">{{ a.name }}</option>
          </select>
        </div>

        <!-- categoria -->
        <div *ngIf="type!=='transfer'">
          <label class="text-sm text-gray-600">Categoria</label>
          <select
            class="mt-1 w-full rounded-lg border p-2"
            [(ngModel)]="category_id"
            name="category_id"
            required
          >
            <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
          </select>
        </div>

        <!-- valor -->
        <div>
          <label class="text-sm text-gray-600">Valor (R$)</label>
          <input
            type="number"
            step="0.01"
            class="mt-1 w-full rounded-lg border p-2"
            [(ngModel)]="amount"
            name="amount"
            required
          />
        </div>

        <!-- data -->
        <div>
          <label class="text-sm text-gray-600">Data</label>
          <input
            type="date"
            class="mt-1 w-full rounded-lg border p-2"
            [(ngModel)]="occurred_at"
            name="occurred_at"
            required
          />
        </div>

        <!-- descrição -->
        <div>
          <label class="text-sm text-gray-600">Descrição</label>
          <input
            type="text"
            class="mt-1 w-full rounded-lg border p-2"
            [(ngModel)]="description"
            name="description"
            placeholder="ex: Almoço, pagamento, transferência..."
          />
        </div>

        <!-- botões -->
        <div class="flex items-center gap-3">
          <button class="rounded-lg bg-brand-primary px-4 py-2 text-white hover:opacity-95">
            {{ isEdit ? 'Salvar' : 'Cadastrar' }}
          </button>
          <button
            type="button"
            (click)="cancel()"
            class="rounded-lg border px-4 py-2 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            *ngIf="isEdit"
            type="button"
            (click)="remove()"
            class="ml-auto rounded-lg bg-red-600 px-4 py-2 text-white hover:opacity-95"
          >
            Excluir
          </button>
        </div>

        <p *ngIf="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
      </form>
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
  occurred_at = new Date().toISOString().slice(0, 10); // yyyy-MM-dd
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
  ) {}

  async ngOnInit() {
    // ⚡ query params (atalhos vindos do dashboard)
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

    // contas e categorias
    this.accounts = await this.accountsSvc.list();
    await this.onTypeChange();

    // modo edição
    this.id = this.ar.snapshot.paramMap.get('id') ?? '';
    this.isEdit = !!this.id;
    if (this.isEdit) {
      const t = await this.svc.get(this.id);
      if (t) {
        this.type = t.type;
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
    } else {
      this.categories = await this.categoriesSvc.list(this.type);
    }
  }

  async submit() {
    try {
      const payload: any = {
        account_id: this.account_id,
        category_id: this.category_id ?? null,
        type: this.type,
        amount: Number(this.amount),
        occurred_at: this.occurred_at,
        description: this.description || undefined,
        transfer_account_id: this.transfer_account_id ?? null,
      };

      if (this.isEdit) {
        await this.svc.update(this.id, payload);
      } else {
        await this.svc.create(payload);
      }

      this.router.navigate(['/transactions']);
    } catch (e: any) {
      this.error = e.message ?? 'Erro ao salvar transação';
    }
  }

  async remove() {
    if (!confirm('Excluir esta transação?')) return;
    try {
      await this.svc.remove(this.id);
      this.router.navigate(['/transactions']);
    } catch (e: any) {
      this.error = e.message ?? 'Erro ao excluir';
    }
  }

  cancel() {
    this.router.navigate(['/transactions']);
  }
}
