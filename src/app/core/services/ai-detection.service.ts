import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export interface DetectionResult {
  vehicles: VehicleDetection[];
  processingTime: number;
  frameSize: { width: number; height: number };
}

export interface VehicleDetection {
  type: 'car' | 'truck' | 'bus' | 'motorcycle' | 'bicycle';
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  hasLicensePlate?: boolean;
  licensePlateRegion?: {
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AiDetectionService {
  private cocoModel?: cocoSsd.ObjectDetection;
  private isModelLoaded = false;
  private loadingPromise?: Promise<void>;

  // Clases de vehículos que buscamos en COCO-SSD
  private readonly VEHICLE_CLASSES = [
    'car', 'truck', 'bus', 'motorcycle', 'bicycle'
  ];

  constructor() {
    console.log('🤖 AI Detection Service iniciado');
  }

  /**
   * Inicializa TensorFlow.js y carga el modelo COCO-SSD
   */
  async initializeAI(): Promise<void> {
    if (this.isModelLoaded) {
      console.log('✅ Modelo de IA ya está cargado');
      return;
    }

    if (this.loadingPromise) {
      console.log('⏳ Esperando carga del modelo...');
      return this.loadingPromise;
    }

    this.loadingPromise = this.loadModel();
    return this.loadingPromise;
  }

  private async loadModel(): Promise<void> {
    try {
      console.log('🔄 Iniciando TensorFlow.js...');
      
      // Configurar TensorFlow para mejor rendimiento
      await tf.ready();
      console.log('✅ TensorFlow.js listo');
      console.log('Backend:', tf.getBackend());
      console.log('Memoria GPU disponible:', tf.memory());

      console.log('📥 Cargando modelo COCO-SSD...');
      this.cocoModel = await cocoSsd.load({
        base: 'mobilenet_v2', // Modelo más ligero para móviles
        modelUrl: undefined // Usar modelo por defecto
      });

      this.isModelLoaded = true;
      console.log('✅ Modelo COCO-SSD cargado exitosamente');
      
      // Calentar el modelo con una imagen dummy
      await this.warmUpModel();
      
    } catch (error) {
      console.error('❌ Error cargando modelo de IA:', error);
      this.isModelLoaded = false;
      throw error;
    }
  }

  /**
   * Calienta el modelo con una imagen dummy para mejorar rendimiento
   */
  private async warmUpModel(): Promise<void> {
    if (!this.cocoModel) return;

    try {
      console.log('🔥 Calentando modelo de IA...');
      const dummyTensor = tf.zeros([1, 224, 224, 3]);
      await this.cocoModel.detect(dummyTensor as any);
      dummyTensor.dispose();
      console.log('✅ Modelo calentado');
    } catch (error) {
      console.warn('⚠️ Error calentando modelo:', error);
    }
  }

  /**
   * Detecta vehículos y posibles placas en un frame base64
   * 🔍 PUNTO DE ANÁLISIS PRINCIPAL - Aquí llega cada frame del stream
   */
  async analyzeFrame(frameBase64: string): Promise<DetectionResult> {
    const startTime = performance.now();

    try {
      if (!this.isModelLoaded || !this.cocoModel) {
        throw new Error('Modelo de IA no está cargado');
      }

      // Convertir base64 a imagen
      const img = await this.base64ToImage(frameBase64);
      const frameSize = { width: img.width, height: img.height };

      // Convertir imagen a tensor para TensorFlow
      const tensor = tf.browser.fromPixels(img);
      
      console.log('🔍 Analizando frame:', frameSize);

      // Detectar objetos usando COCO-SSD
      const predictions = await this.cocoModel.detect(tensor);
      
      // Filtrar solo vehículos
      const vehicles = this.filterVehicles(predictions, frameSize);
      
      // Detectar posibles regiones de placas en cada vehículo
      const vehiclesWithPlates = await this.detectLicensePlateRegions(vehicles, img);

      // Limpiar memoria
      tensor.dispose();
      img.remove();

      const processingTime = performance.now() - startTime;
      
      const result: DetectionResult = {
        vehicles: vehiclesWithPlates,
        processingTime,
        frameSize
      };

      if (vehiclesWithPlates.length > 0) {
        console.log(`🚗 ${vehiclesWithPlates.length} vehículo(s) detectado(s) en ${processingTime.toFixed(1)}ms`);
      }

      return result;

    } catch (error) {
      console.error('❌ Error analizando frame:', error);
      const processingTime = performance.now() - startTime;
      return {
        vehicles: [],
        processingTime,
        frameSize: { width: 0, height: 0 }
      };
    }
  }

  /**
   * Filtra predicciones para quedarse solo con vehículos
   */
  private filterVehicles(predictions: cocoSsd.DetectedObject[], frameSize: { width: number; height: number }): VehicleDetection[] {
    return predictions
      .filter(pred => this.VEHICLE_CLASSES.includes(pred.class))
      .filter(pred => pred.score > 0.5) // Solo alta confianza
      .map(pred => ({
        type: pred.class as VehicleDetection['type'],
        confidence: pred.score,
        boundingBox: {
          x: pred.bbox[0],
          y: pred.bbox[1],
          width: pred.bbox[2],
          height: pred.bbox[3]
        }
      }));
  }

  /**
   * Detecta posibles regiones de placas vehiculares usando heurísticas
   * (Sin OCR, solo detección de regiones rectangulares características)
   */
  private async detectLicensePlateRegions(vehicles: VehicleDetection[], img: HTMLImageElement): Promise<VehicleDetection[]> {
    return vehicles.map(vehicle => {
      // Heurística simple para detectar región de placa
      // Las placas suelen estar en la parte inferior frontal/trasera del vehículo
      const { boundingBox } = vehicle;
      
      // Región inferior del vehículo (donde típicamente están las placas)
      const plateRegionHeight = boundingBox.height * 0.2; // 20% de la altura del vehículo
      const plateRegionWidth = boundingBox.width * 0.6;   // 60% del ancho del vehículo
      
      const licensePlateRegion = {
        x: boundingBox.x + (boundingBox.width - plateRegionWidth) / 2,
        y: boundingBox.y + boundingBox.height - plateRegionHeight,
        width: plateRegionWidth,
        height: plateRegionHeight,
        confidence: 0.7 // Confianza heurística
      };

      return {
        ...vehicle,
        hasLicensePlate: true, // Asumimos que todos los vehículos tienen placa
        licensePlateRegion
      };
    });
  }

  /**
   * Convierte base64 a HTMLImageElement
   */
  private async base64ToImage(base64: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
    });
  }

  /**
   * Verifica si el modelo está listo
   */
  isReady(): boolean {
    return this.isModelLoaded && !!this.cocoModel;
  }

  /**
   * Obtiene información del modelo
   */
  getModelInfo(): { isLoaded: boolean; backend: string; memory?: tf.MemoryInfo } {
    return {
      isLoaded: this.isModelLoaded,
      backend: tf.getBackend(),
      memory: this.isModelLoaded ? tf.memory() : undefined
    };
  }

  /**
   * Limpia recursos de TensorFlow
   */
  dispose(): void {
    if (this.cocoModel) {
      // Los modelos de TensorFlow.js se limpian automáticamente
      this.cocoModel = undefined;
    }
    this.isModelLoaded = false;
    console.log('🧹 Recursos de IA liberados');
  }
}
