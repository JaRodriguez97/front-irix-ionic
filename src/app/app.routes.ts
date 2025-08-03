import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/camera/pages/camera-main/camera-main.page').then((m) => m.CameraMainPage),
  },
];
