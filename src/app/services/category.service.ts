import { Injectable, computed, signal, inject, DestroyRef } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Category } from '../models';
import { DEFAULT_CATEGORIES } from './default-categories';

import {
  collection,
  onSnapshot,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  Unsubscribe,
} from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private auth = inject(Auth);
  private destroyRef = inject(DestroyRef);

  private db = inject(Firestore);

  private readonly allCategories = signal<Category[]>([]);
  readonly loaded = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly categories = this.allCategories.asReadonly();

  readonly incomeCategories = computed(() =>
    this.categories().filter(c => c.type === 'income' || c.type === 'both')
  );

  readonly expenseCategories = computed(() =>
    this.categories().filter(c => c.type === 'expense' || c.type === 'both')
  );

  readonly categoryMap = computed(() =>
    new Map(this.categories().map(c => [c.id, c]))
  );

  private unsub: Unsubscribe | null = null;
  private creatingDefaults = false;

  constructor() {
    const unsubAuth = onAuthStateChanged(this.auth, user => {
      this.unsub?.();
      this.allCategories.set([]);
      this.loaded.set(true);

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
    const ref = collection(this.db, 'categories');
    const q = query(ref, where('userId', '==', user.uid));
    this.loaded.set(false);

    this.unsub = onSnapshot(
      q,
      (snapshot) => {
        const categories = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Category[];
        this.allCategories.set(categories);
        this.loaded.set(true);
      },
      (err) => {
        console.error('Categories load error:', err);
        const msg = err?.code === 'permission-denied'
          ? 'Нет доступа к Firestore. Проверьте правила безопасности.'
          : err?.code === 'unavailable'
            ? 'Firestore не включён. Включите в Firebase Console.'
            : `Ошибка: ${err?.code || ''} ${err?.message || 'неизвестная'}`;
        this.loadError.set(msg);
        this.loaded.set(true);
      }
    );
  }

  async createInitialDefaults(): Promise<void> {
    if (this.creatingDefaults) return;
    const user = this.auth.currentUser;
    if (!user) return;

    this.creatingDefaults = true;
    try {
      const ref = collection(this.db, 'categories');
      const q = query(ref, where('userId', '==', user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) return;

      for (const cat of DEFAULT_CATEGORIES) {
        await addDoc(ref, { ...cat, userId: user.uid });
      }
    } catch (err) {
      console.error('Failed to create default categories:', err);
    } finally {
      this.creatingDefaults = false;
    }
  }

  async create(category: Omit<Category, 'id'>): Promise<void> {
    if (!category.name) throw new Error('Название обязательно');
    if (!['income', 'expense', 'both'].includes(category.type)) throw new Error('Некорректный тип');
    const ref = collection(this.db, 'categories');
    await addDoc(ref, category);
  }

  async update(id: string, data: Partial<Category>): Promise<void> {
    if (data.name !== undefined && !data.name) throw new Error('Название обязательно');
    if (data.type !== undefined && !['income', 'expense', 'both'].includes(data.type)) throw new Error('Некорректный тип');
    const ref = collection(this.db, 'categories');
    await updateDoc(doc(ref, id), data as Record<string, unknown>);
  }

  async delete(id: string): Promise<void> {
    const ref = collection(this.db, 'categories');
    await deleteDoc(doc(ref, id));
  }

  getById(id: string): Category | undefined {
    return this.categoryMap().get(id);
  }
}
