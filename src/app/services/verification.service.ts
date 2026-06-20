import { Injectable, inject } from '@angular/core';
import { Auth, sendEmailVerification, reload } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class VerificationService {
  private auth = inject(Auth);

  async sendVerification(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;
    await sendEmailVerification(user);
  }

  async reloadUser(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;
    await reload(user);
  }

  get isVerified(): boolean {
    return this.auth.currentUser?.emailVerified ?? false;
  }
}
