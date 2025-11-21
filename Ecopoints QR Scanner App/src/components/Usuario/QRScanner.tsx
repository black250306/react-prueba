import { useState } from 'react';
import { QrReader, OnResultFunction } from 'react-qr-reader';
import { Zap, ZapOff, ZoomIn } from 'lucide-react';

type Transaction = {
  type: 'scan';
  points: number;
  description: string;
  location?: string;
};

interface QRScannerProps {
  onScanSuccess: (transaction: Transaction) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleScanResult: OnResultFunction = (result) => {
    if (!result) return;
    
    const textResult = result?.getText();
    if (!textResult) return;

    console.log('QR Decoded:', textResult);
    try {
      const parsedResult = JSON.parse(textResult);
      if (parsedResult.type === 'ecopoint_qr' && parsedResult.id && parsedResult.location && parsedResult.points) {
        onScanSuccess({
          type: 'scan',
          points: parsedResult.points,
          description: `Reciclaje en ${parsedResult.location}`,
          location: parsedResult.location,
        });
      }
    } catch (error) {
      console.error("Error parsing QR code:", error);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden border-4 border-gray-300">
      <QrReader
        onResult={handleScanResult}
        constraints={{
          facingMode: 'environment',
          // @ts-ignore: These are not in the standard type, but supported by browsers.
          torch: isFlashOn,
          zoom: zoom,
        }}
        className="w-full h-full"
      />

      {/* --- CONTROLS --- */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setIsFlashOn(!isFlashOn)}
          className="p-3 rounded-full bg-gray-800 bg-opacity-50 text-white"
        >
          {isFlashOn ? <ZapOff size={24} /> : <Zap size={24} />}
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-11/12 z-10 space-y-4">
        <div className="p-4 rounded-lg bg-gray-800 bg-opacity-50">
          <p className="text-white text-center text-base">
            Apunta la cámara al código QR
          </p>
        </div>

        {/* Zoom Slider */}
        <div className="flex items-center justify-center space-x-3 p-2 rounded-full bg-gray-800 bg-opacity-50">
          <ZoomIn size={24} className="text-white" />
          <input
            type="range"
            min="1"
            max="5" // A reasonable max, browser will clamp to supported value
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
