import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, NgOptimizedImage],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '800ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'none' })
        ),
      ]),
    ]),
    trigger('staggerFade', [
      transition(':enter', [
        query(':self, *', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(120, [
            animate('700ms ease-out', style({ opacity: 1, transform: 'none' })),
          ]),
        ]),
      ]),
    ]),
  ],
  template: `
  <section class="relative min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-emerald-100 overflow-x-hidden">

    <!-- NAVBAR (sticky + glass) -->
    <nav class="sticky top-0 z-50 w-full" aria-label="principal">
      <div class="mx-auto max-w-7xl px-6 md:px-10">
        <div class="mt-4 mb-3 flex items-center justify-between rounded-2xl border border-emerald-100/60 bg-white/70 backdrop-blur-xl px-4 py-3 shadow-sm" @fadeIn>
          <a routerLink="/" class="flex items-center gap-2">
            <span class="text-2xl font-extrabold tracking-tight text-emerald-700">💰 GranaFlow</span>
            <span class="hidden md:inline text-xs text-emerald-700/70 border border-emerald-200 rounded-full px-2 py-0.5">Beta</span>
          </a>

          <div class="flex items-center gap-3 text-sm">
            <a href="#como-funciona" class="hidden md:inline text-gray-700 hover:text-emerald-700 transition">Como funciona</a>
            <a href="#recursos" class="hidden md:inline text-gray-700 hover:text-emerald-700 transition">Recursos</a>
            <a href="#planos" class="hidden md:inline text-gray-700 hover:text-emerald-700 transition">Planos</a>

            <!-- Mostrar botões conforme login -->
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

    <!-- HERO -->
    <header class="relative pt-14 md:pt-20" role="banner">
      <!-- SVG decor: blob animado -->
      <svg class="pointer-events-none absolute -top-24 -right-28 w-[520px] md:w-[680px] opacity-30" viewBox="0 0 600 600" aria-hidden="true">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stop-color="#10B981"/>
            <stop offset="100%" stop-color="#34D399"/>
          </linearGradient>
        </defs>
        <path fill="url(#g1)">
          <animate attributeName="d" dur="14s" repeatCount="indefinite"
            values="
            M438.5,303.5Q413,367,357.5,406Q302,445,238,430.5Q174,416,132.5,366.5Q91,317,92,251.5Q93,186,134.5,138Q176,90,238,84Q300,78,360.5,106Q421,134,444,192Q467,250,438.5,303.5Z;
            M460,316Q435,382,376.5,418.5Q318,455,248,438.5Q178,422,135,371.5Q92,321,96,253Q100,185,138,135.5Q176,86,241.5,76.5Q307,67,366,98.5Q425,130,455,190Q485,250,460,316Z;
            M438.5,303.5Q413,367,357.5,406Q302,445,238,430.5Q174,416,132.5,366.5Q91,317,92,251.5Q93,186,134.5,138Q176,90,238,84Q300,78,360.5,106Q421,134,444,192Q467,250,438.5,303.5Z
            " />
        </path>
      </svg>

      <div class="relative mx-auto max-w-7xl px-6 md:px-10">
        <div class="grid items-center gap-10 md:grid-cols-[1.1fr_1fr]">
          <div @fadeIn>
            <h1 class="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              Controle suas finanças de forma
              <span class="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">inteligente, visual e sem planilhas</span>
            </h1>
            <p class="mt-5 text-lg md:text-xl text-gray-600 max-w-xl">
              Centralize receitas e despesas, defina metas e veja insights práticos em um painel que acelera suas decisões.
            </p>

            <div class="mt-7 flex flex-col sm:flex-row gap-4" @staggerFade>
              <a routerLink="/register"
                class="rounded-xl bg-emerald-600 text-white px-6 py-3 font-medium hover:bg-emerald-700 transition shadow-lg">
                Começar grátis
              </a>
              <a href="#recursos"
                class="rounded-xl border border-emerald-600 px-6 py-3 font-medium text-emerald-700 hover:bg-emerald-50 transition">
                Explorar recursos
              </a>
            </div>

            <div class="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <span class="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                Sem cartão de crédito
              </div>
              <div class="flex items-center gap-2">
                <span class="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                Exporte para CSV/Excel
              </div>
              <div class="flex items-center gap-2">
                <span class="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                Privacidade em primeiro lugar
              </div>
            </div>
          </div>

          <!-- Mockup com moldura -->
          <div class="relative" @fadeIn>
            <div class="absolute inset-0 -z-10 rounded-[28px] bg-gradient-to-br from-emerald-100 to-white blur-2xl"></div>
            <img
              ngSrc="/home.png"
              width="980" height="620"
              alt="Prévia do dashboard do GranaFlow"
              class="w-full rounded-[28px] border border-emerald-100 shadow-2xl" />
          </div>
        </div>
      </div>

      <!-- separador diagonal -->
      <div class="mt-16 h-16 w-full [clip-path:polygon(0_0,100%_100%,0_100%)] bg-gradient-to-r from-emerald-600 to-emerald-500"></div>
    </header>

    <!-- COMO FUNCIONA -->
    <section id="como-funciona" class="bg-emerald-600 text-white py-16" @staggerFade>
      <div class="mx-auto max-w-7xl px-6 md:px-10">
        <h2 class="text-3xl md:text-4xl font-semibold text-white text-center">Como funciona</h2>
        <p class="mt-3 text-emerald-100 text-center max-w-2xl mx-auto">
          Em 3 passos simples você sai do caos para o controle.
        </p>

        <div class="mt-10 grid gap-6 md:grid-cols-3">
          <div class="rounded-2xl bg-white/10 p-6 backdrop-blur">
            <div class="text-2xl">①</div>
            <h3 class="mt-2 text-xl font-semibold">Conecte ou cadastre</h3>
            <p class="mt-1 text-emerald-100">Importe CSV/Excel ou cadastre manualmente suas transações.</p>
          </div>
          <div class="rounded-2xl bg-white/10 p-6 backdrop-blur">
            <div class="text-2xl">②</div>
            <h3 class="mt-2 text-xl font-semibold">Organize e categorize</h3>
            <p class="mt-1 text-emerald-100">Tags inteligentes e regras automáticas para classificar gastos.</p>
          </div>
          <div class="rounded-2xl bg-white/10 p-6 backdrop-blur">
            <div class="text-2xl">③</div>
            <h3 class="mt-2 text-xl font-semibold">Acompanhe metas</h3>
            <p class="mt-1 text-emerald-100">Alertas e projeções ajudam você a cumprir o orçamento.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- RECURSOS (grade irregular) -->
    <section id="recursos" class="py-20" @staggerFade>
      <div class="mx-auto max-w-7xl px-6 md:px-10">
        <h2 class="text-3xl md:text-4xl font-semibold text-gray-900 text-center">Diferenciais que você sente no bolso</h2>
        <p class="mt-3 text-gray-600 text-center max-w-2xl mx-auto">
          Menos tempo preenchendo, mais tempo decidindo.
        </p>

        <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[1fr]">
          <article class="rounded-2xl bg-white p-6 shadow hover:shadow-xl transition hover:-translate-y-0.5">
            <div class="text-emerald-600 text-4xl mb-3">📊</div>
            <h3 class="text-lg font-semibold">Dashboard inteligente</h3>
            <p class="mt-1 text-gray-600">Gráficos, filtros e comparativos por período, categoria e tag.</p>
          </article>

          <article class="rounded-2xl bg-white p-6 shadow hover:shadow-xl transition hover:-translate-y-0.5">
            <div class="text-emerald-600 text-4xl mb-3">💸</div>
            <h3 class="text-lg font-semibold">Regras automáticas</h3>
            <p class="mt-1 text-gray-600">Crie regras para classificar lançamentos repetitivos sem esforço.</p>
          </article>

          <article class="rounded-2xl bg-white p-6 shadow hover:shadow-xl transition hover:-translate-y-0.5 lg:row-span-2">
            <div class="text-emerald-600 text-4xl mb-3">🎯</div>
            <h3 class="text-lg font-semibold">Metas e alertas</h3>
            <p class="mt-1 text-gray-600">Limites por categoria, notificações de estouro e projeção mensal.</p>
            <div class="mt-4 rounded-xl border border-emerald-100 p-4">
              <p class="text-sm text-gray-500">Exemplo: “Restam R$ 320 no seu orçamento de Mercado este mês”.</p>
            </div>
          </article>

          <article class="rounded-2xl bg-white p-6 shadow hover:shadow-xl transition hover:-translate-y-0.5">
            <div class="text-emerald-600 text-4xl mb-3">🧭</div>
            <h3 class="text-lg font-semibold">Planejamento anual</h3>
            <p class="mt-1 text-gray-600">Visão macro por trimestre com sazonalidade e metas acumuladas.</p>
          </article>

          <article class="rounded-2xl bg-white p-6 shadow hover:shadow-xl transition hover:-translate-y-0.5">
            <div class="text-emerald-600 text-4xl mb-3">🔒</div>
            <h3 class="text-lg font-semibold">Privacidade primeiro</h3>
            <p class="mt-1 text-gray-600">Criptografia em repouso, exportações sob demanda e bloqueio por sessão.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- INTEGRAÇÕES & SEGURANÇA -->
    <section class="py-16 bg-white" @fadeIn>
      <div class="mx-auto max-w-7xl px-6 md:px-10">
        <div class="grid gap-8 md:grid-cols-2">
          <div>
            <h3 class="text-2xl font-semibold text-gray-900">Integrações simples</h3>
            <p class="mt-2 text-gray-600">Importe CSV/Excel, use tags e exporte relatórios em um clique.</p>
            <div class="mt-5 flex flex-wrap items-center gap-3 text-xs">
              <span class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">CSV</span>
              <span class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">Excel</span>
              <span class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">OFX (em breve)</span>
              <span class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">API (em breve)</span>
            </div>
          </div>
          <div>
            <h3 class="text-2xl font-semibold text-gray-900">Segurança que dá paz</h3>
            <ul class="mt-2 space-y-2 text-gray-600">
              <li class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>Criptografia em repouso</li>
              <li class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>Controle de sessão e logout remoto</li>
              <li class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>Exportação e exclusão de dados sob demanda</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- DEPOIMENTOS -->
    <section class="py-16 bg-gradient-to-b from-white to-emerald-50" @staggerFade>
      <div class="mx-auto max-w-7xl px-6 md:px-10">
        <h2 class="text-3xl font-semibold text-gray-900 text-center">O que dizem os primeiros usuários</h2>
        <div class="mt-10 grid gap-6 md:grid-cols-3">
          <figure class="rounded-2xl bg-white p-6 shadow border border-emerald-100">
            <blockquote class="text-gray-700">“Em 15 minutos organizei 6 meses de gastos. O painel é viciante.”</blockquote>
            <figcaption class="mt-3 text-sm text-gray-500">— Ana M., Autônoma</figcaption>
          </figure>
          <figure class="rounded-2xl bg-white p-6 shadow border border-emerald-100">
            <blockquote class="text-gray-700">“As regras automáticas economizam meu tempo toda semana.”</blockquote>
            <figcaption class="mt-3 text-sm text-gray-500">— Rafael T., MEI</figcaption>
          </figure>
          <figure class="rounded-2xl bg-white p-6 shadow border border-emerald-100">
            <blockquote class="text-gray-700">“Finalmente cumpri o orçamento de mercado 2 meses seguidos.”</blockquote>
            <figcaption class="mt-3 text-sm text-gray-500">— Júlia S., Designer</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- PLANOS (teaser) -->
    <section id="planos" class="py-16" @fadeIn>
      <div class="mx-auto max-w-7xl px-6 md:px-10">
        <h2 class="text-3xl font-semibold text-gray-900 text-center">Comece grátis. Evolua quando quiser.</h2>
        <div class="mt-10 grid gap-6 md:grid-cols-2">
          <div class="rounded-2xl bg-white p-6 border border-emerald-100 shadow hover:shadow-lg transition">
            <h3 class="text-xl font-semibold text-gray-900">Gratuito</h3>
            <p class="mt-1 text-gray-600">Perfeito para começar hoje.</p>
            <ul class="mt-4 space-y-2 text-gray-700">
              <li>• Até 1.000 lançamentos/mês</li>
              <li>• Metas básicas e exportação CSV</li>
              <li>• Dashboard essencial</li>
            </ul>
            <a routerLink="/register"
              class="mt-6 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-white hover:bg-emerald-700 transition">Criar conta</a>
          </div>
          <div class="relative rounded-2xl bg-gray-900 p-6 text-white border border-gray-800 shadow-lg">
            <span class="absolute -top-3 right-4 rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium">Mais popular</span>
            <h3 class="text-xl font-semibold">Pro</h3>
            <p class="mt-1 text-gray-300">Para quem quer automações e visão anual.</p>
            <ul class="mt-4 space-y-2 text-gray-100/90">
              <li>• Regras automáticas ilimitadas</li>
              <li>• Planejamento anual + projeções</li>
              <li>• Exportação Excel e relatórios</li>
            </ul>
            <a routerLink="/register"
              class="mt-6 inline-block rounded-lg bg-white px-5 py-2.5 text-gray-900 hover:bg-emerald-50 transition">Experimentar</a>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-16 bg-white" @staggerFade aria-labelledby="faq-title">
      <div class="mx-auto max-w-4xl px-6 md:px-10">
        <h2 id="faq-title" class="text-3xl font-semibold text-gray-900 text-center">Perguntas frequentes</h2>
        <div class="mt-8 space-y-3">
          <details class="group rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
            <summary class="cursor-pointer list-none font-medium text-gray-900 flex items-center justify-between">
              O GranaFlow é realmente gratuito?
              <span class="transition group-open:rotate-180">⌄</span>
            </summary>
            <p class="mt-3 text-gray-700">Sim. Há um plano gratuito com limites generosos. O Pro desbloqueia recursos avançados.</p>
          </details>
          <details class="group rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
            <summary class="cursor-pointer list-none font-medium text-gray-900 flex items-center justify-between">
              Posso importar meu histórico?
              <span class="transition group-open:rotate-180">⌄</span>
            </summary>
            <p class="mt-3 text-gray-700">Pode! CSV/Excel já disponíveis. OFX está no roadmap.</p>
          </details>
          <details class="group rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
            <summary class="cursor-pointer list-none font-medium text-gray-900 flex items-center justify-between">
              Como meus dados são protegidos?
              <span class="transition group-open:rotate-180">⌄</span>
            </summary>
            <p class="mt-3 text-gray-700">Criptografia em repouso, controle de sessão e exportação/remoção sob demanda.</p>
          </details>
        </div>
      </div>
    </section>

    <!-- CTA FINAL -->
    <section class="py-20 bg-emerald-700 text-center text-white px-6" @fadeIn>
      <h2 class="text-3xl md:text-4xl font-semibold mb-4">Pronto para dominar suas finanças?</h2>
      <p class="text-emerald-100 mb-8">Leva menos de 1 minuto para criar sua conta.</p>
      <a routerLink="/register"
        class="bg-white text-emerald-700 font-semibold rounded-lg px-8 py-3 hover:bg-emerald-100 transition">
        Criar conta gratuita
      </a>
    </section>

    <!-- FOOTER -->
    <footer class="border-t bg-white">
      <div class="mx-auto max-w-7xl px-6 md:px-10 py-10">
        <div class="grid gap-8 md:grid-cols-4 text-sm">
          <div>
            <div class="text-xl font-bold text-emerald-700">GranaFlow</div>
            <p class="mt-2 text-gray-600">Controle financeiro simples, poderoso e visual.</p>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900">Produto</h4>
            <ul class="mt-2 space-y-2 text-gray-600">
              <li><a href="#recursos" class="hover:text-emerald-700">Recursos</a></li>
              <li><a href="#planos" class="hover:text-emerald-700">Planos</a></li>
              <li><a routerLink="/login" class="hover:text-emerald-700">Entrar</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900">Suporte</h4>
            <ul class="mt-2 space-y-2 text-gray-600">
              <li><a href="#faq-title" class="hover:text-emerald-700">FAQ</a></li>
              <li><span class="text-gray-500">Status (em breve)</span></li>
              <li><span class="text-gray-500">Central de ajuda (em breve)</span></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900">Legal</h4>
            <ul class="mt-2 space-y-2 text-gray-600">
              <li><span class="text-gray-500">Privacidade</span></li>
              <li><span class="text-gray-500">Termos</span></li>
            </ul>
          </div>
        </div>
        <div class="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500">
          <p>© {{ year }} GranaFlow — Todos os direitos reservados.</p>
          <div class="flex items-center gap-3">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span class="text-xs">Construído com foco em privacidade</span>
          </div>
        </div>
      </div>
    </footer>
  </section>
  `,
})
export class LandingPageComponent implements OnInit {
  year = new Date().getFullYear();

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
  }

  isLoggedIn() {
    return this.auth.isLoggedIn();
  }
}
