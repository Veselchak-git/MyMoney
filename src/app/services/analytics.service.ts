import { Injectable } from '@angular/core';
import { Transaction, Category } from '../models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  getByCategory(
    transactions: Transaction[],
    categories: Category[],
    type: 'income' | 'expense'
  ): { category: Category; amount: number; percentage: number }[] {
    const filtered = transactions.filter(t => t.type === type);
    const total = filtered.reduce((s, t) => s + t.amount, 0);
    const catMap = new Map(categories.map(c => [c.id, c]));

    const byCategory = new Map<string, number>();
    for (const t of filtered) {
      byCategory.set(t.categoryId, (byCategory.get(t.categoryId) ?? 0) + t.amount);
    }

    return Array.from(byCategory.entries())
      .map(([id, amount]) => ({
        category: catMap.get(id) ?? { id, name: 'Без категории', icon: 'pi pi-question', type: 'expense', userId: '', isDefault: false, budget: undefined } as Category,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  getMonthlyTotals(
    transactions: Transaction[],
    months: number = 6
  ): { month: string; income: number; expense: number }[] {
    const result: { month: string; income: number; expense: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth();

      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 1);

      const monthTx = transactions.filter(t => {
        const td = t.date.toDate();
        return td >= start && td < end;
      });

      const monthName = d.toLocaleString('ru-RU', { month: 'short' });
      result.push({
        month: monthName,
        income: monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }

    return result;
  }
}
