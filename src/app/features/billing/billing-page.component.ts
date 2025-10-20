import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingService, Plan, Subscription } from '../../core/services/billing.service';
import { SupabaseService } from '../../core/services/supabase.service';

type ToastType = 'success' | 'error' | 'info';
type Toast = { id: number; type: ToastType; text: string };

@Component({
  standalone: true,
  selector: 'app-billing-page',
  imports: [CommonModule],
  template: `
  <!-- HERO -->
  <section class="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-400 text-white p-6">
    <div class="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/10 blur-2xl"></div>
    <div class="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-white/10 blur-2xl"></div>

    <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight">Assinatura</h1>
        <p class="text-emerald-50/90 mt-1">Gerencie seu plano, acompanhe uso e descubra benefícios do Pro.</p>
      </div>

      <div class="flex items-center gap-3">
        <span class="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/25">
          <span class="text-sm opacity-90">Plano atual</span>
          <span class="text-xs font-semibold rounded-full bg-white/25 px-2 py-0.5 uppercase">
            {{ sub?.plan_id || 'free' }}
          </span>
        </span>
        <span class="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/25">
          <span class="h-2 w-2 rounded-full" [ngClass]="isActive() ? 'bg-lime-300' : 'bg-white/60'"></span>
          <span class="text-xs font-medium">{{ sub?.status || 'active' }}</span>
        </span>
      </div>
    </div>
  </section>

  <div class="mt-6 grid gap-6 lg:grid-cols-3">
    <!-- COL ESQUERDA -->
    <section class="lg:col-span-1 space-y-6">
      <!-- PLANO ATUAL -->
      <div class="rounded-2xl border bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between">
          <div>
            <div class="text-sm text-gray-500">Seu plano</div>
            <div class="text-2xl font-semibold text-emerald-700">{{ (sub?.plan_id || 'free') | uppercase }}</div>
            <div class="text-xs text-gray-500 mt-1" *ngIf="sub?.current_period_end">
              Renova em {{ sub?.current_period_end | date:'dd/MM/yyyy' }}
            </div>
          </div>
          <div class="text-3xl">💎</div>
        </div>

        <div class="mt-4">
  <!-- Caso esteja cancelado, mostra aviso -->
  <div *ngIf="isCanceled()" class="text-sm text-amber-600 mb-2">
    O plano foi cancelado, mas você ainda tem acesso até {{ sub?.current_period_end | date:'dd/MM/yyyy' }}.
  </div>

  <button
    *ngIf="!isPro()"
    class="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-60"
    (click)="upgradeSoon()"
    [disabled]="loading.upgrade"
  >
    <span *ngIf="!loading.upgrade">Fazer upgrade para Pro</span>
    <span *ngIf="loading.upgrade" class="inline-flex items-center gap-2">
      <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
      Processando…
    </span>
  </button>

  <button
    *ngIf="isPro() && !isCanceled()"
    class="w-full rounded-xl border px-4 py-2.5 font-medium text-emerald-700 border-emerald-200 hover:bg-emerald-50 transition"
    (click)="openManage()"
  >
    Gerenciar assinatura
  </button>

  <button
    *ngIf="isCanceled()"
    class="w-full rounded-xl border px-4 py-2.5 font-medium text-amber-700 border-amber-200 hover:bg-amber-50 transition"
    (click)="openManage()"
  >
    Reativar assinatura
  </button>
</div>
      </div>

      <!-- USO -->
      <div class="rounded-2xl border bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-900">Uso neste mês</h3>
          <button class="text-xs text-emerald-700 hover:underline" (click)="reloadUsage()" [disabled]="loading.usage">Atualizar</button>
        </div>
        <p class="text-sm text-gray-500">Acompanhe seu consumo para não estourar limites.</p>

        <div class="mt-4 space-y-4">
          <div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Lançamentos</span>
              <span class="font-medium">{{ usage.monthTransactions }} / {{ maxTransactionsLabel() }}</span>
            </div>
            <div class="mt-2 h-2.5 w-full rounded-full bg-gray-100 overflow-hidden ring-1 ring-gray-200/70">
              <div class="h-full bg-emerald-500 transition-all" [style.width.%]="txProgress()"></div>
            </div>
          </div>

          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Regras automáticas</span>
            <span class="font-medium">{{ isPro() ? 'Ilimitadas' : 'Limitado' }}</span>
          </div>

          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Exportações Excel/PDF</span>
            <span class="font-medium">{{ isPro() ? 'Liberado' : 'Somente CSV' }}</span>
          </div>
        </div>
      </div>

      <!-- Dicas -->
      <div class="rounded-2xl border bg-white p-5 shadow-sm">
        <h3 class="font-semibold text-gray-900">Dicas para economizar</h3>
        <ul class="mt-3 space-y-2 text-sm text-gray-600">
          <li>• Use tags e regras para categorizar automaticamente.</li>
          <li>• Defina orçamentos por categoria e ative alertas.</li>
          <li>• Compare meses no dashboard para cortar excessos.</li>
        </ul>
      </div>
    </section>

    <!-- COL DIREITA -->
    <section class="lg:col-span-2 space-y-6">
      <!-- COMPARATIVO -->
      <div class="rounded-2xl border bg-white p-5 shadow-sm">
        <h3 class="font-semibold text-gray-900">Comparativo de planos</h3>
        <div class="mt-4 overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr>
                <th class="text-left p-3 text-gray-500 font-medium">Recurso</th>
                <th class="text-left p-3 text-emerald-700 font-semibold">Free</th>
                <th class="text-left p-3 text-emerald-700 font-semibold">Pro</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr>
                <td class="p-3 text-gray-700">Lançamentos/mês</td>
                <td class="p-3">Até 1.000</td>
                <td class="p-3">Ilimitado</td>
              </tr>
              <tr>
                <td class="p-3 text-gray-700">Regras automáticas</td>
                <td class="p-3">Limitado</td>
                <td class="p-3">Ilimitadas</td>
              </tr>
              <tr>
                <td class="p-3 text-gray-700">Planejamento anual & projeções</td>
                <td class="p-3">—</td>
                <td class="p-3">✔</td>
              </tr>
              <tr>
                <td class="p-3 text-gray-700">Exportar Excel & Relatórios</td>
                <td class="p-3">CSV</td>
                <td class="p-3">Excel + PDF</td>
              </tr>
              <tr>
                <td class="p-3 text-gray-700">Suporte</td>
                <td class="p-3">Comunitário</td>
                <td class="p-3">Prioritário</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CARDS -->
      <div class="grid md:grid-cols-2 gap-4">
        <article *ngFor="let p of plans" class="group rounded-2xl border bg-white p-5 shadow-sm hover:shadow-lg transition">
          <div class="flex items-start justify-between">
            <div>
              <h4 class="text-lg font-semibold text-gray-900">{{ p.name }}</h4>
              <p class="text-sm text-gray-500 mt-0.5" *ngIf="p.id==='free'">Perfeito para começar hoje</p>
              <p class="text-sm text-gray-500 mt-0.5" *ngIf="p.id==='pro'">Para quem quer automações e visão anual</p>
            </div>
            <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1"
              [ngClass]="p.id==='pro' ? 'text-emerald-700 ring-emerald-200 bg-emerald-50' : 'text-gray-700 ring-gray-200 bg-gray-50'">
              {{ p.id | uppercase }}
            </span>
          </div>

          <div class="mt-4">
            <div *ngIf="p.price_cents===0" class="text-xl font-semibold">Grátis</div>
            <div *ngIf="p.price_cents>0" class="text-3xl font-bold">
              {{ (p.price_cents/100) | currency:p.currency:'symbol-narrow' }}<span class="text-base font-semibold text-gray-500">/mês</span>
            </div>
          </div>

          <ul class="mt-4 space-y-2 text-sm text-gray-700">
            <li *ngFor="let f of featureList(p)">• {{ f }}</li>
          </ul>

          <div class="mt-5">
            <button
              class="w-full rounded-xl border px-4 py-2.5 font-medium transition"
              *ngIf="p.id==='free' && !isPro()"
              disabled
            >
              Plano atual
            </button>

            <button
              class="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-60"
              *ngIf="p.id==='pro' && !isPro()"
              (click)="upgradeSoon()"
              [disabled]="loading.upgrade"
            >
              <span *ngIf="!loading.upgrade">Assinar Pro</span>
              <span *ngIf="loading.upgrade" class="inline-flex items-center gap-2">
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                Abrindo checkout…
              </span>
            </button>

            <button
              class="w-full rounded-xl border px-4 py-2.5 font-medium text-emerald-700 border-emerald-200 hover:bg-emerald-50 transition"
              *ngIf="p.id==='pro' && isPro()"
              (click)="openManage()"
            >
              Gerenciar
            </button>
          </div>
        </article>
      </div>

      <!-- FAQ -->
      <div class="rounded-2xl border bg-white p-5 shadow-sm">
        <h3 class="font-semibold text-gray-900">Perguntas rápidas</h3>
        <div class="mt-3 grid md:grid-cols-3 gap-3 text-sm">
          <div>
            <div class="font-medium text-gray-800">Posso começar no Free?</div>
            <p class="text-gray-600">Sim. Você pode usar o Free sem cartão e migrar quando quiser.</p>
          </div>
          <div>
            <div class="font-medium text-gray-800">Como funciona o upgrade?</div>
            <p class="text-gray-600">Ao assinar, liberamos recursos Pro imediatamente.</p>
          </div>
          <div>
            <div class="font-medium text-gray-800">Consigo exportar meus dados?</div>
            <p class="text-gray-600">Sempre. CSV no Free; Excel/PDF no Pro.</p>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- MODAL: GERENCIAMENTO -->
  <div *ngIf="ui.manageOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40" (click)="closeManage()"></div>
    <div class="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 p-5">
      <div class="flex items-start justify-between">
        <h3 class="text-lg font-semibold text-gray-900">Gerenciar assinatura</h3>
        <button class="text-gray-500 hover:text-gray-700" (click)="closeManage()">✕</button>
      </div>

      <div class="mt-4 space-y-3 text-sm">
        <div class="rounded-lg border p-3">
          <div class="font-medium text-gray-800 mb-1">Cancelar renovação</div>
          <p class="text-gray-600">Você manterá o Pro até o fim do período atual.</p>
          <button
            class="mt-2 rounded-lg bg-amber-600 text-white px-3 py-2 hover:bg-amber-700 disabled:opacity-60"
            (click)="cancelAtPeriodEnd()"
            [disabled]="loading.manage"
          >
            Cancelar no fim do período
          </button>
        </div>

        <div class="rounded-lg border p-3">
          <div class="font-medium text-gray-800 mb-1">Downgrade imediato</div>
          <p class="text-gray-600">Mudar agora para o plano Free.</p>
          <button
            class="mt-2 rounded-lg bg-red-600 text-white px-3 py-2 hover:bg-red-700 disabled:opacity-60"
            (click)="downgradeNow()"
            [disabled]="loading.manage"
          >
            Downgrade para Free
          </button>
        </div>

        <div class="rounded-lg border p-3" *ngIf="sub?.status !== 'active'">
          <div class="font-medium text-gray-800 mb-1">Reativar Pro</div>
          <p class="text-gray-600">Voltar a renovar automaticamente.</p>
          <button
            class="mt-2 rounded-lg bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700 disabled:opacity-60"
            (click)="reactivate()"
            [disabled]="loading.manage"
          >
            Reativar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- TOASTS -->
  <div class="fixed bottom-4 right-4 z-50 space-y-2">
    <div *ngFor="let t of toasts"
         class="pointer-events-auto max-w-xs rounded-xl shadow-lg ring-1 p-3 text-sm text-white"
         [ngClass]="{
           'bg-emerald-600 ring-emerald-700/40': t.type==='success',
           'bg-red-600 ring-red-700/40': t.type==='error',
           'bg-gray-800 ring-gray-900/40': t.type==='info'
         }">
      <div class="flex items-start gap-2">
        <span *ngIf="t.type==='success'">✅</span>
        <span *ngIf="t.type==='error'">⚠️</span>
        <span *ngIf="t.type==='info'">ℹ️</span>
        <div class="flex-1 leading-5">{{ t.text }}</div>
        <button class="ml-2 opacity-75 hover:opacity-100" (click)="dismissToast(t.id)">✕</button>
      </div>
    </div>
  </div>
  `
})
export class BillingPageComponent implements OnInit {
  plans: Plan[] = [];
  sub: Subscription | null = null;

