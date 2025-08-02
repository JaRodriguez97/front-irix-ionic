import { Injectable } from '@angular/core';
import { Camera } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  constructor() { }

  /**
   * Verifica y solicita permisos de cámara
   */
  async checkCameraPermissions(): Promise<boolean> {
    try {
      const permissions = await Camera.checkPermissions();
      if (permissions.camera !== 'granted') {
        const requestResult = await Camera.requestPermissions();
        if (requestResult.camera !== 'granted') {
          console.warn('Permisos de cámara denegados');
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return false;
    }
  }

  /**
   * Verifica si los permisos de cámara están concedidos
   */
  async hasCameraPermission(): Promise<boolean> {
    try {
      const permissions = await Camera.checkPermissions();
      return permissions.camera === 'granted';
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return false;
    }
  }
}
