import { Component, Input, computed, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgIf, RouterModule],
  template: `
    <header
      class="sticky top-0 z-40 w-full backdrop-blur-xl
             bg-white/70 supports-[backdrop-filter]:bg-white/55
             shadow-[0_10px_40px_-20px_rgba(16,185,129,0.45)]"
      role="banner"
    >
      <!-- linha de brilho/gradiente na base -->
      <div class="relative">
        <div class="mx-auto max-w-7xl px-4">
          <div class="flex h-14 items-center justify-between">
            <!-- esquerda: menu + brand -->
            <div class="flex items-center gap-3">
              <button
                class="lg:hidden rounded-xl p-2 transition hover:bg-emerald-50 active:scale-[0.98] ring-1 ring-transparent hover:ring-emerald-200/60"
                (click)="onToggleSidebar?.()"
                aria-label="Abrir menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>

              <a routerLink="/" class="group inline-flex items-center gap-2">
                <!-- marca compacta -->
                <span
                  class="grid h-7 w-7 place-items-center rounded-[10px] bg-emerald-600 text-white text-[11px] font-bold ring-1 ring-white/30 shadow-sm"
                  aria-hidden="true"
                >GF</span>
                <div class="leading-none">
                  <div class="text-[15px] font-semibold text-brand-primary group-hover:text-emerald-700 transition">
                    GranaFlow
                  </div>
                  <div class="text-[10px] uppercase tracking-wider text-emerald-900/50">
                    controle financeiro
                  </div>
                </div>
              </a>
            </div>

            <!-- direita: user/actions -->
            <div class="flex items-center gap-2 sm:gap-3 text-sm">
              <span class="hidden sm:block text-brand-muted" *ngIf="isLoggedIn()">
                {{ email() }}
              </span>

              <a routerLink="/profile"
                 class="hidden sm:inline-flex items-center gap-2 rounded-xl border px-3 py-1.5
                        transition hover:bg-emerald-50 hover:text-emerald-700
                        border-emerald-200/60">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M5.121 17.804A9 9 0 1118.88 17.8M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Meu Perfil
              </a>

              <!-- avatar com iniciais -->
              <div class="relative" *ngIf="isLoggedIn()">
                <button
                  class="group flex items-center gap-2 rounded-xl px-2 py-1.5
                         hover:bg-emerald-50 ring-1 ring-transparent hover:ring-emerald-200/60 transition"
                  (click)="userMenuOpen.set(!userMenuOpen())"
                  aria-haspopup="menu" [attr.aria-expanded]="userMenuOpen()"
                >
                  <span
                    class="grid h-8 w-8 place-items-center rounded-full bg-emerald-600/90 text-white text-[12px] font-semibold ring-2 ring-white/40 shadow"
                  >{{ initials() }}</span>
                  <svg class="h-4 w-4 transition group-data-[open=true]:rotate-180"
                       [attr.data-open]="userMenuOpen()" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                          clip-rule="evenodd" />
                  </svg>
                </button>

                <!-- dropdown -->
                <div
                  *ngIf="userMenuOpen()"
                  class="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-emerald-200/60 bg-white/95 backdrop-blur
                         shadow-lg ring-1 ring-black/5"
                  role="menu"
                >
                  <a routerLink="/profile"
                     class="block px-3 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-700"
                     role="menuitem">Perfil</a>
                  <div class="my-1 h-px bg-emerald-200/60"></div>
                  <button (click)="logout()"
                          class="block w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-700"
                          role="menuitem">
                    Sair
                  </button>
                </div>
              </div>
              <button
                class="sm:hidden rounded-xl border px-3 py-1.5 hover:bg-gray-50"
                *ngIf="isLoggedIn()"
                (click)="logout()"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        <!-- linha gradiente na base do header -->
        <div class="pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px]
                    bg-[linear-gradient(90deg,rgba(16,185,129,.0)_0%,rgba(16,185,129,.6)_30%,rgba(16,185,129,.6)_70%,rgba(16,185,129,.0)_100%)]">
        </div>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  @Input() onToggleSidebar?: () => void;

  userMenuOpen = signal(false);

  constructor(private auth: AuthService) {}

  email = computed(() => this.auth.user()?.email ?? '');
  isLoggedIn = computed(() => this.auth.isLoggedIn());
  initials = computed(() => {
    const e = this.email();
    if (!e) return 'GF';
    const base = e.split('@')[0] || '';
    const parts = base.replace(/[^a-zA-Z0-9]+/g,' ').trim().split(' ');
    const a = (parts[0]?.[0] ?? 'G').toUpperCase();
    const b = (parts[1]?.[0] ?? 'F').toUpperCase();
    return (a + b).slice(0,2);
  });

  async logout() {
    await this.auth.signOut();
    location.href = '/login';
  }
}