  usage = { monthTransactions: 0, maxTransactionsFree: 1000 };

  loading = { upgrade: false, usage: false, manage: false };

  private toastSeq = 0;
  toasts: Toast[] = [];

  ui = { manageOpen: false };

  constructor(private billing: BillingService, private sb: SupabaseService) { }

  async ngOnInit() {
    try {
      await this.billing.ensureFree();
      [this.plans, this.sub] = await Promise.all([
        this.billing.getPlans(),
        this.billing.getMySubscription()
      ]);
      await this.loadUsage();
    } catch (e) {
      console.warn('[BillingPage] init error:', e);
      this.toast('error', 'Não foi possível carregar tudo. Tente novamente.');
    }
  }

  async reloadUsage() {
    try {
      this.loading.usage = true;
      await this.loadUsage();
      this.toast('success', 'Uso atualizado com sucesso.');
    } catch (e) {
      this.toast('error', 'Falha ao atualizar uso.');
    } finally {
      this.loading.usage = false;
    }
  }

  async loadUsage() {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    const { data: { user } } = await this.sb.client.auth.getUser();
    if (!user) return;

    const { count, error } = await this.sb.client
      .from('transactions')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .gte('created_at', from)
      .lte('created_at', to)
      .range(0, 0);

    if (error) throw error;
    this.usage.monthTransactions = count ?? 0;
  }

