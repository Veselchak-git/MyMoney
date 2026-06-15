import { Injectable, signal, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Transaction } from '../models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private readonly transactionsRef = collection(this.firestore, 'transactions');

  readonly transactions = signal<Transaction[]>([]);

  constructor() {
    const q = query(this.transactionsRef, orderBy('date', 'desc'));
    collectionData(q, { idField: 'id' }).subscribe((data: any) => {
      this.transactions.set(data as Transaction[]);
    });
  }

  async create(data: Omit<Transaction, 'id' | 'createdAt'>): Promise<void> {
    await addDoc(this.transactionsRef, {
      ...data,
      createdAt: Timestamp.now(),
    });
  }

  async update(id: string, data: Partial<Transaction>): Promise<void> {
    await updateDoc(doc(this.transactionsRef, id), data as any);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.transactionsRef, id));
  }

  getByMonth(year: number, month: number): Transaction[] {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    return this.transactions().filter(t => {
      const d = (t.date as any).toDate();
      return d >= start && d < end;
    });
  }

  getTotalIncome(transactions: Transaction[]): number {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalExpense(transactions: Transaction[]): number {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getBalance(transactions: Transaction[]): number {
    return this.getTotalIncome(transactions) - this.getTotalExpense(transactions);
  }
}
