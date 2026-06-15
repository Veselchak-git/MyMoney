import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TransactionService, CategoryService } from '../../services';
import { formatAmount, formatShortDate } from '../../utils';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-transactions',
  imports: [RouterLink, CardModule, ButtonModule, SelectModule, InputTextModule, FormsModule, DatePickerModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions {
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);

  readonly transactions = this.transactionService.transactions;
  readonly categories = this.categoryService.categories;
  readonly categoryMap = this.categoryService.categoryMap;

  readonly filterType = signal<'all' | 'income' | 'expense'>('all');
  readonly filterCategory = signal<string>('');
  readonly searchText = signal('');
  readonly filterDate = signal<Date | undefined>(undefined);

  readonly filteredTransactions = computed(() => {
    const all = this.transactions() as any[];
    let list = all;

    if (this.filterType() !== 'all') {
      list = list.filter((t: any) => t.type === this.filterType());
    }

    if (this.filterCategory()) {
      list = list.filter((t: any) => t.categoryId === this.filterCategory());
    }

    if (this.searchText()) {
      const q = this.searchText().toLowerCase();
      list = list.filter((t: any) =>
        t.description?.toLowerCase().includes(q) ||
        this.categoryMap().get(t.categoryId)?.name?.toLowerCase().includes(q)
      );
    }

    if (this.filterDate()) {
      const d = this.filterDate()!;
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      list = list.filter((t: any) => {
        const td = (t.date as any).toDate();
        return td >= start && td < end;
      });
    }

    return list;
  });

  async deleteTransaction(id: string): Promise<void> {
    await this.transactionService.delete(id);
  }

  protected readonly formatAmount = formatAmount;
  protected readonly formatShortDate = formatShortDate;
}
