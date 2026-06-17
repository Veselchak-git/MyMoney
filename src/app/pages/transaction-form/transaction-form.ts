import { Component, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Timestamp } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { TransactionService, CategoryService } from '../../services';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-transaction-form',
  imports: [
    FormsModule, InputTextModule, InputNumberModule,
    SelectModule, DatePickerModule, TextareaModule,
    RouterLink,
  ],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.scss',
})
export class TransactionForm {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private auth = inject(Auth);
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);

  readonly isEdit = signal(false);
  readonly editId = signal<string | null>(null);
  readonly loading = signal(false);

  readonly type = signal<'income' | 'expense'>('expense');
  amount = 0;
  categoryId = '';
  date = new Date();
  description = '';

  readonly typeOptions = [
    { label: 'Расход', value: 'expense' },
    { label: 'Доход', value: 'income' },
  ];

  readonly categories = computed(() =>
    this.type() === 'income'
      ? this.categoryService.incomeCategories()
      : this.categoryService.expenseCategories()
  );

  readonly categoriesLoaded = this.categoryService.loaded;
  readonly categoriesError = this.categoryService.loadError;

  constructor() {
    const typeParam = this.route.snapshot.queryParamMap.get('type');
    if (typeParam === 'income' || typeParam === 'expense') {
      this.type.set(typeParam);
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.editId.set(id);
      const tx = this.transactionService.transactions().find(t => t.id === id);
      if (tx) {
        this.type.set(tx.type);
        this.amount = tx.amount;
        this.categoryId = tx.categoryId;
        this.date = tx.date.toDate();
        this.description = tx.description;
      }
    }
  }

  async save(): Promise<void> {
    if (!this.categoryId || !this.amount) return;
    const user = this.auth.currentUser;
    if (!user) return;
    this.loading.set(true);

    try {
      if (this.isEdit() && this.editId()) {
        await this.transactionService.update(this.editId()!, {
          type: this.type(),
          amount: this.amount,
          categoryId: this.categoryId,
          date: Timestamp.fromDate(this.date),
          description: this.description,
        });
      } else {
        await this.transactionService.create({
          userId: user.uid,
          type: this.type(),
          amount: this.amount,
          categoryId: this.categoryId,
          date: Timestamp.fromDate(this.date),
          description: this.description,
        });
      }
      await this.router.navigate(['/transactions']);
    } catch {
      console.error('Failed to save transaction');
    } finally {
      this.loading.set(false);
    }
  }
}
