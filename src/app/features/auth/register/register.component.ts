import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="grid min-h-[100dvh] place-items-center bg-brand-bg/60">
    <div class="w-full max-w-md rounded-xl bg-white p-6 shadow">
      <h1 class="text-2xl font-semibold text-brand-primary">Criar conta</h1>
      <p class="text-sm text-brand-muted">Comece a organizar suas finanças</p>

      <form class="mt-6 space-y-3" (ngSubmit)="submit()">
        <input class="w-full rounded-lg border p-2" type="text" placeholder="Nome completo" [(ngModel)]="fullName" name="fullName" />
        <input class="w-full rounded-lg border p-2" type="email" placeholder="E-mail" [(ngModel)]="email" name="email" required />
        <input class="w-full rounded-lg border p-2" type="password" placeholder="Senha" [(ngModel)]="password" name="password" required />
        <button class="w-full rounded-lg bg-brand-primary px-4 py-2 font-medium text-white hover:opacity-95">
          Criar conta
        </button>
      </form>

      <div class="mt-4 text-center text-sm">
        Já tem conta?
        <a routerLink="/login" class="text-brand-primary underline">Entrar</a>
      </div>

      <p *ngIf="info" class="mt-3 text-sm text-brand-primary">{{ info }}</p>
      <p *ngIf="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    </div>
  </div>
  `,
})
export class RegisterComponent {
  email = '';
  password = '';
  fullName = '';
  error = '';
  info = '';

  constructor(private auth: AuthService, private router: Router) {}

  async submit() {
    this.error = ''; this.info = '';
    try {
      await this.auth.signUp(this.email, this.password, this.fullName);
      // Se confirmar por e-mail estiver ativo, você pode avisar o usuário:
      this.info = 'Conta criada! Você já pode entrar.';
      this.router.navigate(['/login']);
    } catch (e: any) {
      this.error = e.message ?? 'Falha ao criar conta';
    }
  }
}