  effective() {
    if (!this.sub) return { tier: 'free' as const, status: 'none' as const, periodEnd: null as Date | null };
    const now = new Date();
    const end = this.sub.current_period_end ? new Date(this.sub.current_period_end) : null;
    const activeLike = this.sub.status === 'active' || this.sub.status === 'trialing';
    const canceledButValid = this.sub.status === 'canceled' && end && end > now;

    if (this.sub.plan_id === 'pro' && (activeLike || canceledButValid)) {
      return { tier: 'pro' as const, status: this.sub.status as any, periodEnd: end };
    }
    return { tier: 'free' as const, status: this.sub.status as any, periodEnd: end };
  }

  isPro() {
    return this.effective().tier === 'pro';
  }

  isCanceled() {
    return this.sub?.status === 'canceled';
  }

  isActive() {
    const s = this.effective().status;
    return s === 'active' || s === 'trialing';
  }

  txProgress() {
    if (this.isPro()) return 100;
    const max = this.usage.maxTransactionsFree || 1000;
    return Math.min(100, Math.round((this.usage.monthTransactions / max) * 100));
  }
  maxTransactionsLabel() { return this.isPro() ? 'Ilimitado' : this.usage.maxTransactionsFree; }

  featureList(p: Plan): string[] {
    if (p.id === 'free') return ['Até 1.000 lançamentos/mês', 'Dashboard essencial', 'Exportar CSV'];
    if (p.id === 'pro') return ['Regras automáticas ilimitadas', 'Planejamento anual + projeções', 'Exportar Excel e relatórios PDF'];
    return [];
  }

