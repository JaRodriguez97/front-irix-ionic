import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'front-irix-ionic',
  webDir: 'www',
  plugins: {
    Camera: {
      permissions: {
        camera: 'Camera permission is required to take photos'
      },
      // Configuraciones para máxima calidad
      quality: 100,
      allowEditing: false,
      resultType: 'dataUrl', // o 'uri' para mejor rendimiento
      saveToGallery: false,
      correctOrientation: true,
      width: 0, // Sin límite de ancho
      height: 0 // Sin límite de alto
    },
    CameraPreview: {
      permissions: {
        camera: 'Camera permission is required for camera preview',
        'android.permission.CAMERA': 'Camera access is required'
      },
      // Configuraciones específicas para preview de alta calidad
      enableHighResolution: true,
      enableZoom: true,
      disableExifHeaderStripping: false,
      storeToFile: false,
      disableAudio: true
    }
  },
  android: {
    permissions: [
      'android.permission.CAMERA',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS'
    ],
    // Configuración adicional para Android - optimizada para alta calidad
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    // Configuraciones adicionales para mejor calidad de cámara
    useLegacyBridge: false,
    mixedContentMode: 'always_allow'
  },
  ios: {
    // Configuraciones específicas para iOS
    contentInset: 'automatic',
    scrollEnabled: true,
    // Permitir características de cámara de alta calidad en iOS
    backgroundColor: '#000000'
  }
};

export default config;
