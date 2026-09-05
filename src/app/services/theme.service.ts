import { Injectable, signal, computed, DestroyRef, inject } from '@angular/core';

export type ThemePreference = 'light' | 'dark';

const STORAGE_KEY = 'mymoney-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly destroyRef = inject(DestroyRef);
  private mediaQuery: MediaQueryList | null = null;
  private onMediaChange: (() => void) | null = null;
  private onStorage: ((e: StorageEvent) => void) | null = null;

  /** Explicit choice; `null` = follow system until user toggles. */
  private readonly storedPreference = signal<ThemePreference | null>(this.readStored());
  private readonly systemDark = signal(this.readSystemDark());

  readonly preference = computed<ThemePreference>(() => {
    const stored = this.storedPreference();
    if (stored) return stored;
    return this.systemDark() ? 'dark' : 'light';
  });
  readonly resolvedTheme = this.preference;
  readonly themeIcon = computed(() =>
    this.preference() === 'dark' ? 'pi pi-moon' : 'pi pi-sun'
  );
  readonly themeAriaLabel = computed(() =>
    this.preference() === 'dark'
      ? 'Тема: тёмная. Переключить на светлую'
      : 'Тема: светлая. Переключить на тёмную'
  );

  constructor() {
    this.apply();
    this.setupMediaListener();
    this.setupStorageListener();
    this.destroyRef.onDestroy(() => {
      this.teardownMediaListener();
      this.teardownStorageListener();
    });
  }

  setPreference(mode: ThemePreference): void {
    this.storedPreference.set(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
    this.apply();
  }

  toggle(): void {
    this.setPreference(this.preference() === 'dark' ? 'light' : 'dark');
  }

  private apply(): void {
    const dark = this.preference() === 'dark';
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', dark ? '#0B1220' : '#10B981');
    }
  }

  private readStored(): ThemePreference | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      // Legacy `system` or missing → follow device
      if (stored === 'system') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
    return null;
  }

  private readSystemDark(): boolean {
    return typeof window !== 'undefined'
      && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private setupMediaListener(): void {
    this.teardownMediaListener();
    if (typeof window === 'undefined') {
      return;
    }
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.onMediaChange = () => {
      this.systemDark.set(this.mediaQuery?.matches ?? false);
      if (this.storedPreference() === null) {
        this.apply();
      }
    };
    this.mediaQuery.addEventListener('change', this.onMediaChange);
  }

  private teardownMediaListener(): void {
    if (this.mediaQuery && this.onMediaChange) {
      this.mediaQuery.removeEventListener('change', this.onMediaChange);
    }
    this.mediaQuery = null;
    this.onMediaChange = null;
  }

  private setupStorageListener(): void {
    if (typeof window === 'undefined') {
      return;
    }
    this.onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = e.newValue;
      if (next === 'light' || next === 'dark') {
        this.storedPreference.set(next);
      } else {
        this.storedPreference.set(null);
      }
      this.apply();
    };
    window.addEventListener('storage', this.onStorage);
  }

  private teardownStorageListener(): void {
    if (this.onStorage) {
      window.removeEventListener('storage', this.onStorage);
    }
    this.onStorage = null;
  }
}
