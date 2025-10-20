import { TransactionWithRelations } from './../models/transaction.model';
import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import type { Transaction, TxnType } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  constructor(private supa: SupabaseService, private auth: AuthService) { }
  private get uid() { const u = this.auth.user(); if (!u) throw new Error('Sem usuário'); return u.id; }

  async listByMonth(dateISO: string): Promise<TransactionWithRelations[]> {
    const start = new Date(`${dateISO}T00:00:00`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    const { data, error } = await this.supa.client
      .from('transactions')
      .select(`
      id,
      user_id,
      occurred_at,
      description,
      type,
      amount,
      account_id,
      category_id,
      created_at,
      account:account_id ( id, name ),
      category:category_id ( id, name )
    `)
      .gte('occurred_at', start.toISOString())
      .lte('occurred_at', end.toISOString())
      .order('occurred_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((t: any) => ({
      ...t,
      account: Array.isArray(t.account) ? t.account[0] : t.account,
      category: Array.isArray(t.category) ? t.category[0] : t.category,
    })) as TransactionWithRelations[];
  }


  async create(input: {
    account_id: string;
    category_id?: string | null;
    type: TxnType;
    amount: number;
    occurred_at: string;
    description?: string | null;
    notes?: string | null;
    tags?: string[];
    transfer_account_id?: string | null;
  }) {
    const payload = { ...input, user_id: this.uid };
    const { data, error } = await this.supa.client.from('transactions').insert(payload).select().single();
    if (error) throw error;
    return data as Transaction;
  }

  async get(id: string) {
    const { data, error } = await this.supa.client.from('transactions').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as Transaction | null;
  }

  async update(id: string, input: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>) {
    const { data, error } = await this.supa.client.from('transactions').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as Transaction;
  }

  async remove(id: string) {
    const { error } = await this.supa.client.from('transactions').delete().eq('id', id);
    if (error) throw error;
  }
}
