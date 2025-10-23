import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-plans',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="p-6">
      <h1 class="text-2xl font-bold text-emerald-700 mb-4">Planos e Assinaturas</h1>
      <p class="text-slate-600 mb-4">Gerencie os planos disponíveis e valores do GranaFlow.</p>

      <div class="rounded-xl border border-slate-200 p-4 bg-white">
        <p class="text-slate-500 text-sm italic">Gerenciamento de planos em desenvolvimento...</p>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlansComponent {}
