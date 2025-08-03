import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CameraInfo, CameraInfoService, CameraService, CameraState, PermissionsService } from '../../../../core';
import { AiDetectionService, DetectionResult } from '../../../../core/services/ai-detection.service';
import { AppHeaderComponent, HeaderAction } from '../../../../shared';
import { CameraControlsComponent } from '../../components/camera-controls/camera-controls.component';
import { CameraPreviewComponent } from '../../components/camera-preview/camera-preview.component';
import { CameraInfoDisplayComponent } from '../../components/camera-info-display/camera-info-display.component';
import { AiDetectionOverlayComponent } from '../../components/ai-detection-overlay/ai-detection-overlay.component';
import { AiDetectionsTableComponent } from '../../components/ai-detections-table/ai-detections-table.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-camera-main',
  templateUrl: './camera-main.page.html',
  styleUrls: ['./camera-main.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    AppHeaderComponent,
    CameraControlsComponent,
    CameraPreviewComponent,
    CameraInfoDisplayComponent,
    AiDetectionOverlayComponent,
    AiDetectionsTableComponent,
  ],
})
export class CameraMainPage implements OnInit, OnDestroy {
  cameraState: CameraState = {
    isActive: false,
    currentCamera: 'rear',
    currentResolution: null,
    supportedResolutions: [],
    zoomLevel: 1,
    maxZoom: 1,
  };

  cameraInfo: CameraInfo | null = null;
  infoModalOpen = false;
  aiDetections = 0;
  showAiTable = false;
  detectionHistory: DetectionResult[] = [];
  private aiDetectionInterval?: number;
  
  // Acciones del header - Navegación optimizada
  headerActions: HeaderAction[] = [
    {
      id: 'camera-toggle',
      icon: 'power-outline',
      label: 'Encender/Apagar cámara',
      color: 'primary'
    },
    {
      id: 'flip-camera',
      icon: 'camera-reverse-outline',
      label: 'Cambiar cámara',
      color: 'medium'
    },
    {
      id: 'settings',
      icon: 'settings-outline',
      label: 'Configuración',
      color: 'medium'
    },
    {
      id: 'info',
      icon: 'information-circle-outline',
      label: 'Información',
      color: 'tertiary'
    },
    {
      id: 'stats',
      icon: 'analytics-outline',
      label: 'Estadísticas IA',
      color: 'success'
    }
  ];
  
  private cameraStateSubscription?: Subscription;

  constructor(
    private cameraService: CameraService,
    private cameraInfoService: CameraInfoService,
    private permissionsService: PermissionsService,
    private aiDetectionService: AiDetectionService
  ) {}

  async ngOnInit() {
    // Inicializar IA
    try {
      await this.aiDetectionService.initializeAI();
      console.log('✅ IA inicializada correctamente');
    } catch (error) {
      console.error('❌ Error inicializando IA:', error);
    }

    // Suscribirse a cambios de estado de cámara
    this.cameraStateSubscription = this.cameraService.cameraState$.subscribe(
      (state: CameraState) => {
        this.cameraState = state;
        this.updateHeaderActions(); // ¡CRÍTICO! Actualizar header cuando cambia estado
        
        // Si la cámara se activa, inicializar detección de IA
        if (state.isActive) {
          this.startAiDetection();
        }
      }
    );

    // Inicializar acciones del header
    this.updateHeaderActions();
  }

  ngOnDestroy() {
    if (this.cameraStateSubscription) {
      this.cameraStateSubscription.unsubscribe();
    }
    this.stopAiDetection();
    this.stopCamera();
  }

  async getDetailedCameraInfo() {
    this.cameraInfo = await this.cameraInfoService.getCameraInfo(
      this.cameraState.currentCamera
    );
    this.infoModalOpen = true;
  }

  async startCamera() {
    await this.cameraService.startCamera('cameraPreview');
  }

  async stopCamera() {
    await this.cameraService.stopCamera();
  }

  async flipCamera() {
    await this.cameraService.flipCamera();
  }

  async captureHighQuality() {
    await this.cameraService.captureHighQuality();
  }

