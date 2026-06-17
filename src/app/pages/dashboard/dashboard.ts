import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../services';
import { CategoryService } from '../../services';
import { Transaction } from '../../models';
import { formatAmount, formatShortDate } from '../../utils';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);

  readonly transactions = this.transactionService.transactions;
  readonly categoryMap = this.categoryService.categoryMap;

  readonly periodOptions = ['day', 'week', 'month', 'year', 'all'] as const;
  readonly selectedPeriod = signal<'day' | 'week' | 'month' | 'year' | 'all'>('all');

  private getPeriodFilter(): (t: Transaction) => boolean {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const period = this.selectedPeriod();

    switch (period) {
      case 'day': {
        const tomorrow = new Date(startOfDay);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return (t: Transaction) => {
          const d = t.date.toDate();
          return d >= startOfDay && d < tomorrow;
        };
      }
      case 'week': {
        const weekAgo = new Date(startOfDay);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return (t: Transaction) => {
          const d = t.date.toDate();
          return d >= weekAgo;
        };
      }
      case 'month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return (t: Transaction) => {
          const d = t.date.toDate();
          return d >= startOfMonth;
        };
      }
      case 'year': {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return (t: Transaction) => {
          const d = t.date.toDate();
          return d >= startOfYear;
        };
      }
      default:
        return () => true;
    }
  }

  readonly balance = computed(() =>
    this.transactionService.getBalance(this.transactions())
  );

  readonly periodTx = computed(() =>
    this.transactions().filter(this.getPeriodFilter())
  );

  readonly income = computed(() =>
    this.transactionService.getTotalIncome(this.periodTx())
  );

  readonly expense = computed(() =>
    this.transactionService.getTotalExpense(this.periodTx())
  );

  readonly periodLabel = computed(() => {
    switch (this.selectedPeriod()) {
      case 'day': return 'За сегодня';
      case 'week': return 'За 7 дней';
      case 'month': return 'За месяц';
      case 'year': return 'За год';
      case 'all': return 'За всё время';
    }
  });

  readonly recentTransactions = computed(() =>
    this.transactions().slice(0, 3)
  );

  readonly currentMonthTx = computed(() => {
    const now = new Date();
    return this.transactionService.getByMonth(now.getFullYear(), now.getMonth() + 1);
  });

  readonly monthIncome = computed(() =>
    this.transactionService.getTotalIncome(this.currentMonthTx())
  );

  readonly monthExpense = computed(() =>
    this.transactionService.getTotalExpense(this.currentMonthTx())
  );

  protected readonly formatAmount = formatAmount;
  protected readonly formatShortDate = formatShortDate;
}
