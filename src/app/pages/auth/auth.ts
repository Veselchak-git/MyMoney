import { Component, inject, signal } from '@angular/core';
import { Auth as FirebaseAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, InputTextModule],
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
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? '';
      const messages: Record<string, string> = {
        'auth/invalid-credential': 'Неверный email или пароль',
        'auth/user-not-found': 'Пользователь не найден',
        'auth/wrong-password': 'Неверный пароль',
        'auth/email-already-in-use': 'Этот email уже зарегистрирован',
        'auth/weak-password': 'Пароль должен быть не менее 6 символов',
        'auth/invalid-email': 'Некорректный email',
        'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
        'auth/user-disabled': 'Аккаунт отключён',
        'auth/operation-not-allowed': 'Вход через email/пароль отключён',
      };
      this.error.set(messages[code] || 'Ошибка входа. Попробуйте позже');
    } finally {
      this.loading.set(false);
    }
  }

}
