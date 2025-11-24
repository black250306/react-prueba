import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { QrCode, X, CheckCircle2, Camera as CameraIcon, Minus, Plus, ShieldAlert } from 'lucide-react';
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
`;

interface QRScannerProps {
  onScanSuccess?: (transaction: { type: 'scan'; points: number; description: string; location?: string }) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [supportsZoom, setSupportsZoom] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScannerRunning = useRef(false);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);

  const token = localStorage.getItem("token");
  const API_BASE = window.location.hostname === 'localhost'
    ? '/api'
    : 'https://ecopoints.hvd.lat/api';

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 4;
  const ZOOM_STEP = 0.5;

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  });

  const checkZoomSupport = (track: MediaStreamTrack): boolean => {
    try {
      const capabilities = track.getCapabilities();
      const hasZoom = (capabilities as any).zoom !== undefined;
      return hasZoom;
    } catch (error) {
      return false;
    }
  };

  const applyRealZoom = async (newZoom: number) => {
    if (!videoTrackRef.current || !supportsZoom) {
      simulateDigitalZoom(newZoom);
      return;
    }

    try {
      await videoTrackRef.current.applyConstraints({
        advanced: [{ zoom: newZoom }] as any
      });

      setZoomLevel(newZoom);

    } catch (error) {

      simulateDigitalZoom(newZoom);
    }
  };

  const handleZoomChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(event.target.value);
    if (supportsZoom) {
      await applyRealZoom(newZoom);
    } else {
      simulateDigitalZoom(newZoom);
    }
  };

  const increaseZoom = async () => {
    const newZoom = Math.min(zoomLevel + ZOOM_STEP, MAX_ZOOM);
    if (supportsZoom) {
      await applyRealZoom(newZoom);
    } else {
      simulateDigitalZoom(newZoom);
    }
  };

  const decreaseZoom = async () => {
    const newZoom = Math.max(zoomLevel - ZOOM_STEP, MIN_ZOOM);
    if (supportsZoom) {
      await applyRealZoom(newZoom);
    } else {
      simulateDigitalZoom(newZoom);
    }
  };

  const simulateDigitalZoom = (level: number) => {
    const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
    if (videoElement) {
      const scale = level;
      videoElement.style.transform = `scale(${scale})`;
      videoElement.style.transformOrigin = 'center center';
      videoElement.style.width = `${100 * scale}%`;
      videoElement.style.height = `${100 * scale}%`;
    }
    setZoomLevel(level);
  };

  const startScanning = async () => {
    // Si se denegó el permiso previamente, no intentar de nuevo, mostrar mensaje.
    if (hasPermission === false) {
      toast.error("El permiso de la cámara fue denegado. Habilítalo en la configuración de tu navegador.");
      return;
    }


    try {
      setIsScanning(true);
      setHasPermission(null);
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 60,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          videoConstraints: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          } as any,
        },
        async (decodedText) => {
          if (isScannerRunning.current) { // Evita dobles escaneos
            handleScanSuccess(decodedText);
          }
        },
        (errorMessage) => {
          // No hacer nada en error de no-encontrado
        }
      );

      isScannerRunning.current = true;
      setHasPermission(true);
      toast.info("Cámara activa. ¡A escanear!");

      // Pequeño retraso para asegurar que el stream de video esté listo
      setTimeout(async () => {
        try {
          const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
          if (videoElement && videoElement.srcObject) {
            const stream = videoElement.srcObject as MediaStream;
            const videotrack = stream.getVideoTracks()[0];

            if (videotrack) {
              videoTrackRef.current = videotrack;
              const zoomSupported = checkZoomSupport(videotrack);
              setSupportsZoom(zoomSupported);


              if (zoomSupported) {
                toast.success("Zoom óptico disponible.");
              } else {
                toast.info("Usando zoom digital de respaldo.");
              }
            }
          }
        } catch (error) {

        }
      }, 1000);
      isScannerRunning.current = true;
      setHasPermission(true);
      toast.success("Cámara activa - Enfoca el QR dentro del recuadro");

    } catch (err) {
      setHasPermission(false);
      setIsScanning(false);
      isScannerRunning.current = false;
      scannerRef.current = null;
      videoTrackRef.current = null;

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          toast.error("Permiso de cámara denegado");
        } else if (err.name === 'NotFoundError') {
          toast.error("No se encontró cámara trasera");
        } else {
          toast.error("No se pudo acceder a la cámara");
        }
      }
    }
  };

  const stopScanning = async () => {
    isScannerRunning.current = false; // Prevenir escaneos mientras se detiene


    if (videoTrackRef.current) {
      videoTrackRef.current.stop();
      videoTrackRef.current = null;
    }


    if (scannerRef.current && isScannerRunning.current) {
      try {
        // La promesa puede ser rechazada si el scanner ya se detuvo o nunca inició.
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        isScannerRunning.current = false;
      } catch (error) {
        isScannerRunning.current = false;
      }
    }

    // Limpieza de track y estado
    scannerRef.current = null;
    setIsScanning(false);
    setSupportsZoom(false);


    // Resetear cualquier transformación de zoom digital
    const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.style.transform = 'none';
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
    }
  };

  const handleScanSuccess = async (qrData: string) => {

    if (!token) {
      toast.error("No estás autenticado.");
      return;
    }
    await stopScanning();
    try {
      const response = await fetch(`${API_BASE}/validarQR`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ codigo_qr: qrData })
      });


      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Sesión expirada. Inicia sesión nuevamente.");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const puntosGanados = data.puntos_obtenidos || 0;
      setEarnedPoints(puntosGanados);
      setShowSuccess(true);

      onScanSuccess?.({
        type: 'scan',
        points: puntosGanados,
        description: data.mensaje || 'QR Escaneado',
        location: data.ubicacion // puede ser undefined, está bien
      });

      toast.success(`¡${data.mensaje || "Éxito"}! Ganaste ${puntosGanados} ecopoints 🎉`);
    } catch (error) {
      setEarnedPoints(0);
      toast.error("Error al procesar el QR. Intenta nuevamente.");
    }
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {

      stopScanning();

    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (hasPermission === false) {
    return (
      <div className="p-6 space-y-6 flex flex-col items-center justify-center text-center">
        <Card className="w-full max-w-md p-8 bg-white border rounded-lg shadow-sm">
          <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Permiso de Cámara Requerido</h2>
          <p className="text-gray-600 mb-6">
            Para escanear códigos QR, necesitamos acceso a tu cámara. Por favor, habilita el permiso en la configuración de tu navegador y recarga la página.
          </p>
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-semibold"
            onClick={() => window.location.reload()}
          >
            Recargar Página
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
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="text-center space-y-4">
                <CameraIcon className="w-16 h-16 text-gray-400 mx-auto" />
                <p className="text-gray-400">Cámara lista para escanear</p>
              </div>
            </div>
          )}

          <div id="qr-reader" className={`w-full h-full ${isScanning ? '' : 'hidden'}`} style={{ overflow: 'hidden' }}></div>

          {isScanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-4 border-emerald-400/70 rounded-2xl shadow-lg" />
              <motion.div
                className="absolute w-64 h-1 bg-emerald-300 rounded-full"
                animate={{ top: ['30%', '70%', '30%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {isScanning && (
        <Card className="p-4 bg-gray-800 border-gray-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-200">
                Control de Zoom  {!supportsZoom && "(Digital)"}
              </span>
              <span className="text-sm font-bold text-white bg-gray-700 px-2 py-1 rounded">
                {zoomLevel.toFixed(1)}x
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                onClick={decreaseZoom}
                disabled={zoomLevel <= MIN_ZOOM}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700 h-10 w-10"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="flex-1">
              <input
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.1}
                value={zoomLevel}
                onChange={handleZoomChange}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer zoom-slider"
                style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((zoomLevel - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%, #e5e7eb ${((zoomLevel - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%, #e5e7eb 100%)`
                  }}
              />
              </div>
              <Button
                size="sm"
                onClick={increaseZoom}
                disabled={zoomLevel >= MAX_ZOOM}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700 h-10 w-10"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
             <div className="flex justify-between text-xs text-blue-600">
              <span>{MIN_ZOOM}x</span>
              <span className="font-medium">
                {supportsZoom ? "Zoom óptico" : "Zoom digital"}
              </span>
              <span>{MAX_ZOOM}x</span>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3 pt-2">
        {!isScanning ? (
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-semibold"
            onClick={startScanning}
            disabled={showSuccess}
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
      <Card className="p-4 bg-emerald-50 border-emerald-200">
        <div className="space-y-2">
          <p className="text-emerald-900 font-semibold">Consejos:</p>
          <ul className="text-emerald-700 space-y-1 ml-4">
            <li>• Usa la barra de zoom para acercar o alejar la imagen</li>
            <li>• Mantén el QR dentro del cuadro verde</li>
            <li>• Asegúrate de tener buena iluminación</li>
            <li>• El zoom digital funciona en todos los dispositivos</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
