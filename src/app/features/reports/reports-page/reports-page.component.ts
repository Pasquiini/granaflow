import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ReportsService, ReportType } from '../../../core/services/reports.service';
import { CategoriesService } from '../../../core/services/categories.service';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  standalone: true,
  selector: 'app-reports-page',
  imports: [CommonModule, FormsModule, BaseChartDirective],
  providers: [DatePipe],
  template: `
  <div class="space-y-4">
    <div class="rounded-xl bg-white p-6 shadow">
      <h1 class="text-2xl font-semibold text-brand-primary">Relatórios</h1>
      <p class="text-sm text-brand-muted">Filtre por período, tipo e categoria</p>

      <form class="mt-4 grid gap-3 sm:grid-cols-5">
        <div>
          <label class="text-sm text-gray-600">Início</label>
          <input type="date" class="mt-1 w-full rounded-lg border p-2"
                 [(ngModel)]="start" name="start" (change)="reload()" />
        </div>
        <div>
          <label class="text-sm text-gray-600">Fim</label>
          <input type="date" class="mt-1 w-full rounded-lg border p-2"
                 [(ngModel)]="end" name="end" (change)="reload()" />
        </div>
        <div>
          <label class="text-sm text-gray-600">Tipo</label>
          <select class="mt-1 w-full rounded-lg border p-2"
                  [(ngModel)]="type" name="type" (change)="reload()">
            <option [ngValue]="null">Todos</option>
            <option value="expense">Despesas</option>
            <option value="income">Receitas</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="text-sm text-gray-600">Categoria</label>
          <select class="mt-1 w-full rounded-lg border p-2"
                  [(ngModel)]="categoryId" name="categoryId" (change)="reload()">
            <option [ngValue]="null">Todas</option>
            <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
          </select>
        </div>
      </form>

      <div class="mt-4 flex flex-wrap items-center gap-2">
        <button class="rounded-lg border px-3 py-2 hover:bg-gray-50" (click)="exportCSV()">Exportar CSV</button>
        <button class="rounded-lg border px-3 py-2 hover:bg-gray-50" (click)="exportPDF()">Exportar PDF</button>
      </div>
    </div>

    <!-- Gráfico de barras -->
    <div class="rounded-xl bg-white p-6 shadow">
      <div class="mb-3 text-sm font-medium text-gray-700">Receitas x Despesas (diário)</div>
      <canvas baseChart [type]="'bar'" [data]="barData" [options]="barOptions"></canvas>
    </div>

    <!-- Totais por categoria -->
    <div class="rounded-xl bg-white p-6 shadow">
      <div class="mb-2 text-sm font-medium text-gray-700">Totais por categoria</div>
      <div class="overflow-x-auto">
        <table class="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr class="text-left text-xs uppercase text-gray-500">
              <th class="px-3 py-2">Categoria</th>
              <th class="px-3 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of categoryTotals" class="rounded bg-gray-50">
              <td class="px-3 py-2">{{ r.category_name }}</td>
              <td class="px-3 py-2 text-right">R$ {{ r.total | number:'1.2-2' }}</td>
            </tr>
            <tr *ngIf="!loading && categoryTotals.length===0">
              <td colspan="2" class="px-3 py-6 text-center text-brand-muted">Sem dados no período</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detalhado -->
    <div class="rounded-xl bg-white p-6 shadow">
      <div class="mb-2 text-sm font-medium text-gray-700">Detalhado</div>
      <div class="overflow-x-auto">
        <table class="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr class="text-left text-xs uppercase text-gray-500">
              <th class="px-3 py-2">Data</th>
              <th class="px-3 py-2">Descrição</th>
              <th class="px-3 py-2">Categoria</th>
              <th class="px-3 py-2">Conta</th>
              <th class="px-3 py-2">Tipo</th>
              <th class="px-3 py-2 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of detailed" class="rounded bg-gray-50">
              <td class="px-3 py-2">{{ formatDate(t.occurred_at) }}</td>
              <td class="px-3 py-2">{{ t.description || '-' }}</td>
              <td class="px-3 py-2">{{ t.category_name }}</td>
              <td class="px-3 py-2">{{ t.account_name }}</td>
              <td class="px-3 py-2">{{ getTypeLabel(t.type) }}</td>
              <td class="px-3 py-2 text-right"
                  [class.text-red-700]="t.type==='expense'"
                  [class.text-emerald-700]="t.type==='income'">
                {{ (t.type==='expense' ? -t.amount : t.amount) | currency:'BRL':'symbol-narrow':'1.2-2' }}
              </td>
            </tr>
            <tr *ngIf="!loading && detailed.length===0">
              <td colspan="6" class="px-3 py-6 text-center text-brand-muted">Sem transações</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `,
})
export class ReportsPageComponent implements OnInit {
  start = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  end = new Date().toISOString().slice(0, 10);
  type: ReportType = null;
  categoryId: string | null = null;

