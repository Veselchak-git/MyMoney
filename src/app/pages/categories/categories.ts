import { Component, inject, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-categories',
  imports: [FormsModule, CardModule, ButtonModule, InputTextModule, DialogModule, SelectModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  private categoryService = inject(CategoryService);
  private auth = inject(Auth);

  readonly categories = this.categoryService.categories;

  readonly showDialog = signal(false);
  readonly editingId = signal<string | null>(null);
  name = '';
  icon = 'pi pi-tag';
  type: 'income' | 'expense' = 'expense';
  loading = signal(false);

  readonly icons = [
    { label: 'Кошелёк', value: 'pi pi-wallet' },
    { label: 'Зарплата', value: 'pi pi-briefcase' },
    { label: 'Магазин', value: 'pi pi-shopping-cart' },
    { label: 'Дом', value: 'pi pi-home' },
    { label: 'Машина', value: 'pi pi-car' },
    { label: 'Еда', value: 'pi pi-star' },
    { label: 'Здоровье', value: 'pi pi-heart' },
    { label: 'Игры', value: 'pi pi-play' },
    { label: 'Одежда', value: 'pi pi-shopping-bag' },
    { label: 'Телефон', value: 'pi pi-mobile' },
    { label: 'Подписки', value: 'pi pi-refresh' },
    { label: 'Образование', value: 'pi pi-book' },
    { label: 'Подарки', value: 'pi pi-gift' },
    { label: 'График', value: 'pi pi-chart-line' },
    { label: 'Плюс', value: 'pi pi-plus-circle' },
    { label: 'Минус', value: 'pi pi-minus-circle' },
    { label: 'Деньги', value: 'pi pi-dollar' },
    { label: 'Прочее', value: 'pi pi-tag' },
  ];

  openCreate(type: 'income' | 'expense'): void {
    this.editingId.set(null);
    this.name = '';
    this.icon = 'pi pi-tag';
    this.type = type;
    this.showDialog.set(true);
  }

  openEdit(cat: any): void {
    this.editingId.set(cat.id);
    this.name = cat.name;
    this.icon = cat.icon;
    this.type = cat.type === 'both' ? 'expense' : cat.type;
    this.showDialog.set(true);
  }

  async save(): Promise<void> {
    if (!this.name) return;
    this.loading.set(true);
    const user = this.auth.currentUser!;

    try {
      if (this.editingId()) {
        await this.categoryService.update(this.editingId()!, {
          name: this.name,
          icon: this.icon,
          type: this.type,
        });
      } else {
        await this.categoryService.create({
          userId: user.uid,
          name: this.name,
          icon: this.icon,
          type: this.type,
          isDefault: false,
        });
      }
      this.showDialog.set(false);
    } finally {
      this.loading.set(false);
    }
  }

  async delete(id: string): Promise<void> {
    await this.categoryService.delete(id);
  }
}
