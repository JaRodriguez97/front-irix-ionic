// Definir tipos localmente para evitar problemas de importación
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
  supportedFocusModes?: string[];
  supportedIsoRanges?: { min: number; max: number };
  supportedExposureRange?: { min: number; max: number };
}

export interface CameraDevice {
  id: string;
  facing: 'front' | 'back';
  description?: string;
}

export interface CameraState {
  isActive: boolean;
  currentCamera: 'rear' | 'front';
  currentResolution: CameraResolution | null;
  supportedResolutions: CameraResolution[];
  zoomLevel: number;
  maxZoom: number;
}

export interface CameraSettings {
  quality: number;
  enableHighResolution: boolean;
  enableZoom: boolean;
  preferredResolution?: CameraResolution;
}
