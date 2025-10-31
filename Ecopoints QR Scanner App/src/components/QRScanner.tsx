import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { QrCode, X, CheckCircle2, Camera, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface QRScannerProps {
  onScanSuccess: (transaction: { type: 'scan'; points: number; description: string; location?: string }) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScannerRunning = useRef(false);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 15, // más fluidez para móviles
          qrbox: { width: 300, height: 300 }, // área de detección más amplia
          aspectRatio: 1.0,
          videoConstraints: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: "environment",
          },
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // se ignoran errores menores mientras escanea
        }
      );

      isScannerRunning.current = true;
      setHasPermission(true);
      toast.info("Cámara activa: enfoca el QR dentro del recuadro");
    } catch (err) {
      setHasPermission(false);
      setIsScanning(false);
      scannerRef.current = null;
      isScannerRunning.current = false;
      toast.error("No se pudo acceder a la cámara o fue bloqueada");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScannerRunning.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        isScannerRunning.current = false;
      } catch {
        isScannerRunning.current = false;
      }
    }
    scannerRef.current = null;
    setIsScanning(false);
  };

  const handleScanSuccess = (qrData: string) => {
    const recyclingTypes = [
      { description: 'Reciclaje de botellas plásticas', points: 50, location: 'EcoPoint Miraflores' },
      { description: 'Reciclaje de papel y cartón', points: 100, location: 'EcoPoint San Isidro' },
      { description: 'Reciclaje de latas de aluminio', points: 75, location: 'EcoPoint Surco' },
      { description: 'Reciclaje de vidrio', points: 60, location: 'EcoPoint Barranco' },
      { description: 'Reciclaje de electrónicos', points: 150, location: 'EcoPoint Centro' },
    ];

    const randomRecycling = recyclingTypes[Math.floor(Math.random() * recyclingTypes.length)];
    setEarnedPoints(randomRecycling.points);
    setShowSuccess(true);

    onScanSuccess({
      type: 'scan',
      points: randomRecycling.points,
      description: randomRecycling.description,
      location: randomRecycling.location,
    });

    toast.success(`¡Ganaste ${randomRecycling.points} ecopoints! 🎉`);

    setTimeout(() => {
      setShowSuccess(false);
      setIsSimulating(false);
    }, 3000);
  };

  const simulateScan = () => {
    setIsSimulating(true);
    setTimeout(() => {
      handleScanSuccess('DEMO_QR_CODE');
    }, 2000);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <QrCode className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-gray-900 mb-2">Escanear QR</h1>
        <p className="text-gray-500">Escanea el código QR del punto de reciclaje para ganar ecopoints</p>
      </div>

      {/* Scanner Area */}
      <Card className="overflow-hidden">
        <div className="relative aspect-square bg-gray-900">
          {!isScanning && !showSuccess && !isSimulating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Camera className="w-16 h-16 text-gray-400 mx-auto" />
                <p className="text-gray-400">Toca el botón para iniciar el escaneo</p>
              </div>
            </div>
          )}

          <div id="qr-reader" className={`${isScanning ? '' : 'hidden'}`}></div>

          {(isScanning || isSimulating) && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 border-2 border-emerald-400 rounded-lg">
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 rounded-full"
                  animate={{ top: ['0%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              {isSimulating && (
                <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <QrCode className="w-32 h-32 text-emerald-400 mx-auto" />
                    <p className="text-white">Escaneando...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-emerald-600 flex items-center justify-center"
              >
                <div className="text-center text-white space-y-4">
                  <CheckCircle2 className="w-24 h-24 mx-auto" />
                  <div>
                    <h2 className="text-white mb-2">¡Escaneo exitoso!</h2>
                    <p className="text-emerald-100">Ganaste</p>
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
                      className="text-white text-4xl"
                    >
                      +{earnedPoints} ecopoints
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Buttons */}
      <div className="space-y-3">
        {!isScanning && !isSimulating ? (
          <>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={startScanning}
              disabled={showSuccess}
            >
              <Camera className="w-5 h-5 mr-2" />
              Iniciar escaneo con cámara
            </Button>
            <Button
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white"
              onClick={simulateScan}
              disabled={showSuccess}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Modo demo (sin cámara)
            </Button>
          </>
        ) : isScanning ? (
          <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={stopScanning}>
            <X className="w-5 h-5 mr-2" />
            Detener escaneo
          </Button>
        ) : null}
      </div>

      {/* Instructions */}
      <Card className="p-4 bg-emerald-50 border-emerald-200">
        <div className="space-y-2">
          <p className="text-emerald-900 font-semibold">Consejos:</p>
          <ul className="text-emerald-700 space-y-1 ml-4">
            <li>• Usa el "Modo demo" si no tienes cámara disponible</li>
            <li>• Mantén el QR dentro del cuadro</li>
            <li>• Asegúrate de tener buena iluminación</li>
            <li>• No muevas el celular mientras escanea</li>
          </ul>
        </div>
      </Card>

      {hasPermission === false && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <p className="text-amber-900 mb-2">⚠️ No se pudo acceder a la cámara</p>
          <p className="text-amber-700 mb-3">
            Es posible que no hayas dado permiso o que el navegador no tenga acceso a la cámara.
          </p>
          <p className="text-amber-700">
            Usa el <span className="font-semibold">Modo demo</span> para probar sin cámara.
          </p>
        </Card>
      )}
    </div>
  );
}
