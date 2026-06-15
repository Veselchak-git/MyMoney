import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

const firebaseConfig = {
  apiKey: 'AIzaSyBpTErRk7P_2hLxElIQQBOl2T9X0_Xc-Sc',
  authDomain: 'my-finances-2026.firebaseapp.com',
  projectId: 'my-finances-2026',
  storageBucket: 'my-finances-2026.firebasestorage.app',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:abc123def456',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    providePrimeNG({
      ripple: true,
      inputVariant: 'outlined',
      theme: 'none',
    }),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