  categories: Array<{ id: string; name: string }> = [];
  categoryTotals: Array<{ category_id: string | null; category_name: string; total: number }> = [];
  detailed: Array<any> = [];
  loading = true;

  barData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { label: 'Receitas', data: [] },
      { label: 'Despesas', data: [] }
    ]
  };
  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true } }
  };

  constructor(
    private reports: ReportsService,
    private catsSvc: CategoriesService,
    private datePipe: DatePipe
  ) {}

  async ngOnInit() {
    this.categories = await this.catsSvc.list('expense');
    await this.reload();
  }

  async reload() {
    this.loading = true;
    this.categoryTotals = await this.reports.categoryTotals(this.start, this.end, this.type);
    this.detailed = await this.reports.detailed(this.start, this.end, this.type, this.categoryId);
    const daily: Array<{ day: string; income_total: number; expense_total: number }> =
      await this.reports.dailyTotals(this.start, this.end);
    this.barData = {
      labels: daily.map(d => d.day.split('-').reverse().join('/')),
      datasets: [
        { label: 'Receitas', data: daily.map(d => d.income_total) },
        { label: 'Despesas', data: daily.map(d => d.expense_total) }
      ]
    };
    this.loading = false;
  }

  /** Formata a data em dd/MM/yyyy */
  formatDate(dateStr: string): string {
    return this.datePipe.transform(dateStr, 'dd/MM/yyyy') || dateStr;
  }

  /** Traduz o tipo da transação */
  getTypeLabel(type: string): string {
    if (type === 'income') return 'Receita';
    if (type === 'expense') return 'Despesa';
    return '-';
  }

  /** Exporta CSV */
  exportCSV() {
    const rows = [
      ['Data', 'Descrição', 'Categoria', 'Conta', 'Tipo', 'Valor'],
      ...this.detailed.map(t => [
        this.formatDate(t.occurred_at),
        (t.description ?? '').replace(/[\r\n]+/g, ' '),
        t.category_name,
        t.account_name,
        this.getTypeLabel(t.type),
        String(t.amount).replace('.', ',')
      ])
    ];
    const csv = rows.map(r => r.map(field => {
      const f = String(field ?? '');
      return /[",;\n]/.test(f) ? `"${f.replace(/"/g, '""')}"` : f;
    }).join(';')).join('\n');

    const blob = new Blob([new TextEncoder().encode(csv)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `relatorio_${this.start}_a_${this.end}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  /** Exporta PDF */
  exportPDF() {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const title = 'Relatório Financeiro';
    const subtitle =
      `Período: ${this.formatDate(this.start)} a ${this.formatDate(this.end)}` +
      (this.type ? ` — Tipo: ${this.getTypeLabel(this.type)}` : '') +
      (this.categoryId ? ' — Categoria filtrada' : '');

    doc.setFontSize(16);
    doc.text(title, 40, 40);
    doc.setFontSize(10);
    doc.text(subtitle, 40, 58);

    const catBody = this.categoryTotals.map(c => [c.category_name, `R$ ${Number(c.total).toFixed(2)}`]);
    autoTable(doc, {
      startY: 80,
      head: [['Categoria', 'Total']],
      body: catBody.length ? catBody : [['Sem dados', '-']],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [243, 244, 246], textColor: 33 },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: 40, right: 40 }
    });

    const startY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 20 : 120;
    const detBody = this.detailed.map(t => [
      this.formatDate(t.occurred_at),
      t.description || '-',
      t.category_name,
      t.account_name,
      this.getTypeLabel(t.type),
      (t.type === 'expense' ? -Number(t.amount) : Number(t.amount)).toFixed(2)
    ]);

    autoTable(doc, {
      startY,
      head: [['Data', 'Descrição', 'Categoria', 'Conta', 'Tipo', 'Valor']],
      body: detBody.length ? detBody : [['Sem transações', '', '', '', '', '']],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [243, 244, 246], textColor: 33 },
      columnStyles: { 5: { halign: 'right' } },
      margin: { left: 40, right: 40 }
    });

    doc.save(`relatorio_${this.start}_a_${this.end}.pdf`);
  }
}
