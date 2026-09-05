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
  readonly error = signal('');

  readonly type = signal<'income' | 'expense'>('expense');
  amount: number | null = null;
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

  setType(value: 'income' | 'expense'): void {
    this.type.set(value);
    this.categoryId = '';
    this.error.set('');
  }

  clearError(): void {
    this.error.set('');
  }

  private validate(): string {
    if (!this.categoriesLoaded()) {
      return 'Дождитесь загрузки категорий';
    }
    if (this.categoriesError()) {
      return this.categoriesError()!;
    }

    const missingAmount = this.amount == null;
    const nonPositiveAmount = !missingAmount && this.amount! <= 0;
    const invalidCategory =
      !this.categoryId || !this.categories().some(c => c.id === this.categoryId);

    if (missingAmount && invalidCategory) {
      return 'Укажите сумму и выберите категорию';
    }
    if (nonPositiveAmount && invalidCategory) {
      return 'Сумма должна быть положительной и выберите категорию';
    }
    if (missingAmount) {
      return 'Укажите сумму';
    }
    if (nonPositiveAmount) {
      return 'Сумма должна быть положительной';
    }
    if (invalidCategory) {
      return 'Выберите категорию';
    }
    return '';
  }

  async save(): Promise<void> {
    this.error.set('');

    const validationError = this.validate();
    if (validationError) {
      this.error.set(validationError);
      return;
    }

    const user = this.auth.currentUser;
    if (!user) {
      this.error.set('Войдите в аккаунт, чтобы сохранить');
      return;
    }
    this.loading.set(true);

    try {
      const amount = this.amount!;
      if (this.isEdit() && this.editId()) {
        await this.transactionService.update(this.editId()!, {
          type: this.type(),
          amount,
          categoryId: this.categoryId,
          date: Timestamp.fromDate(this.date),
          description: this.description,
        });
      } else {
        await this.transactionService.create({
          userId: user.uid,
          type: this.type(),
          amount,
          categoryId: this.categoryId,
          date: Timestamp.fromDate(this.date),
          description: this.description,
        });
      }
      await this.router.navigate(['/transactions']);
    } catch (err) {
      console.error('Failed to save transaction');
      this.error.set(err instanceof Error ? err.message : 'Не удалось сохранить транзакцию');
    } finally {
      this.loading.set(false);
    }
  }
}
