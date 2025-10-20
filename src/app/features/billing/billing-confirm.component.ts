import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingService } from '../../core/services/billing.service';

@Component({
  standalone: true,
  selector: 'app-billing-confirm',
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border p-4">
      <div class="text-sm text-gray-500">Processando...</div>
      <div class="mt-2 font-medium" *ngIf="ok">Plano atualizado! Redirecionando…</div>
      <div class="mt-2 text-red-600" *ngIf="err">{{ err }}</div>

      <div class="mt-3 text-xs text-gray-500" *ngIf="debug">
        <div>Status: {{ debug.status }}</div>
        <div>Collection: {{ debug.collection_status }}</div>
        <div>Payment ID: {{ debug.payment_id }}</div>
        <div>Preference ID: {{ debug.preference_id }}</div>
      </div>
    </div>
  `
})
export class BillingConfirmComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private billing = inject(BillingService);

  ok = false;
  err: string | null = null;

  debug: any = null;

  async ngOnInit() {
    try {
      const qp = this.route.snapshot.queryParamMap;

      // Mercado Pago pode mandar:
      // status=approved|pending|failure (via back_urls)
      // OU collection_status, payment_id, preference_id etc.
      const status = qp.get('status') || qp.get('collection_status') || 'unknown';
      const paymentId = qp.get('payment_id');
      const prefId = qp.get('preference_id');
      const mock = qp.get('mock');

      this.debug = { status, collection_status: qp.get('collection_status'), payment_id: paymentId, preference_id: prefId };

      // MOCK opcional (caso você teste sem MP)
      if (mock === '1' && (status === 'success' || status === 'approved')) {
        await this.billing.applyMockUpgrade?.('pro');
      }

      // Em produção, o webhook já terá promovido o plano quando status=approved.
      // Só damos feedback e voltamos para /billing. Se quiser, você pode
      // opcionalmente forçar um refresh da assinatura aqui (getMySubscription).
      if (status === 'approved' || status === 'success') {
        this.ok = true;
        setTimeout(() => this.router.navigate(['/billing']), 1200);
        return;
      }

      if (status === 'pending') {
        this.err = 'Pagamento pendente. Assim que for aprovado, seu Pro é liberado.';
      } else if (status === 'failure') {
        this.err = 'Pagamento não concluído. Você pode tentar novamente.';
      } else {
        this.err = 'Retorno do checkout não identificado.';
      }

    } catch (e: any) {
      this.err = e?.message || 'Falha ao confirmar assinatura.';
    }
  }
}
