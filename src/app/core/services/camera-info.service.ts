import { Injectable } from '@angular/core';
import { CameraInfo as CameraInfoPlugin } from '@irix/camera-info';
import { CameraInfo, CameraResolution, CameraDevice } from '../models/camera.model';

@Injectable({
  providedIn: 'root'
})
export class CameraInfoService {

  constructor() { }

  /**
   * Obtiene información detallada de la cámara usando el plugin personalizado
   */
  async getCameraInfo(camera: 'rear' | 'front'): Promise<CameraInfo | null> {
    try {
      const cameraInfo = await CameraInfoPlugin.getCameraInfo({
        camera: camera === 'rear' ? 'back' : 'front',
      });
      return cameraInfo;
    } catch (error) {
      console.error('Error al obtener información de la cámara:', error);
      return null;
    }
  }

  /**
   * Obtiene las resoluciones soportadas por la cámara
   */
  async getSupportedResolutions(camera: 'rear' | 'front'): Promise<CameraResolution[]> {
    try {
      const result = await CameraInfoPlugin.getSupportedResolutions({
        camera: camera === 'rear' ? 'back' : 'front',
      });
      return result.resolutions || [];
    } catch (error) {
      console.error('Error al obtener resoluciones:', error);
      // Fallback a resoluciones predeterminadas
      return [
        { width: 1920, height: 1080 }, // Full HD
        { width: 1280, height: 720 },  // HD
        { width: 854, height: 480 },   // 480p
      ];
    }
  }

  /**
   * Obtiene todas las cámaras disponibles
   */
  async getAvailableCameras(): Promise<CameraDevice[]> {
    try {
      const result = await CameraInfoPlugin.getAvailableCameras();
      return result.cameras || [];
    } catch (error) {
      console.error('Error al obtener cámaras disponibles:', error);
      // Fallback a cámaras predeterminadas
      return [
        { id: '0', facing: 'back' },
        { id: '1', facing: 'front' }
      ];
    }
  }

  /**
   * Encuentra la resolución más alta disponible
   */
  getMaxResolution(resolutions: CameraResolution[]): CameraResolution | null {
    if (resolutions.length === 0) return null;
    
    return resolutions.reduce((max, current) => {
      return current.width * current.height > max.width * max.height
        ? current
        : max;
    });
  }

  /**
   * Filtra resoluciones por aspecto específico (ej: 16:9, 4:3)
   */
  filterResolutionsByAspect(resolutions: CameraResolution[], aspectRatio: string): CameraResolution[] {
    return resolutions.filter(resolution => {
      const calculatedRatio = (resolution.width / resolution.height).toFixed(2);
      const targetRatio = aspectRatio.split(':');
      const targetRatioValue = (parseFloat(targetRatio[0]) / parseFloat(targetRatio[1])).toFixed(2);
      return calculatedRatio === targetRatioValue;
    });
  }
}
