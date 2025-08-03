import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-camera-controls',
  templateUrl: './camera-controls.component.html',
  styleUrls: ['./camera-controls.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonIcon,
  ],
})
export class CameraControlsComponent {
  @Input() isActive: boolean = false;
  @Input() currentCamera: 'rear' | 'front' = 'rear';
  @Input() currentZoom: number = 1;
  @Input() maxZoom: number = 1;
  @Input() isZoomSupported: boolean = false;

  @Output() startCamera = new EventEmitter<void>();
  @Output() stopCamera = new EventEmitter<void>();
  @Output() flipCamera = new EventEmitter<void>();
  @Output() showInfo = new EventEmitter<void>();
  @Output() captureImage = new EventEmitter<void>();

  onToggleCamera() {
    if (this.isActive) {
      this.stopCamera.emit();
    } else {
      this.startCamera.emit();
    }
  }

  onFlipCamera() {
    this.flipCamera.emit();
  }

  onShowInfo() {
    this.showInfo.emit();
  }

  onCaptureImage() {
    this.captureImage.emit();
  }
}
