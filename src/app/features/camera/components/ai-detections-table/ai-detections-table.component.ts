import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonBadge,
  IonIcon,
  IonButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  carOutline,
  busOutline,
  bicycleOutline,
  eyeOutline,
  closeOutline,
  statsChartOutline,
  checkmarkCircleOutline,
  warningOutline,
  documentTextOutline
} from 'ionicons/icons';
import { DetectionResult, VehicleDetection, AiDetectionService } from '../../../../core/services/ai-detection.service';
import { Subscription, interval } from 'rxjs';

interface DetectionStats {
  totalDetections: number;
  vehicleTypes: { [key: string]: number };
  averageConfidence: number;
  platesDetected: number;
  processingTime: number;
  lastUpdate: Date;
}

interface ModelValidation {
  modelName: string;
  version: string;
  accuracy: number;
  classes: string[];
  isLoaded: boolean;
  backend: string;
  memoryUsage: number;
}

@Component({
  selector: 'app-ai-detections-table',
  templateUrl: './ai-detections-table.component.html',
  styleUrls: ['./ai-detections-table.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonBadge,
    IonIcon,
    IonButton,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons
  ]
})
export class AiDetectionsTableComponent implements OnInit, OnDestroy {
  @Input() isVisible: boolean = false;
  @Input() detectionHistory: DetectionResult[] = [];
  
  isModalOpen = false;
  currentStats: DetectionStats = {
    totalDetections: 0,
    vehicleTypes: {},
    averageConfidence: 0,
    platesDetected: 0,
    processingTime: 0,
    lastUpdate: new Date()
  };

  modelValidation: ModelValidation = {
    modelName: 'COCO-SSD',
    version: '2.2.2',
    accuracy: 0.85, // 85% de precisión típica para COCO-SSD
    classes: ['car', 'truck', 'bus', 'motorcycle', 'bicycle'],
    isLoaded: false,
    backend: 'webgl',
    memoryUsage: 0
  };

  private statsSubscription?: Subscription;
  recentDetections: VehicleDetection[] = [];

  constructor(
    private aiDetectionService: AiDetectionService
  ) {
    addIcons({
      carOutline,
      busOutline,
      bicycleOutline,
      eyeOutline,
      closeOutline,
      statsChartOutline,
      checkmarkCircleOutline,
      warningOutline,
      documentTextOutline
    });
  }

  ngOnInit() {
    this.initializeStats();
    this.startStatsUpdater();
  }

  ngOnDestroy() {
    if (this.statsSubscription) {
      this.statsSubscription.unsubscribe();
    }
  }

  /**
   * Inicializa las estadísticas del modelo
   */
  private initializeStats() {
    try {
      // Obtener información real del modelo desde el servicio
      const modelInfo = this.aiDetectionService.getModelInfo();
      
      this.modelValidation = {
        modelName: modelInfo.modelName || 'COCO-SSD',
        version: modelInfo.version || '2.2.2',
        accuracy: modelInfo.accuracy || 0.85,
        classes: modelInfo.supportedClasses || ['car', 'truck', 'bus', 'motorcycle', 'bicycle'],
        isLoaded: modelInfo.isLoaded || false,
        backend: modelInfo.backend || 'webgl',
        memoryUsage: modelInfo.memory?.numBytes || 0
      };
      
      console.log('📊 Información del modelo IA cargada:', this.modelValidation);
    } catch (error) {
      console.warn('⚠️ Error obteniendo info del modelo, usando valores por defecto:', error);
      // Valores por defecto si falla la obtención de información
      this.modelValidation = {
        modelName: 'COCO-SSD',
        version: '2.2.2',
        accuracy: 0.85,
        classes: ['car', 'truck', 'bus', 'motorcycle', 'bicycle'],
        isLoaded: false,
        backend: 'webgl',
        memoryUsage: 0
      };
    }
    
    this.updateStats();
  }

  /**
   * Actualiza estadísticas cada segundo
   */
  private startStatsUpdater() {
    this.statsSubscription = interval(1000).subscribe(() => {
      this.updateStats();
      this.updateModelStatus(); // Actualizar estado del modelo
    });
  }

