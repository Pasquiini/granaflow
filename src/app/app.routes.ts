import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { PageShellComponent } from './shared/components/page-shell/page-shell.component';
import { PlanGuard } from './core/guards/plan.guard';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';

export const routes: Routes = [
  // 1️⃣ Landing Page pública
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/landing-page/landing-page.component').then(
        (m) => m.LandingPageComponent
      ),
  },
  { path: 'pricing', loadComponent: () => import('./features/public/pricing-page/pricing-page.component').then(m => m.PricingPageComponent) },
  { path: 'privacy', loadComponent: () => import('./features/public/privacy-page/privacy-page.component').then(m => m.PrivacyPageComponent) },
  { path: 'terms', loadComponent: () => import('./features/public/terms-page/terms-page.component').then(m => m.TermsPageComponent) },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  // 3️⃣ Área logada — com layout (Navbar + Sidebar)
  {
    path: '',
    canActivate: [authGuard],
    component: PageShellComponent, // 👈 layout interno
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent) },
      { path: 'accounts', loadComponent: () => import('./features/accounts/accounts-list/accounts-list.component').then(m => m.AccountsListComponent) },
      { path: 'accounts/new', loadComponent: () => import('./features/accounts/account-form/account-form.component').then(m => m.AccountFormComponent) },
      { path: 'accounts/:id', loadComponent: () => import('./features/accounts/account-form/account-form.component').then(m => m.AccountFormComponent) },
      { path: 'transactions', loadComponent: () => import('./features/transactions/transactions-list/transactions-list.component').then(m => m.TransactionsListComponent) },
      { path: 'transactions/new', loadComponent: () => import('./features/transactions/transaction-form/transaction-form.component').then(m => m.TransactionFormComponent) },
      { path: 'transactions/:id', loadComponent: () => import('./features/transactions/transaction-form/transaction-form.component').then(m => m.TransactionFormComponent) },
      { path: 'budgets', loadComponent: () => import('./features/budgets/budgets-list/budgets-list.component').then(m => m.BudgetsListComponent) },
      { path: 'budgets/new', loadComponent: () => import('./features/budgets/budget-form/budget-form.component').then(m => m.BudgetFormComponent) },
      { path: 'budgets/:id', loadComponent: () => import('./features/budgets/budget-form/budget-form.component').then(m => m.BudgetFormComponent) },
      { path: 'categories', loadComponent: () => import('./features/categories/categories-list/categories-list.component').then(m => m.CategoriesListComponent) },
      {
        path: 'insights',
        loadComponent: () => import('./features/insights/insights-page/insights-page.component').then(m => m.InsightsPageComponent),
        canActivate: [PlanGuard]
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports-page/reports-page.component').then(m => m.ReportsPageComponent),
        canActivate: [PlanGuard]
      },
      {
        path: 'goals',
        canActivate: [PlanGuard],
        data: { feature: 'goals', requiredPlan: 'pro' },
        loadComponent: () => import('./features/goals/goals-list.component').then(m => m.GoalsListComponent)
      },
      {
        path: 'goals/new',
        canActivate: [PlanGuard],
        data: { feature: 'goals', requiredPlan: 'pro' },
        loadComponent: () => import('./features/goals/goal-form.component').then(m => m.GoalFormComponent)
      },
      {
        path: 'goals/:id',
        canActivate: [PlanGuard],
        data: { feature: 'goals', requiredPlan: 'pro' },
        loadComponent: () => import('./features/goals/goal-detail.component').then(m => m.GoalDetailComponent)
      },
      { path: 'profile', loadComponent: () => import('./features/profile-page/profile-page.component').then(m => m.ProfilePageComponent) },
      { path: 'billing', loadComponent: () => import('./features/billing/billing-page.component').then(m => m.BillingPageComponent) },
      { path: 'billing/confirm', loadComponent: () => import('./features/billing/billing-confirm.component').then(m => m.BillingConfirmComponent) },
    ],
  },

  // 4️⃣ Fallback
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
