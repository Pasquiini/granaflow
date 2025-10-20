import { Component, OnInit } from '@angular/core';
import  Swal  from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <h1 class="text-2xl font-semibold text-brand-primary">Meu Perfil</h1>
      <p class="text-sm text-brand-muted">Gerencie suas informações pessoais</p>

      <div class="rounded-xl bg-white p-6 shadow">
        <div class="flex items-center gap-4">
          <div
            class="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xl"
          >
            {{ initials }}
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-800">{{ form.name }}</h2>
            <p class="text-sm text-gray-500">{{ form.email }}</p>
          </div>
        </div>
      </div>

      <form
        class="rounded-xl bg-white p-6 shadow space-y-4"
        (ngSubmit)="saveProfile()"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700">Nome completo</label>
          <input
            type="text"
            [(ngModel)]="form.name"
            name="name"
            class="mt-1 w-full rounded-lg border p-2"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">E-mail</label>
          <input
            type="email"
            [(ngModel)]="form.email"
            name="email"
            class="mt-1 w-full rounded-lg border p-2 bg-gray-100 text-gray-600"
            disabled
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Nova senha (opcional)</label>
          <input
            type="password"
            [(ngModel)]="form.password"
            name="password"
            class="mt-1 w-full rounded-lg border p-2"
            placeholder="Deixe em branco para manter a atual"
          />
        </div>

        <button
          type="submit"
          class="w-full rounded-lg bg-emerald-600 py-2 font-medium text-white hover:bg-emerald-700 transition"
        >
          Salvar alterações
        </button>
      </form>
    </div>
  `,
})
export class ProfilePageComponent implements OnInit {
  initials = '';
  form = { name: '', email: '', password: '' };

  constructor(private auth: AuthService) {}

  ngOnInit() {
    const user = this.auth.user();
    this.form.name = user?.user_metadata?.['full_name'] ?? 'Usuário';
    this.form.email = user?.email ?? 'email@exemplo.com';
    this.initials = this.form.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  async saveProfile() {
    try {
      const updates: any = { data: { full_name: this.form.name } };
      if (this.form.password.trim()) {
        updates.password = this.form.password.trim();
      }

      await this.auth['supa'].client.auth.updateUser(updates); // atualiza via supabase
      Swal.fire({
        icon: 'success',
        title: 'Perfil atualizado',
        text: 'Suas informações foram salvas com sucesso!',
        timer: 2000,
        showConfirmButton: false,
      });
      this.form.password = '';
    } catch (e: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao atualizar',
        text: e.message,
      });
    }
  }
}