  async upgradeSoon() {
    try {
      this.loading.upgrade = true;
      this.toast('info', 'Preparando checkout…');
      await this.billing.startCheckout('pro');
      this.toast('success', 'Checkout aberto.');
    } catch (e: any) {
      console.error('[upgradeSoon] error', e);
      const msg = e?.message || e?.error?.message || 'Não foi possível iniciar o checkout.';
      this.toast('error', msg);
    } finally {
      this.loading.upgrade = false;
    }
  }

  /* ====== Manage Modal ====== */
  openManage() { this.ui.manageOpen = true; }
  closeManage() { this.ui.manageOpen = false; }

  async cancelAtPeriodEnd() {
    try {
      this.loading.manage = true;
      await this.billing.cancelAtPeriodEnd();
      this.sub = await this.billing.getMySubscription();
      this.toast('success', 'Renovação cancelada. Você manterá o Pro até o fim do período.');
      this.closeManage();
    } catch (e: any) {
      this.toast('error', e?.message || 'Falha ao cancelar.');
    } finally {
      this.loading.manage = false;
    }
  }

  async downgradeNow() {
    try {
      this.loading.manage = true;
      await this.billing.downgradeToFreeNow();
      this.sub = await this.billing.getMySubscription();
      this.toast('success', 'Plano alterado para Free.');
      this.closeManage();
    } catch (e: any) {
      this.toast('error', e?.message || 'Falha ao fazer downgrade.');
    } finally {
      this.loading.manage = false;
    }
  }

  async reactivate() {
    try {
      this.loading.manage = true;
      await this.billing.reactivatePro();
      this.sub = await this.billing.getMySubscription();
      this.toast('success', 'Assinatura reativada.');
      this.closeManage();
    } catch (e: any) {
      this.toast('error', e?.message || 'Falha ao reativar.');
    } finally {
      this.loading.manage = false;
    }
  }

  /* ===== Toasts ===== */
  toast(type: ToastType, text: string, ttlMs = 4000) {
    const id = ++this.toastSeq;
    this.toasts = [...this.toasts, { id, type, text }];
    setTimeout(() => this.dismissToast(id), ttlMs);
  }
  dismissToast(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
