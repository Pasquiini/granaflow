import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicNavbarComponent } from '../../../shared/components/public-navbar/public-navbar.component';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule, PublicNavbarComponent],
  styles: [`
    .animated-gradient {
      background:
        radial-gradient(60% 60% at 20% 20%, rgba(123, 97, 255, .25) 0%, rgba(123, 97, 255, 0) 60%),
        radial-gradient(50% 50% at 80% 30%, rgba(69, 214, 195, .18) 0%, rgba(69, 214, 195, 0) 60%),
        radial-gradient(55% 55% at 50% 80%, rgba(255, 184, 77, .14) 0%, rgba(255, 184, 77, 0) 60%);
      animation: floaty 12s ease-in-out infinite alternate;
    }
    @keyframes floaty {
      0%   { filter: hue-rotate(0deg) saturate(1); transform: translateY(0) }
      100% { filter: hue-rotate(8deg) saturate(1.05); transform: translateY(-6px) }
    }
    .card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,.08) }
  `],
  template: `
  <div class="relative min-h-[100dvh] bg-brand-bg">
    <app-public-navbar></app-public-navbar>
    <div class="absolute inset-0 animated-gradient pointer-events-none"></div>

    <div class="relative grid min-h-[100dvh] place-items-center px-4">
      <div class="card w-full max-w-md rounded-2xl border border-white/30 bg-white/70 backdrop-blur-xl p-6 shadow-lg transition">
        <!-- Header -->
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-brand-primary/10 grid place-items-center">
            <span class="font-bold text-brand-primary">GF</span>
          </div>
          <div>
            <h1 class="text-2xl font-semibold text-brand-primary leading-tight">Entrar</h1>
            <p class="text-sm text-brand-muted">Acesse sua conta do GranaFlow</p>
          </div>
        </div>

        <form class="mt-6 space-y-4" (ngSubmit)="submit()">
          <!-- E-mail -->
          <label class="block">
            <span class="mb-1 block text-xs font-medium text-gray-600">E-mail</span>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M3 8l9 6 9-6M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"/>
                </svg>
              </span>
              <input
                class="w-full rounded-xl border border-gray-200 bg-white/80 pl-9 pr-3 py-2 outline-none transition
                       focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50"
                type="email"
                placeholder="voce@exemplo.com"
                [(ngModel)]="email"
                name="email"
                required
                autocomplete="email"
              />
            </div>
          </label>

          <!-- Senha -->
          <label class="block">
            <div class="mb-1 flex items-center justify-between">
              <span class="text-xs font-medium text-gray-600">Senha</span>
              <a routerLink="/register" class="text-[11px] text-brand-primary hover:underline">
                Criar conta
              </a>
            </div>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M12 11V7a4 4 0 10-8 0v4m2 0h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2h12z"/>
                </svg>
              </span>
              <input
                class="w-full rounded-xl border border-gray-200 bg-white/80 pl-9 pr-10 py-2 outline-none transition
                       focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50"
                [type]="showPassword ? 'text' : 'password'"
                placeholder="Sua senha"
                [(ngModel)]="password"
                name="password"
                required
                autocomplete="current-password"
              />
              <button
                type="button"
                (click)="togglePassword()"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label="Mostrar/ocultar senha"
              >
                <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.01 9.964 7.183a1.012 1.012 0 010 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.01-9.964-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.5 12c1.636 4.03 5.524 7 10.5 7 1.93 0 3.735-.457 5.32-1.268M9.88 9.88a3 3 0 104.24 4.24" />
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M6.228 6.228l11.544 11.544" />
                </svg>
              </button>
            </div>
          </label>

          <!-- Opções -->
          <div class="flex items-center justify-between pt-1">
            <label class="inline-flex items-center gap-2 text-sm text-gray-600 select-none">
              <input type="checkbox" [(ngModel)]="remember" name="remember"
                     class="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary/30" />
              Lembrar de mim
            </label>
            <button type="button"
                    class="text-sm text-brand-primary hover:underline"
                    (click)="goToReset()">
              Esqueceu a senha?
            </button>
          </div>

          <!-- Submit -->
          <button
            class="group w-full rounded-xl bg-brand-primary px-4 py-2.5 font-medium text-white transition
                   hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed
                   shadow-[0_8px_24px_rgba(0,0,0,0.12)] flex items-center justify-center gap-2"
            [disabled]="!email || !password || isLoading"
          >
            <svg *ngIf="isLoading" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 4v2m0 12v2m8-8h-2M6 12H4m12.364 6.364l-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0L16.95 7.05M7.05 16.95l-1.414 1.414"/>
            </svg>
            <span>Entrar</span>
            <svg class="h-4 w-4 transition group-hover:translate-x-0.5" xmlns="http://www.w3.org/2000/svg"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5-5 5M6 12h12"/>
            </svg>
          </button>
        </form>

        <div class="mt-5 text-center text-sm">
          Não tem conta?
          <a routerLink="/register" class="text-brand-primary underline underline-offset-4">Criar conta</a>
        </div>

        <p *ngIf="info" class="mt-3 text-sm text-brand-primary">{{ info }}</p>
        <p *ngIf="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
      </div>
    </div>
  </div>
  `,
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  error = '';
  info = '';
  showPassword = false;
  remember = true;
  isLoading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private ar: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Preenche e-mail salvo (se houver)
    const saved = localStorage.getItem('gf-email');
    if (saved) this.email = saved;
  }

  togglePassword() { this.showPassword = !this.showPassword; }

  goToReset() {
    // Ajuste a rota se você tiver uma página própria de reset
    this.router.navigate(['/reset-password'], { queryParams: { email: this.email || undefined } });
  }

  async submit() {
    this.error = '';
    this.info = '';
    this.isLoading = true;
    try {
      if (this.remember && this.email) {
        localStorage.setItem('gf-email', this.email);
      } else {
        localStorage.removeItem('gf-email');
      }

      await this.auth.signInWithPassword(this.email, this.password);
      const redirect = this.ar.snapshot.queryParamMap.get('redirect') ?? '/dashboard';
      this.router.navigateByUrl(redirect);
    } catch (e: any) {
      this.error = e?.message ?? 'Falha ao entrar';
    } finally {
      this.isLoading = false;
    }
  }
}
