import { Injectable, computed, signal, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Category } from '../models';
import { DEFAULT_CATEGORIES } from './default-categories';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private readonly categoriesRef = collection(this.firestore, 'categories');

  readonly categories = signal<Category[]>([]);

  readonly incomeCategories = computed(() =>
    this.categories().filter(c => c.type === 'income' || c.type === 'both')
  );

  readonly expenseCategories = computed(() =>
    this.categories().filter(c => c.type === 'expense' || c.type === 'both')
  );

  readonly categoryMap = computed(() =>
    new Map(this.categories().map(c => [c.id, c]))
  );

  constructor() {
    collectionData(this.categoriesRef, { idField: 'id' }).subscribe((data: any) => {
      this.categories.set(data as Category[]);
    });
  }

  async createInitialDefaults(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;

    const existing = this.categories();
    if (existing.some(c => c.userId === user.uid)) return;

    for (const cat of DEFAULT_CATEGORIES) {
      await addDoc(this.categoriesRef, {
        ...cat,
        userId: user.uid,
      });
    }
  }

  async create(category: Omit<Category, 'id'>): Promise<void> {
    await addDoc(this.categoriesRef, category);
  }

  async update(id: string, data: Partial<Category>): Promise<void> {
    await updateDoc(doc(this.categoriesRef, id), data as any);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.categoriesRef, id));
  }

  getById(id: string): Category | undefined {
    return this.categoryMap().get(id);
  }
}
