# 📱 IRIX Camera MVP

<div align="center">
  <img src="https://img.shields.io/badge/Ionic-7.0-blue?style=for-the-badge&logo=ionic" alt="Ionic">
  <img src="https://img.shields.io/badge/Angular-20.0-red?style=for-the-badge&logo=angular" alt="Angular">
  <img src="https://img.shields.io/badge/Capacitor-7.4-black?style=for-the-badge&logo=capacitor" alt="Capacitor">
  <img src="https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Android-Native-green?style=for-the-badge&logo=android" alt="Android">
</div>

## 🚀 Descripción del Proyecto

**IRIX Camera MVP** es una aplicación móvil avanzada desarrollada con **Ionic Framework** y **Angular** que proporciona acceso detallado a las capacidades de la cámara del dispositivo. El proyecto incluye un **plugin nativo personalizado** que utiliza la API Camera2 de Android para obtener información técnica profunda sobre las cámaras disponibles.

### ✨ Características Principales

- 📹 **Vista previa de cámara en tiempo real** con máxima calidad
- 🔍 **Información técnica detallada** de las cámaras del dispositivo
- 🎯 **Enfoque táctil** para mejor control de captura
- 📸 **Captura de imágenes de alta resolución**
- 🔄 **Alternancia entre cámaras** (frontal/trasera)
- 🛠️ **Plugin nativo personalizado** para funcionalidades avanzadas

## 🏗️ Arquitectura del Proyecto

### 📁 Estructura del Proyecto

```
front-irix-ionic/
├── 📱 src/app/
│   ├── core/                 # 🆕 Módulo central (v1.1)
│   │   ├── services/         # Servicios modulares
│   │   ├── models/          # Interfaces y tipos
│   │   └── index.ts         # Exportaciones centralizadas
│   └── tab1/                # Componente principal de cámara
├── 🔌 plugins/camera-info/   # Plugin personalizado nativo
├── 📋 capacitor.config.ts    # Configuración de Capacitor
├── ⚙️  ionic.config.json     # Configuración de Ionic
└── 📦 package.json          # Dependencias del proyecto
```

### 🛠️ Stack Tecnológico

- **Frontend**: Ionic 8.0 + Angular 20.0
- **Mobile Runtime**: Capacitor 7.4
- **Lenguaje**: TypeScript 5.8
- **Arquitectura**: Modular con servicios especializados (v1.1)
- **Plugin Nativo**: Java (Android Camera2 API)
- **UI Components**: Ionic Components + SCSS personalizado
- **Preparado para IA**: TensorFlow.js integrado

## 🎥 Funcionalidades de la Cámara

### 📲 Interfaz Principal

| Funcionalidad | Descripción | Estado |
|---------------|-------------|--------|
| 🎬 **Vista Previa** | Stream de cámara en tiempo real con máxima calidad | ✅ |
| 👆 **Enfoque Táctil** | Toca la pantalla para enfocar en puntos específicos | ✅ |
| 📸 **Captura HD** | Fotos con la máxima resolución soportada (hasta 4K+) | ✅ |
| 🔄 **Cambio de Cámara** | Alternancia fluida entre cámara frontal y trasera | ✅ |
| ℹ️ **Info Técnica** | Acceso a especificaciones detalladas de la cámara | ✅ |

### 📊 Información Técnica Disponible

- 🖼️ **Resoluciones**: Lista completa de tamaños soportados
- 🔍 **Zoom Digital**: Capacidad máxima de zoom
- 🎯 **Enfoque**: Modos de autoenfoque soportados
- 📷 **ISO**: Rango de sensibilidad ISO
- 🌅 **Exposición**: Rango de compensación de exposición

## Plugin Personalizado: @irix/camera-info

### Descripción
Plugin nativo desarrollado en Java para Android que permite acceder a información detallada de las cámaras del dispositivo utilizando la API Camera2 de Android.

### 🎯 API del Plugin

| Método | Descripción | Retorna |
|--------|-------------|--------|
| `getSupportedResolutions()` | Obtiene resoluciones disponibles por cámara | `CameraResolution[]` |
| `getCameraInfo()` | Información técnica completa de la cámara | `CameraInfo` |
| `getAvailableCameras()` | Lista todas las cámaras del dispositivo | `CameraDevice[]` |

### 📂 Estructura del Plugin

