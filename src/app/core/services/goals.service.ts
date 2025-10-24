import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import type { Goal } from '../models/goal.model';

export type GoalStatus = 'active' | 'paused' | 'done' | 'overdue';

@Injectable({ providedIn: 'root' })
export class GoalsService {
  constructor(private supabase: SupabaseService) {}

  private get client() {
    return this.supabase.client;
  }

  // -----------------------------
  // GOALS
  // -----------------------------

  async list(): Promise<Goal[]> {
    const { data, error } = await this.client
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Goal[];
  }

  async get(id: string): Promise<Goal> {
    const { data, error } = await this.client
      .from('goals')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Goal;
  }

  async create(payload: Partial<Goal>): Promise<Goal> {
    const { data, error } = await this.client
      .from('goals')
      .insert(payload)
      .select('*')
      .single();
    if (error) throw error;
    return data as Goal;
  }

  async update(id: string, payload: Partial<Goal>): Promise<Goal> {
    const { data, error } = await this.client
      .from('goals')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as Goal;
  }

  // Excluir (mantém o original e um alias para conveniência)
  async remove(id: string): Promise<void> {
    const { error } = await this.client.from('goals').delete().eq('id', id);
    if (error) throw error;
  }
  async delete(id: string): Promise<void> {
    return this.remove(id);
  }

  // -----------------------------
  // STATUS (pausar / retomar)
  // -----------------------------

  async setStatus(id: string, status: GoalStatus): Promise<Goal> {
    return this.update(id, { status });
  }

  async pause(id: string): Promise<Goal> {
    return this.setStatus(id, 'paused');
  }

  async resume(id: string): Promise<Goal> {
    return this.setStatus(id, 'active');
  }

  // -----------------------------
  // CONTRIBUTIONS
  // -----------------------------

  async addContribution(
    goalId: string,
    amount: number,
    note?: string
  ) {
    const { data, error } = await this.client
      .from('goal_contributions')
      .insert({ goal_id: goalId, amount, note })
      .select('*')
      .single();
    if (error) throw error;
    return data as any; // ou GoalContribution se já tipado
  }

  async listContributions(goalId: string) {
    const { data, error } = await this.client
      .from('goal_contributions')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as any[]; // ou GoalContribution[]
  }
}
