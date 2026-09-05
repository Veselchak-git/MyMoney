import { Component, inject, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { CategoryService, VerificationService, ThemeService, UpdateService } from './services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private router = inject(Router);
  private categoryService = inject(CategoryService);
  private verificationService = inject(VerificationService);
  readonly themeService = inject(ThemeService);
  readonly updateService = inject(UpdateService);

  readonly user = signal(this.auth.currentUser);
  readonly mobileMenuOpen = signal(false);
  readonly verificationBannerDismissed = signal(false);
  readonly showLogoutConfirm = signal(false);
  readonly loggingOut = signal(false);
  private verifyTimer: ReturnType<typeof setInterval> | undefined;
  private appStateListener: PluginListenerHandle | undefined;
  private authUnsub: (() => void) | undefined;

  readonly navItems = [
    { path: '/', label: 'Главная', icon: 'pi pi-home' },
    { path: '/transactions', label: 'Транзакции', icon: 'pi pi-list' },
    { path: '/categories', label: 'Категории', icon: 'pi pi-tags' },
    { path: '/analytics', label: 'Аналитика', icon: 'pi pi-chart-line' },
  ];

  get showVerifyBanner(): boolean {
    const u = this.user();
    return !!u && !u.emailVerified && !this.verificationBannerDismissed();
  }

  isAuthPage(): boolean {
    return this.router.url === '/auth';
  }

  ngOnInit(): void {
    this.authUnsub = this.auth.onAuthStateChanged(user => {
      this.user.set(user);
      if (user && !this.isAuthPage()) {
        this.categoryService.createInitialDefaults();
        void this.updateService.checkForUpdate();
        if (user.emailVerified) {
          this.verificationBannerDismissed.set(false);
          this.stopPolling();
        } else {
          this.startPolling();
        }
      } else if (user && this.isAuthPage()) {
        this.stopPolling();
      } else {
        this.stopPolling();
        if (!this.isAuthPage()) {
          this.router.navigate(['/auth']);
        }
      }
    });

    void this.setupAppResumeListener();
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.authUnsub?.();
    void this.appStateListener?.remove();
  }

  async resendVerification(): Promise<void> {
    await this.verificationService.sendVerification();
  }

  async checkVerification(): Promise<void> {
    await this.verificationService.reloadUser();
    const user = this.auth.currentUser;
    if (user?.emailVerified) {
      this.user.set(user);
      this.verificationBannerDismissed.set(false);
      this.stopPolling();
    }
  }

  dismissBanner(): void {
    this.verificationBannerDismissed.set(true);
    this.stopPolling();
  }

  dismissUpdate(): void {
    this.updateService.dismiss();
  }

  async openUpdate(): Promise<void> {
    await this.updateService.openDownload();
  }

  private async setupAppResumeListener(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    this.appStateListener = await CapApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) return;
      const user = this.auth.currentUser;
      if (user && !this.isAuthPage()) {
        void this.updateService.checkForUpdate({ force: true });
      }
    });
  }

  private startPolling(): void {
    this.stopPolling();
    this.verifyTimer = setInterval(() => {
      const u = this.auth.currentUser;
      if (u && !u.emailVerified) return;
      this.user.set(u);
      this.verificationBannerDismissed.set(false);
      this.stopPolling();
    }, 5000);
  }

  private stopPolling(): void {
    if (this.verifyTimer !== undefined) {
      clearInterval(this.verifyTimer);
      this.verifyTimer = undefined;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 640 && this.mobileMenuOpen()) {
      this.mobileMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    if (this.showLogoutConfirm()) {
      this.cancelLogout();
      return;
    }
    if (this.updateService.updateAvailable() && !this.updateService.updateAvailable()?.forceUpdate) {
      this.dismissUpdate();
      return;
    }
    this.mobileMenuOpen.set(false);
  }

  askLogout(): void {
    this.mobileMenuOpen.set(false);
    this.showLogoutConfirm.set(true);
  }

  cancelLogout(): void {
    if (this.loggingOut()) return;
    this.showLogoutConfirm.set(false);
  }

  async confirmLogout(): Promise<void> {
    if (this.loggingOut()) return;
    this.loggingOut.set(true);
    try {
      this.verificationBannerDismissed.set(false);
      this.stopPolling();
      await signOut(this.auth);
      this.showLogoutConfirm.set(false);
      await this.router.navigate(['/auth']);
    } finally {
      this.loggingOut.set(false);
    }
  }
}
