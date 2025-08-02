export interface CameraInfoPlugin {
  /**
   * Obtiene las resoluciones soportadas por la cámara
   */
  getSupportedResolutions(options: { camera: string }): Promise<{ resolutions: CameraResolution[] }>;
  
  /**
   * Obtiene información detallada de la cámara
   */
  getCameraInfo(options: { camera: string }): Promise<CameraInfo>;
  
  /**
   * Obtiene todas las cámaras disponibles
   */
  getAvailableCameras(): Promise<{ cameras: CameraDevice[] }>;
}

export interface CameraResolution {
  width: number;
  height: number;
  aspectRatio?: string;
}

export interface CameraInfo {
  id: string;
  facing: 'front' | 'back';
  supportedResolutions: CameraResolution[];
  maxZoom?: number;
  hasFlash?: boolean;
  supportedFocusModes?: string[];
  supportedIsoRanges?: { min: number; max: number };
  supportedExposureRange?: { min: number; max: number };
}

export interface CameraDevice {
  id: string;
  facing: 'front' | 'back';
  description?: string;
}
