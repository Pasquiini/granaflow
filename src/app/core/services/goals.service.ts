import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import type { Goal } from '../models/goal.model';
import type { GoalContribution } from '../models/goal-contribution.model';

@Injectable({ providedIn: 'root' })
export class GoalsService {
  constructor(private supabase: SupabaseService) {}

  private get client() {
    return this.supabase.client;
  }
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

  async remove(id: string): Promise<void> {
    const { error } = await this.client
      .from('goals')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // -----------------------------
  // CONTRIBUTIONS
  // -----------------------------

  async addContribution(
    goalId: string,
    amount: number,
    note?: string
  ): Promise<GoalContribution> {
    const { data, error } = await this.client
      .from('goal_contributions')
      .insert({ goal_id: goalId, amount, note })
      .select('*')
      .single();
    if (error) throw error;
    return data as GoalContribution;
  }

  async listContributions(goalId: string): Promise<GoalContribution[]> {
    const { data, error } = await this.client
      .from('goal_contributions')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as GoalContribution[];
  }
}
