import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { IonIcon, IonBadge, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { AiDetectionService, DetectionResult, VehicleDetection } from '../../../../core/services/ai-detection.service';
import { CameraService } from '../../../../core/services/camera.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ai-detection-overlay',
  templateUrl: './ai-detection-overlay.component.html',
  styleUrls: ['./ai-detection-overlay.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonIcon,
    IonBadge,
    IonButton,
    IonSpinner,
  ],
})
export class AiDetectionOverlayComponent implements OnInit, OnDestroy {
  @Input() isActive: boolean = false;
  @Input() aiEnabled: boolean = false;

  // Estado de la IA
  isAiInitialized = false;
  isProcessing = false;
  
  // Resultados de detección
  currentDetection: DetectionResult | null = null;
  
  // Estadísticas
  stats = {
    totalFramesProcessed: 0,
    vehiclesDetected: 0,
    averageProcessingTime: 0,
    fps: 0,
    lastProcessingTime: 0
  };

  // Control del stream
  private streamController: { stop: () => void } | null = null;
  private subscriptions: Subscription[] = [];
  private processingTimes: number[] = [];
  private lastFrameTime = 0;

  constructor(
    private aiDetectionService: AiDetectionService,
    private cameraService: CameraService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('🤖 AI Detection Overlay Component iniciado');
  }

  ngOnDestroy() {
    this.stopAiDetection();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Inicia la detección de IA integrada al stream
   */
  async startAiDetection(): Promise<void> {
    try {
      console.log('🚀 Iniciando detección de IA...');
      
      // 1. Verificar que la cámara esté activa
      if (!this.cameraService.getCurrentState().isActive) {
        throw new Error('La cámara debe estar activa antes de iniciar la IA');
      }

      // 2. Inicializar el modelo de IA
      this.isProcessing = true;
      await this.aiDetectionService.initializeAI();
      this.isAiInitialized = true;
      
      console.log('✅ Modelo de IA inicializado');

      // 3. Iniciar stream continuo con análisis de IA
      this.streamController = await this.cameraService.startContinuousVideoStream(
        (frameData: string) => this.processFrameWithAI(frameData),
        15 // 15 FPS para balance entre rendimiento y análisis
      );

      this.resetStats();
      console.log('🎥 Stream con IA iniciado exitosamente');
      
    } catch (error) {
      console.error('❌ Error iniciando detección de IA:', error);
      this.isProcessing = false;
    }
  }

  /**
   * Detiene la detección de IA
   */
  stopAiDetection(): void {
    console.log('🛑 Deteniendo detección de IA...');
    
    if (this.streamController) {
      this.streamController.stop();
      this.streamController = null;
    }
    
    this.currentDetection = null;
    this.isProcessing = false;
    this.cdr.detectChanges();
    
    console.log('✅ Detección de IA detenida');
  }

  /**
   * Procesa cada frame del stream con IA
   * 🔍 PUNTO CENTRAL DE INTEGRACIÓN - Aquí se conecta el stream con TensorFlow
   */
  private async processFrameWithAI(frameBase64: string): Promise<void> {
    if (!this.aiEnabled || !this.isAiInitialized) return;

    try {
      // Limitar procesamiento para evitar sobrecarga
      if (this.isProcessing) return;
      
      this.isProcessing = true;
      const currentTime = performance.now();

      // 🤖 ANÁLISIS CON TENSORFLOW - Detectar vehículos y placas
      const detection = await this.aiDetectionService.analyzeFrame(frameBase64);
      
      // Actualizar resultados si hay vehículos detectados
      if (detection.vehicles.length > 0) {
        this.currentDetection = detection;
        this.updateStats(detection);
        this.cdr.detectChanges();
        
        // Log detallado de vehículos detectados
        this.logDetectionResults(detection);
      }

      // Calcular FPS
      if (this.lastFrameTime > 0) {
        const timeDiff = currentTime - this.lastFrameTime;
        this.stats.fps = Math.round(1000 / timeDiff);
      }
      this.lastFrameTime = currentTime;

    } catch (error) {
      console.error('❌ Error procesando frame con IA:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Actualiza estadísticas de rendimiento
   */
  private updateStats(detection: DetectionResult): void {
    this.stats.totalFramesProcessed++;
    this.stats.vehiclesDetected += detection.vehicles.length;
    this.stats.lastProcessingTime = detection.processingTime;

    // Mantener promedio de tiempos de procesamiento
    this.processingTimes.push(detection.processingTime);
    if (this.processingTimes.length > 10) {
      this.processingTimes.shift();
    }
    
    this.stats.averageProcessingTime = 
      this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length;
  }

  /**
   * Log detallado de resultados de detección
   */
  private logDetectionResults(detection: DetectionResult): void {
    console.log(`🚗 DETECCIÓN:`, {
      vehículos: detection.vehicles.length,
      tiempo: `${detection.processingTime.toFixed(1)}ms`,
      resolución: `${detection.frameSize.width}x${detection.frameSize.height}`
    });

    detection.vehicles.forEach((vehicle, index) => {
      const plateInfo = vehicle.hasLicensePlate ? 
        `📄 Placa detectada (${vehicle.licensePlateRegion?.confidence.toFixed(2)})` : 
        '❌ Sin placa';
      
      console.log(`  ${index + 1}. ${vehicle.type} (${(vehicle.confidence * 100).toFixed(1)}%) - ${plateInfo}`);
    });
  }

  /**
   * Reinicia estadísticas
   */
  private resetStats(): void {
    this.stats = {
      totalFramesProcessed: 0,
      vehiclesDetected: 0,
      averageProcessingTime: 0,
      fps: 0,
      lastProcessingTime: 0
    };
    this.processingTimes = [];
  }

  /**
   * Alterna el estado de la IA
   */
  async toggleAI(): Promise<void> {
    if (this.aiEnabled) {
      this.stopAiDetection();
      this.aiEnabled = false;
    } else {
      this.aiEnabled = true;
      await this.startAiDetection();
    }
  }

  /**
   * Obtiene el color del badge según el tipo de vehículo
   */
  getVehicleColor(type: string): string {
    const colors: { [key: string]: string } = {
      'car': 'primary',
      'truck': 'warning',
      'bus': 'secondary',
      'motorcycle': 'tertiary',
      'bicycle': 'success'
    };
    return colors[type] || 'medium';
  }

  /**
   * Obtiene información del modelo de IA
   */
  get aiModelInfo() {
    return this.aiDetectionService.getModelInfo();
  }

  /**
   * Verifica si la IA está lista
   */
  get isAiReady(): boolean {
    return this.aiDetectionService.isReady();
  }

  /**
   * Función de tracking para optimizar renderizado de vehículos
   */
  trackByVehicle(index: number, vehicle: VehicleDetection): string {
    return `${vehicle.type}-${vehicle.boundingBox.x}-${vehicle.boundingBox.y}-${vehicle.confidence}`;
  }
}
