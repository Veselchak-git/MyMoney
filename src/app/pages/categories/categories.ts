import { Component, HostListener, inject, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services';
import { Category } from '../../models';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-categories',
  imports: [FormsModule, InputTextModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  private categoryService = inject(CategoryService);
  private auth = inject(Auth);

  readonly categories = this.categoryService.categories;

  readonly showDialog = signal(false);
  readonly pendingDelete = signal<Category | null>(null);
  readonly editingId = signal<string | null>(null);
  readonly iconOpen = signal(false);
  readonly incomeOpen = signal(true);
  readonly expenseOpen = signal(true);
  name = '';
  icon = 'pi pi-tag';
  type: 'income' | 'expense' = 'expense';
  loading = signal(false);
  deleting = signal(false);
  readonly error = signal('');
  private saveGeneration = 0;

  get iconLabel(): string {
    return this.icons.find(i => i.value === this.icon)?.label ?? 'Иконка';
  }

  toggleIcons(): void {
    this.iconOpen.update(v => !v);
  }

  selectIcon(value: string): void {
    this.icon = value;
    this.iconOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    if (!(e.target as HTMLElement).closest('.icon-picker')) {
      this.iconOpen.set(false);
    }
  }

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
    this.error.set('');
    this.showDialog.set(true);
  }

  openEdit(cat: Category): void {
    this.editingId.set(cat.id);
    this.name = cat.name;
    this.icon = cat.icon;
    this.type = cat.type === 'both' ? 'expense' : cat.type;
    this.error.set('');
    this.showDialog.set(true);
  }

  clearError(): void {
    this.error.set('');
  }

  async save(): Promise<void> {
    this.error.set('');
    const trimmedName = this.name.trim();
    if (!trimmedName) {
      this.error.set('Укажите название');
      return;
    }

    const user = this.auth.currentUser;
    if (!user) {
      this.error.set('Войдите в аккаунт, чтобы сохранить');
      return;
    }

    const generation = ++this.saveGeneration;
    this.loading.set(true);

    try {
      if (this.editingId()) {
        await this.categoryService.update(this.editingId()!, {
          name: trimmedName,
          icon: this.icon,
          type: this.type,
        });
      } else {
        await this.categoryService.create({
          userId: user.uid,
          name: trimmedName,
          icon: this.icon,
          type: this.type,
          isDefault: false,
        });
      }
      if (generation !== this.saveGeneration) return;
      this.showDialog.set(false);
    } catch (err) {
      if (generation !== this.saveGeneration) return;
      this.error.set(err instanceof Error ? err.message : 'Не удалось сохранить категорию');
    } finally {
      if (generation === this.saveGeneration) {
        this.loading.set(false);
      }
    }
  }

  closeDialog(): void {
    if (this.loading()) return;
    this.saveGeneration++;
    this.loading.set(false);
    this.showDialog.set(false);
    this.iconOpen.set(false);
    this.name = '';
    this.icon = 'pi pi-tag';
    this.error.set('');
  }

  deleteConfirmMessage(cat: Category): string {
    if (cat.isDefault && this.categories().length > 1) {
      return `Удалить категорию «${cat.name}»? Она не будет создана снова автоматически.`;
    }
    return `Удалить категорию «${cat.name}»?`;
  }

  askDelete(cat: Category): void {
    this.pendingDelete.set(cat);
  }

  cancelDelete(): void {
    if (this.deleting()) return;
    this.pendingDelete.set(null);
  }

  async confirmDelete(): Promise<void> {
    const cat = this.pendingDelete();
    if (!cat) return;
    this.deleting.set(true);
    try {
      await this.categoryService.delete(cat.id);
      this.pendingDelete.set(null);
    } catch {
      console.error('Failed to delete category');
    } finally {
      this.deleting.set(false);
    }
  }
}
