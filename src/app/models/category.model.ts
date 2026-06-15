export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  type: 'income' | 'expense' | 'both';
  budget?: number;
  isDefault: boolean;
}