  async onCameraTouch(event: TouchEvent) {
    const touch = event.touches[0];
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = Math.round(((touch.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((touch.clientY - rect.top) / rect.height) * 100);
    // await this.cameraService.setFocusPoint(x, y);
  }

  get isZoomSupported(): boolean {
    return this.cameraService.isZoomSupported();
  }

  /**
   * Inicia la detección de IA en tiempo real
   * Conecta el stream de video con TensorFlow para análisis continuo
   */
  private async startAiDetection(): Promise<void> {
    try {
      console.log('🤖 Iniciando detección de IA integrada...');
      
      // Detener cualquier detección previa
      this.stopAiDetection();
      
      // Inicializar TensorFlow si no está listo
      if (!this.aiDetectionService.isReady()) {
        console.log('📥 Inicializando modelo TensorFlow...');
        await this.aiDetectionService.initializeAI();
        console.log('✅ TensorFlow inicializado');
      }
      
      // Iniciar stream continuo de video a 15 FPS para balance rendimiento/análisis
      const streamController = await this.cameraService.startContinuousVideoStream(
        (frameData: string) => this.processFrameWithAI(frameData),
        15 // 15 FPS para análisis de IA
      );
      
      // Almacenar controlador para poder detener
      this.aiDetectionInterval = setInterval(() => {
        // Mantener vivo el proceso, el análisis real se hace en processFrameWithAI
        if (!this.cameraState.isActive) {
          this.stopAiDetection();
        }
      }, 1000) as any;
      
      console.log('🎥 Stream de IA iniciado exitosamente');
      
    } catch (error) {
      console.error('❌ Error iniciando detección de IA:', error);
      this.stopAiDetection();
    }
  }
  
  /**
   * Procesa cada frame del video con TensorFlow
   * PUNTO CENTRAL DE ANÁLISIS - Aquí TensorFlow detecta vehículos y placas
   */
  private async processFrameWithAI(frameBase64: string): Promise<void> {
    try {
      // Solo procesar si la cámara está activa
      if (!this.cameraState.isActive) return;
      
      // 🤖 ANÁLISIS CON TENSORFLOW - Detectar vehículos y placas
      const detection = await this.aiDetectionService.analyzeFrame(frameBase64);
      
      // 📊 AGREGAR AL HISTORIAL DE DETECCIONES PARA LA TABLA
      if (detection.vehicles.length > 0) {
        this.detectionHistory.push(detection);
        // Mantener solo las últimas 50 detecciones para rendimiento
        if (this.detectionHistory.length > 50) {
          this.detectionHistory = this.detectionHistory.slice(-50);
        }
      }
      
      // Actualizar contador de detecciones para el header
      if (detection.vehicles.length > 0) {
        this.aiDetections = detection.vehicles.length;
        
        // Log detallado para debugging
        console.log(`🚗 ${detection.vehicles.length} vehículo(s) detectado(s):`);
        detection.vehicles.forEach((vehicle, index) => {
          const plateInfo = vehicle.hasLicensePlate ? 
            `📄 Con placa (${(vehicle.licensePlateRegion?.confidence || 0 * 100).toFixed(1)}%)` : 
            '❌ Sin placa';
          console.log(`  ${index + 1}. ${vehicle.type} (${(vehicle.confidence * 100).toFixed(1)}%) - ${plateInfo}`);
        });
      } else {
        // Reducir gradualmente el contador si no hay detecciones
        this.aiDetections = Math.max(0, this.aiDetections - 1);
      }
      
    } catch (error) {
      console.error('❌ Error procesando frame con IA:', error);
    }
  }
  
  /**
   * Detiene la detección de IA
   */
  private stopAiDetection(): void {
    if (this.aiDetectionInterval) {
      clearInterval(this.aiDetectionInterval);
      this.aiDetectionInterval = undefined;
    }
    
    // Detener stream continuo
    if (this.cameraService.isContinuousStreamActive()) {
      this.cameraService.stopContinuousVideoStream();
    }
    
    this.aiDetections = 0;
    console.log('🛑 Detección de IA detenida');
  }

  /**
   * Maneja las acciones del header
   */
  onHeaderAction(actionId: string) {
    switch (actionId) {
      case 'camera-toggle':
        if (this.cameraState.isActive) {
          this.stopCamera();
        } else {
          this.startCamera();
        }
        break;
      case 'flip-camera':
        if (this.cameraState.isActive) {
          this.flipCamera();
        }
        break;
      case 'settings':
        // TODO: Implementar página de configuración
        console.log('Configuración - Funcionalidad pendiente');
        break;
      case 'info':
        this.getDetailedCameraInfo();
        break;
      case 'stats':
        // Mostrar/ocultar tabla de estadísticas de IA
        this.showAiTable = !this.showAiTable;
        console.log(`📊 Tabla de IA ${this.showAiTable ? 'mostrada' : 'ocultada'}`);
        break;
      default:
        console.warn('Acción no reconocida:', actionId);
    }
  }

  /**
   * Actualiza dinámicamente las acciones del header basado en el estado
   */
  private updateHeaderActions() {
    this.headerActions = this.headerActions.map(action => {
      switch (action.id) {
        case 'camera-toggle':
          return {
            ...action,
            icon: this.cameraState.isActive ? 'stop-circle-outline' : 'camera-outline',
            color: this.cameraState.isActive ? 'danger' : 'primary',
            active: this.cameraState.isActive
          };
        case 'flip-camera':
        case 'capture':
          return {
            ...action,
            disabled: !this.cameraState.isActive
          };
        default:
          return action;
      }
    });
  }
}
