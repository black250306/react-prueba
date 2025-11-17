import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { QrCode, X, CheckCircle2, Camera as CameraIcon, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Device } from '@capacitor/device';

const sliderStyles = `
  .zoom-slider::-webkit-slider-thumb {
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

const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [supportsZoom, setSupportsZoom] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<'web' | 'native'>('web');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScannerRunning = useRef(false);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);

  const idusuario = localStorage.getItem("usuario_id");
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
  
  useEffect(() => {
    const platform = isNativePlatform() ? 'native' : 'web';
    setCurrentPlatform(platform);
  }, []);

  const checkZoomSupport = (track: MediaStreamTrack): boolean => {
    try {
      const capabilities = track.getCapabilities();
      const hasZoom = (capabilities as any).zoom !== undefined;
      return hasZoom;
    } catch (error) {
      return false;
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
  
  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(event.target.value);
    simulateDigitalZoom(newZoom);
  };

  const increaseZoom = () => {
    const newZoom = Math.min(zoomLevel + ZOOM_STEP, MAX_ZOOM);
    simulateDigitalZoom(newZoom);
  };

  const decreaseZoom = () => {
    const newZoom = Math.max(zoomLevel - ZOOM_STEP, MIN_ZOOM);
    simulateDigitalZoom(newZoom);
  };

  const startWebScanning = async () => {
    try {
      setIsScanning(true);
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          videoConstraints: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          } as any,
        },
        async (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Error silencioso durante el escaneo
        }
      );

      setTimeout(async () => {
        try {
          const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
          if (videoElement && videoElement.srcObject) {
            const stream = videoElement.srcObject as MediaStream;
            const videoTrack = stream.getVideoTracks()[0];
            videoTrackRef.current = videoTrack;

            const zoomSupported = checkZoomSupport(videoTrack);
            setSupportsZoom(zoomSupported);

            if (zoomSupported) {
              toast.success("Cámara activa - Zoom disponible");
            } else {
              toast.info("Cámara activa - Usando zoom digital");
            }
          }
        } catch (error) {
          console.log('Error checking zoom support');
        }
      }, 1000);

      isScannerRunning.current = true;
      setHasPermission(true);
      toast.success("Cámara activa - Enfoca el QR dentro del recuadro");

    } catch (err) {
      setHasPermission(false);
      setIsScanning(false);
      scannerRef.current = null;
      isScannerRunning.current = false;
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

  const stopWebScanning = async () => {
    const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.style.transform = 'none';
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
    }

    if (videoTrackRef.current) {
      videoTrackRef.current.stop();
      videoTrackRef.current = null;
    }

    if (scannerRef.current && isScannerRunning.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        isScannerRunning.current = false;
      } catch (error) {
        console.warn("Error stopping scanner:", error);
        isScannerRunning.current = false;
      }
    }
    
    scannerRef.current = null;
    setIsScanning(false);
    setSupportsZoom(false);
    setZoomLevel(1);
  };
  
  const checkNativePermission = async (): Promise<boolean> => {
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });
      
      if (status.granted) {
        return true;
      }
      
      if (status.denied) {
        toast.error("Permiso de cámara denegado. Por favor, habilita los permisos en configuración.");
        return false;
      }
      
      const requestStatus = await BarcodeScanner.checkPermission({ force: true });
      return requestStatus.granted;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  const prepareNativeScanner = () => {
    BarcodeScanner.hideBackground();
    document.body.style.background = 'transparent';
  };

  const showAppContent = () => {
    document.body.style.background = '';
    BarcodeScanner.showBackground();
  };

  const startNativeScanning = async () => {
    try {
      const hasPerm = await checkNativePermission();
      if (!hasPerm) {
        setHasPermission(false);
        return;
      }

      setHasPermission(true);
      setIsScanning(true);
      
      prepareNativeScanner();
      
      const result = await BarcodeScanner.startScan();
      
      if (result.hasContent) {
        await handleScanSuccess(result.content!);
      } else {
        stopNativeScanning();
      }
      
    } catch (error) {
      console.error('Error starting native scan:', error);
      toast.error("Error al iniciar el escáner");
      stopNativeScanning();
    }
  };

  const stopNativeScanning = async () => {
    try {
      await BarcodeScanner.stopScan();
      showAppContent();
      setIsScanning(false);
    } catch (error) {
      console.error('Error stopping native scan:', error);
      showAppContent();
      setIsScanning(false);
    }
  };
  
  const startScanning = async () => {
    if (currentPlatform === 'native') {
      await startNativeScanning();
    } else {
      await startWebScanning();
    }
  };

  const stopScanning = async () => {
    if (currentPlatform === 'native') {
      await stopNativeScanning();
    } else {
      await stopWebScanning();
    }
  };

  const handleScanSuccess = async (qrData: string) => {
    if (!token) {
      toast.error("No estás autenticado. Inicia sesión nuevamente.");
      return;
    }

    await stopScanning();

    try {
      const response = await fetch(`${API_BASE}/validarQR`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          codigo_qr: qrData
        }),
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
      
      try {
        onScanSuccess?.({
          type: 'scan',
          points: puntosGanados,
          description: data.mensaje || 'Escaneo QR',
          location: data.ubicacion || undefined,
        });
      } catch (err) {
        console.error('onScanSuccess handler threw:', err);
      }
      
      toast.success(`¡${data.mensaje || "Escaneo exitoso"}! Ganaste ${puntosGanados} ecopoints 🎉`);

    } catch (error) {
      console.error("Error processing QR:", error);
      setEarnedPoints(0);
      toast.error("Error al procesar el código QR. Intenta nuevamente.");
    }

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <style>{sliderStyles}</style>

      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <QrCode className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Escanear QR</h1>
        <p className="text-gray-500">Escanea el código QR del punto de reciclaje para ganar ecopoints</p>
        {currentPlatform === 'native' && (
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            📱 Modo App Nativa
          </div>
        )}
      </div>

      <Card className="overflow-hidden border-2 border-gray-200">
        <div className="relative aspect-square bg-gray-900">
          {!isScanning && !showSuccess && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <CameraIcon className="w-16 h-16 text-gray-400 mx-auto" />
                <p className="text-gray-400">Toca el botón para iniciar el escaneo</p>
                {currentPlatform === 'native' && (
                  <p className="text-gray-500 text-sm">Usando escáner nativo del dispositivo</p>
                )}
              </div>
            </div>
          )}

          {isScanning && currentPlatform === 'web' && (
            <>
              <div id="qr-reader" className="w-full h-full"></div>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-emerald-400 rounded-lg">
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 rounded-full"
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
                
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <QrCode className="w-16 h-16 text-emerald-400 mx-auto" />
                    </motion.div>
                    <p className="text-white font-medium">Escaneando código QR...</p>
                    {!supportsZoom && isScanning && (
                      <p className="text-yellow-300 text-sm">Usando zoom digital</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {isScanning && currentPlatform === 'native' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-center text-white space-y-6 p-8">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <QrCode className="w-24 h-24 text-emerald-400 mx-auto" />
                </motion.div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white">Escáner Nativo Activado</h3>
                  <p className="text-emerald-200">La cámara se abrió en pantalla completa</p>
                  <p className="text-sm text-gray-300">Escanea el código QR con la cámara de tu dispositivo</p>
                </div>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto"
                />
              </div>
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
      
      {isScanning && currentPlatform === 'web' && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">
                Control de Zoom {!supportsZoom && "(Digital)"}
              </span>
              <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {zoomLevel.toFixed(1)}x
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                onClick={decreaseZoom}
                disabled={zoomLevel <= MIN_ZOOM}
                variant="outline"
                className="flex-shrink-0 border-blue-300 text-blue-700 hover:bg-blue-100"
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer zoom-slider"
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
                className="flex-shrink-0 border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Plus className="w-4 h-4" />
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

      <div className="space-y-3">
        {!isScanning ? (
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-semibold"
            onClick={startScanning}
            disabled={showSuccess || hasPermission === false}
          >
            <CameraIcon className="w-6 h-6 mr-3" />
            { hasPermission === false
              ? "Permiso de cámara denegado"
              : currentPlatform === 'native'
              ? "Abrir cámara para escanear QR"
              : "Iniciar escaneo con cámara"
            }
          </Button>
        ) : (
          <Button 
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold"
            onClick={stopScanning}
          >
            <X className="w-6 h-6 mr-3" />
            {currentPlatform === 'native' ? 'Cerrar escáner' : 'Detener escaneo'}
          </Button>
        )}
      </div>

      <Card className="p-4 bg-emerald-50 border-emerald-200">
        <div className="space-y-2">
          <p className="text-emerald-900 font-semibold">
            Consejos para {currentPlatform === 'native' ? 'App' : 'Web'}:
          </p>
          <ul className="text-emerald-700 space-y-1 ml-4 list-disc">
            {currentPlatform === 'native' ? (
              <>
                <li>El escáner abrirá en pantalla completa</li>
                <li>Mejor rendimiento y precisión</li>
                <li>Funciona sin conexión a internet</li>
                <li>Acepta automáticamente los permisos</li>
              </>
            ) : (
              <>
                <li>Usa la barra de zoom para acercar o alejar la imagen</li>
                <li>Mantén el QR dentro del cuadro verde</li>
                <li>Asegúrate de tener buena iluminación</li>
                <li>El zoom digital funciona en todos los dispositivos</li>
              </>
            )}
          </ul>
        </div>
      </Card>
    </div>
  );
}
