import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth').then(m => m.AuthPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'transactions',
        loadComponent: () => import('./pages/transactions/transactions').then(m => m.Transactions),
      },
      {
        path: 'transactions/new',
        loadComponent: () => import('./pages/transaction-form/transaction-form').then(m => m.TransactionForm),
      },
      {
        path: 'transactions/:id/edit',
        loadComponent: () => import('./pages/transaction-form/transaction-form').then(m => m.TransactionForm),
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/categories/categories').then(m => m.Categories),
      },
      {
        path: 'budgets',
        loadComponent: () => import('./pages/budgets/budgets').then(m => m.Budgets),
      },
      {
        path: 'analytics',
        loadComponent: () => import('./pages/analytics/analytics').then(m => m.Analytics),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
