import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, PermissionStatus as CameraPermissionStatus } from '@capacitor/camera'; 
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { X, CheckCircle2, Camera as CameraIcon, Minus, Plus, Zap, ZapOff, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Importaciones de la API Nativa (Asumimos @capacitor-community/camera-preview y jsqr están instalados)
import { 
    CameraPreview, 
    CameraPreviewOptions, 
} from '@capacitor-community/camera-preview'; 
import jsQR from 'jsqr'; 

const sliderStyles = `
/* Estilos del slider */
.zoom-slider::-webkit-slider-thumb {
-webkit-appearance: none;
appearance: none;
height: 20px;
width: 20px;
border-radius: 50%;
background: #10b981;
cursor: pointer;
border: 2px solid white;
box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.zoom-slider::-moz-range-thumb {
height: 20px;
width: 20px;
border-radius: 50%;
background: #10b981;
cursor: pointer;
border: 2px solid white;
box-shadow: 0 2px 4px rgba(0,0,0,0.2);
box-sizing: border-box;
}
.zoom-slider::-webkit-slider-track {
background: #4b5563;
height: 8px;
border-radius: 4px;
}
.zoom-slider::-moz-range-track {
background: #4b5563;
height: 8px;
border-radius: 4px;
border: none;
}
/* Estilos para el contenedor nativo de la cámara */
#qr-preview-container {
    width: 100%;
    /* El 'aspect-square' de Tailwind en el HTML define la altura */
    position: relative;
    background-color: black;
    overflow: hidden; 
}
/* La vista nativa debe tener un z-index bajo para que los controles HTML se vean */
capacitor-camera-preview {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1; /* Z-INDEX BAJO para que los botones floten por encima (z-index 20/30) */
    object-fit: cover;
}
`;

interface QRScannerProps {
  onScanSuccess?: (transaction: { type: 'scan'; points: number; description: string; location?: string }) => void;
}

type PermissionStatus = 'checking' | 'granted' | 'denied' | 'idle';

interface CameraCapabilities {
  hasZoom: boolean;
  minZoom: number;
  maxZoom: number;
  step: number;
  hasFlash: boolean;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('checking');
  const [isScanning, setIsScanning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFlashOn, setIsFlashOn] = useState(false);
  
  const [cameraCapabilities, setCameraCapabilities] = useState<CameraCapabilities>({
    hasZoom: false,
    minZoom: 1,
    maxZoom: 4,
    step: 0.1,
    hasFlash: false
  });

  const scanIntervalRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null); 

  const token = localStorage.getItem("token");
  const API_BASE = window.location.hostname === 'localhost' ? '/api' : 'https://ecopoints.hvd.lat/api';

  const MIN_ZOOM = 1, MAX_ZOOM = 4, ZOOM_STEP = 0.1;

  useEffect(() => {
    const checkPermissions = async () => {
      if (!Capacitor.isNativePlatform()) {
        setPermissionStatus('denied');
        toast.error("Esta función requiere la app móvil (Capacitor).");
        return;
      }
      try {
        const status: CameraPermissionStatus = await Camera.checkPermissions();
        
          const cameraStatusString = status.camera as string; 
          
        if (cameraStatusString === 'granted') {
          setPermissionStatus('granted');
        } else if (cameraStatusString === 'denied' || cameraStatusString === 'restricted') {
          setPermissionStatus('denied');
        } else {
          setPermissionStatus('idle');
        }
      } catch (error) {
        console.error("Error checking permissions:", error);
        setPermissionStatus('idle');
      }
    };
    checkPermissions();
    
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      void stopScanning(); 
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Solicitud de permisos
  const requestCameraPermission = async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const result = await Camera.requestPermissions({ permissions: ['camera'] });
      if (result.camera === 'granted') {
        setPermissionStatus('granted');
        toast.success("Permiso de cámara concedido.");
      } else {
        setPermissionStatus('denied');
        toast.error("Permiso de cámara denegado.");
      }
    } catch (err: any) {
      console.error("Error requesting permission:", err);
      toast.error("No se pudo obtener el permiso para la cámara.");
      setPermissionStatus('denied');
    }
  };

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  });

    // 🚨 Función para forzar enfoque (tap-to-focus)
    const focusOnCenter = async () => {
        try {
            const rect = previewContainerRef.current?.getBoundingClientRect();
            if (!rect) return;

            // Coordenadas del centro de la vista visible
            const x = rect.width / 2;
            const y = rect.height / 2;

            // Llama al método nativo para forzar el enfoque en esas coordenadas de pantalla.
            await (CameraPreview as any).tapToFocus({ x: x, y: y });
            toast.info("Enfoque reajustado.");
        } catch (e) {
            console.warn("Tap to focus falló o no soportado:", e);
        }
    };


  // 🚨 LÓGICA DE ESCANEO TOTALMENTE NATIVA (Usando CameraPreview)
  const startScanning = async () => {
    if (showSuccess || permissionStatus !== 'granted' || !previewContainerRef.current) return;

    setIsScanning(true);

    try {
        // 🚨 OBTENER DIMENSIONES Y POSICIÓN REALES DEL CONTENEDOR
        const containerRect = previewContainerRef.current.getBoundingClientRect();

      // Opciones para iniciar la vista previa nativa
      const cameraPreviewOptions: CameraPreviewOptions = {
        parent: 'qr-preview-container', 
        position: 'rear', 
        // 🚨 CORRECCIÓN DE POSICIONAMIENTO Y TAMAÑO
        width: containerRect.width, 
        height: containerRect.height, 
        x: containerRect.left,
        y: containerRect.top, // Posición vertical desde la parte superior de la ventana
        disableAudio: true,
        storeToFile: false,
      };

      await CameraPreview.start(cameraPreviewOptions);

      // Obtener capacidades (Zoom y Flash) de la API Nativa
      let zoomMax = MAX_ZOOM;
      let hasTorch = false;
      let currentZoom = MIN_ZOOM;

      try {
        const maxZoomResult: { zoom: number } = await (CameraPreview as any).getMaxZoom();
        zoomMax = maxZoomResult.zoom || MAX_ZOOM;
      } catch (e) { console.warn("Max Zoom not directly available"); }

      try {
        const flashResult: { result: string[] } = await (CameraPreview as any).getSupportedFlashModes();
        hasTorch = flashResult.result.includes('torch');
      } catch (e) { console.warn("Flash modes not directly available"); }
      
      try {
        const currentZoomResult: { zoom: number } = await (CameraPreview as any).getZoom();
        currentZoom = currentZoomResult.zoom || MIN_ZOOM;
      } catch (e) { /* Fallback a MIN_ZOOM */ }
      
      setCameraCapabilities({
        hasZoom: zoomMax > MIN_ZOOM,
        minZoom: MIN_ZOOM,
        maxZoom: zoomMax,
        step: (zoomMax - MIN_ZOOM) / 100, 
        hasFlash: hasTorch
      });
      setZoomLevel(currentZoom);

      // 🔥 Forzar un enfoque inicial
      setTimeout(focusOnCenter, 500); 

      // 🚨 Iniciar el escaneo periódico de QR
      scanIntervalRef.current = setInterval(async () => {
        if (!isScanning) return;
        
        try {
          const result = await CameraPreview.capture({ quality: 90 }); 
          const base64PictureData = result.value;

          await processImageForQR(base64PictureData);
        
        } catch (error) {
        }
      }, 300);

    } catch (err: any) {
      console.error("CameraPreview Start Error:", err);
      setIsScanning(false);
      toast.error(`Error al iniciar cámara: ${err.message || 'Desconocido'}`);
    }
  };
    
  // Procesamiento de la imagen capturada para encontrar el QR
  const processImageForQR = async (base64Image: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.src = `data:image/jpeg;base64,${base64Image}`;
    
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = null;
        }
        handleScanSuccess(code.data);
      }
    };
  };

  // 🚨 LÓGICA DE DETENER TOTALMENTE NATIVA
  const stopScanning = async () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    try {
      await CameraPreview.stop();
      console.log("CameraPreview stopped.");
    } catch (error) {
      console.warn("Error stopping CameraPreview:", error);
    }
    
    setIsScanning(false);
    setZoomLevel(MIN_ZOOM);
    setIsFlashOn(false);
  };

  const handleScanSuccess = async (qrData: string) => {
    await stopScanning(); 
    if (!token) {
      toast.error("No estás autenticado.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/validarQR`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ codigo_qr: qrData })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const puntosGanados = data.puntos_obtenidos || 0;
      setEarnedPoints(puntosGanados);
      setShowSuccess(true);
      onScanSuccess?.({
        type: 'scan',
        points: puntosGanados,
        description: data.mensaje || 'QR',
        location: data.ubicacion
      });
      toast.success(`¡${data.mensaje || "Éxito"}! Ganaste ${puntosGanados} ecopoints 🎉`);
    } catch (error) {
      console.error("Error processing QR:", error);
      toast.error("Error al procesar el QR. Intenta nuevamente.");
    } finally {
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  // 🚨 CONTROL DE ZOOM TOTALMENTE NATIVO
  const applyZoom = async (newZoom: number) => {
    if (!cameraCapabilities.hasZoom) return;

    const clampedZoom = Math.max(
      cameraCapabilities.minZoom,
      Math.min(newZoom, cameraCapabilities.maxZoom)
    );

    try {
      await (CameraPreview as any).setZoom({ factor: clampedZoom });
      setZoomLevel(clampedZoom);
      // 🔥 Forzar el enfoque después del cambio de zoom para reajustar nitidez
      await focusOnCenter();
    } catch (error) {
      console.error("Error applying zoom with CameraPreview:", error);
      toast.error("No se pudo ajustar el zoom óptico.");
    }
  };

  // 🚨 CONTROL DE FLASH TOTALMENTE NATIVO
  const toggleFlash = async () => {
    if (!cameraCapabilities.hasFlash) {
      toast.info("El flash no está disponible en este dispositivo.");
      return;
    }
    try {
      await (CameraPreview as any).setTorch({ on: !isFlashOn });
      setIsFlashOn(!isFlashOn);
    } catch (error) {
      console.error("Error toggling flash with CameraPreview:", error);
      toast.error("No se pudo controlar el flash.");
    }
  };

  if (permissionStatus === 'checking') {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Comprobando permisos de cámara...</p>
      </div>
    );
  }

  if (permissionStatus !== 'granted' && Capacitor.isNativePlatform()) {
    return (
      <div className="p-6 space-y-6 flex flex-col items-center justify-center text-center">
        <Card className="w-full max-w-md p-8 bg-white border rounded-lg shadow-sm">
          <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Permiso de Cámara Requerido</h2>
          <p className="text-gray-600 mb-6">
            Necesitamos tu permiso para acceder a la cámara y poder escanear los códigos QR.
          </p>
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-semibold"
            onClick={requestCameraPermission}
            disabled={permissionStatus === 'denied'}
          >
            <CameraIcon className="w-6 h-6 mr-3" />
            Habilitar Cámara
          </Button>
        </Card>
      </div>
    );
  }
  
  if (permissionStatus !== 'granted' && !Capacitor.isNativePlatform()) {
    return (
      <div className="p-6 space-y-6 flex flex-col items-center justify-center text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Funcionalidad no disponible. Por favor, ejecuta la aplicación en un entorno nativo (Capacitor).</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <style>{sliderStyles}</style>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Escanear QR</h1>
        <p className="text-gray-500">Apunta la cámara al código QR para ganar ecopoints</p>
        {cameraCapabilities.hasZoom && isScanning && (
          <p className="text-sm text-emerald-600 mt-1">Zoom óptico nativo activo</p>
        )}
      </div>

      <Card className="overflow-hidden border-2 border-gray-200">
          {/* 🚨 Contenedor principal de la cámara con el onClick para enfocar */}
        <div ref={previewContainerRef} className="relative aspect-square bg-gray-900" id="qr-preview-container" onClick={focusOnCenter}>
          
          {!isScanning && !showSuccess && (
            <div className="absolute inset-0 flex items-center justify-center p-4 z-20">
              <div className="text-center space-y-4">
                <CameraIcon className="w-16 h-16 text-gray-400 mx-auto" />
                <p className="text-gray-400">Cámara lista para escanear</p>
              </div>
            </div>
          )}
          
          {isScanning && (
            <>
              {/* Botón de Flash (z-index 30) */}
              <div className="absolute top-4 right-4 z-30">
                <Button
                  size="icon"
                  onClick={toggleFlash}
                  className={`bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 ${
                    !cameraCapabilities.hasFlash ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={!cameraCapabilities.hasFlash}
                >
                  {isFlashOn ? <ZapOff className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                </Button>
              </div>
              {/* Recuadro del Escáner (z-index 20) */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                <div className="w-64 h-64 border-4 border-emerald-400/70 rounded-2xl shadow-lg" />
                <motion.div
                  className="absolute w-64 h-1 bg-emerald-300 rounded-full"
                  animate={{ top: '30%', opacity: [0, 1, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </>
          )}
          {/* Canvas invisible para procesar los frames de CameraPreview con jsQR */}
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas> 

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-emerald-600 flex items-center justify-center z-40"
              >
                <div className="text-center text-white space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle2 className="w-20 h-20 mx-auto" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">¡Escaneo exitoso!</h2>
                    <p className="text-emerald-100 mb-4">Has ganado</p>
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                      className="text-white text-5xl font-bold"
                    >
                      +{earnedPoints}
                    </motion.p>
                    <p className="text-emerald-100 mt-2">ecopoints</p>
                  </div>
                </div>
              </motion.div>)}
          </AnimatePresence>
        </div>
      </Card>

      {isScanning && (
        <Card className="p-4 bg-gray-800 border-gray-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-200">
                Control de Zoom {cameraCapabilities.hasZoom ? '(Óptico Nativo)' : '(Zoom no disponible)'}
              </span>
              <span className="text-sm font-bold text-white bg-gray-700 px-2 py-1 rounded">
                {zoomLevel.toFixed(1)}x
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                size="icon"
                onClick={() => applyZoom(zoomLevel - cameraCapabilities.step)}
                disabled={!cameraCapabilities.hasZoom || zoomLevel <= cameraCapabilities.minZoom}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700 h-10 w-10"
              >
                <Minus className="w-5 h-5" />
              </Button>
              <input
                type="range"
                min={cameraCapabilities.minZoom}
                max={cameraCapabilities.maxZoom}
                step={cameraCapabilities.step}
                value={zoomLevel}
                onChange={(e) => applyZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer zoom-slider"
                disabled={!cameraCapabilities.hasZoom}
              />
              <Button
                size="icon"
                onClick={() => applyZoom(zoomLevel + cameraCapabilities.step)}
                disabled={!cameraCapabilities.hasZoom || zoomLevel >= cameraCapabilities.maxZoom}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700 h-10 w-10"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3 pt-2">
        {!isScanning ? (
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-semibold"
            onClick={startScanning}
            disabled={showSuccess || !Capacitor.isNativePlatform()}
          >
            <CameraIcon className="w-6 h-6 mr-3" />
            Iniciar escaneo
          </Button>
        ) : (
          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold"
            onClick={stopScanning}
          >
            <X className="w-6 h-6 mr-3" />
            Detener escaneo
          </Button>
        )}
      </div>
    </div>
  );
}