```
plugins/camera-info/
├── 🤖 android/
│   ├── build.gradle                    # Configuración Gradle
│   └── src/main/java/com/irix/camerainfo/
│       └── CameraInfoPlugin.java       # Implementación Java
├── 📝 src/
│   ├── definitions.ts                  # Interfaces TypeScript
│   └── index.ts                        # Exportaciones del plugin
├── 📦 package.json                     # Metadatos del plugin
├── 🔧 rollup.config.js                # Configuración de build
└── 📚 tsconfig.json                    # Configuración TypeScript
```

### 🤖 Implementación Android

| Componente | Propósito | API Level |
|------------|-----------|----------|
| **Camera2 API** | Acceso avanzado a funcionalidades de cámara | 21+ |
| **CameraManager** | Gestión de múltiples cámaras del dispositivo | 21+ |
| **CameraCharacteristics** | Obtención de capacidades específicas | 21+ |
| **StreamConfigurationMap** | Configuración de resoluciones y formatos | 21+ |

**Permisos requeridos:**
- `android.permission.CAMERA`
- `android.permission.WRITE_EXTERNAL_STORAGE`

### 💻 Uso del Plugin

```typescript
import { CameraInfo } from '@irix/camera-info';

// 📏 Obtener resoluciones soportadas
const resolutions = await CameraInfo.getSupportedResolutions({ 
  camera: 'back' 
});
console.log(resolutions.resolutions); // [{ width: 4032, height: 3024 }, ...]

// ℹ️ Obtener información completa de la cámara
const cameraInfo = await CameraInfo.getCameraInfo({ 
  camera: 'back' 
});
console.log(cameraInfo);
/* Output:
{
  id: "0",
  facing: "back",
  supportedResolutions: [...],
  maxZoom: 10.0,
  supportedFocusModes: ["auto", "continuous"],
  supportedIsoRanges: { min: 100, max: 3200 },
  supportedExposureRange: { min: -12, max: 12 }
}
*/

// 📱 Obtener todas las cámaras disponibles
const cameras = await CameraInfo.getAvailableCameras();
console.log(cameras.cameras); // [{ id: "0", facing: "back" }, ...]
```

## 🚀 Instalación y Configuración

### 📋 Prerrequisitos

- **Node.js** 18+ y **npm**
- **Android Studio** (para desarrollo Android)
- **Java JDK** 17+
- **Ionic CLI**: `npm install -g @ionic/cli`

### ⚡ Instalación Rápida

```bash
# 1️⃣ Clonar el repositorio
git clone https://github.com/JaRodriguez97/front-irix-ionic.git
cd front-irix-ionic

# 2️⃣ Instalar dependencias principales
npm install

# 3️⃣ Construir el plugin personalizado (IMPORTANTE)
cd plugins/camera-info
npm install
npm run build
cd ../..

# 4️⃣ Desarrollo web
npm run start    # Ionic serve

# 5️⃣ Desarrollo móvil
npm run dev      # Build + Android Studio
```

### 📱 Configuración para Dispositivo

```bash
# Sincronizar con plataformas nativas
npx cap sync

# Abrir en Android Studio
npx cap open android

# Ejecutar en dispositivo conectado
npx cap run android
```

### 📜 Scripts de Desarrollo

| Script | Descripción | Uso |
|--------|-------------|-----|
| `npm run start` | 🌐 Servidor de desarrollo web | Desarrollo y pruebas |
| `npm run dev` | 📱 Build + Android Studio | Desarrollo móvil |
| `npm run build` | 🏗️ Compilación para producción | Deployment |
| `npm run test` | 🧪 Ejecución de pruebas | Testing |
| `npm run lint` | 🔍 Análisis de código | Code quality |

## 📦 Dependencias Principales

### 🎯 Core Dependencies

| Dependencia | Versión | Propósito |
|-------------|---------|----------|
| `@ionic/angular` | 8.0 | Framework UI móvil |
| `@angular/core` | 20.0 | Framework base |
| `@capacitor/core` | 7.4.2 | Runtime nativo |
| `@capacitor-community/camera-preview` | 7.0.2 | Vista previa de cámara |
| `@capacitor/camera` | 7.0.1 | API básica de cámara |

### 🔌 Plugin Personalizado

| Plugin | Descripción |
|--------|-------------|
| `@irix/camera-info` | Plugin nativo para información avanzada de cámara |

### 🤖 Preparación para IA

| Dependencia | Versión | Estado |
|-------------|---------|--------|
| `@tensorflow/tfjs` | 3.21.0 | ⏳ Preparado |
| `@tensorflow-models/coco-ssd` | 2.2.2 | ⏳ Preparado |

## 🛣️ Roadmap de Desarrollo

### ✅ Completado (v1.0 MVP)

