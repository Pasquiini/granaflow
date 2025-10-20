import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BillingService, Subscription } from '../../../core/services/billing.service';

type MenuItem = { path: string; label: string; icon: string };

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  providers: [BillingService],
  template: `
    <!-- overlay mobile -->
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-[1px] lg:hidden"
      *ngIf="open"
      (click)="onClose?.()"
    ></div>

    <aside
      class="fixed z-40 h-full w-72 p-3 transition-transform lg:static lg:translate-x-0"
      [class.-translate-x-full]="!open"
    >
      <div
        class="relative h-full rounded-2xl p-2 bg-white/60 backdrop-blur-xl border border-emerald-200/50 shadow-[0_10px_40px_-20px_rgba(16,185,129,0.45)]
               [background:linear-gradient(180deg,rgba(16,185,129,.15)_0%,rgba(16,185,129,.05)_100%)]"
      >
        <!-- blob decorativo -->
        <div class="pointer-events-none absolute -top-10 -right-12 h-44 w-44 rounded-full bg-emerald-400/25 blur-3xl"></div>

        <!-- topo: branding -->
        <div class="mb-6 mt-1 flex items-center gap-3 px-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-sm ring-1 ring-white/20"
          >
            GF
          </div>
          <div class="leading-tight">
            <h1 class="text-[17px] font-semibold text-emerald-700">GranaFlow</h1>
            <p class="text-xs text-emerald-800/70">controle financeiro</p>
          </div>
        </div>

        <!-- divisória -->
        <div class="px-3">
          <div class="flex items-center gap-2 text-[11px] uppercase tracking-wider text-emerald-900/50">
            <span class="h-px flex-1 bg-emerald-200/60"></span>
            <span>navegação</span>
            <span class="h-px flex-1 bg-emerald-200/60"></span>
          </div>
        </div>

        <!-- navegação -->
        <nav class="mt-3 flex-1 space-y-1 px-2">
          <a
            *ngFor="let item of menu"
            [routerLink]="item.path"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700
                   transition-all duration-200 hover:bg-emerald-50/80 hover:text-emerald-700
                   ring-1 ring-transparent"
          >
            <span
              class="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full bg-emerald-500/70 opacity-0 transition-all duration-200 group-[.active]:opacity-100 group-hover:opacity-60"
            ></span>

            <span class="text-[18px] opacity-90">{{ item.icon }}</span>
            <span class="font-medium text-[0.95rem]">{{ item.label }}</span>

            <span
              class="absolute inset-0 -z-10 scale-95 rounded-xl bg-emerald-500/0 blur-[2px] transition
                     group-[.active]:bg-emerald-500/10 group-hover:bg-emerald-500/5"
            ></span>
          </a>
        </nav>

        <!-- separador -->
        <div class="mt-4 px-3">
          <div class="h-px bg-emerald-200/60"></div>
        </div>

        <!-- assinatura com badge dinâmico -->
        <div class="px-3 mt-3">
          <a
            routerLink="/billing"
            routerLinkActive="active"
            class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700
                   transition-all duration-200 hover:bg-emerald-50/80 hover:text-emerald-700"
          >
            <span class="text-[18px]">💎</span>
            <span class="font-medium text-[0.95rem]">Assinatura</span>

            <!-- badge à direita -->
            <span
              class="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1"
              [ngClass]="isPro ? 'bg-emerald-600/10 text-emerald-700 ring-emerald-600/25' : 'bg-amber-500/10 text-amber-700 ring-amber-500/25'"
            >
              <span class="leading-none">{{ isPro ? 'PRO' : 'FREE' }}</span>
            </span>
          </a>
        </div>

        <!-- rodapé -->
        <div class="px-3 py-3 text-[11.5px] text-emerald-900/60 mt-auto">
          <div class="flex items-center justify-between">
            <p>© {{ year }} GranaFlow</p>
            <span class="rounded-full bg-emerald-600/10 px-2 py-0.5 text-emerald-700 ring-1 ring-emerald-600/20">
              DevPas Tech
            </span>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [
    `
      aside { display: flex; flex-direction: column; }
      a { position: relative; }
      .active {
        color: #065f46 !important;
        background: linear-gradient(180deg, rgba(16,185,129,.08) 0%, rgba(16,185,129,.04) 100%);
        box-shadow: 0 6px 20px -10px rgba(16,185,129,.55);
        border-radius: 0.75rem;
        transition: all .2s ease;
        transform: translateX(2px);
        outline: 0;
      }
      a:focus-visible { box-shadow: 0 0 0 3px rgba(16,185,129,.35); }
    `,
  ],
})
export class SidebarComponent implements OnInit {
  @Input() open = false;
  @Input() onClose?: () => void;

  year = new Date().getFullYear();
  isPro = false;

  menu: MenuItem[] = [
    { path: '/dashboard',    label: 'Dashboard',     icon: '🏠' },
    { path: '/accounts',     label: 'Contas',        icon: '💳' },
    { path: '/transactions', label: 'Transações',    icon: '💸' },
    { path: '/budgets',      label: 'Orçamentos',    icon: '📊' },
    { path: '/reports',      label: 'Relatórios',    icon: '📑' },
    { path: '/insights',     label: 'Insights',      icon: '🧠' },
  ];

  constructor(private billing: BillingService) {}

  async ngOnInit() {
    // tenta buscar assinatura; se não existir, permanece "FREE"
    const sub = await this.billing.getMySubscription().catch(() => null) as Subscription | null;
    this.isPro = !!sub && (sub.plan_id === 'pro') && (sub.status === 'active' || sub.status === 'trialing');
  }
}
