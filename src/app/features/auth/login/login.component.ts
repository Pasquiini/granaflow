import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="grid min-h-[100dvh] place-items-center bg-brand-bg/60">
    <div class="w-full max-w-md rounded-xl bg-white p-6 shadow">
      <h1 class="text-2xl font-semibold text-brand-primary">Entrar</h1>
      <p class="text-sm text-brand-muted">Acesse sua conta do GranaFlow</p>

      <form class="mt-6 space-y-3" (ngSubmit)="submit()">
        <input class="w-full rounded-lg border p-2" type="email" placeholder="E-mail" [(ngModel)]="email" name="email" required />
        <input class="w-full rounded-lg border p-2" type="password" placeholder="Senha" [(ngModel)]="password" name="password" required />
        <button class="w-full rounded-lg bg-brand-primary px-4 py-2 font-medium text-white hover:opacity-95">
          Entrar
        </button>
      </form>

      <div class="mt-4 text-center text-sm">
        Não tem conta?
        <a routerLink="/register" class="text-brand-primary underline">Criar conta</a>
      </div>

      <p *ngIf="error" class="mt-3 text-sm text-red-600">{{ error }}</p>
    </div>
  </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router, private ar: ActivatedRoute) {}

  async submit() {
    this.error = '';
    try {
      await this.auth.signInWithPassword(this.email, this.password);
      const redirect = this.ar.snapshot.queryParamMap.get('redirect') ?? '/dashboard';
      this.router.navigateByUrl(redirect);
    } catch (e: any) {
      this.error = e.message ?? 'Falha ao entrar';
    }
  }
}
