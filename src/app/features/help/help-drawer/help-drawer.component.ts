import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FAQ, FaqItem, ONBOARDING_STEPS, Step } from '../../../core/models/help.model';

@Component({
  selector: 'app-help-drawer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- overlay -->
    <div
      *ngIf="open"
      class="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[1px] motion-reduce:transition-none"
      (click)="close()"
    ></div>

    <!-- DESKTOP/TABLET (md+) -->
    <aside
      class="fixed right-0 top-0 z-[61] hidden h-dvh w-[380px] bg-white shadow-xl
             transition-transform duration-200 will-change-transform p-4 overflow-y-auto md:block
             md:rounded-l-2xl"
      [ngClass]="open ? 'translate-x-0' : 'translate-x-full'"
      role="dialog" aria-modal="true" aria-label="Ajuda do GranaFlow (desktop)"
      (click)="$event.stopPropagation()"
    >
      <ng-container *ngTemplateOutlet="content"></ng-container>
    </aside>

    <!-- MOBILE (<md) -->
    <aside
      class="fixed bottom-0 left-0 right-0 z-[61] block bg-white shadow-2xl
             transition-transform duration-200 will-change-transform p-4 overflow-y-auto md:hidden
             rounded-t-2xl max-h-[85vh]"
      [ngClass]="open ? 'translate-y-0' : 'translate-y-full'"
      [style.paddingBottom]="'max(env(safe-area-inset-bottom, 16px),16px)'"
      role="dialog" aria-modal="true" aria-label="Ajuda do GranaFlow (mobile)"
      (click)="$event.stopPropagation()"
    >
      <div class="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-300/80"></div>
      <ng-container *ngTemplateOutlet="content"></ng-container>
    </aside>

    <ng-template #content>
      <header class="mb-3 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-emerald-700">Ajuda</h2>
        <button
          class="rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100"
          (click)="close()"
          aria-label="Fechar ajuda"
        >✕</button>
      </header>

      <!-- WhatsApp -->
      <section class="mb-4 rounded-xl border border-emerald-200/60 p-3 bg-emerald-50/50">
        <h3 class="font-medium text-emerald-800 flex items-center gap-2">
          Precisa de ajuda humana? <span>💬</span>
        </h3>
        <p class="text-sm text-emerald-900/80 mt-1">Fale com o suporte da DevPas Tech pelo WhatsApp.</p>
        <a
          class="mt-2 inline-flex items-center justify-center rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          [href]="whatsUrl" target="_blank" rel="noopener"
          (click)="emitMetric('whatsapp_clicked')"
        >Abrir WhatsApp</a>
        <p class="mt-2 text-[11px] text-emerald-900/60">Ao abrir o WhatsApp, você será redirecionado para um app externo.</p>
      </section>

      <!-- Onboarding -->
      <section class="mb-4">
        <h3 class="font-medium text-slate-800">Comece por aqui</h3>
        <div class="mt-2 grid gap-2 sm:grid-cols-1">
          <div *ngFor="let s of steps" class="rounded-xl border border-slate-200/80 p-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="font-medium text-slate-800 truncate">{{ s.title }}</div>
                <div class="text-sm text-slate-600">{{ s.desc }}</div>
              </div>
              <a
                *ngIf="s.route"
                [routerLink]="s.route"
                class="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                (click)="emitMetric('onboarding_step_opened', s.id); close()"
              >Ir agora</a>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section>
        <h3 class="font-medium text-slate-800">Perguntas rápidas</h3>
        <div class="mt-2 divide-y divide-slate-200/80 rounded-xl border border-slate-200/80 bg-white">
          <details *ngFor="let f of faq" class="group p-3">
            <summary
              class="cursor-pointer list-none font-medium text-slate-800 outline-none
                     transition-colors group-open:text-emerald-700"
              (click)="emitMetric('faq_clicked', f.q)"
            >
              <span class="mr-2">❓</span><span class="align-middle">{{ f.q }}</span>
            </summary>
            <p class="mt-2 text-sm text-slate-700">{{ f.a }}</p>
          </details>
        </div>
      </section>
    </ng-template>
  `,
})
export class HelpDrawerComponent {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();

  faq: FaqItem[] = FAQ;
  steps: Step[] = ONBOARDING_STEPS;

  whatsUrl = 'https://wa.me/5517996499888?text=Ol%C3%A1%20DevPas%20Tech%2C%20preciso%20de%20ajuda%20no%20GranaFlow.';

  close() { this.closed.emit(); }
  emitMetric(name: string, payload?: string) { console.log('[help_metric]', name, payload ?? null); }

  @HostListener('document:keydown.escape')
  onEsc() { if (this.open) this.close(); }
}
