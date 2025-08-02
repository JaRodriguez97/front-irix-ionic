import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Servicios
import { CameraService } from './services/camera.service';
import { CameraInfoService } from './services/camera-info.service';
import { PermissionsService } from './services/permissions.service';

@NgModule({
  imports: [CommonModule],
  providers: [
    CameraService,
    CameraInfoService,
    PermissionsService
  ]
})
export class CoreModule {
  constructor() {
    console.log('CoreModule inicializado');
  }
}
