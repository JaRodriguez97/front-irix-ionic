import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';

// Core services y modelos
import {
  CameraInfo,
  CameraInfoService,
  CameraResolution,
  CameraService,
  CameraState,
  PermissionsService,
} from '../core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    CommonModule,
  ],
})
export class Tab1Page implements OnInit, OnDestroy {
  // Estado de la cámara usando servicios modulares
  cameraState: CameraState = {
    isActive: false,
    currentCamera: 'rear',
    currentResolution: null,
    supportedResolutions: [],
    zoomLevel: 1,
    maxZoom: 1,
  };

  private cameraStateSubscription?: Subscription;

  constructor(
    private cameraService: CameraService,
    private cameraInfoService: CameraInfoService,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit() {
    console.log('App iniciada - Arquitectura Modular v1.1');
    // Suscribirse al estado de la cámara
    this.cameraStateSubscription = this.cameraService.cameraState$.subscribe(
      (state: CameraState) => {
        this.cameraState = state;
        console.log('Estado de cámara actualizado:', state);
      }
    );
  }

  ngOnDestroy() {
    this.stopCamera();
    if (this.cameraStateSubscription) {
      this.cameraStateSubscription.unsubscribe();
    }
  }

  /**
   * Propiedades de compatibilidad para el template
   */
  get cameraActive(): boolean {
    return this.cameraState.isActive;
  }

  get currentCamera(): 'rear' | 'front' {
    return this.cameraState.currentCamera;
  }

  /**
   * Obtiene información detallada de la cámara usando servicios modulares
   */
  async getDetailedCameraInfo(): Promise<CameraInfo | null> {
    return await this.cameraInfoService.getCameraInfo(
      this.cameraState.currentCamera
    );
  }

  /**
   * Muestra información detallada de la cámara en un alert (sin flash según v1.1)
   */
  async showCameraInfo() {
    const cameraInfo = await this.getDetailedCameraInfo();
    if (cameraInfo) {
      const zoomPermissions = await this.cameraService.checkZoomPermissions();
      alert(
        `ID: ${cameraInfo.id}\n` +
          `Lente: ${cameraInfo.facing}\n` +
          `Res. Soportadas: ${cameraInfo.supportedResolutions
            .map((r: CameraResolution) => r.width + 'x' + r.height)
            .join(', ')}\n` +
          `Zoom Máx.: ${cameraInfo.maxZoom}\n` +
          `Tipo de Zoom: ${zoomPermissions.type}\n` +
          `Modos de Enfoque: ${
            cameraInfo.supportedFocusModes?.join(', ') || 'N/A'
          }\n` +
          `ISO: ${cameraInfo.supportedIsoRanges?.min}-${cameraInfo.supportedIsoRanges?.max}\n` +
          `Exposición: ${cameraInfo.supportedExposureRange?.min}-${cameraInfo.supportedExposureRange?.max}\n`
      );
    } else {
      alert('No se pudo obtener la información de la cámara.');
    }
  }

  /**
   * Inicializar cámara usando servicios modulares
   */
  async startCamera() {
    const success = await this.cameraService.startCamera('cameraPreview');
    if (success) {
      console.log('Cámara iniciada exitosamente con arquitectura modular');
    } else {
      alert('No se pudo iniciar la cámara. Verifica los permisos.');
    }
  }

  /**
   * Detener cámara usando servicios modulares
   */
  async stopCamera() {
    await this.cameraService.stopCamera();
  }

  /**
   * Cambiar cámara usando servicios modulares
   */
  async flipCamera() {
    const success = await this.cameraService.flipCamera();
    if (!success) {
      console.warn('No se pudo cambiar la cámara');
    }
  }

  /**
   * Capturar imagen usando servicios modulares
   */
  async captureHighQuality() {
    const imageData = await this.cameraService.captureHighQuality();
    if (imageData) {
      console.log('Imagen capturada exitosamente:', imageData);
      // Aquí podrías procesar la imagen capturada
    } else {
      alert('Error al capturar la imagen');
    }
  }

  /**
   * Manejo de toque para enfoque (manteniendo funcionalidad original)
   */
  async onCameraTouch(event: TouchEvent) {
    if (this.cameraActive && event.touches.length === 1) {
      try {
        const touch = event.touches[0];
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const x = Math.round(((touch.clientX - rect.left) / rect.width) * 100);
        const y = Math.round(((touch.clientY - rect.top) / rect.height) * 100);
        console.log('Enfoque táctil en:', { x, y });

        // TODO: Implementar enfoque táctil cuando esté disponible en el plugin
        // await this.cameraService.setFocusPoint(x, y);
      } catch (error) {
        console.error('Error al procesar toque para enfoque:', error);
      }
    }
  }

  /**
   * Funciones adicionales para v1.1 - Zoom
   */
  async setZoom(level: number) {
    const success = await this.cameraService.setZoom(level);
    if (!success) {
      console.warn('No se pudo ajustar el zoom');
    }
  }

  get currentZoom(): number {
    return this.cameraState.zoomLevel;
  }

  get maxZoom(): number {
    return this.cameraState.maxZoom;
  }

  get isZoomSupported(): boolean {
    return this.cameraService.isZoomSupported();
  }
}
