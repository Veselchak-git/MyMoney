import { Injectable, inject, signal } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

export interface AppUpdateInfo {
  latestVersionCode: number;
  latestVersionName: string;
  /** Download / store page URL (defaults to RuStore listing). */
  storeUrl: string;
  message: string;
  forceUpdate: boolean;
}

const CONFIG_PATH = ['appConfig', 'android'] as const;
const DISMISS_KEY = 'mymoney-update-dismissed-code';
const DEFAULT_STORE_URL = 'https://www.rustore.ru/catalog/app/ru.veselchak.mymoney';

@Injectable({ providedIn: 'root' })
export class UpdateService {
  private readonly db = inject(Firestore);

  readonly updateAvailable = signal<AppUpdateInfo | null>(null);
  readonly checking = signal(false);

  private checkedThisSession = false;

  async checkForUpdate(options?: { force?: boolean }): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    if (this.checking()) return;
    if (this.checkedThisSession && !options?.force) return;

    this.checking.set(true);
    try {
      const info = await App.getInfo();
      const currentCode = Number.parseInt(info.build, 10);
      if (!Number.isFinite(currentCode)) return;

      const snap = await getDoc(doc(this.db, ...CONFIG_PATH));
      if (!snap.exists()) return;

      const data = snap.data() as Partial<AppUpdateInfo> & { apkUrl?: string };
      const latestCode = Number(data.latestVersionCode);
      if (!Number.isFinite(latestCode) || latestCode <= currentCode) {
        this.updateAvailable.set(null);
        return;
      }

      const versionName = String(data.latestVersionName ?? latestCode);
      const update: AppUpdateInfo = {
        latestVersionCode: latestCode,
        latestVersionName: versionName,
        storeUrl:
          String(data.storeUrl ?? data.apkUrl ?? '').trim() || DEFAULT_STORE_URL,
        message:
          String(data.message ?? '').trim() ||
          `Доступна версия ${versionName}. Обновите приложение в RuStore.`,
        forceUpdate: Boolean(data.forceUpdate),
      };

      if (!update.forceUpdate && this.isDismissed(latestCode)) {
        this.updateAvailable.set(null);
        return;
      }

      this.updateAvailable.set(update);
    } catch {
      /* network / permission — ignore */
    } finally {
      this.checkedThisSession = true;
      this.checking.set(false);
    }
  }

  dismiss(): void {
    const update = this.updateAvailable();
    if (!update || update.forceUpdate) return;
    try {
      localStorage.setItem(DISMISS_KEY, String(update.latestVersionCode));
    } catch {
      /* ignore */
    }
    this.updateAvailable.set(null);
  }

  async openDownload(): Promise<void> {
    const url = this.updateAvailable()?.storeUrl || DEFAULT_STORE_URL;
    await Browser.open({ url });
  }

  private isDismissed(latestCode: number): boolean {
    try {
      return localStorage.getItem(DISMISS_KEY) === String(latestCode);
    } catch {
      return false;
    }
  }
}
