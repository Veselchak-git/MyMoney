import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { map } from 'rxjs';

export const authGuard = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    auth.onAuthStateChanged(user => {
      if (user) {
        resolve(true);
      } else {
        router.navigate(['/auth']);
        resolve(false);
      }
    });
  });
};
