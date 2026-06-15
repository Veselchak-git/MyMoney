import { Component, inject, signal } from '@angular/core';
import { Auth as FirebaseAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, ButtonModule, InputTextModule, CardModule, DividerModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class AuthPage {
  private auth = inject(FirebaseAuth);
  private router = inject(Router);

  readonly isLogin = signal(true);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  toggleMode(): void {
    this.isLogin.update(v => !v);
    this.error.set('');
  }

  async submit(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      if (this.isLogin()) {
        await signInWithEmailAndPassword(this.auth, this.email, this.password);
      } else {
        await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      }
      await this.router.navigate(['/']);
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }

  async googleLogin(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      await signInWithPopup(this.auth, new GoogleAuthProvider());
      await this.router.navigate(['/']);
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }
}
