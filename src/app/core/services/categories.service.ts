import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import type { Category, CategoryKind } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  constructor(private supa: SupabaseService, private auth: AuthService) {}
  private get uid() { const u = this.auth.user(); if (!u) throw new Error('Sem usuário'); return u.id; }

  async list(kind?: CategoryKind): Promise<Category[]> {
    let q = this.supa.client.from('categories').select('*').order('name', { ascending: true });
    if (kind) q = q.eq('kind', kind);
    const { data, error } = await q;
    if (error) throw error;
    return data as Category[];
  }

  async create(input: { name: string; kind: CategoryKind; parent_id?: string | null; icon?: string | null; color?: string | null; }) {
    const { data, error } = await this.supa.client
      .from('categories').insert({ ...input, user_id: this.uid }).select().single();
    if (error) throw error;
    return data as Category;
  }

  async get(id: string) {
    const { data, error } = await this.supa.client.from('categories').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as Category | null;
  }

  async update(id: string, input: Partial<Pick<Category, 'name'|'kind'|'parent_id'|'icon'|'color'>>) {
    const { data, error } = await this.supa.client.from('categories').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as Category;
  }

  async remove(id: string) {
    const { error } = await this.supa.client.from('categories').delete().eq('id', id);
    if (error) throw error;
  }
}
