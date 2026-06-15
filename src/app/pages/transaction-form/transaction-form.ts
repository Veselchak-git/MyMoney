import { Component, inject, signal, computed, effect } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Timestamp } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { TransactionService, CategoryService } from '../../services';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-transaction-form',
  imports: [
    FormsModule, CardModule, ButtonModule, InputTextModule, InputNumberModule,
    SelectModule, SelectButtonModule, DatePickerModule, TextareaModule,
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

  type = 'expense';
  amount = 0;
  categoryId = '';
  date = new Date();
  description = '';

  readonly typeOptions = [
    { label: 'Расход', value: 'expense' },
    { label: 'Доход', value: 'income' },
  ];

  readonly categories = computed(() =>
    this.type === 'income'
      ? this.categoryService.incomeCategories()
      : this.categoryService.expenseCategories()
  );

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.editId.set(id);
      const tx = (this.transactionService
        .transactions() as any[]).find((t: any) => t.id === id);
      if (tx) {
        this.type = tx.type;
        this.amount = tx.amount;
        this.categoryId = tx.categoryId;
        this.date = (tx.date as any).toDate();
        this.description = tx.description;
      }
    }
  }

  async save(): Promise<void> {
    if (!this.categoryId || !this.amount) return;

    this.loading.set(true);
    const user = this.auth.currentUser!;

    try {
      if (this.isEdit() && this.editId()) {
        await this.transactionService.update(this.editId()!, {
          type: this.type as 'income' | 'expense',
          amount: this.amount,
          categoryId: this.categoryId,
          date: Timestamp.fromDate(this.date),
          description: this.description,
        });
      } else {
        await this.transactionService.create({
          userId: user.uid,
          type: this.type as 'income' | 'expense',
          amount: this.amount,
          categoryId: this.categoryId,
          date: Timestamp.fromDate(this.date),
          description: this.description,
        });
      }
      await this.router.navigate(['/transactions']);
    } finally {
      this.loading.set(false);
    }
  }
}
