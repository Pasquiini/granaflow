import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="max-w-3xl mx-auto py-16 px-6">
      <h1 class="text-3xl font-extrabold text-emerald-700 mb-4">Política de Privacidade</h1>
      <p class="text-gray-700 mb-4">
        O GranaFlow respeita sua privacidade. Coletamos apenas os dados necessários para
        garantir o funcionamento do sistema e não compartilhamos suas informações com terceiros.
      </p>
      <p class="text-gray-700 mb-4">
        Você pode excluir sua conta e todos os dados a qualquer momento nas configurações do perfil.
      </p>
      <p class="text-gray-700">Última atualização: {{ year }}</p>
    </section>
  `,
})
export class PrivacyPageComponent {
  year = new Date().getFullYear();
}
