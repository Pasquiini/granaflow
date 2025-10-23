import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service'; // ajuste o caminho se necessário
import { from, map, Observable } from 'rxjs';

export type RevenuePoint = { label: string; value: number };

export interface OverviewMetrics {
  activeUsers: number;
  proSubscriptions: number;
  mrr: number;
  trends: {
    users: number[];
    pro: number[];
    mrr: number[];
  };
  revenueByMonth: RevenuePoint[];
}

@Injectable({ providedIn: 'root' })
export class AdminMetricsService {
  private readonly supabase = inject(SupabaseService);

  getOverview$(): Observable<OverviewMetrics> {
    return from(
      this.supabase.client.rpc('admin_overview')  // 👈 chama o RPC
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        // o RPC retorna um JSON (jsonb). Apenas tipamos/validamos campos:
        const d = data as any;
        return {
          activeUsers: Number(d?.activeUsers ?? 0),
          proSubscriptions: Number(d?.proSubscriptions ?? 0),
          mrr: Number(d?.mrr ?? 0),
          trends: {
            users: Array.isArray(d?.trends?.users) ? d.trends.users.map(Number) : [],
            pro:   Array.isArray(d?.trends?.pro)   ? d.trends.pro.map(Number)   : [],
            mrr:   Array.isArray(d?.trends?.mrr)   ? d.trends.mrr.map(Number)   : [],
          },
          revenueByMonth: Array.isArray(d?.revenueByMonth)
            ? d.revenueByMonth.map((x: any) => ({ label: String(x.label), value: Number(x.value) }))
            : []
        } as OverviewMetrics;
      })
    );
  }

  /** % de crescimento entre primeiro e último ponto */
  growthPct(series: number[]): number {
    if (!series?.length) return 0;
    const first = series[0];
    const last  = series[series.length - 1];
    if (first === 0) return 0;
    return ((last - first) / Math.abs(first)) * 100;
  }
}
