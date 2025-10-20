// src/app/core/services/billing.service.ts
import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Plan { id: 'free' | 'pro' | string; name: string; price_cents: number; currency: string; }
export interface Subscription { plan_id: string; status: string; current_period_end?: string | null; created_at?: string; }

@Injectable({ providedIn: 'root' })
export class BillingService {
  constructor(private sb: SupabaseService) {}

  /** (Opcional) Mantido por compatibilidade; a Edge Function já garante o free se necessário. */
  async ensureFree(): Promise<void> { return; }

  /* ===================== Reads ===================== */

  async getPlans(): Promise<Plan[]> {
    const { data, error } = await this.sb.client
      .from('plans')
      .select('id,name,price_cents,currency')
      .eq('is_active', true)
      .order('price_cents', { ascending: true });

    if (error) throw error;
    return (data ?? []) as Plan[];
  }

  async getMySubscription(): Promise<Subscription | null> {
    const { data: { user } } = await this.sb.client.auth.getUser();
    if (!user) return null;

    const { data, error } = await this.sb.client
      .from('subscriptions')
      .select('plan_id,status,current_period_end,created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // se não houver linha, caímos para um “free ativo” padrão
    if (error && error.code !== 'PGRST116') throw error;
    return (data ?? { plan_id: 'free', status: 'active', current_period_end: null });
  }

  /* ===================== Checkout ===================== */

  async startCheckout(planId: string) {
    const { data, error } = await this.sb.client.functions.invoke('mp-create-checkout', {
      body: { planId }
    });
    if (error) throw error;
    // redireciona (mock -> /billing?mock=1&plan=pro; produção -> url do MP)
    window.location.href = data.url;
  }

  /* ===================== Mock helpers (dev) ===================== */

  /** Mantém para o fluxo /billing/confirm?mock=1&plan=... */
  async applyMockUpgrade(planId: 'pro'|'free'|string) {
    const userId = await this.requireUserId();

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1); // +30 dias (aprox)

    const { error } = await this.sb.client
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        current_period_end: periodEnd.toISOString()
      }, { onConflict: 'user_id' });

    if (error) throw error;
  }

  /* ===================== Manage (mock) ===================== */

  /**
   * Cancela a renovação automática, mantendo PRO até o fim do período atual.
   * Convencionalmente marcamos status = 'canceled' e preservamos o plan_id='pro'.
   */
  async cancelAtPeriodEnd() {
    const userId = await this.requireUserId();

    // tenta obter a assinatura atual para preservar current_period_end
    const current = await this.getMySubscription();

    // se não houver current_period_end, define +30 dias como fallback
    const periodEnd = current?.current_period_end
      ? new Date(current.current_period_end)
      : new Date(Date.now() + 30*24*60*60*1000);

    const { error } = await this.sb.client
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan_id: 'pro',
        status: 'canceled', // indica que NÃO vai renovar
        current_period_end: periodEnd.toISOString()
      }, { onConflict: 'user_id' });

    if (error) throw error;
  }

  /**
   * Faz downgrade imediato para FREE (status 'active', sem período futuro).
   */
  async downgradeToFreeNow() {
    const userId = await this.requireUserId();

    const { error } = await this.sb.client
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan_id: 'free',
        status: 'active',
        current_period_end: null
      }, { onConflict: 'user_id' });

    if (error) throw error;
  }

  /**
   * Reativa PRO (status 'active') e empurra o período para +30 dias a partir de hoje.
   * Use em conjunto com o botão “Reativar” do modal.
   */
  async reactivatePro() {
    const userId = await this.requireUserId();

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { error } = await this.sb.client
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan_id: 'pro',
        status: 'active',
        current_period_end: periodEnd.toISOString()
      }, { onConflict: 'user_id' });

    if (error) throw error;
  }

  /* ===================== Utils ===================== */

  private async requireUserId(): Promise<string> {
    const { data: { user }, error } = await this.sb.client.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Usuário não autenticado.');
    return user.id;
  }
}
