import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BillingService } from '../services/billing.service';

@Injectable({ providedIn: 'root' })
export class PlanGuard {
  constructor(private billing: BillingService, private router: Router) {}
  canActivate: CanActivateFn = async () => {
    const sub = await this.billing.getMySubscription();
    const ok = sub && (sub.status === 'active' || sub.status === 'trialing') && sub.plan_id === 'pro';
    if (!ok) {
      await this.router.navigate(['/billing'], { queryParams: { upgrade: 1 } });
      return false;
    }
    return true;
  };
}
