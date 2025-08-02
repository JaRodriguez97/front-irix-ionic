import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  CameraPreview,
  CameraPreviewOptions,
} from '@capacitor-community/camera-preview';
import { Camera } from '@capacitor/camera';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { CameraInfo } from '@irix/camera-info';

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
  cameraActive = false;
  currentCamera = 'rear';

  // Configuraciones de alta calidad
  private maxWidth = 0; // Sin límite (máxima resolución disponible)
  private maxHeight = 0; // Sin límite (máxima resolución disponible)
  private quality = 100; // Máxima calidad
  private supportedResolutions: any[] = [];
  private currentResolution: any = null;

  ngOnInit() {
    console.log('App iniciada');
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  async checkCameraPermissions(): Promise<boolean> {
    try {
      const permissions = await Camera.checkPermissions();
      if (permissions.camera !== 'granted') {
        const requestResult = await Camera.requestPermissions();
        if (requestResult.camera !== 'granted') {
          alert(
            'Se requieren permisos de cámara. Por favor, habilítalos en configuración.'
          );
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  async getCameraCapabilities() {
    try {
      const capabilities = await CameraPreview.getSupportedFlashModes();
      return capabilities;
    } catch {
      return null;
    }
  }

  /**
   * Obtiene información detallada de la cámara usando nuestro plugin personalizado
   */
  async getDetailedCameraInfo() {
    try {
      const cameraInfo = await CameraInfo.getCameraInfo({
        camera: this.currentCamera === 'rear' ? 'back' : 'front',
      });
      console.log('Información detallada de la cámara:', cameraInfo);
      return cameraInfo;
    } catch (error) {
      console.log('Error al obtener información de la cámara:', error);
      return null;
    }
  }

  /**
   * Muestra información detallada de la cámara en un alert
   */
  async showCameraInfo() {
    const cameraInfo = await this.getDetailedCameraInfo();
    if (cameraInfo) {
      alert(
        `ID: ${cameraInfo.id}\n` +
          `Lente: ${cameraInfo.facing}\n` +
          `Res. Soportadas: ${cameraInfo.supportedResolutions
            .map((r) => r.width + 'x' + r.height)
            .join(', ')}\n` +
          `Zoom Máx.: ${cameraInfo.maxZoom}\n` +
          `Tiene Flash: ${cameraInfo.hasFlash}\n` +
          `Modos de Enfoque: ${cameraInfo.supportedFocusModes.join(', ')}\n` +
          `ISO: ${cameraInfo.supportedIsoRanges.min}-${cameraInfo.supportedIsoRanges.max}\n` +
          `Exposición: ${cameraInfo.supportedExposureRange.min}-${cameraInfo.supportedExposureRange.max}\n`
      );
    } else {
      alert('No se pudo obtener la información de la cámara.');
    }
  }

  /**
   * Obtiene las resoluciones soportadas por la cámara usando plugin personalizado
   */
  async getSupportedResolutions() {
    try {
      // Usar nuestro plugin personalizado para obtener resoluciones reales
      const result = await CameraInfo.getSupportedResolutions({
        camera: this.currentCamera === 'rear' ? 'back' : 'front',
      });

      this.supportedResolutions = result.resolutions || [];

      // Seleccionar la resolución más alta disponible
      if (this.supportedResolutions.length > 0) {
        this.currentResolution = this.supportedResolutions.reduce(
          (max, current) => {
            return current.width * current.height > max.width * max.height
              ? current
              : max;
          }
        );
        console.log('Resolución máxima encontrada:', this.currentResolution);
        console.log('Todas las resoluciones:', this.supportedResolutions);
      } else {
        // Fallback a configuraciones predeterminadas
        this.supportedResolutions = [
          { width: 1920, height: 1080 }, // Full HD
          { width: 1280, height: 720 }, // HD
          { width: 854, height: 480 }, // 480p
        ];
        this.currentResolution = this.supportedResolutions[0];
        console.log('Usando resoluciones por defecto');
      }

      return this.supportedResolutions;
    } catch (error) {
      console.log(
        'Error al obtener resoluciones con plugin, usando por defecto:',
        error
      );
      // Fallback a configuraciones predeterminadas
      this.supportedResolutions = [
        { width: 1920, height: 1080 }, // Full HD
        { width: 1280, height: 720 }, // HD
        { width: 854, height: 480 }, // 480p
      ];
      this.currentResolution = this.supportedResolutions[0];
      return this.supportedResolutions;
    }
  }

  async startCamera() {
    if (this.cameraActive || !(await this.checkCameraPermissions())) return;
    try {
      // Obtener resoluciones soportadas antes de iniciar
      await this.getSupportedResolutions();

      const container = document
        .getElementById('cameraPreview')
        .getBoundingClientRect();

      // Usar la resolución máxima si está disponible, sino usar dimensiones del contenedor
      let previewWidth = Math.floor(container.width) || 320;
      let previewHeight = Math.floor(container.height) || 400;

      const cameraPreviewOptions: CameraPreviewOptions = {
        position: this.currentCamera as 'rear' | 'front',
        parent: 'cameraPreview',
        className: 'cameraPreview',

        // Usar dimensiones del contenedor para el preview
        width: previewWidth,
        height: previewHeight,

        // Configuraciones para máxima calidad
        disableExifHeaderStripping: false, // Mantener metadatos EXIF completos
        storeToFile: false, // No guardar automáticamente para control manual
        disableAudio: true, // Desactivar audio para mejor rendimiento de cámara

        // Posición dentro del contenedor
        x: Math.floor(container.left),
        y: Math.floor(container.top),

        // Configuraciones de orientación y calidad máxima
        rotateWhenOrientationChanged: true,
        toBack: false, // Mantener en primer plano
        enableHighResolution: true, // Habilitar alta resolución
        enableZoom: true, // Habilitar capacidades de zoom

        // Configuraciones adicionales para calidad
        //tapPhoto: true, // Permitir tap para tomar foto
        //tapFocus: true, // Permitir tap para enfocar
        // previewDrag: false, // Desactivar arrastre para mejor estabilidad

        // Configuraciones específicas según la resolución disponible
        ...(this.currentResolution && {
          // Si tenemos resolución máxima disponible, configurarla
          pictureSize: `${this.currentResolution.width}x${this.currentResolution.height}`,
        }),
      };

      console.log('Iniciando cámara con opciones:', cameraPreviewOptions);
      this.cameraActive = true;
      await CameraPreview.start(cameraPreviewOptions);

      console.log('Cámara iniciada exitosamente');
    } catch (error) {
      this.cameraActive = false;
      console.error('Error detallado al iniciar cámara:', error);
      alert(`No se pudo iniciar la cámara: ${error.message}`);
    }
  }

  async stopCamera() {
    if (this.cameraActive) {
      try {
        await CameraPreview.stop();
        this.cameraActive = false;
      } catch (error) {
        console.error('Error al detener la cámara:', error);
      }
    }
  }

  async flipCamera() {
    if (this.cameraActive) {
      try {
        await CameraPreview.flip();
        this.currentCamera = this.currentCamera === 'rear' ? 'front' : 'rear';
      } catch (error) {
        console.error('Error al voltear la cámara:', error);
      }
    }
  }

  async onCameraTouch(event: TouchEvent) {
    if (this.cameraActive && event.touches.length === 1) {
      try {
        const touch = event.touches[0];
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const x = Math.round(((touch.clientX - rect.left) / rect.width) * 100);
        const y = Math.round(((touch.clientY - rect.top) / rect.height) * 100);
        console.log('Enfoque en:', x, y);
      } catch (error) {
        console.error('Error al enfocar:', error);
      }
    }
  }

  async captureHighQuality() {
    if (this.cameraActive) {
      try {
        const result = await CameraPreview.capture({ quality: 100 });
        console.log('Foto capturada:', result);
      } catch (error) {
        console.error('Error al capturar foto:', error);
      }
    }
  }
}
