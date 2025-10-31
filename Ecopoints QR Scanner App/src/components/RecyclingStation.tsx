import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Recycle, MapPin, Leaf, Sparkles, RefreshCw, X } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface StationInfo {
  id: string;
  name: string;
  location: string;
  type: 'plastic' | 'paper' | 'metal' | 'glass' | 'electronics' | 'mixed';
  pointsRange: { min: number; max: number };
}

const stationTypes = {
  plastic: { 
    label: 'Plástico', 
    color: 'bg-blue-500', 
    icon: '♻️',
    description: 'Botellas, envases y plásticos'
  },
  paper: { 
    label: 'Papel y Cartón', 
    color: 'bg-amber-500', 
    icon: '📄',
    description: 'Periódicos, cajas y documentos'
  },
  metal: { 
    label: 'Metal', 
    color: 'bg-gray-500', 
    icon: '🥫',
    description: 'Latas, aluminio y metal'
  },
  glass: { 
    label: 'Vidrio', 
    color: 'bg-green-500', 
    icon: '🍾',
    description: 'Botellas y envases de vidrio'
  },
  electronics: { 
    label: 'Electrónicos', 
    color: 'bg-purple-500', 
    icon: '📱',
    description: 'Dispositivos y componentes'
  },
  mixed: { 
    label: 'Reciclaje General', 
    color: 'bg-emerald-500', 
    icon: '🌍',
    description: 'Materiales reciclables mixtos'
  }
};

interface RecyclingStationProps {
  onClose?: () => void;
}

export function RecyclingStation({ onClose }: RecyclingStationProps) {
  const [qrData, setQrData] = useState('');
  const [currentStation] = useState<StationInfo>({
    id: 'STATION-MIRAFLORES-001',
    name: 'EcoPoint Miraflores',
    location: 'Av. Larco 1234, Miraflores',
    type: 'mixed',
    pointsRange: { min: 10, max: 100 }
  });

  // Generate unique QR code that changes periodically
  useEffect(() => {
    const generateQRData = () => {
      const timestamp = Date.now();
      const data = {
        stationId: currentStation.id,
        type: currentStation.type,
        timestamp: timestamp,
        signature: `ECO-${currentStation.id}-${timestamp}`
      };
      setQrData(JSON.stringify(data));
    };

    generateQRData();
    // Regenerate QR code every 30 seconds for security
    const interval = setInterval(generateQRData, 30000);

    return () => clearInterval(interval);
  }, [currentStation]);

  const stationType = stationTypes[currentStation.type];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <Card className="overflow-hidden shadow-2xl border-2 border-emerald-200">
          {/* Close button for demo mode */}
          {onClose && (
            <div className="absolute top-4 right-4 z-50">
              <Button
                onClick={onClose}
                variant="ghost"
                className="rounded-full w-10 h-10 p-0 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          )}
          {/* Header with Background */}
          <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 text-white p-8 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1683665281529-90ea475286e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY28lMjBncmVlbiUyMG5hdHVyZXxlbnwxfHx8fDE3NjE2MzI3NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Background"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-2"
              >
                <Recycle className="w-12 h-12 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl text-white mb-2">EcoPoints</h1>
                <p className="text-xl text-emerald-100">Estación de Reciclaje</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* QR Code Section */}
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="inline-flex items-center justify-center"
                >
                  <Sparkles className="w-8 h-8 text-emerald-600" />
                </motion.div>
                <h2 className="text-2xl text-gray-900">¡Gana EcoPoints!</h2>
                <p className="text-gray-600">
                  Escanea el código QR con la app EcoPoints
                </p>
              </div>

              {/* QR Code Display */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 150 }}
                  className="bg-white p-6 rounded-2xl shadow-xl border-4 border-emerald-500"
                >
                  {qrData && (
                    <QRCodeSVG
                      value={qrData}
                      size={280}
                      level="H"
                      includeMargin={true}
                      fgColor="#059669"
                      bgColor="#ffffff"
                    />
                  )}
                </motion.div>
              </div>

              <div className="text-center">
                <Badge className={`${stationType.color} text-white text-lg px-4 py-2`}>
                  {stationType.icon} {stationType.label}
                </Badge>
              </div>
            </div>

            {/* Station Info Section */}
            <div className="space-y-6">
              {/* Station Details */}
              <Card className="p-6 bg-emerald-50 border-emerald-200">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl text-gray-900 mb-2">{currentStation.name}</h3>
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>{currentStation.location}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-emerald-200">
                    <p className="text-gray-600 mb-2">Materiales aceptados:</p>
                    <p className="text-gray-900">{stationType.description}</p>
                  </div>
                </div>
              </Card>

              {/* Points Info */}
              <Card className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg text-gray-900 mb-2">Puntos por escaneo</h3>
                    <p className="text-3xl text-amber-600 mb-2">
                      {currentStation.pointsRange.min} - {currentStation.pointsRange.max}
                    </p>
                    <p className="text-gray-600">
                      La cantidad exacta depende del material reciclado
                    </p>
                  </div>
                </div>
              </Card>

              {/* Instructions */}
              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="text-lg text-gray-900 mb-3">📱 Cómo usar:</h3>
                <ol className="space-y-2 text-gray-700">
                  <li className="flex gap-2">
                    <span className="text-emerald-600">1.</span>
                    <span>Descarga la app EcoPoints</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600">2.</span>
                    <span>Escanea este código QR</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600">3.</span>
                    <span>Deposita tu material reciclable</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600">4.</span>
                    <span>¡Gana puntos automáticamente!</span>
                  </li>
                </ol>
              </Card>

              {/* Environmental Impact */}
              <Card className="p-6 bg-green-50 border-green-200">
                <div className="text-center space-y-2">
                  <p className="text-green-800">🌍 Impacto Ambiental</p>
                  <p className="text-2xl text-green-600">+2.5 Toneladas</p>
                  <p className="text-gray-600">de CO₂ ahorrado este mes</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                <span>QR actualizado cada 30 segundos</span>
              </div>
              <div className="flex items-center gap-2">
                <span>ID: {currentStation.id}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Bottom Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            💚 Gracias por cuidar el planeta · EcoPoints © 2025
          </p>
        </div>
      </div>
    </div>
  );
}
