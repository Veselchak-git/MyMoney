import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TransactionService, CategoryService } from '../../services';
import { Transaction } from '../../models';
import { formatAmount, formatShortDate } from '../../utils';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-transactions',
  imports: [RouterLink, SelectModule, InputTextModule, FormsModule, DatePickerModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions {
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);

  readonly transactions = this.transactionService.transactions;
  readonly categories = this.categoryService.categories;
  readonly categoryMap = this.categoryService.categoryMap;

  readonly pendingDelete = signal<Transaction | null>(null);
  readonly deleting = signal(false);

  readonly filterTypeOptions = [
    { label: 'Все', value: 'all' },
    { label: 'Доходы', value: 'income' },
    { label: 'Расходы', value: 'expense' },
  ];

  readonly filterType = signal<string>('all');
  readonly filterCategory = signal<string>('');
  readonly searchText = signal('');
  readonly filterDate = signal<Date | undefined>(undefined);

  readonly filteredTransactions = computed(() => {
    let list = this.transactions();

    if (this.filterType() !== 'all') {
      list = list.filter(t => t.type === this.filterType());
    }

    if (this.filterCategory()) {
      list = list.filter(t => t.categoryId === this.filterCategory());
    }

    if (this.searchText()) {
      const q = this.searchText().toLowerCase();
      list = list.filter(t =>
        t.description?.toLowerCase().includes(q) ||
        this.categoryMap().get(t.categoryId)?.name?.toLowerCase().includes(q)
      );
    }

    if (this.filterDate()) {
      const d = this.filterDate()!;
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      list = list.filter(t => {
        const td = t.date.toDate();
        return td >= start && td < end;
      });
    }

    return list;
  });

  deleteConfirmMessage(tx: Transaction): string {
    const name = this.categoryMap().get(tx.categoryId)?.name || 'Без категории';
    const sign = tx.type === 'income' ? '+' : '−';
    return `Удалить транзакцию «${name}» (${sign}${formatAmount(tx.amount)})?`;
  }

  askDelete(tx: Transaction): void {
    this.pendingDelete.set(tx);
  }

  cancelDelete(): void {
    if (this.deleting()) return;
    this.pendingDelete.set(null);
  }

  async confirmDelete(): Promise<void> {
    const tx = this.pendingDelete();
    if (!tx) return;
    this.deleting.set(true);
    try {
      await this.transactionService.delete(tx.id);
      this.pendingDelete.set(null);
    } catch {
      console.error('Failed to delete transaction');
    } finally {
      this.deleting.set(false);
    }
  }

  resetFilters(): void {
    this.filterType.set('all');
    this.filterCategory.set('');
    this.searchText.set('');
    this.filterDate.set(undefined);
  }

  protected readonly formatAmount = formatAmount;
  protected readonly formatShortDate = formatShortDate;
}
