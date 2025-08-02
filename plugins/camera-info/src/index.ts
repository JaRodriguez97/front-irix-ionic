import { registerPlugin } from '@capacitor/core';

import type { CameraInfoPlugin } from './definitions';

const CameraInfo = registerPlugin<CameraInfoPlugin>('CameraInfo');

export * from './definitions';
export { CameraInfo };
