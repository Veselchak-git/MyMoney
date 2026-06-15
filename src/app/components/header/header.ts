import { Component, inject } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, ButtonModule, AvatarModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private auth = inject(Auth);
  readonly user = this.auth.currentUser;

  readonly navItems = [
    { path: '/', label: 'Главная', icon: 'pi pi-home' },
    { path: '/transactions', label: 'Транзакции', icon: 'pi pi-list' },
    { path: '/categories', label: 'Категории', icon: 'pi pi-tags' },
    { path: '/budgets', label: 'Бюджеты', icon: 'pi pi-chart-bar' },
    { path: '/analytics', label: 'Аналитика', icon: 'pi pi-chart-line' },
  ];

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