- [x] 🏗️ Configuración inicial del proyecto Ionic + Angular + Capacitor
- [x] 📹 Implementación de vista previa de cámara en tiempo real
- [x] 🔌 Desarrollo de plugin nativo personalizado (Android)
- [x] 📊 API para obtener información técnica de cámaras
- [x] 🎯 Interfaz táctil para enfoque
- [x] 📸 Captura de imágenes en alta resolución
- [x] 🔄 Alternancia entre cámaras frontal/trasera

### ✅ Completado (v1.1)

- [x] ⚡ **Flash completamente removido** del plugin según roadmap v1.1
- [x] 📱 **Arquitectura modular completada** con servicios unificados:
  - `CameraService` - Gestión de estado y operaciones de cámara
  - `CameraInfoService` - Información técnica detallada
  - `PermissionsService` - Manejo centralizado de permisos
- [x] 🔍 **Controles de zoom** implementados con verificación de permisos
- [x] 🛠️ **Plugin personalizado** compilado y funcional
- [x] ⚙️ **Resolución de conflictos TypeScript** en modelos e interfaces
- [x] 🎯 **Integración completa** entre servicios modulares y componentes

### ✅ En Desarrollo (v1.2)

- [x] 🔍 si el dispotisitivo cuenta con zoom optico, habilitar y solicitar permiso, si el zoom es digital ignorar todo lo relacionado con el zoom
- [x] 📱  modularizar tab1, con nombres adecuados segun su componente o modulo, respetando la arquitectura existente
- [x] 🎥 Captura en tiempo real del stream video en 1280x720
- [x] 🤖 Integración de IA al stream antes capturado (con TensorFlow y detección de vehículos con placas vehiculares sin OCR)
- [x] 📱  implementar una navegación mega intuitiva y que complemente el diseño UI/UX principalmente con una barra header con botones de navegación
- [x] Validación entrenamiento modelo IA e integración tabla explicita al cliente sobre lectura de IA

### 🚧 En Desarrollo (v1.3)
- [ ] 📱  modularizar todo lo del código de la versión 1.2, con nombres adecuados segun su componente o modulo, respetando la arquitectura existente
- [ ] implementar toda la semantica de angular 17+ en *if *for etc
- [ ] se está tomando capturas, y no se visualiza nada fluido, validar si la lógica en general está realizando captura videográfica del stream de video que hay en la cámara del dispositivo, no capturas fotográficas, se necesita fluides
- [ ] analizar viabilidad para encerrar vehiculos en rectaculos en amarillo y las placas en rojo en tiempo real para confirmar seguimiento en tiempo real
- [ ] Confirmada la detección, del vehiculo realizar captura de imagen en la mayor resolución posible, al siguiente frame de detectar el vehículo con una placa de tamaño adecuada

### 🚧 En Desarrollo (v1.4)
- [ ] 📱  modularizar todo lo del código de la versión 1.3, con nombres adecuados segun su componente o modulo, respetando la arquitectura existente
- [ ] implementar toda la semantica de angular 17+ en *if *for etc
- [ ] que la IA se active cuando se active la cámara
- [ ] ajustar header de una forma mejor distribuido y funcional

### 🎯 Próximas Funcionalidades (v2.0)

- [ ] 📊 Dashboard de estadísticas de cámara
- [ ] 🔄 Filtros y efectos en tiempo real
- [ ] ☁️ Sincronización en la nube
- [ ] 🧪 Suite completa de pruebas unitarias
- [ ] 🍎 Soporte para iOS en el plugin personalizado (queda al pendiente mientras se define si se hace una versión para IOS de la app)
- [ ] 🎨 Mejoras en la interfaz de usuario

## 📋 Requisitos del Sistema

### 📱 Android
- **Mínimo**: Android 7.0 (API 24)
- **Recomendado**: Android 10+ (API 29+)
- **Permisos**: Cámara, Almacenamiento

### 🍎 iOS (Próximamente)
- **Mínimo**: iOS 13.0
- **Recomendado**: iOS 15+

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor:

1. 🍴 Fork el proyecto
2. 🌿 Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. 📤 Push a la rama (`git push origin feature/AmazingFeature`)
5. 🔄 Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Desarrollado por

**JaRodriguez97** - [GitHub](https://github.com/JaRodriguez97)

---

<div align="center">
  <p><strong>IRIX Camera MVP</strong> - Revolucionando el acceso a las capacidades de cámara móvil</p>
  <p>⭐ ¡Si te gusta este proyecto, dale una estrella! ⭐</p>
</div>

