import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
  constructor(private supabase: SupabaseService) {}

  async get() {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase.client
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  }
}
