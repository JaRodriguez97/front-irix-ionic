package com.irix.camerainfo;

import android.Manifest;
import android.content.Context;
import android.graphics.ImageFormat;
import android.hardware.camera2.CameraAccessException;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraManager;
import android.hardware.camera2.params.StreamConfigurationMap;
import android.util.Size;
import android.util.Range;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

@CapacitorPlugin(
    name = "CameraInfo",
    permissions = {
        @Permission(strings = {Manifest.permission.CAMERA}, alias = "camera")
    }
)
public class CameraInfoPlugin extends Plugin {

    @PluginMethod
    public void getSupportedResolutions(PluginCall call) {
        String cameraType = call.getString("camera", "back");
        
        try {
            CameraManager cameraManager = (CameraManager) getContext().getSystemService(Context.CAMERA_SERVICE);
            String cameraId = getCameraId(cameraManager, cameraType);
            
            if (cameraId == null) {
                call.reject("Camera not found");
                return;
            }

            CameraCharacteristics characteristics = cameraManager.getCameraCharacteristics(cameraId);
            StreamConfigurationMap map = characteristics.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP);
            
            if (map == null) {
                call.reject("No stream configuration map available");
                return;
            }

            Size[] outputSizes = map.getOutputSizes(ImageFormat.JPEG);
            JSArray resolutions = new JSArray();
            
            for (Size size : outputSizes) {
                JSObject resolution = new JSObject();
                resolution.put("width", size.getWidth());
                resolution.put("height", size.getHeight());
                
                // Calcular aspect ratio
                double aspectRatio = (double) size.getWidth() / size.getHeight();
                String aspectRatioString = String.format("%.2f:1", aspectRatio);
                resolution.put("aspectRatio", aspectRatioString);
                
                resolutions.put(resolution);
            }

            JSObject result = new JSObject();
            result.put("resolutions", resolutions);
            call.resolve(result);
            
        } catch (CameraAccessException e) {
            call.reject("Camera access error: " + e.getMessage());
        }
    }

    @PluginMethod  
    public void getCameraInfo(PluginCall call) {
        String cameraType = call.getString("camera", "back");
        
        try {
            CameraManager cameraManager = (CameraManager) getContext().getSystemService(Context.CAMERA_SERVICE);
            String cameraId = getCameraId(cameraManager, cameraType);
            
            if (cameraId == null) {
                call.reject("Camera not found");
                return;
            }

            CameraCharacteristics characteristics = cameraManager.getCameraCharacteristics(cameraId);
            
            JSObject cameraInfo = new JSObject();
            cameraInfo.put("id", cameraId);
            cameraInfo.put("facing", cameraType);
            
            // Obtener resoluciones soportadas
            StreamConfigurationMap map = characteristics.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP);
            if (map != null) {
                Size[] outputSizes = map.getOutputSizes(ImageFormat.JPEG);
                JSArray resolutions = new JSArray();
                
                for (Size size : outputSizes) {
                    JSObject resolution = new JSObject();
                    resolution.put("width", size.getWidth());
                    resolution.put("height", size.getHeight());
                    
                    double aspectRatio = (double) size.getWidth() / size.getHeight();
                    String aspectRatioString = String.format("%.2f:1", aspectRatio);
                    resolution.put("aspectRatio", aspectRatioString);
                    
                    resolutions.put(resolution);
                }
                cameraInfo.put("supportedResolutions", resolutions);
            }
            
            // Obtener zoom máximo
            Float maxZoom = characteristics.get(CameraCharacteristics.SCALER_AVAILABLE_MAX_DIGITAL_ZOOM);
            if (maxZoom != null) {
                cameraInfo.put("maxZoom", maxZoom);
            }
            
            // Obtener modos de enfoque soportados
            int[] focusModes = characteristics.get(CameraCharacteristics.CONTROL_AF_AVAILABLE_MODES);
            if (focusModes != null) {
                JSArray focusModesArray = new JSArray();
                for (int mode : focusModes) {
                    String modeString = getFocusModeString(mode);
                    focusModesArray.put(modeString);
                }
                cameraInfo.put("supportedFocusModes", focusModesArray);
            }
            
            // Obtener rango ISO soportado
            Range<Integer> isoRange = characteristics.get(CameraCharacteristics.SENSOR_INFO_SENSITIVITY_RANGE);
            if (isoRange != null) {
                JSObject isoRangeObj = new JSObject();
                isoRangeObj.put("min", isoRange.getLower());
                isoRangeObj.put("max", isoRange.getUpper());
                cameraInfo.put("supportedIsoRanges", isoRangeObj);
            }
            
            // Obtener rango de exposición soportado
            Range<Integer> exposureRange = characteristics.get(CameraCharacteristics.CONTROL_AE_COMPENSATION_RANGE);
            if (exposureRange != null) {
                JSObject exposureRangeObj = new JSObject();
                exposureRangeObj.put("min", exposureRange.getLower());
                exposureRangeObj.put("max", exposureRange.getUpper());
                cameraInfo.put("supportedExposureRange", exposureRangeObj);
            }
            
            call.resolve(cameraInfo);
            
        } catch (CameraAccessException e) {
            call.reject("Camera access error: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getAvailableCameras(PluginCall call) {
        try {
            CameraManager cameraManager = (CameraManager) getContext().getSystemService(Context.CAMERA_SERVICE);
            String[] cameraIds = cameraManager.getCameraIdList();
            
            JSArray cameras = new JSArray();
            
            for (String cameraId : cameraIds) {
                CameraCharacteristics characteristics = cameraManager.getCameraCharacteristics(cameraId);
                Integer facing = characteristics.get(CameraCharacteristics.LENS_FACING);
                
                JSObject camera = new JSObject();
                camera.put("id", cameraId);
                
                String facingString = "unknown";
                String description = "Cámara desconocida";
                
                if (facing != null) {
                    switch (facing) {
                        case CameraCharacteristics.LENS_FACING_BACK:
                            facingString = "back";
                            description = "Cámara trasera";
                            break;
                        case CameraCharacteristics.LENS_FACING_FRONT:
                            facingString = "front";
                            description = "Cámara frontal";
                            break;
                        case CameraCharacteristics.LENS_FACING_EXTERNAL:
                            facingString = "external";
                            description = "Cámara externa";
                            break;
                    }
                }
                
                camera.put("facing", facingString);
                camera.put("description", description);
                cameras.put(camera);
            }
            
            JSObject result = new JSObject();
            result.put("cameras", cameras);
            call.resolve(result);
            
        } catch (CameraAccessException e) {
            call.reject("Camera access error: " + e.getMessage());
        }
    }
    
    private String getCameraId(CameraManager cameraManager, String cameraType) throws CameraAccessException {
        String[] cameraIds = cameraManager.getCameraIdList();
        
        for (String cameraId : cameraIds) {
            CameraCharacteristics characteristics = cameraManager.getCameraCharacteristics(cameraId);
            Integer facing = characteristics.get(CameraCharacteristics.LENS_FACING);
            
            if (facing != null) {
                if (cameraType.equals("back") && facing == CameraCharacteristics.LENS_FACING_BACK) {
                    return cameraId;
                } else if (cameraType.equals("front") && facing == CameraCharacteristics.LENS_FACING_FRONT) {
                    return cameraId;
                }
            }
        }
        
        return null;
    }
    
    private String getFocusModeString(int mode) {
        switch (mode) {
            case CameraCharacteristics.CONTROL_AF_MODE_AUTO:
                return "auto";
            case CameraCharacteristics.CONTROL_AF_MODE_CONTINUOUS_PICTURE:
                return "continuous";
            case CameraCharacteristics.CONTROL_AF_MODE_MACRO:
                return "macro";
            case CameraCharacteristics.CONTROL_AF_MODE_CONTINUOUS_VIDEO:
                return "continuous_video";
            case CameraCharacteristics.CONTROL_AF_MODE_EDOF:
                return "edof";
            case CameraCharacteristics.CONTROL_AF_MODE_OFF:
                return "off";
            default:
                return "unknown";
        }
    }
}
