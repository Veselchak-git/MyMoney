import { Injectable } from '@angular/core';
import { BiometricAuth, BiometryError } from '@aparajita/capacitor-biometric-auth';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class BiometricService {

  async isAvailable(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;

    try {
      const result = await BiometricAuth.checkBiometry();
      return result.isAvailable;
    } catch {
      return false;
    }
  }

  async authenticate(reason: string): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true;

    try {
      await BiometricAuth.authenticate({
        reason,
        allowDeviceCredential: true,
        androidTitle: 'Подтверждение входа',
        androidSubtitle: 'Приложите палец к сканеру',
      });
      return true;
    } catch (e: unknown) {
      if (e instanceof BiometryError && e.code === 'userCancel') {
        return false;
      }
      return false;
    }
  }
}
