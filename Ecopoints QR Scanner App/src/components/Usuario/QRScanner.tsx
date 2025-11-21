import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { X, CheckCircle2, Camera as CameraIcon, Minus, Plus, Zap, ZapOff, Video, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const sliderStyles = `
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
`;

interface QRScannerProps {
  onScanSuccess?: (transaction: { type: 'scan'; points: number; description: string; location?: string }) => void;
}

interface CameraDevice {
  id: string;
  label: string;
}

type PermissionStatus = 'checking' | 'granted' | 'denied' | 'idle';

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('checking');
  const [isScanning, setIsScanning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFlashOn, setIsFlashOn] = useState(false);

  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | undefined>();

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScannerRunning = useRef(false);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);

  const token = localStorage.getItem("token");
  const API_BASE = window.location.hostname === 'localhost' ? '/api' : 'https://ecopoints.hvd.lat/api';

  const MIN_ZOOM = 1, MAX_ZOOM = 4, ZOOM_STEP = 0.5;

  useEffect(() => {
    const checkPermissions = async () => {
      if (Capacitor.isNativePlatform()) {
        setPermissionStatus('idle');
        return;
      }
      try {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (result.state === 'granted') {
          setPermissionStatus('granted');
        } else if (result.state === 'prompt') {
          setPermissionStatus('idle');
        } else {
          setPermissionStatus('denied');
        }
        result.onchange = () => setPermissionStatus(result.state as PermissionStatus);
      } catch (error) {
        console.warn("Permissions API not supported, defaulting to 'idle'.", error);
        setPermissionStatus('idle');
      }
    };
    checkPermissions();
  }, []);

  useEffect(() => {
    const getCameras = async () => {
      if (cameras.length > 0) return;
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          setCameras(devices);
          const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear') || d.label.toLowerCase().includes('trasera'));
          setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
        }
      } catch (err) {
        console.error("Error getting cameras:", err);
        toast.error("No se pudieron obtener las cámaras. Por favor, recarga la página.");
      }
    };
    if (permissionStatus === 'granted') {
      getCameras();
    }
  }, [permissionStatus, cameras.length]);

  const requestCameraPermission = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const permission = await Camera.requestPermissions({ permissions: ['camera'] });
        if (permission.camera === 'granted') {
          setPermissionStatus('granted');
        } else {
          setPermissionStatus('denied');
          toast.error("Permiso de cámara denegado.");
        }
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionStatus('granted');
    } catch (err: any) {
      console.error("Error requesting camera permission:", err);
      if (err.name === 'NotAllowedError') {
        toast.error("Has denegado el permiso para usar la cámara.");
      } else {
        toast.error("No se pudo obtener el permiso para la cámara.");
      }
      setPermissionStatus('denied');
    }
  };

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  });

  const setTransparentBackground = (isTransparent: boolean) => {
    if (Capacitor.isNativePlatform()) {
      document.body.style.backgroundColor = isTransparent ? 'transparent' : '';
      document.getElementById('root')!.style.backgroundColor = isTransparent ? 'transparent' : '';
    }
  };

  const startScanning = async () => {
    if (showSuccess || !selectedCameraId) {
      toast.error("No hay una cámara seleccionada.");
      return;
    }
    setTransparentBackground(true);
    setIsScanning(true);

    const scanner = new Html5Qrcode("qr-reader", { verbose: false, formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE] });
    scannerRef.current = scanner;

    // Configuración para el escáner QR
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      supportedformats: [Html5QrcodeSupportedFormats.QR_CODE],
    };

    try {
      await scanner.start(
        selectedCameraId,
        config,
        (decodedText) => handleScanSuccess(decodedText),
        (errorMessage) => { if (!errorMessage.includes("NotFoundException")) console.log("Scanner msg:", errorMessage); }
      );
      isScannerRunning.current = true;
      setTimeout(() => { if (scannerRef.current) setupZoomAndFlash(); }, 500);
    } catch (err: any) {
      console.error("Scanner Start Error:", err);
      setIsScanning(false);
      setTransparentBackground(false);
      toast.error(`Error al iniciar cámara: ${err.message || 'Desconocido'}`);
    }
  };

  const setupZoomAndFlash = () => {
    try {
      const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        if (!track) return;
        videoTrackRef.current = track;

        const capabilities = track.getCapabilities();
        if (capabilities.zoom) {
          const settings = track.getSettings();
          setZoomLevel(settings.zoom || MIN_ZOOM);
        } else {
          applyDigitalZoom(MIN_ZOOM);
        }
      } else {
        applyDigitalZoom(MIN_ZOOM);
      }
    } catch (error) {
      console.warn("Error setting up zoom/flash:", error);
      applyDigitalZoom(MIN_ZOOM);
    }
  };

  const stopScanning = async () => {
    setTransparentBackground(false);
    const videoContainer = document.querySelector('#qr-reader') as HTMLElement;
    if (videoContainer) videoContainer.style.transform = 'none';

    videoTrackRef.current = null;
    if (scannerRef.current && isScannerRunning.current) {
      try { await scannerRef.current.stop(); }
      catch (error) { console.warn("Error stopping scanner:", error); }
      finally {
        isScannerRunning.current = false;
        scannerRef.current = null;
      }
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
      onScanSuccess?.({ type: 'scan', points: puntosGanados, description: data.mensaje || 'QR', location: data.ubicacion });
      toast.success(`¡${data.mensaje || "Éxito"}! Ganaste ${puntosGanados} ecopoints 🎉`);
    } catch (error) {
      console.error("Error processing QR:", error);
      toast.error("Error al procesar el QR. Intenta nuevamente.");
    } finally {
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const applyDigitalZoom = (level: number) => {
    const videoContainer = document.querySelector('#qr-reader') as HTMLElement;
    if (videoContainer) {
      videoContainer.style.transform = `scale(${level})`;
      videoContainer.style.transformOrigin = 'center center';
      videoContainer.style.overflow = 'hidden';
    }
    setZoomLevel(level);
  };

  const applyZoom = async (zoomValue: number) => {
    if (!videoTrackRef.current) return applyDigitalZoom(zoomValue);
    try {
      const capabilities = videoTrackRef.current.getCapabilities();
      if (capabilities.zoom) {
        await videoTrackRef.current.applyConstraints({ advanced: [{ zoom: zoomValue }] });
        setZoomLevel(zoomValue);
      } else {
        applyDigitalZoom(zoomValue);
      }
    } catch (error) {
      console.warn("Native zoom failed, using digital zoom:", error);
      applyDigitalZoom(zoomValue);
    }
  };

  const toggleFlash = async () => {
    if (!videoTrackRef.current) return;
    try {
      const capabilities = videoTrackRef.current.getCapabilities();
      if (capabilities.torch) {
        await videoTrackRef.current.applyConstraints({ advanced: [{ torch: !isFlashOn }] });
        setIsFlashOn(!isFlashOn);
      } else {
        toast.info("El flash no está disponible en este dispositivo.");
      }
    } catch (error) {
      console.error("Failed to toggle flash", error);
      toast.error("No se pudo controlar el flash.");
    }
  };

  useEffect(() => () => { void stopScanning(); }, []);

  if (permissionStatus === 'checking') {
    return (
      <div className="p-6 text-center text-gray-500"><p>Comprobando permisos de cámara...</p></div>
    );
  }

  if (permissionStatus !== 'granted') {
    return (
      <div className="p-6 space-y-6 flex flex-col items-center justify-center text-center">
        <Card className="w-full max-w-md p-8 bg-white border rounded-lg shadow-sm">
          <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Permiso de Cámara Requerido</h2>
          <p className="text-gray-600 mb-6">
            {permissionStatus === 'denied'
              ? "Has bloqueado el acceso a la cámara. Para continuar, por favor habilita el permiso en la configuración de tu navegador o dispositivo."
              : "Necesitamos tu permiso para acceder a la cámara y poder escanear los códigos QR."
            }
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

  return (
    <div className="p-6 space-y-6">
      <style>{sliderStyles}</style>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Escanear QR</h1>
        <p className="text-gray-500">Apunta la cámara al código QR para ganar ecopoints</p>
      </div>

      <Card className="overflow-hidden border-2 border-gray-200">
        <div className="relative aspect-square bg-gray-900">
          {!isScanning && !showSuccess && (
            <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
              {cameras.length === 0 ? (
                <p className="text-gray-400">Buscando cámaras...</p>
              ) : (
                <div className="text-center space-y-4">
                  <CameraIcon className="w-16 h-16 text-gray-400 mx-auto" />
                  <p className="text-gray-400">Cámara lista para escanear</p>
                </div>
              )}
            </div>
          )}
          <div id="qr-reader" className={`w-full h-full ${isScanning ? '' : 'hidden'}`}></div>
          {isScanning && (
            <>
              <div className="absolute top-4 right-4 z-30">
                <Button size="icon" onClick={toggleFlash} className="bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12">
                  {isFlashOn ? <ZapOff className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                </Button>
              </div>
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
          <AnimatePresence>
            {showSuccess && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute inset-0 bg-emerald-600 flex items-center justify-center z-40">
                <div className="text-center text-white space-y-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                    <CheckCircle2 className="w-20 h-20 mx-auto" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">¡Escaneo exitoso!</h2>
                    <p className="text-emerald-100 mb-4">Has ganado</p>
                    <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 200 }} className="text-white text-5xl font-bold">+{earnedPoints}</motion.p>
                    <p className="text-emerald-100 mt-2">ecopoints</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {!isScanning && (
        <Card className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="space-y-2">
            <label htmlFor="camera-select" className="block text-sm font-semibold text-gray-800">Seleccionar Cámara</label>
            <div className="relative flex items-center">
              <Video className="absolute left-3 w-5 h-5 text-gray-500 pointer-events-none" />
              <select
                id="camera-select"
                value={selectedCameraId || ''}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                disabled={cameras.length === 0}
                className="block w-full pl-10 pr-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Seleccionar cámara"
              >
                {cameras.length === 0 ? (
                  <option>Cargando cámaras...</option>
                ) : (
                  cameras.map(camera => (
                    <option key={camera.id} value={camera.id}>{camera.label || `Cámara ${camera.id.substring(0, 6)}`}</option>
                  ))
                )}
              </select>
            </div>
          </div>
        </Card>
      )}

      {isScanning && (
        <Card className="p-4 bg-gray-800 border-gray-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-200">Control de Zoom</span>
              <span className="text-sm font-bold text-white bg-gray-700 px-2 py-1 rounded">{zoomLevel.toFixed(1)}x</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button size="icon" onClick={() => applyZoom(Math.max(zoomLevel - ZOOM_STEP, MIN_ZOOM))} disabled={zoomLevel <= MIN_ZOOM} variant="outline" className="border-gray-600 text-white hover:bg-gray-700 h-10 w-10"><Minus className="w-5 h-5" /></Button>
              <input type="range" min={MIN_ZOOM} max={MAX_ZOOM} step={0.1} value={zoomLevel} onChange={(e) => applyZoom(parseFloat(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer zoom-slider"/>
              <Button size="icon" onClick={() => applyZoom(Math.min(zoomLevel + ZOOM_STEP, MAX_ZOOM))} disabled={zoomLevel >= MAX_ZOOM} variant="outline" className="border-gray-600 text-white hover:bg-gray-700 h-10 w-10"><Plus className="w-5 h-5" /></Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3 pt-2">
        {!isScanning ? (
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-semibold"
            onClick={startScanning}
            disabled={showSuccess || cameras.length === 0}
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