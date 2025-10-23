import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, JsonPipe, NgIf } from '@angular/common';
import { AdminPaymentRow } from '../../core/services/admin-billing.service';

@Component({
  selector: 'app-payment-detail-dialog',
  standalone: true,
  imports: [CommonModule, JsonPipe, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="open" class="fixed inset-0 z-[100]">
      <!-- backdrop -->
      <div class="absolute inset-0 bg-black/50" (click)="close()"></div>

      <!-- dialog -->
      <div
        class="absolute inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 top-16 md:top-20
               w-auto md:w-[720px] max-h-[80vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div class="flex items-center justify-between px-5 py-3 border-b bg-slate-50">
          <div>
            <h3 class="text-lg font-semibold text-slate-800">Detalhes do pagamento</h3>
            <p class="text-xs text-slate-500">ID: <span class="font-mono">{{ payment?.id }}</span></p>
          </div>
          <button
            class="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-200/70"
            (click)="close()"
            aria-label="Fechar">✕</button>
        </div>

        <div class="px-5 py-4 grid gap-3 text-sm">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-slate-500">E-mail</div>
              <div class="font-medium">{{ payment?.user_email || '—' }}</div>
            </div>
            <div>
              <div class="text-slate-500">Valor</div>
              <div class="font-medium">R$ {{ payment?.amount_brl | number:'1.2-2' }}</div>
            </div>
            <div>
              <div class="text-slate-500">Status</div>
              <div class="font-medium">{{ payment?.status || '—' }}</div>
            </div>
            <div>
              <div class="text-slate-500">Data</div>
              <div class="font-medium">{{ payment?.paid_at ? (payment?.paid_at | date:'short') : '—' }}</div>
            </div>
          </div>

          <div class="flex items-center justify-between mt-2">
            <h4 class="font-semibold text-slate-800">Payload (raw)</h4>
            <div class="flex gap-2">
              <button class="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
                      (click)="copyJson()">Copiar JSON</button>
              <button class="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
                      (click)="downloadJson()">Baixar JSON</button>
            </div>
          </div>

          <pre class="text-xs bg-slate-50 text-slate-800 rounded-lg p-3 overflow-auto max-h-[40vh]">{{ prettyJson }}</pre>
        </div>
      </div>
    </div>
  `
})
export class PaymentDetailDialogComponent {
  @Input() open = false;
  @Input() payment: AdminPaymentRow | null = null;
  @Output() closed = new EventEmitter<void>();

  get prettyJson(): string {
    const raw = this.payment?.raw ?? {};
    try { return JSON.stringify(raw, null, 2); } catch { return String(raw); }
  }

  close() { this.closed.emit(); }

  async copyJson() {
    try {
      await navigator.clipboard.writeText(this.prettyJson);
      // opcional: toast/snackbar (aqui só um alert simples)
      alert('JSON copiado para a área de transferência.');
    } catch {
      alert('Não foi possível copiar o JSON.');
    }
  }

  downloadJson() {
    const blob = new Blob([this.prettyJson], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const id = this.payment?.id || 'payment';
    a.href = url;
    a.download = `payment-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
