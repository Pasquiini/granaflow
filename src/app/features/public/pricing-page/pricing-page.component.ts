import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pricing-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-16">
      <div class="max-w-5xl mx-auto px-6 text-center">
        <h1 class="text-4xl font-extrabold text-emerald-700 mb-2">Planos e Preços</h1>
        <p class="text-gray-600 mb-12">Escolha o plano ideal para o seu controle financeiro.</p>

        <div class="grid md:grid-cols-2 gap-8">
          <div class="rounded-2xl bg-white p-6 shadow hover:shadow-lg transition">
            <h3 class="text-2xl font-semibold text-gray-900">Gratuito</h3>
            <p class="mt-1 text-gray-600">Perfeito para começar hoje.</p>
            <ul class="mt-4 space-y-2 text-gray-700 text-left">
              <li>• Até 1.000 lançamentos/mês</li>
              <li>• Metas básicas</li>
              <li>• Exportação CSV</li>
            </ul>
            <a routerLink="/register" class="mt-6 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-white hover:bg-emerald-700 transition">
              Criar conta gratuita
            </a>
          </div>

          <div class="relative rounded-2xl bg-gray-900 p-6 text-white border border-gray-800 shadow-lg">
            <span class="absolute -top-3 right-4 rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium">Mais popular</span>
            <h3 class="text-2xl font-semibold">Pro</h3>
            <p class="mt-1 text-gray-300">Para quem quer automação e visão anual.</p>
            <ul class="mt-4 space-y-2 text-gray-100/90 text-left">
              <li>• Regras automáticas ilimitadas</li>
              <li>• Planejamento anual + projeções</li>
              <li>• Exportação Excel e relatórios</li>
            </ul>
            <a routerLink="/register" class="mt-6 inline-block rounded-lg bg-white px-5 py-2.5 text-gray-900 hover:bg-emerald-50 transition">
              Experimentar
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class PricingPageComponent {}
