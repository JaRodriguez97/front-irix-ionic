import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';

import { CameraInfo } from '../../../../core';

@Component({
  selector: 'app-camera-info-display',
  templateUrl: './camera-info-display.component.html',
  styleUrls: ['./camera-info-display.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
  ],
})
export class CameraInfoDisplayComponent {
  @Input() cameraInfo: CameraInfo | null = null;
  @Input() isOpen: boolean = false;

  get formattedResolutions(): string {
    if (!this.cameraInfo?.supportedResolutions) return 'N/A';
    
    return this.cameraInfo.supportedResolutions
      .map(r => `${r.width}x${r.height}`)
      .join(', ');
  }

  get formattedFocusModes(): string {
    return this.cameraInfo?.supportedFocusModes?.join(', ') || 'N/A';
  }

  get formattedIsoRange(): string {
    if (!this.cameraInfo?.supportedIsoRanges) return 'N/A';
    
    return `${this.cameraInfo.supportedIsoRanges.min}-${this.cameraInfo.supportedIsoRanges.max}`;
  }

  get formattedExposureRange(): string {
    if (!this.cameraInfo?.supportedExposureRange) return 'N/A';
    
    return `${this.cameraInfo.supportedExposureRange.min}-${this.cameraInfo.supportedExposureRange.max}`;
  }
}
