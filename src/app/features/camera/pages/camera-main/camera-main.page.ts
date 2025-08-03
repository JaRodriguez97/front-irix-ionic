import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CameraInfo, CameraInfoService, CameraService, CameraState, PermissionsService } from '../../../../core';
import { CameraControlsComponent } from '../../components/camera-controls/camera-controls.component';
import { CameraPreviewComponent } from '../../components/camera-preview/camera-preview.component';
import { CameraInfoDisplayComponent } from '../../components/camera-info-display/camera-info-display.component';
import { AiDetectionOverlayComponent } from '../../components/ai-detection-overlay/ai-detection-overlay.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-camera-main',
  templateUrl: './camera-main.page.html',
  styleUrls: ['./camera-main.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CameraControlsComponent,
    CameraPreviewComponent,
    CameraInfoDisplayComponent,
    AiDetectionOverlayComponent,
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
  private cameraStateSubscription?: Subscription;

  constructor(
    private cameraService: CameraService,
    private cameraInfoService: CameraInfoService,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit() {
    this.cameraStateSubscription = this.cameraService.cameraState$.subscribe(
      (state: CameraState) => {
        this.cameraState = state;
      }
    );
  }

  ngOnDestroy() {
    if (this.cameraStateSubscription) {
      this.cameraStateSubscription.unsubscribe();
    }
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
}