  /**
   * Actualiza el estado del modelo en tiempo real
   */
  private updateModelStatus() {
    try {
      const currentModelInfo = this.aiDetectionService.getModelInfo();
      
      // Solo actualizar si hay cambios significativos
      if (this.modelValidation.isLoaded !== currentModelInfo.isLoaded) {
        this.modelValidation.isLoaded = currentModelInfo.isLoaded;
        this.modelValidation.backend = currentModelInfo.backend;
        this.modelValidation.memoryUsage = currentModelInfo.memory?.numBytes || 0;
        
        console.log(`📊 Estado del modelo actualizado: ${currentModelInfo.isLoaded ? 'Cargado' : 'No cargado'}`);
      }
    } catch (error) {
      // Silenciar errores para no saturar el log
    }
  }

  /**
   * Actualiza las estadísticas basadas en el historial de detecciones
   */
  private updateStats() {
    if (this.detectionHistory.length === 0) return;

    const recent = this.detectionHistory.slice(-10); // Últimas 10 detecciones
    
    // Calcular estadísticas
    let totalVehicles = 0;
    let totalConfidence = 0;
    let totalPlates = 0;
    let totalProcessingTime = 0;
    const vehicleTypes: { [key: string]: number } = {};

    recent.forEach(detection => {
      totalVehicles += detection.vehicles.length;
      totalProcessingTime += detection.processingTime;
      
      detection.vehicles.forEach(vehicle => {
        totalConfidence += vehicle.confidence;
        vehicleTypes[vehicle.type] = (vehicleTypes[vehicle.type] || 0) + 1;
        
        if (vehicle.hasLicensePlate) {
          totalPlates++;
        }
      });
    });

    this.currentStats = {
      totalDetections: totalVehicles,
      vehicleTypes,
      averageConfidence: totalVehicles > 0 ? totalConfidence / totalVehicles : 0,
      platesDetected: totalPlates,
      processingTime: recent.length > 0 ? totalProcessingTime / recent.length : 0,
      lastUpdate: new Date()
    };

    // Mantener las últimas detecciones para mostrar
    this.recentDetections = recent
      .flatMap(d => d.vehicles)
      .slice(-5)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Obtiene el icono para cada tipo de vehículo
   */
  getVehicleIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'car': 'car-outline',
      'truck': 'car-outline', // No hay icono específico, usar car
      'bus': 'bus-outline',
      'motorcycle': 'bicycle-outline', // Aproximación
      'bicycle': 'bicycle-outline'
    };
    return icons[type] || 'car-outline';
  }

  /**
   * Obtiene el color del badge según la confianza
   */
  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'danger';
  }

  /**
   * Abre el modal de estadísticas detalladas
   */
  openStatsModal() {
    this.isModalOpen = true;
  }

  /**
   * Cierra el modal
   */
  closeModal() {
    this.isModalOpen = false;
  }

  /**
   * Formatea el porcentaje de confianza
   */
  formatConfidence(confidence: number): string {
    return `${(confidence * 100).toFixed(1)}%`;
  }

  /**
   * Obtiene el estado de validación del modelo
   */
  getModelStatus(): { text: string; color: string; icon: string } {
    if (!this.modelValidation.isLoaded) {
      return { text: 'Cargando...', color: 'warning', icon: 'warning-outline' };
    }
    
    if (this.modelValidation.accuracy >= 0.8) {
      return { text: 'Excelente', color: 'success', icon: 'checkmark-circle-outline' };
    }
    
    return { text: 'Bueno', color: 'primary', icon: 'checkmark-circle-outline' };
  }

  /**
   * Limpia las estadísticas
   */
  clearStats() {
    this.currentStats = {
      totalDetections: 0,
      vehicleTypes: {},
      averageConfidence: 0,
      platesDetected: 0,
      processingTime: 0,
      lastUpdate: new Date()
    };
    this.recentDetections = [];
  }
}
