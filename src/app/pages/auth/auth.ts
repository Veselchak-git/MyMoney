import { Component, inject, signal } from '@angular/core';
import { Auth as FirebaseAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { VerificationService } from '../../services';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, InputTextModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class AuthPage {
  private auth = inject(FirebaseAuth);
  private router = inject(Router);
  private verificationService = inject(VerificationService);

  readonly isLogin = signal(true);
  readonly verificationSent = signal(false);
  readonly loginNotVerified = signal(false);
  readonly showResetForm = signal(false);
  readonly resetSent = signal(false);

  email = '';
  password = '';
  resetEmail = '';
  loading = signal(false);
  error = signal('');

  toggleMode(): void {
    this.isLogin.update(v => !v);
    this.error.set('');
    this.verificationSent.set(false);
    this.loginNotVerified.set(false);
  }

  openReset(): void {
    this.showResetForm.set(true);
    this.resetEmail = this.email;
    this.error.set('');
    this.resetSent.set(false);
  }

  cancelReset(): void {
    this.showResetForm.set(false);
    this.error.set('');
    this.resetSent.set(false);
  }

  async sendReset(): Promise<void> {
    if (!this.resetEmail) {
      this.error.set('Введите email');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      await sendPasswordResetEmail(this.auth, this.resetEmail);
      this.resetSent.set(true);
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? '';
      const messages: Record<string, string> = {
        'auth/user-not-found': 'Пользователь с таким email не найден',
        'auth/invalid-email': 'Некорректный email',
        'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
      };
      this.error.set(messages[code] || 'Не удалось отправить письмо. Попробуйте позже');
    } finally {
      this.loading.set(false);
    }
  }

  async submit(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    if (!this.isLogin() && this.password.length < 6) {
      this.error.set('Пароль должен быть не менее 6 символов');
      this.loading.set(false);
      return;
    }

    try {
      if (this.isLogin()) {
        await signInWithEmailAndPassword(this.auth, this.email, this.password);
        if (!this.auth.currentUser?.emailVerified) {
          this.loginNotVerified.set(true);
          return;
        }
      } else {
        await createUserWithEmailAndPassword(this.auth, this.email, this.password);
        await this.verificationService.sendVerification();
        this.verificationSent.set(true);
        this.isLogin.set(true);
        return;
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

  async resendVerification(): Promise<void> {
    try {
      await this.verificationService.sendVerification();
      this.error.set('');
    } catch {
      this.error.set('Не удалось отправить письмо. Попробуйте позже');
    }
  }

  async checkVerification(): Promise<void> {
    await this.verificationService.reloadUser();
    if (this.auth.currentUser?.emailVerified) {
      await this.router.navigate(['/']);
    }
  }
}
