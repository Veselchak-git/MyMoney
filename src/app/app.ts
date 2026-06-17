import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { CategoryService } from './services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private auth = inject(Auth);
  private categoryService = inject(CategoryService);

  readonly user = signal(this.auth.currentUser);
  readonly mobileMenuOpen = signal(false);

  readonly navItems = [
    { path: '/', label: 'Главная', icon: 'pi pi-home' },
    { path: '/transactions', label: 'Транзакции', icon: 'pi pi-list' },
    { path: '/categories', label: 'Категории', icon: 'pi pi-tags' },
    { path: '/analytics', label: 'Аналитика', icon: 'pi pi-chart-line' },
  ];

  ngOnInit(): void {
    this.auth.onAuthStateChanged(user => {
      this.user.set(user);
      if (user) {
        this.categoryService.createInitialDefaults();
      }
    });
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
