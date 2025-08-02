# front-irix-ionic

Este es un proyecto MVP desarrollado con Ionic Framework y Angular. La aplicación tiene como objetivo proporcionar una interfaz para la manipulación de la cámara con capacidades avanzadas de información del dispositivo.

## Contenido del Proyecto

### Estructura del Proyecto

- **Ionic & Capacitor**: Integración con Capacitor para acceder a las funcionalidades nativas de la cámara.
- **Angular**: Usado como framework principal para crear componentes y manejar la lógica de negocio.
- **Plugin Personalizado**: Plugin nativo personalizado (`@irix/camera-info`) para obtener información detallada de la cámara.
- **Cámara**: Implementación personalizada para iniciar, detener, y manipular la cámara del dispositivo.

### Archivos Clave

- **`package.json`**: Lista de dependencias y scripts del proyecto.
- **`ionic.config.json`**: Configuración para el proyecto Ionic.
- **`capacitor.config.ts`**: Configuración personalizada para Capacitor, incluyendo permisos y configuraciones de plugins.
- **`angular.json`**: Configuraciones de Angular, incluyendo arquitecturas build y test.
- **`plugins/camera-info/`**: Plugin personalizado para obtener información detallada de la cámara.

### Funcionalidades

#### Tab1 - Cámara en Tiempo Real

- **Inicio y Detención de Cámara**: Posibilidad de iniciar y detener la cámara con controles a través de botones.
- **Enfoque Táctil**: Toque para enfocar en la vista previa de la cámara.
- **Captura de Imágenes de Alta Calidad**: Toma de fotos con la máxima calidad soportada por el dispositivo.
- **Cambiar Cámara**: Permite alternar entre cámaras frontal y trasera.
- **Información de Cámara**: Botón para obtener información detallada de la cámara actual incluyendo:
  - Resoluciones soportadas
  - Zoom máximo
  - Disponibilidad de flash
  - Modos de enfoque soportados
  - Rangos ISO soportados
  - Rangos de exposición

## Plugin Personalizado: @irix/camera-info

### Descripción
Plugin nativo desarrollado en Java para Android que permite acceder a información detallada de las cámaras del dispositivo utilizando la API Camera2 de Android.

### Funcionalidades del Plugin

- **`getSupportedResolutions()`**: Obtiene todas las resoluciones soportadas por la cámara especificada.
- **`getCameraInfo()`**: Obtiene información completa de la cámara incluyendo capacidades técnicas.
- **`getAvailableCameras()`**: Lista todas las cámaras disponibles en el dispositivo.

### Estructura del Plugin

```
plugins/camera-info/
├── android/
│   ├── build.gradle
│   └── src/main/java/com/irix/camerainfo/
│       └── CameraInfoPlugin.java
├── src/
│   ├── definitions.ts
│   └── index.ts
└── package.json
```

### Implementación Android

El plugin utiliza:
- **Camera2 API**: Para acceder a las características avanzadas de la cámara
- **CameraManager**: Para gestionar múltiples cámaras
- **CameraCharacteristics**: Para obtener capacidades específicas de cada cámara
- **StreamConfigurationMap**: Para obtener resoluciones soportadas

### Uso del Plugin

```typescript
import { CameraInfo } from '@irix/camera-info';

// Obtener resoluciones soportadas
const resolutions = await CameraInfo.getSupportedResolutions({ camera: 'back' });

// Obtener información completa de la cámara
const cameraInfo = await CameraInfo.getCameraInfo({ camera: 'back' });

// Obtener todas las cámaras disponibles
const cameras = await CameraInfo.getAvailableCameras();
```

### Instalación

1. Clona el repositorio.
2. Ejecuta `npm install` para instalar todas las dependencias.
3. **IMPORTANTE**: Construye el plugin personalizado antes del primer uso:
   ```bash
   cd plugins/camera-info
   npm install
   npm run build
   cd ../..
   ```
4. Utiliza `ionic serve` para iniciar la aplicación en modo desarrollo.
5. Para probar en dispositivo: `npm run dev` (construye y abre Android Studio).

### Scripts Útiles

- **`npm run dev`**: Construye el proyecto y abre el entorno Android.
- **`npm run start`**: Inicia la aplicación en un servidor local.
- **`npm run build`**: Compila la aplicación para producción.
- **`npm run test`**: Corre las pruebas unitarias.
- **`npm run lint`**: Analiza el código para ver problemas de estilo.

## Dependencias Principales

- **@capacitor-community/camera-preview**: Preview de cámara en tiempo real
- **@capacitor/camera**: API básica de cámara de Capacitor
- **@irix/camera-info**: Plugin personalizado para información de cámara
- **@tensorflow/tfjs & @tensorflow-models/coco-ssd**: Para futuras funcionalidades de AI

## Notas de Desarrollo

### Pasos Realizados

1. **Configuración inicial**: Proyecto Ionic con Angular y Capacitor
2. **Implementación básica de cámara**: Usando camera-preview plugin
3. **Detección de limitaciones**: Los plugins existentes no proporcionan información detallada
4. **Desarrollo de plugin personalizado**: Creación de plugin nativo en Java
5. **Integración del plugin**: Instalación local y uso en la aplicación
6. **UI para información**: Botón para mostrar datos de cámara en alert

### Próximos Pasos Sugeridos

- Implementar funcionalidades adicionales de cámara (zoom, flash, etc.)
- Agregar soporte para iOS en el plugin personalizado
- Integrar funcionalidades de AI para análisis de imágenes
- Mejorar la UI para mostrar información de cámara
- Agregar tests unitarios para el plugin
## Notas Adicionales

Este proyecto se encuentra en desarrollo activo. El plugin personalizado actualmente solo soporta Android. Para producción, se recomienda agregar soporte para iOS y realizar pruebas exhaustivas en múltiples dispositivos.
  ```

