import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Header } from './components/header/header';
import { CategoryService } from './services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private auth = inject(Auth);
  private categoryService = inject(CategoryService);

  readonly user = signal(this.auth.currentUser);

  ngOnInit(): void {
    this.auth.onAuthStateChanged(user => {
      this.user.set(user);
      if (user) {
        this.categoryService.createInitialDefaults();
      }
    });
  }
}
