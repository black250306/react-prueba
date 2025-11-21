import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Capacitor } from '@capacitor/core';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { QrCode, X, CheckCircle2, Camera as CameraIcon, Minus, Plus, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useCameraPermission } from '../../hooks/useCameraPermission';

const sliderStyles = `
  .zoom-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 8px;
    background: #e2e8f0; /* bg-gray-200 */
    border-radius: 9999px;
    outline: none;
    opacity: 0.7;
    transition: opacity .2s;
  }
  .zoom-slider:hover {
    opacity: 1;
  }
  .zoom-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #10b981; /* bg-emerald-600 */
    cursor: pointer;
    border-radius: 50%;
  }
  .zoom-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #10b981; /* bg-emerald-600 */
    cursor: pointer;
    border-radius: 50%;
  }
`;

interface QRScannerProps {
  onScanSuccess?: (transaction: { type: 'scan'; points: number; description: string; location?: string }) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);

  const { permissionStatus, requestPermission } = useCameraPermission();
  const permissionDenied = permissionStatus === 'denied';

  const isNative = useMemo(() => Capacitor.isNativePlatform(), []);
  const token = useMemo(() => localStorage.getItem("token"), []);
  const API_BASE = useMemo(() => window.location.hostname === 'localhost' ? '/api' : 'https://ecopoints.hvd.lat/api', []);

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 4;

  const getAuthHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }), [token]);

  const setBodyTransparent = (isTransparent: boolean) => {
    if (isNative) {
      document.body.style.backgroundColor = isTransparent ? 'transparent' : '';
      document.getElementById('root')!.style.backgroundColor = isTransparent ? 'transparent' : '';
    }
  };

  const applyZoom = useCallback(async (zoomValue: number) => {
    if (!videoTrackRef.current?.getCapabilities) return;
    try {
      const capabilities = videoTrackRef.current.getCapabilities();
      if ('zoom' in capabilities) {
        await videoTrackRef.current.applyConstraints({ advanced: [{ zoom: zoomValue }] } as any);
        setZoomLevel(zoomValue);
      }
    } catch (error) {
      console.warn("Zoom nativo no disponible:", error);
    }
  }, []);

  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(event.target.value);
    setZoomLevel(newZoom);
    applyZoom(newZoom);
  };

  const stopScanning = useCallback(async () => {
    setIsScanning(false);
    setBodyTransparent(false);

    const currentScanner = scannerRef.current;
    if (currentScanner) {
      scannerRef.current = null; // Evita race conditions
      try {
        if (currentScanner.isScanning) {
          await currentScanner.stop();
        }
      } catch (error) {
        console.error("Error al detener el escáner (puede que ya estuviera detenido):", error);
      }
    }

    if (videoTrackRef.current) {
      videoTrackRef.current = null;
    }
  }, [isNative]);

  const handleScanSuccess = useCallback(async (qrData: string) => {
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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      const data = await response.json();
      const puntosGanados = data.puntos_obtenidos || 0;
      setEarnedPoints(puntosGanados);
      setShowSuccess(true);
      onScanSuccess?.({ type: 'scan', points: puntosGanados, description: data.mensaje || 'QR', location: data.ubicacion });
      toast.success(`¡${data.mensaje || "Éxito"}! Ganaste ${puntosGanados} ecopoints 🎉`);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error("Error procesando QR:", error);
      toast.error(error.message || "Error al procesar el QR. Intenta nuevamente.");
    }
  }, [stopScanning, token, onScanSuccess, API_BASE, getAuthHeaders]);

  const startScanning = async () => {
    if (isScanning || showSuccess) return;

    const perm = await requestPermission();
    if (perm !== 'granted') {
      return;
    }

    setBodyTransparent(true);

    scannerRef.current = new Html5Qrcode("qr-reader", {
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
    });

    const videoConstraints = {
      facingMode: "environment",
      advanced: [
        { focusMode: "continuous" },
        { exposureMode: "continuous" },
        { whiteBalanceMode: "continuous" }
      ]
    };

    try {
        await scannerRef.current.start(
            videoConstraints as MediaTrackConstraints,
            { fps: 10, qrbox: (w, h) => ({ width: Math.min(w, h) * 0.7, height: Math.min(w, h) * 0.7 }), aspectRatio: 1.0 },
            (decodedText) => { handleScanSuccess(decodedText); },
            (errorMessage) => { /* Ignorar errores comunes */ }
        );

        setIsScanning(true);

        const videoElem = document.getElementById('qr-reader')?.querySelector('video');
        if (videoElem?.srcObject) {
            const stream = videoElem.srcObject as MediaStream;
            videoTrackRef.current = stream.getVideoTracks()[0];
            applyZoom(zoomLevel);
        }
    } catch (err: any) {
      console.error("Error al iniciar el escáner:", err);
      toast.error(err.message || 'No se pudo iniciar la cámara.');
      await stopScanning();
    }
  };


  useEffect(() => {
    return () => { stopScanning(); };
  }, [stopScanning]);

  return (
    <div className="p-6 space-y-6">
      <style>{sliderStyles}</style>

      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <QrCode className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Escanear QR</h1>
        <p className="text-gray-500">Gana ecopoints escaneando el QR del punto de reciclaje</p>
      </div>

      {permissionDenied && (
          <Card className="p-4 bg-yellow-50 border-yellow-300">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0" />
              <div className="flex-grow">
                <h3 className="font-semibold text-yellow-800">Permiso de Cámara Requerido</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Has denegado el permiso para usar la cámara. Para escanear, necesitas habilitarlo manualmente.
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  Por favor, ve a <span className="font-semibold">Ajustes &gt; Aplicaciones &gt; Ecopoints &gt; Permisos</span> y activa la cámara.
                </p>
              </div>
            </div>
          </Card>
      )}

      <Card className="overflow-hidden border-2 border-gray-200">
        <div className="relative aspect-square bg-gray-900">
          {!isScanning && !showSuccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <CameraIcon className="w-16 h-16 text-gray-400 mx-auto" />
                <p className="text-gray-400 mt-4">
                    {permissionDenied ? 'Permiso de cámara bloqueado' : 'Toca el botón para iniciar el escaneo'}
                </p>
            </div>
          )}

          <div id="qr-reader" className={`w-full h-full ${isScanning ? '' : 'hidden'}`}></div>

          {isScanning && (
            <div className="absolute inset-0 pointer-events-none border-8 border-emerald-500/50 rounded-lg">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] border-2 border-dashed border-white/70 rounded-lg"/>
              <motion.div
                className="absolute top-0 left-0 right-0 h-1 bg-emerald-400"
                animate={{ top: ['-2%', '102%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          )}

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-emerald-600 flex items-center justify-center z-20"
              >
                <div className="text-center text-white space-y-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle2 className="w-20 h-20 mx-auto" />
                  </motion.div>
                  <h2 className="text-2xl font-bold">¡Escaneo exitoso!</h2>
                  <p>Has ganado</p>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                    className="text-5xl font-bold"
                  >
                    +{earnedPoints}
                  </motion.p>
                  <p>ecopoints</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
      
      {isScanning && (
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Minus className="w-4 h-4 text-gray-500" />
            <input
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.1}
                value={isScanning ? zoomLevel : MIN_ZOOM}
                onChange={handleZoomChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer zoom-slider"
            />
            <Plus className="w-4 h-4 text-gray-500" />
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {!isScanning ? (
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg"
            onClick={startScanning}
            disabled={showSuccess || permissionDenied}
          >
            <CameraIcon className="w-5 h-5 mr-2" />
            {permissionDenied ? "Permiso Bloqueado" : "Iniciar escaneo"}
          </Button>
        ) : (
          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg"
            onClick={stopScanning}
          >
            <X className="w-5 h-5 mr-2" />
            Detener
          </Button>
        )}
      </div>
    </div>
  );
}
