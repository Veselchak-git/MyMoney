import { Component, inject, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { CategoryService, VerificationService } from './services';

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

  readonly user = signal(this.auth.currentUser);
  readonly mobileMenuOpen = signal(false);
  readonly verificationBannerDismissed = signal(false);
  private verifyTimer: ReturnType<typeof setInterval> | undefined;

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
    this.auth.onAuthStateChanged(user => {
      this.user.set(user);
      if (user && !this.isAuthPage()) {
        this.categoryService.createInitialDefaults();
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
  }

  ngOnDestroy(): void {
    this.stopPolling();
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

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.mobileMenuOpen.set(false);
  }

  async logout(): Promise<void> {
    this.verificationBannerDismissed.set(false);
    this.stopPolling();
    await signOut(this.auth);
    await this.router.navigate(['/auth']);
  }
}
