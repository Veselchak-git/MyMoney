import { inject } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BiometricService } from '../services/biometric.service';

export const authGuard = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const biometric = inject(BiometricService);

  return new Promise<boolean>((resolve) => {
    const unsub = onAuthStateChanged(auth, async user => {
      unsub();
      if (!user) {
        await router.navigate(['/auth']);
        resolve(false);
        return;
      }

      const bioAvailable = await biometric.isAvailable();
      if (bioAvailable) {
        const ok = await biometric.authenticate('Подтвердите вход по отпечатку');
        if (!ok) {
          await router.navigate(['/auth']);
          resolve(false);
          return;
        }
      }

      resolve(true);
    });
  });
};
