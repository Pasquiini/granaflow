import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="p-6">
      <h1 class="text-2xl font-bold text-emerald-700 mb-4">Configurações Administrativas</h1>
      <p class="text-slate-600 mb-4">Ajuste permissões, parâmetros e preferências do painel administrativo.</p>

      <div class="rounded-xl border border-slate-200 p-4 bg-white">
        <p class="text-slate-500 text-sm italic">Área de configurações em construção...</p>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {}
