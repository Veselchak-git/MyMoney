import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../services';
import { CategoryService } from '../../services';
import { formatAmount, formatShortDate } from '../../utils';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CardModule, ButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);

  readonly transactions = this.transactionService.transactions;
  readonly categoryMap = this.categoryService.categoryMap;

  private get txList(): any[] { return this.transactions() as any[]; }

  readonly balance = computed(() =>
    this.transactionService.getBalance(this.txList as any)
  );

  readonly income = computed(() =>
    this.transactionService.getTotalIncome(this.txList as any)
  );

  readonly expense = computed(() =>
    this.transactionService.getTotalExpense(this.txList as any)
  );

  readonly recentTransactions = computed(() =>
    this.txList.slice(0, 5)
  );

  readonly currentMonthTx = computed(() => {
    const now = new Date();
    return this.transactionService.getByMonth(now.getFullYear(), now.getMonth() + 1) as any[];
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
