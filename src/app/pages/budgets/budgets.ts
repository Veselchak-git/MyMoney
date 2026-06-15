import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransactionService, CategoryService } from '../../services';
import { Category } from '../../models';
import { formatAmount } from '../../utils';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-budgets',
  imports: [FormsModule, CardModule, ButtonModule, InputNumberModule, ProgressBarModule],
  templateUrl: './budgets.html',
  styleUrl: './budgets.scss',
})
export class Budgets {
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);

  readonly categories = this.categoryService.categories;
  readonly transactions = this.transactionService.transactions;
  readonly editingId = signal<string | null>(null);
  readonly editValue = signal<number>(0);

  readonly currentMonthTx = computed(() => {
    const now = new Date();
    return this.transactionService.getByMonth(now.getFullYear(), now.getMonth() + 1);
  });

  readonly expensesByCategory = computed(() => {
    const map = new Map<string, number>();
    for (const tx of this.currentMonthTx().filter(t => t.type === 'expense')) {
      map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + tx.amount);
    }
    return map;
  });

  readonly expenseCategoriesWithBudget = computed<any[]>(() =>
    (this.categories() as any[]).filter((c: any) => (c.type === 'expense' || c.type === 'both') && c.budget != null && c.budget > 0)
  );

  getPercentage(spent: number, budget: number): number {
    return budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  }

  async startEdit(cat: any): Promise<void> {
    this.editingId.set(cat.id);
    this.editValue.set(cat.budget ?? 0);
  }

  async saveBudget(): Promise<void> {
    const id = this.editingId();
    if (!id) return;
    await this.categoryService.update(id, { budget: this.editValue() });
    this.editingId.set(null);
  }

  async removeBudget(id: string): Promise<void> {
    await this.categoryService.update(id, { budget: 0 });
  }

  protected readonly formatAmount = formatAmount;
}
