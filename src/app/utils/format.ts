import { Timestamp } from '@angular/fire/firestore';

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatShortDate(timestamp: Timestamp): string {
  const d = timestamp.toDate();
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(d);
}
