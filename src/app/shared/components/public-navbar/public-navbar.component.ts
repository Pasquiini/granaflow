import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <nav class="sticky top-0 z-50 w-full bg-transparent" aria-label="principal">
    <div class="mx-auto max-w-7xl px-6 md:px-10">
      <div class="mt-4 mb-3 flex items-center justify-between rounded-2xl border border-emerald-100/60 bg-white/70 backdrop-blur-xl px-4 py-3 shadow-sm">
        <a routerLink="/" class="flex items-center gap-2">
          <span class="text-2xl font-extrabold tracking-tight text-emerald-700">💰 GranaFlow</span>
          <span class="hidden md:inline text-xs text-emerald-700/70 border border-emerald-200 rounded-full px-2 py-0.5">Beta</span>
        </a>

        <div class="flex items-center gap-3 text-sm">
          <a href="/#como-funciona" class="hidden md:inline text-gray-700 hover:text-emerald-700 transition">Como funciona</a>
          <a href="/#recursos" class="hidden md:inline text-gray-700 hover:text-emerald-700 transition">Recursos</a>
          <a href="/#planos" class="hidden md:inline text-gray-700 hover:text-emerald-700 transition">Planos</a>

          <ng-container *ngIf="!isLoggedIn(); else logged">
            <a routerLink="/login" class="text-gray-700 hover:text-emerald-700 transition">Entrar</a>
            <a routerLink="/register"
               class="rounded-lg bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 transition shadow-md">
               Criar conta
            </a>
          </ng-container>

          <ng-template #logged>
            <a routerLink="/dashboard"
               class="rounded-lg bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 transition shadow-md">
               Acessar o sistema
            </a>
          </ng-template>
        </div>
      </div>
    </div>
  </nav>
  `
})
export class PublicNavbarComponent {
  constructor(private auth: AuthService) {}
  isLoggedIn() { return this.auth.isLoggedIn(); }
}
