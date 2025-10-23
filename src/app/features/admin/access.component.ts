import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, switchMap, map, debounceTime } from 'rxjs';
import { AdminAccessService, AdminRow } from '../../core/services/admin-access.service';

@Component({
  selector: 'app-admin-access',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="p-6">
      <div class="mb-4">
        <h1 class="text-2xl font-bold text-emerald-700">Acesso de Administradores</h1>
        <p class="text-slate-600">Gerencie e-mails com permissão de administrador.</p>
      </div>

      <form class="flex flex-wrap gap-2 items-center mb-4" (ngSubmit)="add()">
        <input
          class="flex-1 min-w-[260px] rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
          type="email" placeholder="email@exemplo.com"
          [(ngModel)]="email" name="email" required
        />
        <button
          class="rounded-lg border border-emerald-600 text-emerald-700 px-3 py-2 hover:bg-emerald-50"
          type="submit"
          [disabled]="busy"
        >Adicionar</button>
      </form>

      <div class="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-slate-600">
            <tr>
              <th class="text-left px-4 py-2">E-mail</th>
              <th class="text-left px-4 py-2">Adicionado em</th>
              <th class="text-right px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr *ngFor="let a of admins$ | async">
              <td class="px-4 py-2">{{ a.email }}</td>
              <td class="px-4 py-2">{{ a.created_at | date:'short' }}</td>
              <td class="px-4 py-2 text-right">
                <button
                  class="px-2 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50"
                  (click)="remove(a.email)"
                  [disabled]="busy"
                >Remover</button>
              </td>
            </tr>
            <tr *ngIf="(admins$ | async)?.length === 0">
              <td colspan="3" class="px-4 py-6 text-center text-slate-500">
                Nenhum administrador cadastrado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class AdminAccessComponent {
  private svc = inject(AdminAccessService);

  email = '';
  busy = false;

  private refresh$ = new BehaviorSubject<void>(void 0);

  admins$ = this.refresh$.pipe(
    debounceTime(50),
    switchMap(() => this.svc.list$()),
    map(list => list.sort((a, b) => a.email.localeCompare(b.email)))
  );

  async add() {
    const e = (this.email || '').trim().toLowerCase();
    if (!e) return;
    this.busy = true;
    try {
      await this.svc.add$(e).toPromise();
      this.email = '';
      this.refresh$.next();
      alert('Administrador adicionado com sucesso.');
    } catch (err: any) {
      alert('Erro ao adicionar: ' + (err?.message || 'desconhecido'));
    } finally {
      this.busy = false;
    }
  }

  async remove(email: string) {
    if (!confirm(`Remover '${email}' dos administradores?`)) return;
    this.busy = true;
    try {
      await this.svc.remove$(email).toPromise();
      this.refresh$.next();
      alert('Administrador removido.');
    } catch (err: any) {
      alert('Erro ao remover: ' + (err?.message || 'desconhecido'));
    } finally {
      this.busy = false;
    }
  }
}
