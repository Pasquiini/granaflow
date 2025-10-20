import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="max-w-3xl mx-auto py-16 px-6">
      <h1 class="text-3xl font-extrabold text-emerald-700 mb-4">Termos de Uso</h1>
      <p class="text-gray-700 mb-4">
        Ao criar uma conta no GranaFlow, você concorda em utilizar o sistema apenas para fins
        pessoais e legítimos. O uso indevido pode resultar na suspensão da conta.
      </p>
      <p class="text-gray-700 mb-4">
        O sistema é oferecido "como está", e podemos atualizar ou descontinuar recursos a qualquer momento.
      </p>
      <p class="text-gray-700">Última atualização: {{ year }}</p>
    </section>
  `,
})
export class TermsPageComponent {
  year = new Date().getFullYear();
}
