import { Timestamp } from '@angular/fire/firestore';

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  date: Timestamp;
  description: string;
  createdAt: Timestamp;
}
