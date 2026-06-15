export function formatAmount(copecks: number): string {
  const rubles = Math.abs(copecks) / 100;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
  }).format(rubles);
}

export function formatDate(timestamp: any): string {
  const d = timestamp.toDate();
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export function formatShortDate(timestamp: any): string {
  const d = timestamp.toDate();
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(d);
}
