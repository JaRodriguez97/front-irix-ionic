import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-camera-preview',
  templateUrl: './camera-preview.component.html',
  styleUrls: ['./camera-preview.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonIcon,
  ],
})
export class CameraPreviewComponent {
  @Input() isActive: boolean = false;
  @Output() touchFocus = new EventEmitter<TouchEvent>();

  onCameraTouch(event: TouchEvent) {
    if (this.isActive && event.touches.length === 1) {
      this.touchFocus.emit(event);
    }
  }
}
