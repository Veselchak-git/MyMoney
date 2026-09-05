import { Component, inject, computed } from '@angular/core';
import { TransactionService, CategoryService, AnalyticsService, ThemeService } from '../../services';
import { formatAmount } from '../../utils';
import { ChartModule } from 'primeng/chart';
import type { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-analytics',
  imports: [ChartModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
})
export class Analytics {
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private analyticsService = inject(AnalyticsService);
  private themeService = inject(ThemeService);

  readonly transactions = this.transactionService.transactions;
  readonly categories = this.categoryService.categories;

  readonly currentMonthTx = computed(() => {
    const now = new Date();
    return this.transactionService.getByMonth(now.getFullYear(), now.getMonth() + 1);
  });

  readonly expenseBreakdown = computed(() =>
    this.analyticsService.getByCategory(this.currentMonthTx(), this.categories(), 'expense')
  );

  readonly incomeBreakdown = computed(() =>
    this.analyticsService.getByCategory(this.currentMonthTx(), this.categories(), 'income')
  );

  readonly monthlyTotals = computed(() =>
    this.analyticsService.getMonthlyTotals(this.transactions(), 6)
  );

  readonly pieChartData = computed(() => ({
    labels: this.expenseBreakdown().map(i => i.category.name),
    datasets: [{
      data: this.expenseBreakdown().map(i => i.amount),
      backgroundColor: [
        '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
        '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
        '#06B6D4', '#D946EF', '#22C55E', '#EAB308', '#A855F7',
      ],
    }],
  }));

  private readonly chartColors = computed(() => {
    const dark = this.themeService.resolvedTheme() === 'dark';
    return {
      muted: dark ? '#94A3B8' : '#6B7280',
      grid: dark ? '#334155' : '#E5E7EB',
    };
  });

  readonly chartOptions = computed<ChartOptions<'pie'>>(() => {
    const { muted } = this.chartColors();
    return {
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 11 }, color: muted },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    };
  });

  readonly barChartData = computed(() => ({
    labels: this.monthlyTotals().map(i => i.month),
    datasets: [
      {
        label: 'Доходы',
        data: this.monthlyTotals().map(i => i.income),
        backgroundColor: '#10B981',
        borderRadius: 6,
      },
      {
        label: 'Расходы',
        data: this.monthlyTotals().map(i => i.expense),
        backgroundColor: '#EF4444',
        borderRadius: 6,
      },
    ],
  }));

  readonly barOptions = computed<ChartOptions<'bar'>>(() => {
    const { muted, grid } = this.chartColors();
    return {
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { size: 12 }, color: muted },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: muted },
        },
        y: {
          beginAtZero: true,
          grid: { color: grid },
          ticks: {
            color: muted,
            callback: (v: number | string) => formatAmount(Number(v)),
          },
        },
      },
    };
  });

  readonly lineChartData = computed(() => {
    const monthly = this.monthlyTotals();
    return {
      labels: monthly.map(i => i.month),
      datasets: [{
        label: 'Баланс',
        data: monthly.map(i => i.income - i.expense),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#10B981',
      }],
    };
  });

  readonly lineOptions = computed<ChartOptions<'line'>>(() => {
    const { muted, grid } = this.chartColors();
    return {
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { size: 12 }, color: muted },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: muted },
        },
        y: {
          beginAtZero: true,
          grid: { color: grid },
          ticks: {
            color: muted,
            callback: (v: number | string) => formatAmount(Number(v)),
          },
        },
      },
    };
  });

  protected readonly formatAmount = formatAmount;
}
