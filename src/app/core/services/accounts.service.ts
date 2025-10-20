import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import type { Account, AccountType } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountsService {
  constructor(private supa: SupabaseService, private auth: AuthService) {}

  private get uid() {
    const u = this.auth.user();
    if (!u) throw new Error('Sem usuário autenticado');
    return u.id;
  }

  async list(): Promise<Account[]> {
    const { data, error } = await this.supa.client
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Account[];
  }

  async get(id: string): Promise<Account | null> {
    const { data, error } = await this.supa.client
      .from('accounts')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Account | null;
  }

  async create(input: { name: string; type: AccountType; initial_balance: number }) {
    const payload = { ...input, user_id: this.uid };
    const { data, error } = await this.supa.client.from('accounts').insert(payload).select().single();
    if (error) throw error;
    return data as Account;
  }

  async update(id: string, input: Partial<Pick<Account, 'name' | 'type' | 'initial_balance'>>) {
    const { data, error } = await this.supa.client.from('accounts').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as Account;
  }

  async remove(id: string) {
    const { error } = await this.supa.client.from('accounts').delete().eq('id', id);
    if (error) throw error;
  }
}
