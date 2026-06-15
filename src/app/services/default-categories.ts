import { Category } from '../models';

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'userId'>[] = [
  { name: 'Зарплата', icon: 'pi pi-briefcase', type: 'income', isDefault: true },
  { name: 'Фриланс', icon: 'pi pi-pencil', type: 'income', isDefault: true },
  { name: 'Инвестиции', icon: 'pi pi-chart-line', type: 'income', isDefault: true },
  { name: 'Подарки', icon: 'pi pi-gift', type: 'income', isDefault: true },
  { name: 'Прочий доход', icon: 'pi pi-plus-circle', type: 'income', isDefault: true },
  { name: 'Продукты', icon: 'pi pi-shopping-cart', type: 'expense', isDefault: true },
  { name: 'Транспорт', icon: 'pi pi-car', type: 'expense', isDefault: true },
  { name: 'Жильё', icon: 'pi pi-home', type: 'expense', isDefault: true },
  { name: 'Рестораны', icon: 'pi pi-star', type: 'expense', isDefault: true },
  { name: 'Здоровье', icon: 'pi pi-heart', type: 'expense', isDefault: true },
  { name: 'Развлечения', icon: 'pi pi-play', type: 'expense', isDefault: true },
  { name: 'Одежда', icon: 'pi pi-shopping-bag', type: 'expense', isDefault: true },
  { name: 'Связь', icon: 'pi pi-mobile', type: 'expense', isDefault: true },
  { name: 'Подписки', icon: 'pi pi-refresh', type: 'expense', isDefault: true },
  { name: 'Образование', icon: 'pi pi-book', type: 'expense', isDefault: true },
  { name: 'Прочие расходы', icon: 'pi pi-minus-circle', type: 'expense', isDefault: true },
];
