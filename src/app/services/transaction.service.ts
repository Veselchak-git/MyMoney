import { Injectable, signal, inject, DestroyRef } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Timestamp, Firestore } from '@angular/fire/firestore';
import { Transaction } from '../models';

import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Unsubscribe,
} from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private auth = inject(Auth);
  private destroyRef = inject(DestroyRef);
  private db = inject(Firestore);

  readonly transactions = signal<Transaction[]>([]);

  private unsub: Unsubscribe | null = null;

  constructor() {
    const unsubAuth = onAuthStateChanged(this.auth, user => {
      this.unsub?.();
      this.transactions.set([]);

      if (user) {
        this.subscribe(user);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.unsub?.();
      unsubAuth();
    });
  }

  private subscribe(user: User): void {
    const ref = collection(this.db, 'transactions');
    const q = query(ref, where('userId', '==', user.uid));
    this.unsub = onSnapshot(
      q,
      (snapshot) => {
        const txns = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Transaction[];
        txns.sort((a, b) => {
          const da = a.date.toDate();
          const db = b.date.toDate();
          return db.getTime() - da.getTime();
        });
        this.transactions.set(txns);
      },
      (err) => console.error('Transactions load error:', err),
    );
  }

  async create(data: Omit<Transaction, 'id' | 'createdAt'>): Promise<void> {
    if (data.amount <= 0) throw new Error('Сумма должна быть положительной');
    if (!['income', 'expense'].includes(data.type)) throw new Error('Некорректный тип');
    if (!data.categoryId) throw new Error('Категория обязательна');
    const ref = collection(this.db, 'transactions');
    await addDoc(ref, { ...data, createdAt: Timestamp.now() });
  }

  async update(id: string, data: Partial<Transaction>): Promise<void> {
    if (data.amount !== undefined && data.amount <= 0) throw new Error('Сумма должна быть положительной');
    if (data.type !== undefined && !['income', 'expense'].includes(data.type)) throw new Error('Некорректный тип');
    const ref = collection(this.db, 'transactions');
    await updateDoc(doc(ref, id), data as Record<string, unknown>);
  }

  async delete(id: string): Promise<void> {
    const ref = collection(this.db, 'transactions');
    await deleteDoc(doc(ref, id));
  }

  getByMonth(year: number, month: number): Transaction[] {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    return this.transactions().filter(t => {
      const d = t.date.toDate();
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
