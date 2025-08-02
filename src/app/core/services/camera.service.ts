import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CameraPreview, CameraPreviewOptions } from '@capacitor-community/camera-preview';
import { CameraState, CameraSettings, CameraResolution } from '../models/camera.model';
import { PermissionsService } from './permissions.service';
import { CameraInfoService } from './camera-info.service';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private cameraStateSubject = new BehaviorSubject<CameraState>({
    isActive: false,
    currentCamera: 'rear',
    currentResolution: null,
    supportedResolutions: [],
    zoomLevel: 1,
    maxZoom: 1
  });

  private defaultSettings: CameraSettings = {
    quality: 100,
    enableHighResolution: true,
    enableZoom: true
  };

  public cameraState$: Observable<CameraState> = this.cameraStateSubject.asObservable();

  constructor(
    private permissionsService: PermissionsService,
    private cameraInfoService: CameraInfoService
  ) { }

  /**
   * Obtiene el estado actual de la cámara
   */
  getCurrentState(): CameraState {
    return this.cameraStateSubject.value;
  }

  /**
   * Inicializa las capacidades de la cámara
   */
  async initializeCameraCapabilities(camera: 'rear' | 'front'): Promise<void> {
    try {
      const [resolutions, cameraInfo] = await Promise.all([
        this.cameraInfoService.getSupportedResolutions(camera),
        this.cameraInfoService.getCameraInfo(camera)
      ]);

      const currentState = this.getCurrentState();
      const maxResolution = this.cameraInfoService.getMaxResolution(resolutions);
      
      this.updateState({
        ...currentState,
        currentCamera: camera,
        supportedResolutions: resolutions,
        currentResolution: maxResolution,
        maxZoom: cameraInfo?.maxZoom || 1
      });

      console.log('Capacidades de cámara inicializadas:', {
        camera,
        resolutions: resolutions.length,
        maxResolution,
        maxZoom: cameraInfo?.maxZoom
      });
    } catch (error) {
      console.error('Error al inicializar capacidades de cámara:', error);
    }
  }

  /**
   * Inicia la cámara con configuraciones optimizadas
   */
  async startCamera(containerId: string, settings?: Partial<CameraSettings>): Promise<boolean> {
    try {
      // Verificar permisos
      const hasPermissions = await this.permissionsService.checkCameraPermissions();
      if (!hasPermissions) {
        console.warn('No se tienen permisos de cámara');
        return false;
      }

      const currentState = this.getCurrentState();
      if (currentState.isActive) {
        console.warn('La cámara ya está activa');
        return true;
      }

      // Inicializar capacidades si no se han cargado
      if (currentState.supportedResolutions.length === 0) {
        await this.initializeCameraCapabilities(currentState.currentCamera);
      }

      // Configurar opciones de cámara
      const finalSettings = { ...this.defaultSettings, ...settings };
      const cameraOptions = await this.buildCameraOptions(containerId, finalSettings);

      // Iniciar cámara
      await CameraPreview.start(cameraOptions);
      
      this.updateState({
        ...this.getCurrentState(),
        isActive: true
      });

      console.log('Cámara iniciada exitosamente');
      return true;
    } catch (error) {
      console.error('Error al iniciar cámara:', error);
      return false;
    }
  }

  /**
   * Detiene la cámara
   */
  async stopCamera(): Promise<void> {
    try {
      const currentState = this.getCurrentState();
      if (currentState.isActive) {
        await CameraPreview.stop();
        this.updateState({
          ...currentState,
          isActive: false,
          zoomLevel: 1
        });
        console.log('Cámara detenida');
      }
    } catch (error) {
      console.error('Error al detener cámara:', error);
    }
  }

  /**
   * Cambia entre cámara frontal y trasera
   */
  async flipCamera(): Promise<boolean> {
    try {
      const currentState = this.getCurrentState();
      if (!currentState.isActive) return false;

      await CameraPreview.flip();
      const newCamera = currentState.currentCamera === 'rear' ? 'front' : 'rear';
      
      // Reinicializar capacidades para la nueva cámara
      await this.initializeCameraCapabilities(newCamera);
      
      console.log(`Cámara cambiada a: ${newCamera}`);
      return true;
    } catch (error) {
      console.error('Error al cambiar cámara:', error);
      return false;
    }
  }

  /**
   * Captura una imagen con alta calidad
   */
  async captureHighQuality(): Promise<string | null> {
    try {
      const currentState = this.getCurrentState();
      if (!currentState.isActive) {
        console.warn('La cámara no está activa');
        return null;
      }

      const result = await CameraPreview.capture({ quality: 100 });
      console.log('Imagen capturada exitosamente');
      return result.value;
    } catch (error) {
      console.error('Error al capturar imagen:', error);
      return null;
    }
  }

  /**
   * Ajusta el nivel de zoom (implementado para v1.1)
   */
  async setZoom(zoomLevel: number): Promise<boolean> {
    try {
      const currentState = this.getCurrentState();
      if (!currentState.isActive) return false;

      const clampedZoom = Math.max(1, Math.min(zoomLevel, currentState.maxZoom));
      
      // Verificar si el zoom digital está disponible
      if (!this.isZoomSupported()) {
        console.warn('Zoom no soportado en esta cámara');
        return false;
      }

      // Implementar zoom usando CameraPreview si está disponible
      // Nota: CameraPreview no tiene setZoom nativo, se maneja via estado interno
      // y se aplicaría via plugin personalizado en versiones futuras
      console.log('Aplicando zoom via estado interno (plugin personalizado requerido para zoom real)');
      
      // TODO: Implementar con plugin personalizado cuando esté disponible
      // if (this.customCameraPlugin?.setZoom) {
      //   await this.customCameraPlugin.setZoom({ factor: clampedZoom });
      // }
      
      this.updateState({
        ...currentState,
        zoomLevel: clampedZoom
      });
      
      console.log(`Zoom aplicado: ${clampedZoom}x (máx: ${currentState.maxZoom}x)`);
      return true;
    } catch (error) {
      console.error('Error al ajustar zoom:', error);
      return false;
    }
  }

  /**
   * Verifica si el zoom está soportado
   */
  isZoomSupported(): boolean {
    const currentState = this.getCurrentState();
    return currentState.maxZoom > 1;
  }

  /**
   * Obtiene el nivel de zoom actual
   */
  getCurrentZoom(): number {
    return this.getCurrentState().zoomLevel;
  }

  /**
   * Obtiene el zoom máximo disponible
   */
  getMaxZoom(): number {
    return this.getCurrentState().maxZoom;
  }

  /**
   * Verifica permisos de zoom digital
   */
  async checkZoomPermissions(): Promise<{ hasPermission: boolean; type: 'digital' | 'optical' | 'none' }> {
    try {
      const currentState = this.getCurrentState();
      const cameraInfo = await this.cameraInfoService.getCameraInfo(currentState.currentCamera);
      
      if (!cameraInfo || !cameraInfo.maxZoom || cameraInfo.maxZoom <= 1) {
        return { hasPermission: false, type: 'none' };
      }

      // La mayoría de cámaras móviles modernas soportan zoom digital
      // El zoom óptico es raro en dispositivos móviles
      const zoomType = cameraInfo.maxZoom > 10 ? 'digital' : 'digital';
      
      return { hasPermission: true, type: zoomType };
    } catch (error) {
      console.error('Error al verificar permisos de zoom:', error);
      return { hasPermission: false, type: 'none' };
    }
  }

  /**
   * Construye las opciones de configuración de la cámara
   */
  private async buildCameraOptions(containerId: string, settings: CameraSettings): Promise<CameraPreviewOptions> {
    const container = document.getElementById(containerId)?.getBoundingClientRect();
    const currentState = this.getCurrentState();
    
    const previewWidth = Math.floor(container?.width || 320);
    const previewHeight = Math.floor(container?.height || 400);

    const options: CameraPreviewOptions = {
      position: currentState.currentCamera as 'rear' | 'front',
      parent: containerId,
      className: 'cameraPreview',
      width: previewWidth,
      height: previewHeight,
      x: Math.floor(container?.left || 0),
      y: Math.floor(container?.top || 0),
      
      // Configuraciones de calidad
      disableExifHeaderStripping: false,
      storeToFile: false,
      disableAudio: true,
      
      // Configuraciones avanzadas
      rotateWhenOrientationChanged: true,
      toBack: false,
      enableHighResolution: settings.enableHighResolution,
      enableZoom: settings.enableZoom,
      
      // Configurar resolución si está disponible
      ...(currentState.currentResolution && {
        pictureSize: `${currentState.currentResolution.width}x${currentState.currentResolution.height}`
      })
    };

    return options;
  }

  /**
   * Actualiza el estado interno
   */
  private updateState(newState: CameraState): void {
    this.cameraStateSubject.next(newState);
  }

  /**
   * Limpia recursos al destruir el servicio
   */
  async destroy(): Promise<void> {
    await this.stopCamera();
    this.cameraStateSubject.complete();
  }
}
